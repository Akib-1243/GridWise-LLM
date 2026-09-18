# GridWise

GridWise is an LLM-assisted energy optimization project for the BUP CSE Fest 2026 preliminary problem. It contains a React dashboard and a Laravel API that accepts a 24-hour energy scenario, interprets operator notes, and returns a validated hourly energy plan.

## Project Structure

- `backend/` - Laravel API, optimizer, Docker configuration, and runtime files
- `frontend/` - React + Vite dashboard
- `Docs/` - Problem statement materials, architecture notes, ERD, response contract, and public sample cases

## Run With Docker

From the repository root:

```powershell
docker compose -f backend/docker-compose.yml up --build -d
```

Open the dashboard at:

- http://localhost:3000

Backend endpoints:

- http://localhost:8000/health
- `POST http://localhost:8000/optimize-energy`

Stop the stack with:

```powershell
docker compose -f backend/docker-compose.yml down
```

## Judge API

The judge-facing API is independent of the frontend.

### Health

```http
GET /health
```

Response:

```json
{"status":"ok"}
```

### Optimize Energy

```http
POST /optimize-energy
Content-Type: application/json
```

The request must contain:

- `scenario_id`
- `operator_notes` - 1 to 3 non-empty strings
- `hours` - exactly 24 unique records for hours `0` through `23`
- `battery` - capacity, initial energy, minimum reserve, and hourly charge/discharge limits

The response contains:

- `scenario_id`
- `directive_interpretation`
- `hourly_plan`
- `total_grid_kwh`
- `total_cost_bdt`
- `peak_grid_kwh`
- `plan_summary`

The complete contract is documented in `Docs/Response_contract__must_match_Problem_Statement_exactly_.json` and the input examples are in `Docs/BUP_CSE_FEST_2026_Preli_Public_Sample_Cases.json`.

## Validation

The backend currently supports and validates:

- Solar reduction directives
- Minimum battery reserve directives, including percentage reserves
- No-charge and no-discharge windows
- Maximum grid-import windows
- Natural-language time windows such as `noon until 2 PM`
- Energy balance and effective solar limits
- Battery capacity, reserve, and hourly rate limits
- End-of-day battery neutrality
- Duplicate or incomplete hourly input rejection

All 10 public sample cases have been replayed successfully against the optimizer, and the live Docker endpoints have been smoke-tested.

## Local Development

Backend:

```powershell
Set-Location backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan serve
```

Frontend:

```powershell
Set-Location frontend
npm install
npm run dev
```

For local frontend development, set `VITE_API_BASE_URL` in `frontend/.env` to the backend URL, normally `http://localhost:8000`.

## Documentation

Read the documents in `Docs/` before changing the API contract. The most important references are:

- `BUP_CSE_FEST_2026_Preliminary_Problem_Statement_GridWise_LLM.pdf`
- `BUP_CSE_FEST_2026_Participant_Guide_&_Evaluation_Rubric_GridWise_LLM.pdf`
- `GridWise_Full_Project_Blueprint.txt`
- `OptimizeEnergyController_flow__exact_.txt`
- `ERD__Entity_Relationship_Diagram_.txt`
- `Response_contract__must_match_Problem_Statement_exactly_.json`

## Current Scope

The judge-critical API and frontend dashboard are implemented. The broader blueprint still describes future work for MySQL-backed scenario/run history, dashboard history endpoints, external LLM providers, and a full LP/MILP solver. The current optimizer is deterministic and constraint-aware, so it runs without an LLM credential and remains self-contained for judging.
