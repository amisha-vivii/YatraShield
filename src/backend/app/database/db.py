"""PostgreSQL/PostGIS access layer (Supabase-hosted database).

Connection details come from environment variables only. All queries are
parameterised — no string interpolation of user input anywhere.
"""

from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Any, Iterator, Sequence

from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row

DATABASE_URL = os.environ.get("DATABASE_URL", "")

_pool: ConnectionPool | None = None


def pool() -> ConnectionPool | None:
    """Lazy pool. Returns None when no database is configured (demo mode)."""
    global _pool
    if not DATABASE_URL:
        return None
    if _pool is None:
        _pool = ConnectionPool(DATABASE_URL, min_size=1, max_size=8, kwargs={"row_factory": dict_row})
    return _pool


def is_configured() -> bool:
    return bool(DATABASE_URL)


@contextmanager
def cursor() -> Iterator[Any]:
    p = pool()
    if p is None:
        raise RuntimeError("database-not-configured")
    with p.connection() as conn:
        with conn.cursor() as cur:
            yield cur


def query(sql: str, params: Sequence[Any] = ()) -> list[dict[str, Any]]:
    with cursor() as cur:
        cur.execute(sql, params)
        return list(cur.fetchall())


def execute(sql: str, params: Sequence[Any] = ()) -> None:
    with cursor() as cur:
        cur.execute(sql, params)


def postgis_available() -> bool:
    try:
        rows = query("SELECT extname FROM pg_extension WHERE extname = %s", ("postgis",))
        return len(rows) == 1
    except Exception:
        return False


def complaints_within(lat: float, lon: float, radius_m: float, service_type: str | None = None) -> list[dict[str, Any]]:
    """PostGIS radius query. Callers fall back to Haversine if this raises."""
    return query(
        """
        SELECT r.id,
               r.service_type,
               r.complaint_category,
               r.reported_price,
               r.expected_price,
               r.created_at,
               ST_Distance(
                   r.geom,
                   ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
               ) / 1000.0 AS distance_km
        FROM reports r
        WHERE ST_DWithin(r.geom, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, %s)
          AND (%s IS NULL OR r.service_type = %s)
        ORDER BY distance_km
        """,
        (lon, lat, lon, lat, radius_m, service_type, service_type),
    )
