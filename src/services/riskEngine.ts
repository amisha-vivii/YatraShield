import { locationById } from '../data/locations';
import { riskPatterns, textPatterns } from '../data/patterns';
import { providers } from '../data/providers';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  Alternative,
  Evidence,
  Report,
  RiskFactor } from
'../types';
import { clamp, inr } from '../utils/format';
import { haversineKm } from '../utils/geo';
import { anomalyToScore, fitIsolationForest } from './anomaly';
import { similarityToExemplars } from './embeddings';
import { benchmarkFor, providerRisk, riskLevelFor } from './providerRisk';

/** Explainable weighting — identical to backend/app/risk_engine/weights.py */
export const WEIGHTS = {
  price: 0.3,
  complaint: 0.25,
  geo: 0.2,
  pattern: 0.15,
  text: 0.1
} as const;

export const FACTOR_LABELS = {
  price: 'PRICE ANOMALY',
  complaint: 'COMPLAINT HISTORY',
  geo: 'LOCATION RISK',
  pattern: 'SERVICE PATTERN',
  text: 'TEXT SIGNAL'
} as const;

const OVERPRICE_CATEGORIES = ['Overcharging', 'Unexpected fare increase'];

/**
 * Local implementation of POST /api/risk/analyze.
 * Same 12-step pipeline as the FastAPI risk engine; used when the API is not
 * reachable (Demo Mode). Reads only from the seeded/submitted report set.
 */
export function analyzeRisk(req: AnalyzeRequest, reports: Report[]): AnalyzeResponse {
  const location = locationById(req.location_id)!;
  const origin = locationById(req.origin_location_id ?? req.location_id) ?? location;
  const destination = locationById(req.destination_location_id ?? req.location_id) ?? location;
  const routeDistance = req.distance_km ??
  (req.origin_location_id ? haversineKm(origin.latitude, origin.longitude, destination.latitude, destination.longitude) : 8);
  const referenceDistance = 8;
  const routeScale = req.service_type === 'Taxi' || req.service_type === 'Airport Transfer' ?
  clamp(routeDistance / referenceDistance, 0.6, 2.5) : 1;
  const baseBenchmark = benchmarkFor(req.service_type, req.location_id);
  const bm = {
    ...baseBenchmark,
    min_price: Math.round(baseBenchmark.min_price * routeScale),
    average_price: Math.round(baseBenchmark.average_price * routeScale),
    max_price: Math.round(baseBenchmark.max_price * routeScale)
  };
  if (req.time_period === 'Night' && baseBenchmark.time_period !== 'Night') {
    bm.min_price = Math.round(bm.min_price * 1.2);
    bm.average_price = Math.round(bm.average_price * 1.2);
    bm.max_price = Math.round(bm.max_price * 1.2);
  }
  if (req.toll_amount) {
    bm.min_price += req.toll_amount;
    bm.average_price += req.toll_amount;
    bm.max_price += req.toll_amount;
  }

  // 1–2 · Price benchmark + isolation-forest anomaly ------------------------
  const ratio = req.quoted_price / bm.average_price;
  const deviationPct = (ratio - 1) * 100;
  const deviationScore = clamp((ratio - 1) * 45);

  const legitimateQuotes = providers.
  filter(
    (p) =>
    p.service_type === req.service_type &&
    p.location_id === req.location_id &&
    p.status !== 'Under review'
  ).
  flatMap((p) => [p.price_low, p.price_high, (p.price_low + p.price_high) / 2]);
  const trainingPrices = [
  bm.min_price,
  bm.average_price,
  bm.max_price,
  ...legitimateQuotes];

  const trainingRows = trainingPrices.map((p) => [p, p / bm.average_price]);
  const forest = fitIsolationForest(trainingRows.length >= 4 ? trainingRows : [[bm.min_price, 0.8], [bm.average_price, 1], [bm.max_price, 1.2], [bm.average_price, 1]]);
  const isolation = forest.score([req.quoted_price, ratio]);
  const anomalyScore = anomalyToScore(isolation);
  const priceScore = Math.round(0.6 * deviationScore + 0.4 * anomalyScore);

  // 3–4 · Nearby complaints (PostGIS ST_DWithin → Haversine fallback) -------
  const withKm = reports.map((r) => ({
    ...r,
    distance_km: haversineKm(location.latitude, location.longitude, r.latitude, r.longitude)
  }));
  const sameService = withKm.filter((r) => r.service_type === req.service_type);
  const near2 = sameService.filter((r) => r.distance_km <= 2);
  const near5 = sameService.filter((r) => r.distance_km <= 5);
  const ring2to5 = near5.length - near2.length;

  const categoryCounts = new Map<string, number>();
  for (const r of near5) categoryCounts.set(r.complaint_category, (categoryCounts.get(r.complaint_category) ?? 0) + 1);
  const dominant = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const dominantBoost = dominant && dominant[1] >= 3 ? 18 : 0;
  const complaintScore = Math.round(clamp(near2.length * 8 + ring2to5 * 3 + dominantBoost));

  // 5 · Geo risk: location index + hotspot density -------------------------
  const incidents2km = withKm.filter((r) => r.distance_km <= 2).length;
  const densityScore = clamp(incidents2km * 9);
  const geoScore = Math.round(0.6 * location.risk_index + 0.4 * densityScore);

  // 6 · Historical service pattern search ----------------------------------
  const pattern =
  riskPatterns.find(
    (p) => p.service_type === req.service_type && p.location === location.name
  ) ?? riskPatterns.find((p) => p.service_type === req.service_type);
  const family = dominant && OVERPRICE_CATEGORIES.includes(dominant[0]) ?
  OVERPRICE_CATEGORIES :
  dominant ?
  [dominant[0]] :
  [];
  const similarReports = reports.filter(
    (r) => r.service_type === req.service_type && (family.length === 0 || family.includes(r.complaint_category))
  ).length;
  const patternConfidence = pattern?.confidence ?? 50;
  const patternScore = Math.round(0.5 * clamp(similarReports * 5.5) + 0.5 * patternConfidence);

  // 7–9 · Sentence embeddings vs historical complaint patterns -------------
  const candidates = textPatterns.filter(
    (t) => t.service_type === req.service_type || t.service_type === 'Any'
  );
  const pool = candidates.length ? candidates : textPatterns;
  const scoredText = pool.
  map((t) => ({ t, sim: similarityToExemplars(req.description || '', t.exemplars) })).
  sort((a, b) => b.sim - a.sim);
  const bestText = req.description.trim().length > 8 ? scoredText[0] : null;
  const similarity = bestText ? bestText.sim : 0;
  const textScore = Math.round(clamp(similarity * 100 * 0.87));

  // 10 · Weighted, explainable score ---------------------------------------
  const overall = Math.round(
    priceScore * WEIGHTS.price +
    complaintScore * WEIGHTS.complaint +
    geoScore * WEIGHTS.geo +
    patternScore * WEIGHTS.pattern +
    textScore * WEIGHTS.text
  );
  const level = riskLevelFor(overall);
  const weighted_calculation = [
    ['Price anomaly', priceScore, WEIGHTS.price], ['Complaint history', complaintScore, WEIGHTS.complaint],
    ['Location risk', geoScore, WEIGHTS.geo], ['Service pattern', patternScore, WEIGHTS.pattern], ['Text signal', textScore, WEIGHTS.text]
  ].map(([label, score, weight]) => ({ label: label as string, score: score as number, weight: weight as number, contribution: Number(((score as number) * (weight as number)).toFixed(1)) }));
  const sampleCount = baseBenchmark.sample_count ?? 0;

  const factors: RiskFactor[] = [
  { key: 'price', label: FACTOR_LABELS.price, score: priceScore, weight: WEIGHTS.price, detail: `Quoted ${inr(req.quoted_price)} against a route-adjusted ${inr(bm.average_price)} benchmark for ${routeDistance.toFixed(1)} km (isolation score ${isolation.toFixed(2)}).` },
  { key: 'complaint', label: FACTOR_LABELS.complaint, score: complaintScore, weight: WEIGHTS.complaint, detail: `${near2.length} complaints within 2 km and ${ring2to5} more within 5 km for this service.` },
  { key: 'geo', label: FACTOR_LABELS.geo, score: geoScore, weight: WEIGHTS.geo, detail: `Location risk index ${location.risk_index} with ${incidents2km} incidents inside a 2 km radius.` },
  { key: 'pattern', label: FACTOR_LABELS.pattern, score: patternScore, weight: WEIGHTS.pattern, detail: `${similarReports} comparable reports linked to ${pattern ? pattern.name : 'no active pattern'}.` },
  { key: 'text', label: FACTOR_LABELS.text, score: textScore, weight: WEIGHTS.text, detail: bestText ? `${Math.round(similarity * 100)}% similarity to "${bestText.t.label}".` : 'No description supplied, text signal excluded from evidence.' }];


  // 11 · Evidence ----------------------------------------------------------
  const evidence: Evidence[] = [
  {
    id: 'ev-price',
    type: 'PRICE SIGNAL',
    title: `Quoted ${inr(req.quoted_price)} vs benchmark ${inr(bm.average_price)}`,
    description: `Local range for ${req.service_type} at ${location.name} is ${inr(bm.min_price)}–${inr(bm.max_price)}.`,
    value: `${deviationPct >= 0 ? '+' : ''}${Math.round(deviationPct)}%`,
    source: 'price_benchmarks · Isolation Forest'
  },
  {
    id: 'ev-complaint',
    type: 'COMPLAINT SIGNAL',
    title: `${near2.length} recent complaints within 2 km`,
    description: dominant ? `Most frequent category nearby: ${dominant[0]} (${dominant[1]} of ${near5.length} within 5 km).` : 'No dominant complaint category nearby.',
    value: `${near2.length} / 2 km`,
    source: 'reports · PostGIS ST_DWithin'
  },
  {
    id: 'ev-geo',
    type: 'LOCATION SIGNAL',
    title: `${incidents2km} nearby incidents across all services`,
    description: `${location.name} carries a risk index of ${location.risk_index}${location.risk_index >= 65 ? ' — classified as a high-risk hotspot.' : '.'}`,
    value: `Index ${location.risk_index}`,
    source: 'locations · reports density'
  },
  {
    id: 'ev-pattern',
    type: 'SERVICE PATTERN',
    title: `${similarReports} similar reports on record`,
    description: pattern ? `${pattern.name} · confidence ${pattern.confidence}% · trend ${pattern.trend}.` : 'No matching pattern in risk_patterns.',
    value: pattern ? pattern.name.split(' → ').slice(-2).join(' ') : '—',
    source: 'risk_patterns'
  }];

  if (bestText) {
    evidence.push({
      id: 'ev-text',
      type: 'TEXT SIGNAL',
      title: `${Math.round(similarity * 100)}% similarity to a known complaint pattern`,
      description: `Closest historical pattern: ${bestText.t.label}. Multilingual support depends on the loaded sentence-transformer model.`,
      value: `${Math.round(similarity * 100)}%`,
      source: 'sentence embeddings · cosine similarity'
    });
  }

  // 12 · Contextual recommendation -----------------------------------------
  const reasons = factors.
  filter((f) => f.score >= 55).
  sort((a, b) => b.score * b.weight - a.score * a.weight).
  map((f) => f.detail);

  const recommendation =
  overall > 80 ?
  {
    headline: 'HIGH RISK SERVICE',
    message: 'Multiple risk signals detected.',
    actions: ['Verify fare before payment.', 'Check an alternative provider.', 'Review supporting evidence.']
  } :
  overall > 60 ?
  {
    headline: 'VERIFY BEFORE PROCEEDING',
    message: 'Several risk signals detected for this service and location.',
    actions: ['Confirm the price in writing before you start.', 'Prefer a prepaid or metered option.', 'Review supporting evidence.']
  } :
  overall > 30 ?
  {
    headline: 'MODERATE RISK SIGNALS',
    message: 'Some signals differ from the local baseline.',
    actions: ['Confirm what the price includes.', 'Compare against the local benchmark.', 'Keep a receipt or booking record.']
  } :
  {
    headline: 'NO SIGNIFICANT RISK SIGNALS',
    message: 'This quote is close to local baselines and complaint history is limited.',
    actions: ['Confirm the final price before boarding or booking.', 'Report anything unexpected afterwards.']
  };

  // Price comparison + safer alternatives from provider rows ---------------
  const sameServiceProviders = providers.
  filter((p) => p.service_type === req.service_type).
  map((p) => ({
    provider: p,
    distance_km: haversineKm(location.latitude, location.longitude, p.latitude, p.longitude)
  })).
  filter((p) => p.distance_km <= 12);

  const price_comparison = {
    quoted: req.quoted_price,
    benchmark: bm.average_price,
    range_low: bm.min_price,
    range_high: bm.max_price,
    multiple: Number(ratio.toFixed(2)),
    deviation_pct: Math.round(deviationPct),
    anomaly_score: priceScore,
    distance_km: Number(routeDistance.toFixed(1)),
    estimated_minutes: req.estimated_minutes,
    quoted_per_km: Number((req.quoted_price / Math.max(routeDistance, 0.1)).toFixed(2)),
    nearby: sameServiceProviders.
    slice().
    sort((a, b) => a.provider.price_low - b.provider.price_low).
    slice(0, 5).
    map((p) => ({
      provider: p.provider.name,
      price_low: p.provider.price_low,
      price_high: p.provider.price_high,
      distance_km: Number(p.distance_km.toFixed(1))
    })),
    data_confidence: sampleCount >= 20 ? 'High' : sampleCount >= 5 ? 'Medium' : 'Low',
    sample_count: sampleCount,
    context: { service: req.service_type, location: location.name, distance_km: Number(routeDistance.toFixed(1)), time_period: req.time_period ?? baseBenchmark.time_period ?? 'Not specified', day_type: req.day_type ?? baseBenchmark.day_type ?? 'Not specified', vehicle: req.vehicle_type ?? baseBenchmark.vehicle_type ?? 'Not specified', luggage: req.luggage_count ?? 'Not specified', toll: req.toll_amount ?? 'Not specified' }
  };

  const alternatives: Alternative[] = sameServiceProviders.
  filter((p) => p.provider.id !== req.provider_id).
  map(({ provider, distance_km }) => {
    const risk = providerRisk(provider, reports);
    return {
      provider_id: provider.id,
      provider: provider.name,
      service: provider.service_type,
      price_low: provider.price_low,
      price_high: provider.price_high,
      risk_score: risk.score,
      risk_level: risk.level,
      distance_km: Number(distance_km.toFixed(1)),
      reports: risk.reports
    };
  }).
  filter((a) => a.risk_score < overall).
  sort((a, b) => a.risk_score - b.risk_score).
  slice(0, 4);

  return {
    request_id: `YS-A-${Date.now().toString().slice(-6)}`,
    overall_score: overall,
    risk_level: level,
    price_score: priceScore,
    complaint_score: complaintScore,
    geo_score: geoScore,
    service_pattern_score: patternScore,
    text_score: textScore,
    data_confidence: sampleCount >= 20 ? 'High' : sampleCount >= 5 ? 'Medium' : 'Low',
    price_deviation: Number(deviationPct.toFixed(1)),
    benchmark_price: bm.average_price,
    expected_min: bm.min_price,
    expected_max: bm.max_price,
    benchmark_context: { service: req.service_type, location: location.name, distance_km: Number(routeDistance.toFixed(1)), time_period: req.time_period ?? baseBenchmark.time_period ?? 'Not specified', day_type: req.day_type ?? baseBenchmark.day_type ?? 'Not specified', vehicle: req.vehicle_type ?? baseBenchmark.vehicle_type ?? 'Not specified', luggage: req.luggage_count ?? 'Not specified', toll: req.toll_amount ?? 'Not specified' },
    benchmark_sample_count: sampleCount,
    weighted_calculation,
    factors,
    evidence,
    reasons,
    recommendation,
    price_comparison,
    alternatives,
    matched_pattern: bestText ?
    { name: bestText.t.label, similarity: Number(similarity.toFixed(2)), category: bestText.t.category } :
    null,
    location,
    engine: {
      source: 'local-fallback',
      anomaly_model: 'IsolationForest (96 trees)',
      embedding_model: 'deterministic concept embedding (fallback)'
    },
    benchmark: {
      min_price: bm.min_price,
      average_price: bm.average_price,
      max_price: bm.max_price
    }
  };
}