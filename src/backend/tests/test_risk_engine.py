"""Risk-engine tests. Run with: pytest backend/tests -q"""

from __future__ import annotations

import math

from app.risk_engine.anomaly import score_price
from app.risk_engine.engine import (
    WEIGHTS,
    classify,
    complaint_score,
    geo_score,
    haversine_km,
)
from app.risk_engine.text_signal import score_text

BENCHMARK = {"min_price": 700, "average_price": 850, "max_price": 1000}
LEGIT = [700.0, 850.0, 1000.0, 850.0, 950.0, 800.0, 900.0]


# ── price anomaly ────────────────────────────────────────────────────────────
def test_price_anomaly_flags_airport_quote():
    result = score_price(2500, BENCHMARK, LEGIT, "Taxi")
    assert result.deviation_score > 80
    assert result.anomaly_score > 60
    assert result.price_score >= 80


def test_price_anomaly_ignores_fair_quote():
    result = score_price(900, BENCHMARK, LEGIT, "Taxi")
    assert result.price_score < 30


# ── risk classification ─────────────────────────────────────────────────────
def test_risk_classification_bands():
    assert classify(12) == "LOW RISK"
    assert classify(45) == "MEDIUM RISK"
    assert classify(74) == "HIGH RISK"
    assert classify(88) == "CRITICAL RISK"


def test_weights_sum_to_one():
    assert math.isclose(sum(WEIGHTS.values()), 1.0)


# ── geo distance ────────────────────────────────────────────────────────────
def test_haversine_matches_known_distance():
    # Delhi Airport → Connaught Place ≈ 14 km
    km = haversine_km(28.5562, 77.1000, 28.6315, 77.2167)
    assert 12 < km < 16


# ── complaint scoring ───────────────────────────────────────────────────────
def _row(distance_km: float, category: str = "Overcharging", service: str = "Taxi"):
    return {"distance_km": distance_km, "complaint_category": category, "service_type": service}


def test_complaint_scoring_uses_radius_and_category():
    nearby = [_row(0.2), _row(0.5), _row(1.1), _row(1.4), _row(1.8), _row(1.9),
              _row(3.1), _row(3.4), _row(3.8), _row(3.9), _row(4.4)]
    score, detail = complaint_score(nearby, "Taxi")
    assert detail["within_2km"] == 6
    assert detail["between_2_and_5km"] == 5
    assert 75 <= score <= 90


def test_geo_score_blends_index_and_density():
    location = {"risk_index": 78, "latitude": 28.5562, "longitude": 77.1}
    score, detail = geo_score(location, [_row(1.0)] * 8 + [_row(4.0)] * 3)
    assert detail["incidents_2km"] == 8
    assert 70 <= score <= 80


# ── text similarity ─────────────────────────────────────────────────────────
def test_text_similarity_matches_related_pattern():
    patterns = [
        {"label": "Unexpected fare increase", "category": "Unexpected fare increase",
         "exemplars": ["Driver demanded extra cash after reaching hotel."]},
        {"label": "Deposit not returned", "category": "Deposit dispute",
         "exemplars": ["Scooter rental kept my deposit claiming damage."]},
    ]
    signal = score_text("The driver asked for extra cash after we reached the hotel.", patterns)
    assert signal is not None
    assert signal.pattern == "Unexpected fare increase"
    assert signal.similarity > 0.3


def test_text_signal_absent_without_description():
    assert score_text("", [{"label": "x", "category": "y", "exemplars": ["z"]}]) is None
