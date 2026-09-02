# YatraShield — Intelligent Tourism-Risk Platform

> "Know the risk before you engage."

YatraShield is a **decision-support** platform. It analyses reported incidents, location-specific
complaints, pricing anomalies, review signals and suspicious service patterns, and gives a traveller a
**contextual risk warning before they engage** with a service. It never claims a confirmed scam, never
declares 100% fraud and never guarantees that a service is safe.

---

## 1. Problem

A traveller arriving at Delhi Airport is quoted ₹2,500 for a hotel transfer that locally costs ₹700–₹1,000.
The information needed to judge that quote — tariffs, prior complaints at that spot, recurring service
patterns — exists, but it is fragmented and arrives too late. Tourists decide in seconds, at the kerb.

## 2. Solution

One request — service, location, quoted price, description — is scored by an explainable risk engine
across five independent signals, and returned with the evidence behind every point of the score, a price
comparison, and lower-risk alternatives retrieved from the database.

## 3. Architecture

```
React frontend
      ↓  service query
FastAPI backend
      ↓  structured request
Tourism Risk Engine
   ├── NLP signal (sentence embeddings)
   ├── Price anomaly (Isolation Forest)
   ├── Geo risk (PostGIS radius + density)
   └── Service pattern (stored patterns)
      ↓  explainable scoring
Contextual warning → traveller
      ↕
PostgreSQL / PostGIS  →  Supabase-hosted database
```

Data layer: government tourism feedback, crowdsourced reports, review signals, price benchmarks and
location data — all stored in PostgreSQL/PostGIS and read by the FastAPI risk engine.

## 4. Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React + TypeScript, Leaflet + OpenStreetMap, Recharts |
| Backend | Python, FastAPI, Pydantic |
| Database | PostgreSQL + PostGIS |
| Hosting (DB) | Supabase (managed PostgreSQL/PostGIS) |
| ML | scikit-learn Isolation Forest, sentence-transformer embeddings |

**Why React** — the traveller-facing flow is highly interactive (live map, staged analysis, evidence
drill-down) and the same components serve the authority dashboard.
**Why FastAPI** — typed request/response contracts via Pydantic, and the Python ML stack lives in-process,
so the risk engine needs no extra service.
**Why PostgreSQL/PostGIS** — risk is inherently spatial; `ST_DWithin` answers "complaints within 2 km" in
the database instead of in application code, with GIST indexes.
**Why Isolation Forest** — unsupervised, so no labelled fraud data is required; it flags *unusual* price
and service observations, which is exactly the claim the product makes.
**Why sentence embeddings** — complaints are free text in many languages; embeddings match paraphrases
("driver demanded extra cash" ↔ "unexpected fare increase") without any LLM.
**Why Supabase** — managed PostgreSQL with PostGIS available as an extension, so the prototype ships with
a real hosted spatial database and no infrastructure work.

## 5. Database schema

`providers`, `services`, `locations`, `price_benchmarks`, `reports`, `risk_scores`, `risk_patterns`,
`evidence`, `data_sources` — see `database/schema.sql`. `reports.geom`, `providers.geom` and
`locations.geom` are generated `GEOGRAPHY(Point,4326)` columns with GIST indexes; `complaints_within()`
wraps the `ST_DWithin` radius query.

## 6. Risk formula

```
overall_score = price_score        × 0.30
              + complaint_score    × 0.25
              + geo_score          × 0.20
              + service_pattern    × 0.15
              + text_score         × 0.10        (normalised 0–100)
```

| Score | Level |
| --- | --- |
| 0–30 | LOW RISK |
| 31–60 | MEDIUM RISK |
| 61–80 | HIGH RISK |
| 81–100 | CRITICAL RISK |

Signal definitions:

- **Price anomaly** — benchmark deviation blended with an Isolation Forest fitted on legitimate quotes
  (benchmark statistics plus providers not under review).
- **Complaint history** — same-service complaints within 2 km and 5 km, plus a dominant-category boost.
- **Location risk** — location risk index combined with incident density inside 2 km.
- **Service pattern** — volume of comparable reports and the confidence of the matched stored pattern.
- **Text signal** — cosine similarity between the complaint embedding and historical exemplars.

## 7. Project structure

```
frontend/src/            # this design: components/, pages/, services/, contexts/, data/, types/, utils/
backend/app/main.py      # FastAPI application and endpoints
backend/app/risk_engine/  engine.py · anomaly.py · text_signal.py
backend/app/database/db.py
backend/app/schemas/risk.py
backend/tests/           # pytest suite
database/schema.sql · database/seed.sql
.env.example · README.md
```

## 8. API

`GET` `/api/health` · `/api/cities` · `/api/services` · `/api/providers` · `/api/reports` ·
`/api/hotspots` · `/api/risk-map` · `/api/intelligence/summary` · `/api/intelligence/patterns` ·
`/api/provider/{id}` · `/api/provider/{id}/history`

`POST` `/api/risk/analyze` · `/api/reports` · `/api/data/import`

`POST /api/risk/analyze` returns `overall_score`, `risk_level`, the five factor scores, `factors`,
`evidence`, `reasons` and `recommendation`.

## 9. Setup

### Environment variables

Copy `.env.example` and fill it in. `VITE_API_BASE_URL` is the only frontend variable; `DATABASE_URL`
and `ALLOWED_ORIGINS` are server-side only. No Supabase service key is ever exposed to the browser.

### Supabase

1. Create a project, then in the SQL editor: `CREATE EXTENSION IF NOT EXISTS postgis;`
2. Run `database/schema.sql`, then `database/seed.sql`.
3. Copy the connection URI into `DATABASE_URL`.

### Running FastAPI

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Running the frontend

```bash
npm install
npm run dev            # set VITE_API_BASE_URL=http://localhost:8000 to use the live API
```

## 10. Demo mode

If `VITE_API_BASE_URL` is unset or FastAPI is unreachable, the UI shows **DEMO MODE** and runs the local
reference engine in `services/riskEngine.ts` — the same weights, thresholds, Isolation Forest algorithm
and radius logic over the seeded dataset, so the demo never depends on network availability. If the
sentence-transformer cannot be loaded, both implementations fall back to a deterministic text similarity
method. Raw errors are never displayed.

## 11. Seed data and the demo flow

**TRY LIVE DEMO** fills in Taxi · Delhi Airport · ₹2,500 · "Driver offered airport to hotel taxi for
₹2500." and runs the analysis. Nothing is hardcoded: the seeded rows (benchmark ₹850, six taxi complaints
within 2 km, five more within 5 km, location risk index 78, sixteen comparable reports, pattern
confidence 82%) produce a **HIGH RISK score of approximately 82/100**. Change the seed and the score
changes.

## 12. Testing

```bash
cd backend
pytest tests -q
```

Covers price anomaly, risk calculation, risk classification, geo distance, complaint scoring, text
similarity, API endpoints and database operations (with a stubbed database layer).

## 13. Limitations

- Scores reflect reported signals only; absence of reports is not evidence of safety.
- Benchmarks depend on tariff coverage; sparse locations fall back to national averages.
- Text similarity quality depends on the loaded model and its language coverage.
- Prototype data is **synthetic and clearly labelled**. No live government feed is connected — the MVP
  can operate without proprietary platform APIs.
- Government data adapter: set `DATA_GOV_IN_RESOURCE_ID` and `DATA_GOV_IN_API_KEY` on the backend to
      reach an official `data.gov.in` resource. Records are not mapped into prices, providers, locations or
      grievances until that resource's published schema is verified; unavailable fields remain unavailable.
- The platform is decision support, not adjudication.

## 14. Future scope

- Analyst validation queue with audit trail and pattern promotion.
- pgvector-backed complaint retrieval for large-scale semantic search.
- Authority integrations for verified tariff and licence registries.
- Temporal risk models (time-of-day, season, event surges).
- Multilingual voice reporting at the kerb.

## 15. Deployment

The repository includes `vercel.json` for the Vite frontend and `render.yaml` for the FastAPI backend.

### Supabase

1. Create a Supabase project and enable the PostGIS extension.
2. Run `src/database/schema.sql`, then `src/database/seed.sql` in the SQL editor.
3. Copy the database connection URI for the backend `DATABASE_URL` variable.

### Render backend

Create a Web Service from the repository, or use the included Render blueprint. It uses:

```text
Root directory: src/backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health check: /api/health
```

Set `DATABASE_URL`, `ALLOWED_ORIGINS`, and optionally `LLM_API_KEY` in Render's secret environment variables.

### Vercel frontend

Import the repository into Vercel. The Vite defaults are `npm run build` and `dist`. Set
`VITE_API_BASE_URL` to the deployed Render backend URL. The included `vercel.json` preserves React Router
deep links on refresh.

Never commit database credentials or LLM keys. The frontend only receives `VITE_API_BASE_URL`; all other
secrets stay on the backend.
