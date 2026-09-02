"""API and database-operation tests. Run with: pytest backend/tests -q

These tests exercise the FastAPI layer with a stubbed database module so they
run without a live Supabase/PostgreSQL instance.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app import main
from app.database import db
from app.risk_engine import engine

LOCATION = {"id": "loc-1", "name": "Delhi Airport (IGI T3)", "city": "Delhi",
            "latitude": 28.5562, "longitude": 77.1, "risk_index": 78}
BENCHMARK = {"service_type": "Taxi", "location_id": "loc-1",
             "min_price": 700, "average_price": 850, "max_price": 1000}
PROVIDERS = [{"price_low": 850, "price_high": 950}, {"price_low": 700, "price_high": 900}]
PATTERN = {"id": "pat-1", "name": "AIRPORT → TAXI → OVERCHARGING",
           "description": "Arrivals-kerb pickups quoted at 2-3x the metered tariff.",
           "service_type": "Taxi", "location": "Delhi Airport (IGI T3)",
           "report_count": 37, "confidence": 82, "trend": "Emerging", "status": "Active"}


def _reports():
    rows = []
    for i, km in enumerate([0.2, 0.5, 0.7, 0.9, 1.1, 1.5, 3.1, 3.3, 3.6, 3.8, 3.9]):
        rows.append({
            "id": f"RPT-{i}", "service_type": "Taxi", "complaint_category": "Overcharging",
            "reported_price": 2400, "expected_price": 850, "distance_km": km,
            "latitude": 28.5562 + km / 111, "longitude": 77.1, "created_at": "2026-08-01",
        })
    return rows


@pytest.fixture(autouse=True)
def stub_db(monkeypatch):
    def fake_query(sql: str, params=()):
        text = " ".join(sql.split()).lower()
        if "from locations where id" in text:
            return [LOCATION]
        if "from price_benchmarks" in text:
            return [BENCHMARK]
        if "from providers" in text:
            return PROVIDERS
        if "from risk_patterns" in text:
            return [PATTERN]
        if "count(*) as c from reports" in text:
            return [{"c": 16}]
        if "from reports" in text:
            return _reports()
        if "pg_extension" in text:
            return [{"extname": "postgis"}]
        return []

    monkeypatch.setattr(db, "query", fake_query)
    monkeypatch.setattr(db, "execute", lambda *a, **k: None)
    monkeypatch.setattr(db, "is_configured", lambda: True)
    monkeypatch.setattr(db, "complaints_within", lambda *a, **k: _reports())
    monkeypatch.setattr(engine.db, "query", fake_query)
    monkeypatch.setattr(engine.db, "complaints_within", lambda *a, **k: _reports())


def test_health_endpoint():
    client = TestClient(main.app)
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["database"] == "configured"


def test_analyze_endpoint_returns_high_risk_for_demo_scenario():
    client = TestClient(main.app)
    res = client.post("/api/risk/analyze", json={
        "service_type": "Taxi",
        "location_id": "loc-1",
        "quoted_price": 2500,
        "description": "Driver offered airport to hotel taxi for 2500.",
        "provider_id": None,
    })
    assert res.status_code == 200
    body = res.json()
    assert body["risk_level"] in ("HIGH RISK", "CRITICAL RISK")
    assert 70 <= body["overall_score"] <= 95
    assert body["price_score"] >= 80
    assert len(body["evidence"]) >= 4


def test_analyze_endpoint_rejects_invalid_price():
    client = TestClient(main.app)
    res = client.post("/api/risk/analyze", json={
        "service_type": "Taxi", "location_id": "loc-1", "quoted_price": -5,
        "description": "", "provider_id": None,
    })
    assert res.status_code == 422


def test_create_report_returns_pending_receipt():
    client = TestClient(main.app)
    res = client.post("/api/reports", json={
        "service_type": "Taxi", "location_id": "loc-1", "reported_price": 2500,
        "expected_price": 850, "description": "Driver asked for extra cash at the hotel.",
        "complaint_category": "Overcharging", "latitude": 28.5562, "longitude": 77.1,
    })
    assert res.status_code == 200
    assert res.json()["status"] == "Pending validation"
    assert res.json()["id"].startswith("YS-2026-")
