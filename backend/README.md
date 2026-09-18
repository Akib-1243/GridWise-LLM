# GridWise Backend

Laravel API for the GridWise energy optimization contract.

## Endpoints

- `GET /api/health` returns `{"status":"ok"}`.
- `POST /api/optimize-energy` validates a 24-hour scenario and returns the exact documented response shape.

The optimizer uses deterministic guardrails and remains available without an LLM credential. Set `LLM_PROVIDER=openai` to interpret operator notes with OpenAI; the response is restricted to JSON, validated locally, and falls back to the deterministic interpreter on timeout, provider errors, or invalid output. Unsupported notes become `no_op` and never invent constraints.

## OpenAI configuration

Keep credentials in the ignored `backend/.env` file. Start from `.env.example` and set:

```dotenv
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=your-key-here
LLM_TIMEOUT=8
```

Docker passes these values to PHP when the stack starts. Never commit `.env` or log the API key. Rotate a key if it has been shared outside the intended secret store.

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
