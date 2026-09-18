# GridWise Backend

Laravel API for the GridWise energy optimization contract.

## Endpoints

- `GET /api/health` returns `{"status":"ok"}`.
- `POST /api/optimize-energy` validates a 24-hour scenario and returns the exact documented response shape.

The optimizer is deterministic and available without an LLM credential. Operator notes are interpreted through guarded pattern matching; unsupported notes become `no_op` and never invent constraints.

## Run with Docker

```bash
docker compose up --build
```

The API is then available at `http://localhost:8000/api/health`.

## Local run

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```
