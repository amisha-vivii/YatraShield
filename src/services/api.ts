import { dataSources } from '../data/dataSources';
import { locations } from '../data/locations';
import { riskPatterns } from '../data/patterns';
import { providers } from '../data/providers';
import { services } from '../data/services';
import type { AnalyzeRequest, AnalyzeResponse, Report } from '../types';
import { haversineKm } from '../utils/geo';
import { providerRisk } from './providerRisk';
import { analyzeRisk } from './riskEngine';

/**
 * FastAPI client.
 *
 * Base URL comes from the VITE_API_BASE_URL environment variable — no secrets
 * and no Supabase keys ever reach the browser; the browser only talks to
 * FastAPI, which owns the PostgreSQL/PostGIS (Supabase-hosted) connection.
 *
 * If the API is not configured or not reachable, every call transparently
 * degrades to the in-browser reference implementation and the UI shows
 * DEMO MODE. Raw errors are never surfaced to travellers.
 */

function readEnv(key: string): string | undefined {
  try {
    const env = (import.meta as unknown as {env?: Record<string, string>;}).env;
    return env?.[key];
  } catch {
    return undefined;
  }
}

export const API_BASE = readEnv('VITE_API_BASE_URL') ?? '';

export type BackendStatus = 'checking' | 'connected' | 'demo';

async function request<T>(path: string, init?: RequestInit, timeoutMs = 3000): Promise<T> {
  if (!API_BASE) throw new Error('api-not-configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
    });
    if (!res.ok) throw new Error(`api-${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** GET /api/health — decides whether the app runs live or in demo mode. */
export async function checkBackend(): Promise<BackendStatus> {
  if (!API_BASE) return 'demo';
  try {
    await request<{status: string;}>('/api/health', undefined, 2500);
    return 'connected';
  } catch {
    return 'demo';
  }
}

/** POST /api/risk/analyze */
export async function analyze(req: AnalyzeRequest, reports: Report[]): Promise<AnalyzeResponse> {
  try {
    const res = await request<AnalyzeResponse>('/api/risk/analyze', {
      method: 'POST',
      body: JSON.stringify(req)
    }, 8000);
    const localShape = analyzeRisk(req, reports);
    const benchmark = res.benchmark ?? localShape.benchmark;
    return {
      ...localShape,
      ...res,
      benchmark,
      price_comparison: {
        ...localShape.price_comparison,
        benchmark: benchmark.average_price,
        range_low: benchmark.min_price,
        range_high: benchmark.max_price,
        multiple: Number((req.quoted_price / benchmark.average_price).toFixed(2)),
        deviation_pct: Math.round((req.quoted_price / benchmark.average_price - 1) * 100)
        ,data_confidence: res.data_confidence,
        anomaly_score: res.price_score,
        sample_count: res.benchmark_sample_count,
        context: res.benchmark_context
      },
      engine: { ...localShape.engine, ...res.engine, source: 'fastapi' }
    };
  } catch {
    return analyzeRisk(req, reports);
  }
}

/** GET /api/cities */
export const getCities = () =>
[...new Set(locations.map((l) => l.city))].sort();

/** GET /api/services */
export const getServices = () => services;

/** GET /api/providers */
export function getProviders(reports: Report[]) {
  return providers.map((p) => {
    const risk = providerRisk(p, reports);
    const last = reports.
    filter((r) => r.provider_id === p.id).
    map((r) => r.created_at).
    sort().
    pop();
    return { ...p, risk_score: risk.score, risk_level: risk.level, reports: risk.reports, benchmark: risk.benchmark, updated_at: last ?? p.created_at };
  });
}

/** GET /api/provider/{id} + /api/provider/{id}/history */
export function getProvider(id: string, reports: Report[]) {
  const provider = providers.find((p) => p.id === id);
  if (!provider) return null;
  const risk = providerRisk(provider, reports);
  const history = reports.
  filter((r) => r.provider_id === id).
  sort((a, b) => a.created_at < b.created_at ? 1 : -1);
  return { provider, risk, history };
}

/** GET /api/hotspots — clustered report density per location. */
export function getHotspots(reports: Report[]) {
  return locations.
  map((l) => {
    const within = reports.filter(
      (r) => haversineKm(l.latitude, l.longitude, r.latitude, r.longitude) <= 5
    );
    const anomalies = within.filter((r) => r.reported_price > r.expected_price * 1.6).length;
    const categories = new Map<string, number>();
    for (const r of within) categories.set(r.complaint_category, (categories.get(r.complaint_category) ?? 0) + 1);
    const top = [...categories.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      ...l,
      reports: within.length,
      price_anomalies: anomalies,
      incidents: within.filter(
        (r) => haversineKm(l.latitude, l.longitude, r.latitude, r.longitude) <= 2
      ).length,
      top_pattern: top ? top[0] : 'No dominant pattern'
    };
  }).
  sort((a, b) => b.risk_index - a.risk_index);
}

/** GET /api/risk-map */
export const getRiskMap = (reports: Report[]) => ({
  hotspots: getHotspots(reports),
  reports
});

/** GET /api/intelligence/summary */
export function getIntelligenceSummary(reports: Report[]) {
  const hotspots = getHotspots(reports);
  const scored = getProviders(reports);
  return {
    total_reports: reports.length,
    active_hotspots: hotspots.filter((h) => h.risk_index >= 55 && h.reports > 0).length,
    high_risk_services: scored.filter((p) => p.risk_score > 60).length,
    price_anomalies: reports.filter((r) => r.reported_price > r.expected_price * 1.6).length,
    pending: reports.filter((r) => r.status === 'Pending validation').length
  };
}

/** GET /api/intelligence/patterns */
export const getPatterns = () => riskPatterns;

/** GET /api/data-sources */
export const getDataSources = () => dataSources;