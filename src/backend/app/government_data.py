"""Optional adapter for an official data.gov.in tourism resource.

The resource ID and API key are deployment configuration. No government
records are bundled here, and an unconfigured adapter never returns synthetic
records as official data.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass(frozen=True)
class GovernmentDataStatus:
    source: str
    configured: bool
    available: bool
    fields: dict[str, str]
    message: str


RESOURCE_ID = os.environ.get("DATA_GOV_IN_RESOURCE_ID", "").strip()
API_KEY = os.environ.get("DATA_GOV_IN_API_KEY", "").strip()
BASE_URL = "https://api.data.gov.in/resource"


def status() -> GovernmentDataStatus:
    configured = bool(RESOURCE_ID and API_KEY)
    fields = {
        "tourism_prices": "unavailable",
        "tourist_locations": "unavailable",
        "service_providers": "unavailable",
        "complaints_grievances": "unavailable",
    }
    if not configured:
        return GovernmentDataStatus(
            source="data.gov.in",
            configured=False,
            available=False,
            fields=fields,
            message=(
                "Configure DATA_GOV_IN_RESOURCE_ID and DATA_GOV_IN_API_KEY "
                "for an official resource. No synthetic records are used."
            ),
        )
    return GovernmentDataStatus(
        source="data.gov.in",
        configured=True,
        available=False,
        fields=fields,
        message=(
            "Resource configured, but its schema has not been verified. "
            "Map only fields confirmed in the published resource metadata."
        ),
    )


async def fetch_records(limit: int = 100) -> dict[str, Any]:
    """Fetch the configured official resource without inventing a mapping."""
    current = status()
    if not current.configured:
        return {"status": current.__dict__, "records": []}

    url = f"{BASE_URL}/{RESOURCE_ID}"
    params = {"api-key": API_KEY, "format": "json", "limit": max(1, min(limit, 1000))}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        return {
            "status": {**current.__dict__, "message": f"Official resource unavailable: {type(exc).__name__}"},
            "records": [],
        }

    return {
        "status": {
            **current.__dict__,
            "available": True,
            "message": "Official resource reachable; fields remain unmapped pending schema verification.",
        },
        "records": payload.get("records", []),
    }