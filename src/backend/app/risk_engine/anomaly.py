"""Price/service anomaly detection with scikit-learn Isolation Forest.

Purpose: IDENTIFY UNUSUAL PATTERNS. It does not prove fraud.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import IsolationForest

SERVICE_CODES = {
    "Taxi": 0,
    "Hotel": 1,
    "Tour Guide": 2,
    "Vehicle Rental": 3,
    "Souvenir Shop": 4,
    "Boat Ride": 5,
    "Ticket Agent": 6,
}


@dataclass
class AnomalyResult:
    raw_score: float          # sklearn decision_function output
    anomaly_score: float      # 0-100 platform scale
    deviation_score: float    # benchmark deviation on the same scale
    price_score: int          # blended price signal handed to the risk engine


def _features(price: float, benchmark: float, service_type: str, provider_reports: int) -> list[float]:
    ratio = price / benchmark if benchmark else 1.0
    return [
        price,
        ratio,
        price - benchmark,
        float(SERVICE_CODES.get(service_type, 0)),
        float(provider_reports),
    ]


def score_price(
    quoted_price: float,
    benchmark: dict,
    legitimate_prices: list[float],
    service_type: str,
    provider_reports: int = 0,
    random_state: int = 42,
) -> AnomalyResult:
    """Fit on legitimate observations, then score the traveller's quote.

    `legitimate_prices` are benchmark statistics plus quotes from providers that
    are not under review, so an unusually high quote stays isolated.
    """
    average = float(benchmark["average_price"]) or 1.0
    samples = [p for p in legitimate_prices if p and p > 0] or [
        float(benchmark["min_price"]),
        average,
        float(benchmark["max_price"]),
    ]
    X = np.array([_features(p, average, service_type, 0) for p in samples], dtype=float)

    model = IsolationForest(
        n_estimators=100,
        contamination="auto",
        random_state=random_state,
    ).fit(X)

    x = np.array([_features(quoted_price, average, service_type, provider_reports)], dtype=float)
    raw = float(model.decision_function(x)[0])           # < 0 → outlier
    anomaly = float(np.clip((-raw + 0.05) / 0.15 * 100, 0, 100))

    ratio = quoted_price / average
    deviation = float(np.clip((ratio - 1) * 45, 0, 100))

    return AnomalyResult(
        raw_score=raw,
        anomaly_score=anomaly,
        deviation_score=deviation,
        price_score=int(round(0.6 * deviation + 0.4 * anomaly)),
    )
