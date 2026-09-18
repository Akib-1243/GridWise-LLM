<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class OptimizeEnergyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scenario_id' => ['required', 'string', 'max:120'],
            'operator_notes' => ['required', 'array', 'min:1', 'max:3'],
            'operator_notes.*' => ['required', 'string', 'min:1', 'max:2000'],
            'hours' => ['required', 'array', 'size:24'],
            'hours.*.hour' => ['required', 'integer', 'between:0,23', 'distinct'],
            'hours.*.demand_kwh' => ['required', 'numeric', 'min:0'],
            'hours.*.solar_kwh' => ['required', 'numeric', 'min:0'],
            'hours.*.tariff_bdt_per_kwh' => ['required', 'numeric', 'min:0'],
            'battery' => ['required', 'array'],
            'battery.capacity_kwh' => ['required', 'numeric', 'gt:0'],
            'battery.initial_energy_kwh' => ['required', 'numeric', 'min:0'],
            'battery.minimum_energy_kwh' => ['required', 'numeric', 'min:0'],
            'battery.max_charge_kwh_per_hour' => ['required', 'numeric', 'min:0'],
            'battery.max_discharge_kwh_per_hour' => ['required', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $battery = $this->input('battery', []);
        if (($battery['minimum_energy_kwh'] ?? 0) > ($battery['capacity_kwh'] ?? 0)) {
            $this->merge(['battery' => array_merge($battery, ['_invalid_reserve' => true])]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->input('battery._invalid_reserve')) {
                $validator->errors()->add('battery.minimum_energy_kwh', 'Minimum energy cannot exceed capacity.');
            }
            $battery = $this->input('battery', []);
            if (($battery['initial_energy_kwh'] ?? 0) > ($battery['capacity_kwh'] ?? 0)) {
                $validator->errors()->add('battery.initial_energy_kwh', 'Initial energy cannot exceed capacity.');
            }
            if (($battery['minimum_energy_kwh'] ?? 0) > ($battery['initial_energy_kwh'] ?? 0)) {
                $validator->errors()->add('battery.initial_energy_kwh', 'Initial energy cannot be below minimum energy.');
            }
        });
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'The request data is invalid.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
