"""Tourism risk engine.

    NLP SIGNAL      PRICE ANOMALY      GEO RISK
          \\              |               /
                  SERVICE PATTERN
                          |
                 EXPLAINABLE SCORING
                          |
                 CONTEXTUAL WARNING

Weights: price 30%, complaints 25%, geo 20%, service pattern 15%, text 10%.
"""

from __future__ import annotations

import math
import uuid
from typing import Any

from ..database import db
from ..llm import explain_risk
from .anomaly import score_price
from .text_signal import score_text

WEIGHTS = {"price": 0.30, "complaint": 0.25, "geo": 0.20, "pattern": 0.15, "text": 0.10}
OVERPRICE_CATEGORIES = ("Overcharging", "Unexpected fare increase")
EARTH_RADIUS_KM = 6371.0
NATIONAL_AVERAGES = {
    "Taxi": 520,
    "Hotel": 2000,
    "Tour Guide": 780,
    "Vehicle Rental": 560,
    "Souvenir Shop": 900,
    "Boat Ride": 620,
    "Ticket Agent": 310,
    "Airport Transfer": 900,
    "Bus Tour": 850,
    "Train Ticket": 450,
    "Restaurant": 700,
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Fallback used when PostGIS spatial functions are unavailable locally."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def classify(score: float) -> str:
    if score <= 30:
        return "LOW RISK"
    if score <= 60:
        return "MEDIUM RISK"
    if score <= 80:
        return "HIGH RISK"
    return "CRITICAL RISK"


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def _nearby(location: dict, service_type: str) -> list[dict[str, Any]]:
    """Complaints within 5 km, via PostGIS when available."""
    try:
        return db.complaints_within(location["latitude"], location["longitude"], 5000, None)
    except Exception:
        rows = db.query("SELECT * FROM reports")
        for row in rows:
            row["distance_km"] = haversine_km(
                location["latitude"], location["longitude"], row["latitude"], row["longitude"]
            )
        return [r for r in rows if r["distance_km"] <= 5]


def complaint_score(nearby: list[dict], service_type: str) -> tuple[int, dict]:
    same = [r for r in nearby if r["service_type"] == service_type]
    near2 = [r for r in same if r["distance_km"] <= 2]
    ring = len(same) - len(near2)

    counts: dict[str, int] = {}
    for row in same:
        counts[row["complaint_category"]] = counts.get(row["complaint_category"], 0) + 1
    dominant = max(counts.items(), key=lambda kv: kv[1], default=None)
    boost = 18 if dominant and dominant[1] >= 3 else 0

    score = int(round(clamp(len(near2) * 8 + ring * 3 + boost)))
    return score, {
        "within_2km": len(near2),
        "between_2_and_5km": ring,
        "dominant_category": dominant[0] if dominant else None,
        "dominant_count": dominant[1] if dominant else 0,
    }


def geo_score(location: dict, nearby: list[dict]) -> tuple[int, dict]:
    incidents = len([r for r in nearby if r["distance_km"] <= 2])
    density = clamp(incidents * 9)
    score = int(round(0.6 * float(location["risk_index"]) + 0.4 * density))
    return score, {"incidents_2km": incidents, "risk_index": location["risk_index"]}


def pattern_score(service_type: str, dominant_category: str | None, location_name: str) -> tuple[int, dict]:
    patterns = db.query(
        "SELECT * FROM risk_patterns WHERE service_type = %s ORDER BY (location = %s) DESC, confidence DESC",
        (service_type, location_name),
    )
    pattern = patterns[0] if patterns else None
    family = list(OVERPRICE_CATEGORIES) if dominant_category in OVERPRICE_CATEGORIES else (
        [dominant_category] if dominant_category else []
    )
    if family:
        rows = db.query(
            "SELECT count(*) AS c FROM reports WHERE service_type = %s AND complaint_category = ANY(%s)",
            (service_type, family),
        )
    else:
        rows = db.query("SELECT count(*) AS c FROM reports WHERE service_type = %s", (service_type,))
    similar = int(rows[0]["c"]) if rows else 0
    confidence = int(pattern["confidence"]) if pattern else 50
    score = int(round(0.5 * clamp(similar * 5.5) + 0.5 * confidence))
    return score, {"similar_reports": similar, "pattern": pattern["name"] if pattern else None, "confidence": confidence}


def analyze(payload: dict) -> dict:
    """POST /api/risk/analyze — the 12-step pipeline."""
    location = db.query("SELECT * FROM locations WHERE id = %s", (payload["location_id"],))[0]
    route = None
    if payload.get("route_id"):
        route_rows = db.query("SELECT * FROM service_routes WHERE id = %s AND service_type = %s AND route_status = 'Active'", (payload["route_id"], payload["service_type"]))
        if not route_rows and payload["service_type"] == "Taxi":
            route_rows = db.query("SELECT id, origin_id, destination_id, distance_km, estimated_minutes AS estimated_duration_minutes FROM travel_routes WHERE id = %s", (payload["route_id"],))
        if not route_rows:
            raise ValueError("Invalid route for selected service.")
        route = route_rows[0]
        if route["destination_id"] != payload["location_id"] or payload.get("origin_location_id") and route["origin_id"] != payload["origin_location_id"]:
            raise ValueError("Route endpoints do not match the selected locations.")
    benchmarks = db.query(
        "SELECT * FROM price_benchmarks WHERE service_type = %s AND location_id = %s",
        (payload["service_type"], payload["location_id"]),
    )
    fallback_average = NATIONAL_AVERAGES.get(payload["service_type"], 500)
    base_benchmark = benchmarks[0] if benchmarks else {
        "min_price": round(fallback_average * 0.75),
        "average_price": fallback_average,
        "max_price": round(fallback_average * 1.3),
    }
    origin_rows = db.query("SELECT * FROM locations WHERE id = %s", (payload.get("origin_location_id") or payload["location_id"],))
    origin = origin_rows[0] if origin_rows else location
    distance_km = float(route["distance_km"]) if route else (float(payload["distance_km"]) if payload.get("distance_km") else (
        haversine_km(
            float(origin["latitude"]), float(origin["longitude"]),
            float(location["latitude"]), float(location["longitude"])
        ) if payload.get("origin_location_id") else 8.0
    ))
    route_scale = max(0.6, min(2.5, distance_km / 8.0)) if payload["service_type"] in ("Taxi", "Airport Transfer") else 1.0
    benchmark = {
        **base_benchmark,
        "min_price": round(float(base_benchmark["min_price"]) * route_scale),
        "average_price": round(float(base_benchmark["average_price"]) * route_scale),
        "max_price": round(float(base_benchmark["max_price"]) * route_scale),
    }
    # Apply only charges explicitly supplied by the traveller. A stored row
    # already includes its matching time/day/vehicle context.
    if payload.get("time_period") and payload["time_period"].lower() == "night" and base_benchmark.get("time_period") != "Night":
        benchmark = {**benchmark, "min_price": round(benchmark["min_price"] * 1.2), "average_price": round(benchmark["average_price"] * 1.2), "max_price": round(benchmark["max_price"] * 1.2)}
    toll = float(payload.get("toll_amount") or 0)
    if toll:
        benchmark = {key: value + toll if key in ("min_price", "average_price", "max_price") else value for key, value in benchmark.items()}
    sample_count = int(base_benchmark.get("sample_count") or 0)
    data_confidence = "High" if sample_count >= 20 else "Medium" if sample_count >= 5 else "Low"
    benchmark_context = {
        "service": payload["service_type"], "location": location["name"],
        "distance_km": round(distance_km, 1), "time_period": payload.get("time_period") or base_benchmark.get("time_period") or "Not specified",
        "day_type": payload.get("day_type") or base_benchmark.get("day_type") or "Not specified",
        "vehicle": payload.get("vehicle_type") or base_benchmark.get("vehicle_type") or "Not specified",
        "luggage": payload.get("luggage_count") if payload.get("luggage_count") is not None else "Not specified",
        "toll": toll or "Not specified",
    }

    legit = db.query(
        """
        SELECT price_low, price_high FROM providers
        WHERE service_type = %s AND location_id = %s AND status <> 'Under review'
        """,
        (payload["service_type"], payload["location_id"]),
    )
    legitimate_prices = [float(benchmark["min_price"]), float(benchmark["average_price"]), float(benchmark["max_price"])]
    for row in legit:
        legitimate_prices += [float(row["price_low"]), float(row["price_high"])]

    anomaly = score_price(
        float(payload["quoted_price"]), benchmark, legitimate_prices, payload["service_type"]
    )

    nearby = _nearby(location, payload["service_type"])
    c_score, c_detail = complaint_score(nearby, payload["service_type"])
    g_score, g_detail = geo_score(location, nearby)
    p_score, p_detail = pattern_score(payload["service_type"], c_detail["dominant_category"], location["name"])

    text_patterns = db.query(
        "SELECT id, name AS label, description, service_type FROM risk_patterns WHERE service_type = %s",
        (payload["service_type"],),
    )
    exemplars = [
        {"label": row.get("label", row.get("name", "Unknown pattern")), "category": c_detail["dominant_category"] or "Overcharging",
         "exemplars": [row["description"]]}
        for row in text_patterns
        if row["description"]
    ]
    text = score_text(payload.get("description", ""), exemplars)
    t_score = text.score if text else 0

    overall = int(round(
        anomaly.price_score * WEIGHTS["price"]
        + c_score * WEIGHTS["complaint"]
        + g_score * WEIGHTS["geo"]
        + p_score * WEIGHTS["pattern"]
        + t_score * WEIGHTS["text"]
    ))
    level = classify(overall)
    deviation = (ratio - 1) * 100
    weighted_calculation = [
        {"label": factor["label"], "score": factor["score"], "weight": factor["weight"], "contribution": round(factor["score"] * factor["weight"], 1)}
        for factor in [
            {"label": "Price anomaly", "score": anomaly.price_score, "weight": WEIGHTS["price"]},
            {"label": "Complaint history", "score": c_score, "weight": WEIGHTS["complaint"]},
            {"label": "Location risk", "score": g_score, "weight": WEIGHTS["geo"]},
            {"label": "Service pattern", "score": p_score, "weight": WEIGHTS["pattern"]},
            {"label": "Text signal", "score": t_score, "weight": WEIGHTS["text"]},
        ]
    ]

    ratio = float(payload["quoted_price"]) / float(benchmark["average_price"] or 1)
    evidence = [
        {"id": "ev-price", "type": "PRICE SIGNAL",
         "title": f"Quoted {payload['quoted_price']:.0f} vs benchmark {float(benchmark['average_price']):.0f}",
         "description": f"Local range {benchmark['min_price']}-{benchmark['max_price']}.",
         "value": f"{(ratio - 1) * 100:+.0f}%", "source": "price_benchmarks · Isolation Forest"},
        {"id": "ev-complaint", "type": "COMPLAINT SIGNAL",
         "title": f"{c_detail['within_2km']} recent complaints within 2 km",
         "description": f"Dominant nearby category: {c_detail['dominant_category']}.",
         "value": f"{c_detail['within_2km']} / 2 km", "source": "reports · PostGIS ST_DWithin"},
        {"id": "ev-geo", "type": "LOCATION SIGNAL",
         "title": f"{g_detail['incidents_2km']} nearby incidents across all services",
         "description": f"{location['name']} risk index {g_detail['risk_index']}.",
         "value": f"Index {g_detail['risk_index']}", "source": "locations · reports density"},
        {"id": "ev-pattern", "type": "SERVICE PATTERN",
         "title": f"{p_detail['similar_reports']} similar reports on record",
         "description": f"{p_detail['pattern']} · confidence {p_detail['confidence']}%.",
         "value": str(p_detail["pattern"] or "-"), "source": "risk_patterns"},
    ]
    if text:
        evidence.append({
            "id": "ev-text", "type": "TEXT SIGNAL",
            "title": f"{text.similarity * 100:.0f}% similarity to a known complaint pattern",
            "description": f"Closest historical pattern: {text.pattern}.",
            "value": f"{text.similarity * 100:.0f}%", "source": f"sentence embeddings ({text.model})",
        })

    if overall > 80:
        recommendation = {"headline": "HIGH RISK SERVICE", "message": "Multiple risk signals detected.",
                          "actions": ["Verify fare before payment.", "Check an alternative provider.",
                                      "Review supporting evidence."]}
    elif overall > 60:
        recommendation = {"headline": "VERIFY BEFORE PROCEEDING",
                          "message": "Several risk signals detected for this service and location.",
                          "actions": ["Confirm the price in writing before you start.",
                                      "Prefer a prepaid or metered option.", "Review supporting evidence."]}
    elif overall > 30:
        recommendation = {"headline": "MODERATE RISK SIGNALS", "message": "Some signals differ from the local baseline.",
                          "actions": ["Confirm what the price includes.", "Compare against the local benchmark."]}
    else:
        recommendation = {"headline": "NO SIGNIFICANT RISK SIGNALS",
                          "message": "This quote is close to local baselines.",
                          "actions": ["Confirm the final price before booking."]}

    factors = [
        {"key": "price", "label": "PRICE ANOMALY", "score": anomaly.price_score, "weight": WEIGHTS["price"],
         "detail": f"Deviation {(ratio - 1) * 100:+.0f}% · isolation raw score {anomaly.raw_score:.3f}."},
        {"key": "complaint", "label": "COMPLAINT HISTORY", "score": c_score, "weight": WEIGHTS["complaint"],
         "detail": f"{c_detail['within_2km']} within 2 km, {c_detail['between_2_and_5km']} more within 5 km."},
        {"key": "geo", "label": "LOCATION RISK", "score": g_score, "weight": WEIGHTS["geo"],
         "detail": f"Risk index {g_detail['risk_index']} with {g_detail['incidents_2km']} incidents in 2 km."},
        {"key": "pattern", "label": "SERVICE PATTERN", "score": p_score, "weight": WEIGHTS["pattern"],
         "detail": f"{p_detail['similar_reports']} comparable reports linked to {p_detail['pattern']}."},
        {"key": "text", "label": "TEXT SIGNAL", "score": t_score, "weight": WEIGHTS["text"],
         "detail": f"{text.similarity * 100:.0f}% similarity to '{text.pattern}'." if text else "No description supplied."},
    ]

    ai_insight = explain_risk({
        "service": payload["service_type"],
        "route_distance_km": round(distance_km, 1),
        "estimated_minutes": payload.get("estimated_minutes"),
        "quoted_price": float(payload["quoted_price"]),
        "benchmark": float(benchmark["average_price"]),
        "local_range": [float(benchmark["min_price"]), float(benchmark["max_price"])],
        "risk_score": overall,
        "risk_level": level,
        "evidence": [factor["detail"] for factor in factors],
    })

    return {
        "request_id": f"YS-A-{uuid.uuid4().hex[:6].upper()}",
        "overall_score": overall,
        "risk_level": level,
        "price_score": anomaly.price_score,
        "complaint_score": c_score,
        "geo_score": g_score,
        "service_pattern_score": p_score,
        "text_score": t_score,
        "data_confidence": data_confidence,
        "price_deviation": round(deviation, 1),
        "benchmark_price": float(benchmark["average_price"]),
        "expected_min": float(benchmark["min_price"]),
        "expected_max": float(benchmark["max_price"]),
        "benchmark_context": benchmark_context,
        "benchmark_sample_count": sample_count,
        "weighted_calculation": weighted_calculation,
        "benchmark": {
            "min_price": float(benchmark["min_price"]),
            "average_price": float(benchmark["average_price"]),
            "max_price": float(benchmark["max_price"]),
        },
        "factors": factors,
        "evidence": evidence,
        "reasons": [f["detail"] for f in factors if f["score"] >= 55],
        "recommendation": recommendation,
        "ai_insight": ai_insight,
    }
