<?php

namespace App\Services;

use App\Support\DirectiveTypes;
use Illuminate\Support\Facades\Http;

class EnergyOptimizer
{
    public function optimize(array $input): array
    {
        $this->assertInputHours($input['hours']);
        $hoursByKey = [];
        foreach ($input['hours'] as $hour) {
            $hoursByKey[(int) $hour['hour']] = $hour;
        }
        ksort($hoursByKey);
        $hours = array_values($hoursByKey);
        $this->assertCompleteHours($hours);
        $directives = $this->interpretNotesWithConfiguredProvider($input['operator_notes'], $input['battery']);
        $effectiveSolar = $this->effectiveSolar($hours, $directives);
        $plan = $this->buildPlan($hours, $input['battery'], $directives, $effectiveSolar);

        $totalGrid = round(array_sum(array_column($plan, 'grid_kwh')), 2);
        $totalCost = round(array_sum(array_map(
            fn (array $entry, int $index) => $entry['grid_kwh'] * (float) $hours[$index]['tariff_bdt_per_kwh'],
            $plan,
            array_keys($plan),
        )), 2);

        $this->validatePlan($plan, $hours, $input['battery'], $directives, $effectiveSolar);

        return [
            'scenario_id' => (string) $input['scenario_id'],
            'directive_interpretation' => $directives,
            'hourly_plan' => $plan,
            'total_grid_kwh' => $totalGrid,
            'total_cost_bdt' => $totalCost,
            'peak_grid_kwh' => round(max(array_column($plan, 'grid_kwh')), 2),
            'plan_summary' => sprintf('24-hour plan using %.2f kWh from the grid with deterministic guardrails applied.', $totalGrid),
        ];
    }

    private function assertInputHours(array $hours): void
    {
        $seen = [];
        foreach ($hours as $hour) {
            $value = (int) ($hour['hour'] ?? -1);
            if (isset($seen[$value])) $this->fail(422, 'hours must not contain duplicate hour values.');
            $seen[$value] = true;
        }
    }

    private function assertCompleteHours(array $hours): void
    {
        $actual = array_map(fn (array $hour) => (int) $hour['hour'], $hours);
        if (count($actual) !== 24 || $actual !== range(0, 23)) {
            $this->fail(422, 'hours must contain each integer hour from 0 through 23 exactly once.');
        }
    }

    private function interpretNotes(array $notes, array $battery): array
    {
        return array_map(function (string $note, int $index) use ($battery): array {
            $text = strtolower($note);
            $window = $this->extractHours($text);
            $type = 'no_op';
            $adjustment = null;
            $explanation = 'This note does not affect the 24-hour energy schedule.';

            if (preg_match('/solar|panel|sun/', $text) && preg_match('/reduc|clean|wash|cloud|shade|availab/', $text)) {
                $type = 'solar_reduction';
                $factor = $this->extractRemainingFactor($text);
                $adjustment = ['hours' => $window, 'factor' => $factor];
                $explanation = sprintf('Usable solar is limited to %.0f%% during the stated window.', $factor * 100);
            } elseif (preg_match('/reserve|at least .*battery|min(?:imum)? .*battery|battery .*min/', $text)) {
                $type = 'minimum_battery_reserve';
                $reserve = $this->extractReserve($text, (float) $battery['capacity_kwh']);
                $adjustment = ['hours' => $window, 'minimum_energy_kwh' => $reserve];
                $explanation = 'The requested minimum battery reserve is enforced during the stated window.';
            } elseif (preg_match('/no charge|do not charge|avoid charging|charging .*off|charging .*disabl|charger .*isolat|charging circuit .*unavailab/', $text)) {
                $type = 'no_charge_window';
                $adjustment = ['hours' => $window];
                $explanation = 'Battery charging is disabled during the stated window.';
            } elseif (preg_match('/no discharge|must not discharge|do not discharge|avoid discharging|discharging .*off/', $text)) {
                $type = 'no_discharge_window';
                $adjustment = ['hours' => $window];
                $explanation = 'Battery discharging is disabled during the stated window.';
            } elseif (preg_match('/grid|import|draw/', $text) && preg_match('/max|cap|limit|exceed|below/', $text)) {
                $type = 'max_grid_window';
                $limit = $this->extractNumber($text, '/(?:max(?:imum)?|cap|limit|exceed|below)[^\d]*(\d+(?:\.\d+)?)/') ?? 0;
                $adjustment = ['hours' => $window, 'max_grid_kwh' => $limit];
                $explanation = 'Grid import is capped during the stated window.';
            }

            return [
                'note_index' => $index,
                'applies' => $type !== 'no_op',
                'directive_type' => in_array($type, DirectiveTypes::ALL, true) ? $type : 'no_op',
                'structured_adjustment' => $adjustment,
                'explanation' => $explanation,
            ];
        }, $notes, array_keys($notes));
    }

    private function interpretNotesWithConfiguredProvider(array $notes, array $battery): array
    {
        if (config('llm.provider') !== 'openai' || !config('llm.api_key')) {
            return $this->interpretNotes($notes, $battery);
        }

        try {
            $response = Http::withToken(config('llm.api_key'))
                ->acceptJson()
                ->timeout((int) config('llm.timeout', 8))
                ->post(rtrim(config('llm.base_url'), '/') . '/chat/completions', [
                    'model' => config('llm.model', 'gpt-4o-mini'),
                    'temperature' => 0,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Interpret energy operator notes into JSON only. Never invent constraints. Return {"directives":[...]} where each directive has note_index, applies, directive_type, structured_adjustment, and explanation. Allowed directive_type values: solar_reduction, minimum_battery_reserve, no_charge_window, no_discharge_window, max_grid_window, no_op. Hours must be integer values from 0 through 23. Use no_op when uncertain or unsupported.',
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'notes' => array_values($notes),
                                'battery' => $battery,
                            ], JSON_THROW_ON_ERROR),
                        ],
                    ],
                ]);

            if (!$response->successful()) {
                return $this->interpretNotes($notes, $battery);
            }

            $payload = $response->json('choices.0.message.content');
            $decoded = is_string($payload) ? json_decode($payload, true, 512, JSON_THROW_ON_ERROR) : null;
            $directives = $decoded['directives'] ?? null;
            if (!is_array($directives) || count($directives) !== count($notes)) {
                return $this->interpretNotes($notes, $battery);
            }

            return $this->sanitizeLlmDirectives($directives, $notes, $battery);
        } catch (\Throwable) {
            return $this->interpretNotes($notes, $battery);
        }
    }

    private function sanitizeLlmDirectives(array $directives, array $notes, array $battery): array
    {
        $fallback = $this->interpretNotes($notes, $battery);
        $sanitized = [];
        foreach (array_values($directives) as $index => $directive) {
            $type = $directive['directive_type'] ?? 'no_op';
            if (!is_string($type) || !in_array($type, DirectiveTypes::ALL, true)) {
                $sanitized[] = $fallback[$index];
                continue;
            }

            $adjustment = $directive['structured_adjustment'] ?? null;
            $hours = is_array($adjustment) && isset($adjustment['hours']) && is_array($adjustment['hours'])
                ? array_values(array_unique(array_filter(array_map('intval', $adjustment['hours']), fn (int $hour) => $hour >= 0 && $hour <= 23)))
                : [];
            if ($type !== 'no_op' && $hours === []) {
                $sanitized[] = $fallback[$index];
                continue;
            }

            $cleanAdjustment = is_array($adjustment) ? $adjustment : [];
            $cleanAdjustment['hours'] = $hours;
            if ($type === 'solar_reduction') {
                if (!is_numeric($cleanAdjustment['factor'] ?? null) || (float) $cleanAdjustment['factor'] < 0 || (float) $cleanAdjustment['factor'] > 1) {
                    $sanitized[] = $fallback[$index];
                    continue;
                }
                $cleanAdjustment['factor'] = round((float) $cleanAdjustment['factor'], 4);
            } elseif ($type === 'minimum_battery_reserve') {
                if (!is_numeric($cleanAdjustment['minimum_energy_kwh'] ?? null) || (float) $cleanAdjustment['minimum_energy_kwh'] < 0 || (float) $cleanAdjustment['minimum_energy_kwh'] > (float) $battery['capacity_kwh']) {
                    $sanitized[] = $fallback[$index];
                    continue;
                }
                $cleanAdjustment['minimum_energy_kwh'] = round((float) $cleanAdjustment['minimum_energy_kwh'], 4);
            } elseif ($type === 'max_grid_window') {
                if (!is_numeric($cleanAdjustment['max_grid_kwh'] ?? null) || (float) $cleanAdjustment['max_grid_kwh'] < 0) {
                    $sanitized[] = $fallback[$index];
                    continue;
                }
                $cleanAdjustment['max_grid_kwh'] = round((float) $cleanAdjustment['max_grid_kwh'], 4);
            }
            sort($cleanAdjustment['hours']);
            $sanitized[] = [
                'note_index' => $index,
                'applies' => $type !== 'no_op',
                'directive_type' => $type,
                'structured_adjustment' => $type === 'no_op' ? null : $cleanAdjustment,
                'explanation' => is_string($directive['explanation'] ?? null) ? $directive['explanation'] : 'The note does not affect the schedule.',
            ];
        }

        return $sanitized;
    }

    private function extractHours(string $text): array
    {
        if (preg_match('/(noon|midnight|\d{1,2}\s*(?:am|pm)?)\s*(?:to|until|through|-)\s*(noon|midnight|\d{1,2}\s*(?:am|pm)?)/i', $text, $match)) {
            $start = $this->parseTimeToken($match[1]);
            $end = $this->parseTimeToken($match[2], $match[1]);
            if ($end <= $start) $end += 24;
            return array_values(array_filter(range($start, $end - 1), fn (int $hour) => $hour < 24));
        }
        if (preg_match_all('/\b(?:at|hour)\s*(\d{1,2})\b/', $text, $matches)) {
            return array_values(array_unique(array_filter(array_map('intval', $matches[1]), fn (int $hour) => $hour < 24)));
        }
        return [];
    }

    private function parseTimeToken(string $token, ?string $context = null): int
    {
        $token = strtolower(trim($token));
        if ($token === 'noon') return 12;
        if ($token === 'midnight') return 0;
        preg_match('/(\d{1,2})\s*(am|pm)?/', $token, $match);
        $hour = (int) $match[1];
        $meridiem = $match[2] ?? null;
        if (!$meridiem && $context && preg_match('/(am|pm)/i', $context, $contextMatch)) $meridiem = strtolower($contextMatch[1]);
        if (!$meridiem) return min($hour, 23);
        $hour %= 12;
        return $meridiem === 'pm' ? $hour + 12 : $hour;
    }

    private function extractRemainingFactor(string $text): float
    {
        if (preg_match('/(\d+(?:\.\d+)?)\s*%\s*(?:reduction|cut)/', $text, $match)) return round(1 - ((float) $match[1] / 100), 4);
        if (preg_match('/(?:to|at|around|roughly)\s*(\d+(?:\.\d+)?)\s*%/', $text, $match)) return round((float) $match[1] / 100, 4);
        return 0.2;
    }

    private function extractNumber(string $text, string $pattern): ?float
    {
        return preg_match($pattern, $text, $match) ? (float) $match[1] : null;
    }

    private function extractReserve(string $text, float $capacity): float
    {
        if (!preg_match('/(\d+(?:\.\d+)?)\s*(kwh|%)/i', $text, $match)) return 0;
        $value = (float) $match[1];
        return strtolower($match[2]) === '%' ? $capacity * $value / 100 : $value;
    }

    private function effectiveSolar(array $hours, array $directives): array
    {
        $solar = array_fill(0, 24, 0.0);
        foreach ($hours as $hour) $solar[(int) $hour['hour']] = (float) $hour['solar_kwh'];
        foreach ($directives as $directive) {
            if ($directive['directive_type'] !== 'solar_reduction') continue;
            foreach ($directive['structured_adjustment']['hours'] as $hour) $solar[$hour] *= $directive['structured_adjustment']['factor'];
        }
        return $solar;
    }

    private function buildPlan(array $hours, array $battery, array $directives, array $effectiveSolar): array
    {
        $energy = (float) $battery['initial_energy_kwh'];
        $capacity = (float) $battery['capacity_kwh'];
        $minimum = (float) $battery['minimum_energy_kwh'];
        $plan = [];
        foreach ($hours as $index => $hour) {
            $demand = (float) $hour['demand_kwh'];
            $solar = min((float) $effectiveSolar[$index], $demand);
            $remaining = $demand - $solar;
            $discharge = 0.0;
            $charge = 0.0;
            $noCharge = $this->blocked($directives, 'no_charge_window', $index);
            $noDischarge = $this->blocked($directives, 'no_discharge_window', $index);
            $reserve = $this->reserveAt($directives, $index, $minimum);
            $gridLimit = $this->gridLimitAt($directives, $index);
            if (!$noDischarge && $this->shouldDischarge($hours, $index) && $remaining > 0) {
                $chargeRate = (float) $battery['max_charge_kwh_per_hour'];
                $energyNeededForNeutrality = $this->requiredEnergyAt($directives, $battery, $index, $hours, $effectiveSolar);
                $discharge = min(
                    $remaining,
                    (float) $battery['max_discharge_kwh_per_hour'],
                    max(0, $energy - max($reserve, $energyNeededForNeutrality)),
                );
                $remaining -= $discharge;
            }
            if ($gridLimit !== null && $remaining > $gridLimit && !$noDischarge) {
                $futureEnergy = $index < 23 ? $this->requiredEnergyAt($directives, $battery, $index + 1, $hours, $effectiveSolar) : (float) $battery['minimum_energy_kwh'];
                $extraDischarge = min($remaining - $gridLimit, (float) $battery['max_discharge_kwh_per_hour'] - $discharge, max(0, $energy - $discharge - $futureEnergy));
                $discharge += max(0, $extraDischarge);
                $remaining -= max(0, $extraDischarge);
            }
            if (!$noCharge && $remaining < 0) {
                $charge = min(-$remaining, (float) $battery['max_charge_kwh_per_hour'], $capacity - $energy);
            }
            if (!$noCharge && $gridLimit === null) {
                $energyAfterSolarCharge = $energy + $charge - $discharge;
                $energyNeededForNeutrality = $this->requiredEnergyAt($directives, $battery, $index, $hours, $effectiveSolar);
                $charge = min(
                    (float) $battery['max_charge_kwh_per_hour'],
                    $capacity - $energy + $discharge,
                    max($charge, $energyNeededForNeutrality - $energyAfterSolarCharge),
                );
            }
            $grid = max(0, $remaining) + max(0, $charge - max(0, -$remaining));
            if ($gridLimit !== null && $grid > $gridLimit + 0.01) {
                $this->fail(422, sprintf('Scenario is infeasible: grid import exceeds the cap at hour %d.', $index));
            }
            $energy = $energy + $charge - $discharge;
            $action = $charge > 0 ? 'charge' : ($discharge > 0 ? 'discharge' : 'idle');
            $plan[] = ['hour' => $index, 'grid_kwh' => round($grid, 4), 'solar_used_kwh' => round($solar, 4), 'battery_action' => $action, 'battery_kwh' => round($charge ?: $discharge, 4), 'battery_energy_after_kwh' => round($energy, 4)];
        }
        return $plan;
    }

    private function shouldDischarge(array $hours, int $index): bool
    {
        $tariffs = array_map(fn (array $hour) => (float) $hour['tariff_bdt_per_kwh'], $hours);
        return (float) $hours[$index]['tariff_bdt_per_kwh'] >= $this->median($tariffs);
    }

    private function median(array $values): float
    {
        sort($values); $middle = intdiv(count($values), 2);
        return count($values) % 2 ? $values[$middle] : (($values[$middle - 1] + $values[$middle]) / 2);
    }

    private function blocked(array $directives, string $type, int $hour): bool
    {
        foreach ($directives as $directive) if ($directive['directive_type'] === $type && in_array($hour, $directive['structured_adjustment']['hours'], true)) return true;
        return false;
    }

    private function reserveAt(array $directives, int $hour, float $default): float
    {
        foreach ($directives as $directive) if ($directive['directive_type'] === 'minimum_battery_reserve' && in_array($hour, $directive['structured_adjustment']['hours'], true)) return max($default, (float) $directive['structured_adjustment']['minimum_energy_kwh']);
        return $default;
    }

    private function gridLimitAt(array $directives, int $hour): ?float
    {
        $limit = null;
        foreach ($directives as $directive) {
            if ($directive['directive_type'] === 'max_grid_window' && in_array($hour, $directive['structured_adjustment']['hours'], true)) {
                $limit = $limit === null ? (float) $directive['structured_adjustment']['max_grid_kwh'] : min($limit, (float) $directive['structured_adjustment']['max_grid_kwh']);
            }
        }
        return $limit;
    }

    private function requiredEnergyAt(array $directives, array $battery, int $hour, array $hours, array $effectiveSolar): float
    {
        $chargeRate = (float) $battery['max_charge_kwh_per_hour'];
        $required = max(0, (float) $battery['initial_energy_kwh'] - ((23 - $hour) * $chargeRate));
        foreach ($directives as $directive) {
            if ($directive['directive_type'] !== 'minimum_battery_reserve') continue;
            foreach ($directive['structured_adjustment']['hours'] as $reserveHour) {
                if ($reserveHour >= $hour) {
                    $required = max($required, (float) $directive['structured_adjustment']['minimum_energy_kwh'] - (($reserveHour - $hour) * $chargeRate));
                }
            }
        }
        foreach ($directives as $directive) {
            if ($directive['directive_type'] !== 'max_grid_window') continue;
            $cap = (float) $directive['structured_adjustment']['max_grid_kwh'];
            $requiredDischarge = 0.0;
            $activeReserve = (float) $battery['minimum_energy_kwh'];
            foreach ($directive['structured_adjustment']['hours'] as $capHour) {
                if ($capHour >= $hour) {
                    $requiredDischarge += max(0, (float) $hours[$capHour]['demand_kwh'] - (float) $effectiveSolar[$capHour] - $cap);
                    $activeReserve = max($activeReserve, $this->reserveAt($directives, $capHour, (float) $battery['minimum_energy_kwh']));
                }
            }
            $required = max($required, $activeReserve + $requiredDischarge);
        }
        return $required;
    }

    private function validatePlan(array $plan, array $hours, array $battery, array $directives, array $effectiveSolar): void
    {
        $energy = (float) $battery['initial_energy_kwh'];
        foreach ($plan as $index => $entry) {
            $batteryDelta = $entry['battery_action'] === 'charge' ? $entry['battery_kwh'] : ($entry['battery_action'] === 'discharge' ? -$entry['battery_kwh'] : 0);
            $balance = $entry['grid_kwh'] + $entry['solar_used_kwh'] + max(0, -$batteryDelta) - (float) $hours[$index]['demand_kwh'] - max(0, $batteryDelta);
            if (abs($balance) > 0.01 || $entry['solar_used_kwh'] > $effectiveSolar[$index] + 0.01) $this->fail(500, 'Generated plan failed energy replay validation.');
            $rateLimit = $entry['battery_action'] === 'charge' ? (float) $battery['max_charge_kwh_per_hour'] : (float) $battery['max_discharge_kwh_per_hour'];
            if ($entry['battery_kwh'] < -0.01 || $entry['battery_kwh'] > $rateLimit + 0.01 || ($entry['battery_action'] === 'idle' && abs($entry['battery_kwh']) > 0.01)) $this->fail(500, 'Generated plan failed battery rate validation.');
            $energy += $batteryDelta;
            if (abs($energy - $entry['battery_energy_after_kwh']) > 0.01 || $energy < (float) $battery['minimum_energy_kwh'] - 0.01 || $energy > (float) $battery['capacity_kwh'] + 0.01) $this->fail(500, 'Generated plan failed battery replay validation.');
            if ($this->blocked($directives, 'no_charge_window', $index) && $entry['battery_action'] === 'charge') $this->fail(500, 'Generated plan violated a no-charge directive.');
            if ($this->blocked($directives, 'no_discharge_window', $index) && $entry['battery_action'] === 'discharge') $this->fail(500, 'Generated plan violated a no-discharge directive.');
            $reserve = $this->reserveAt($directives, $index, (float) $battery['minimum_energy_kwh']);
            if ($energy < $reserve - 0.01 || ($this->gridLimitAt($directives, $index) !== null && $entry['grid_kwh'] > $this->gridLimitAt($directives, $index) + 0.01)) $this->fail(500, 'Generated plan violated a directive constraint.');
        }
        if (abs($energy - (float) $battery['initial_energy_kwh']) > 0.01) $this->fail(500, 'Generated plan failed end-of-day neutrality.');
    }

    private function fail(int $status, string $message): void
    {
        if (function_exists('abort')) abort($status, $message);
        throw new \RuntimeException($message);
    }
}
