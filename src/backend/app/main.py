"""YatraShield FastAPI application.

React → FastAPI → Risk Engine → PostgreSQL/PostGIS → Supabase-hosted database
"""

from __future__ import annotations

import csv
import io
import logging
import os
import uuid

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import db
from . import government_data
from .risk_engine import engine
from .schemas.risk import AnalyzeRequest, ReportCreate

logger = logging.getLogger("yatrashield")

ALLOWED_ORIGINS = [o for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o]
MAX_UPLOAD_BYTES = 2_000_000

app = FastAPI(title="YatraShield API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(Exception)
async def unhandled(_request, exc: Exception) -> JSONResponse:
    """Never surface raw Python errors to travellers."""
    logger.exception("unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "The service is temporarily unavailable."})


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "database": "configured" if db.is_configured() else "demo",
        "postgis": db.postgis_available() if db.is_configured() else False,
    }


@app.get("/api/cities")
def cities() -> list[str]:
    return [row["city"] for row in db.query("SELECT DISTINCT city FROM locations ORDER BY city")]


@app.get("/api/services")
def services() -> list[dict]:
    return db.query("SELECT id, name, category, description FROM services ORDER BY id")


@app.get("/api/providers")
def providers(service_type: str | None = None, city: str | None = None) -> list[dict]:
    return db.query(
        """
        SELECT * FROM providers
        WHERE (%s IS NULL OR service_type = %s) AND (%s IS NULL OR city = %s)
        ORDER BY name
        """,
        (service_type, service_type, city, city),
    )


@app.get("/api/routes")
def routes(service_type: str | None = None, origin: str | None = None, destination: str | None = None) -> list[dict]:
    return db.query(
        """SELECT * FROM service_routes
           WHERE (%s IS NULL OR service_type = %s)
             AND (%s IS NULL OR origin_id = %s OR origin_name = %s)
             AND (%s IS NULL OR destination_id = %s OR destination_name = %s)
             AND route_status = 'Active' ORDER BY origin_name, destination_name""",
        (service_type, service_type, origin, origin, origin, destination, destination, destination),
    )


@app.get("/api/routes/{route_id}")
def route(route_id: str) -> dict:
    rows = db.query("SELECT * FROM service_routes WHERE id = %s AND route_status = 'Active'", (route_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Route not found.")
    return rows[0]


@app.get("/api/provider/{provider_id}")
def provider(provider_id: str) -> dict:
    rows = db.query("SELECT * FROM providers WHERE id = %s", (provider_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Provider not found.")
    return rows[0]


@app.get("/api/provider/{provider_id}/history")
def provider_history(provider_id: str) -> list[dict]:
    return db.query(
        "SELECT * FROM reports WHERE provider_id = %s ORDER BY created_at DESC LIMIT 200",
        (provider_id,),
    )


@app.get("/api/reports")
def reports(limit: int = 200) -> list[dict]:
    limit = max(1, min(limit, 1000))
    return db.query("SELECT * FROM reports ORDER BY created_at DESC LIMIT %s", (limit,))


@app.get("/api/hotspots")
def hotspots() -> list[dict]:
    return db.query(
        """
        SELECT l.id, l.name, l.city, l.latitude, l.longitude, l.risk_index,
               count(r.id) AS reports,
               count(r.id) FILTER (
                   WHERE ST_DWithin(r.geom, l.geom, 2000)
               ) AS incidents,
               count(r.id) FILTER (
                   WHERE r.reported_price >= r.expected_price * 1.6
               ) AS price_anomalies
        FROM locations l
        LEFT JOIN reports r ON ST_DWithin(r.geom, l.geom, 5000)
        GROUP BY l.id
        ORDER BY l.risk_index DESC
        """
    )


@app.get("/api/risk-map")
def risk_map() -> dict:
    return {"hotspots": hotspots(), "reports": reports(limit=1000)}


@app.get("/api/intelligence/summary")
def intelligence_summary() -> dict:
    rows = db.query(
        """
        SELECT
            (SELECT count(*) FROM reports) AS total_reports,
            (SELECT count(*) FROM locations WHERE risk_index >= 55) AS active_hotspots,
            (SELECT count(*) FROM risk_scores WHERE overall_score > 60) AS high_risk_services,
            (SELECT count(*) FROM reports WHERE reported_price >= expected_price * 1.6) AS price_anomalies,
            (SELECT count(*) FROM reports WHERE status = 'Pending validation') AS pending
        """
    )
    return rows[0]


@app.get("/api/intelligence/patterns")
def intelligence_patterns() -> list[dict]:
    return db.query("SELECT * FROM risk_patterns ORDER BY report_count DESC")


@app.get("/api/data-sources")
def data_sources() -> list[dict]:
    return db.query("SELECT * FROM data_sources ORDER BY id")


@app.get("/api/government-data/status")
def government_data_status() -> dict:
    """Report official-source readiness without presenting seed data as official."""
    return government_data.status().__dict__


@app.get("/api/government-data/records")
async def government_data_records(limit: int = 100) -> dict:
    return await government_data.fetch_records(limit)


@app.post("/api/risk/analyze")
def analyze(payload: AnalyzeRequest) -> dict:
    try:
        return engine.analyze(payload.model_dump())
    except (IndexError, ValueError) as exc:
        if isinstance(exc, ValueError):
            raise HTTPException(status_code=400, detail="The selected route is not available for this service.")
        raise HTTPException(status_code=404, detail="Unknown location.")


@app.post("/api/reports")
def create_report(payload: ReportCreate) -> dict:
    report_id = f"YS-2026-{uuid.uuid4().int % 10000:04d}"
    db.execute(
        """
        INSERT INTO reports (id, service_type, location_id, provider_id, reported_price, expected_price,
                             description, complaint_category, latitude, longitude, language, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Pending validation')
        """,
        (
            report_id,
            payload.service_type,
            payload.location_id,
            payload.provider_id,
            payload.reported_price,
            payload.expected_price,
            payload.description,
            payload.complaint_category,
            payload.latitude,
            payload.longitude,
            payload.language,
        ),
    )
    return {"id": report_id, "status": "Pending validation"}


@app.post("/api/data/import")
async def data_import(file: UploadFile = File(...)) -> dict:
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")
    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 2 MB limit.")

    reader = csv.DictReader(io.StringIO(raw.decode("utf-8", errors="replace")))
    imported = valid = rejected = 0
    errors: list[dict] = []

    for index, row in enumerate(reader, start=2):
        imported += 1
        try:
            lat, lon = float(row["latitude"]), float(row["longitude"])
            quoted = float(row["quoted_price"])
            if not (-90 <= lat <= 90 and -180 <= lon <= 180) or quoted <= 0:
                raise ValueError("range")
            db.execute(
                """
                INSERT INTO reports (id, service_type, location_id, provider_id, reported_price, expected_price,
                                     description, complaint_category, latitude, longitude, status, created_at)
                VALUES (%s, %s,
                        (SELECT id FROM locations ORDER BY geom <-> ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography LIMIT 1),
                        %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    row.get("incident_id") or f"IMP-{uuid.uuid4().hex[:8]}",
                    row["service_type"], lon, lat, row.get("provider_id") or None,
                    quoted, row.get("benchmark_price") or quoted, row.get("description", ""),
                    row.get("complaint_category", "Overcharging"), lat, lon,
                    row.get("status") or "Pending validation", row["date"],
                ),
            )
            valid += 1
        except Exception as exc:  # noqa: BLE001 - row level validation
            rejected += 1
            errors.append({"row": index, "reason": type(exc).__name__})

    return {"imported": imported, "valid": valid, "rejected": rejected, "errors": errors[:50]}
