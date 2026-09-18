# GridWise Frontend

React + TypeScript dashboard for the documented `GET /health` and `POST /optimize-energy` API.

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the Laravel API origin (no trailing slash). The default is `http://localhost:8000`. If the API is unavailable, running a scenario displays the public SAMPLE-01 output bundled from the official documentation, so the judge demo remains reliable.

## Demo flow

Open the command center, select **Create optimization scenario**, review the 24-hour input and operator notes, then select **Run AI plan**. The result page presents the LLM directive interpretation, verified KPIs, battery timeline, and complete hourly schedule.
