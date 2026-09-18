# GridWise Backend

Laravel API for the GridWise energy optimization contract.

## Endpoints

- `GET /health` returns `{"status":"ok"}`.
- `POST /optimize-energy` validates a 24-hour scenario and returns the exact documented response shape.
- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, and password-management endpoints provide token authentication.

The optimizer is deterministic and available without an LLM credential. Operator notes are interpreted through guarded pattern matching; unsupported notes become `no_op` and never invent constraints. Optimization requires a valid Sanctum bearer token.

## Run with Docker

```bash
docker compose up --build
```

The API is then available at `http://localhost:8000/health`.

## Local run

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Set a strong `ADMIN_PASSWORD` in `.env`; the Docker startup command creates the configured admin account.
