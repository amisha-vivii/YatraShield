-- YatraShield · PostgreSQL / PostGIS schema
-- Target: Supabase-hosted PostgreSQL with the PostGIS extension enabled.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS providers (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    service_type  TEXT NOT NULL,
    city          TEXT NOT NULL,
    location_id   TEXT,
    latitude      DOUBLE PRECISION NOT NULL,
    longitude     DOUBLE PRECISION NOT NULL,
    price_low     NUMERIC(10, 2),
    price_high    NUMERIC(10, 2),
    status        TEXT NOT NULL DEFAULT 'Monitored',
    geom          GEOGRAPHY(Point, 4326)
                  GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL UNIQUE,
    category     TEXT NOT NULL,
    description  TEXT
);

CREATE TABLE IF NOT EXISTS locations (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    city        TEXT NOT NULL,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    risk_index  INTEGER NOT NULL DEFAULT 0 CHECK (risk_index BETWEEN 0 AND 100),
    geom        GEOGRAPHY(Point, 4326)
                GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED
);

CREATE TABLE IF NOT EXISTS price_benchmarks (
    id             TEXT PRIMARY KEY,
    service_type   TEXT NOT NULL,
    location_id    TEXT REFERENCES locations (id),
    min_price      NUMERIC(10, 2) NOT NULL,
    average_price  NUMERIC(10, 2) NOT NULL,
    max_price      NUMERIC(10, 2) NOT NULL,
    route_or_distance_band TEXT,
    vehicle_type   TEXT,
    time_period    TEXT,
    day_type       TEXT,
    luggage_included BOOLEAN,
    toll_included BOOLEAN,
    p25_price      NUMERIC(10, 2),
    median_price   NUMERIC(10, 2),
    p75_price      NUMERIC(10, 2),
    sample_count   INTEGER NOT NULL DEFAULT 0,
    source_type    TEXT NOT NULL DEFAULT 'SYNTHETIC PROTOTYPE CASES',
    last_updated   DATE,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (service_type, location_id)
);

ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS route_or_distance_band TEXT;
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS time_period TEXT;
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS day_type TEXT;
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS luggage_included BOOLEAN;
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS toll_included BOOLEAN;
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS p25_price NUMERIC(10, 2);
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS median_price NUMERIC(10, 2);
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS p75_price NUMERIC(10, 2);
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS sample_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'SYNTHETIC PROTOTYPE CASES';
ALTER TABLE price_benchmarks ADD COLUMN IF NOT EXISTS last_updated DATE;

CREATE TABLE IF NOT EXISTS travel_routes (
    id                TEXT PRIMARY KEY,
    origin_id         TEXT NOT NULL REFERENCES locations (id),
    destination_id    TEXT NOT NULL REFERENCES locations (id),
    distance_km       NUMERIC(8, 2) NOT NULL CHECK (distance_km > 0),
    estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes > 0),
    UNIQUE (origin_id, destination_id)
);

CREATE TABLE IF NOT EXISTS service_routes (
    id TEXT PRIMARY KEY,
    service_id TEXT REFERENCES services (id),
    service_type TEXT NOT NULL,
    origin_id TEXT NOT NULL REFERENCES locations (id),
    destination_id TEXT NOT NULL REFERENCES locations (id),
    origin_name TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL CHECK (distance_km > 0),
    estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0),
    route_status TEXT NOT NULL DEFAULT 'Active',
    base_price NUMERIC(10, 2),
    price_unit TEXT DEFAULT 'per trip',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (service_type, origin_id, destination_id)
);

CREATE INDEX IF NOT EXISTS service_routes_lookup_idx ON service_routes (service_type, origin_id, destination_id);

CREATE TABLE IF NOT EXISTS reports (
    id                  TEXT PRIMARY KEY,
    service_type        TEXT NOT NULL,
    location_id         TEXT REFERENCES locations (id),
    provider_id         TEXT REFERENCES providers (id),
    reported_price      NUMERIC(10, 2) NOT NULL CHECK (reported_price > 0),
    expected_price      NUMERIC(10, 2),
    description         TEXT,
    complaint_category  TEXT NOT NULL,
    latitude            DOUBLE PRECISION NOT NULL,
    longitude           DOUBLE PRECISION NOT NULL,
    language            TEXT DEFAULT 'English',
    status              TEXT NOT NULL DEFAULT 'Pending validation',
    embedding           REAL[],           -- pgvector in production: vector(384)
    geom                GEOGRAPHY(Point, 4326)
                        GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_geom_idx ON reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS reports_service_idx ON reports (service_type, complaint_category);
CREATE INDEX IF NOT EXISTS providers_geom_idx ON providers USING GIST (geom);

CREATE TABLE IF NOT EXISTS risk_scores (
    id                     BIGSERIAL PRIMARY KEY,
    report_id              TEXT REFERENCES reports (id),
    provider_id            TEXT REFERENCES providers (id),
    overall_score          INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    price_score            INTEGER NOT NULL,
    complaint_score        INTEGER NOT NULL,
    geo_score              INTEGER NOT NULL,
    service_pattern_score  INTEGER NOT NULL,
    text_score             INTEGER NOT NULL,
    risk_level             TEXT NOT NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_patterns (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT,
    service_type  TEXT NOT NULL,
    location      TEXT,
    report_count  INTEGER NOT NULL DEFAULT 0,
    confidence    INTEGER NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
    trend         TEXT NOT NULL DEFAULT 'Stable',
    status        TEXT NOT NULL DEFAULT 'Monitoring'
);

CREATE TABLE IF NOT EXISTS evidence (
    id           BIGSERIAL PRIMARY KEY,
    report_id    TEXT REFERENCES reports (id),
    type         TEXT NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    value        TEXT,
    source       TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_sources (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    type          TEXT NOT NULL,
    description   TEXT,
    status        TEXT NOT NULL,
    last_updated  DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Complaints within a radius (metres) of a point — the query the geo signal uses.
CREATE OR REPLACE FUNCTION complaints_within(
    p_lat DOUBLE PRECISION,
    p_lon DOUBLE PRECISION,
    p_radius_m DOUBLE PRECISION,
    p_service TEXT DEFAULT NULL
)
RETURNS TABLE (id TEXT, complaint_category TEXT, distance_m DOUBLE PRECISION)
LANGUAGE sql STABLE AS $$
    SELECT r.id,
           r.complaint_category,
           ST_Distance(r.geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography) AS distance_m
    FROM reports r
    WHERE ST_DWithin(r.geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography, p_radius_m)
      AND (p_service IS NULL OR r.service_type = p_service)
    ORDER BY distance_m;
$$;
