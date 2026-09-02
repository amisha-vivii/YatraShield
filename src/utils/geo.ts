/**
 * Geo helpers.
 *
 * In production these distances are computed in PostgreSQL/PostGIS, e.g.
 *   SELECT count(*) FROM reports
 *   WHERE ST_DWithin(geom::geography, ST_MakePoint($lon,$lat)::geography, 2000);
 *
 * This module is the documented Haversine fallback used when PostGIS is not
 * reachable (local development / browser demo mode). Same maths, same units.
 */

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
lat1: number,
lon1: number,
lat2: number,
lon2: number)
: number {
  const toRad = (v: number) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
  Math.sin(dLat / 2) ** 2 +
  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function withinRadius<T extends {latitude: number;longitude: number;}>(
rows: T[],
lat: number,
lon: number,
km: number)
: T[] {
  return rows.filter((r) => haversineKm(lat, lon, r.latitude, r.longitude) <= km);
}

export function hotspotDensity<T extends {latitude: number;longitude: number;}>(
rows: T[],
lat: number,
lon: number,
km = 2)
: number {
  const area = Math.PI * km * km;
  return withinRadius(rows, lat, lon, km).length / area;
}