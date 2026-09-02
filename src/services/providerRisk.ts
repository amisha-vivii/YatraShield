import { locationById } from '../data/locations';
import { nationalAverages, priceBenchmarks } from '../data/priceBenchmarks';
import type { Provider, Report, RiskLevel } from '../types';
import { clamp } from '../utils/format';

export function benchmarkFor(service_type: string, location_id: string) {
  return (
    priceBenchmarks.find((b) => b.service_type === service_type && b.location_id === location_id) ?? {
      id: 'pb-national',
      service_type: service_type as Provider['service_type'],
      location_id,
      min_price: Math.round((nationalAverages[service_type] ?? 500) * 0.75),
      average_price: nationalAverages[service_type] ?? 500,
      max_price: Math.round((nationalAverages[service_type] ?? 500) * 1.3),
      updated_at: '2026-08-01'
    });

}

export function riskLevelFor(score: number): RiskLevel {
  if (score <= 30) return 'LOW RISK';
  if (score <= 60) return 'MEDIUM RISK';
  if (score <= 80) return 'HIGH RISK';
  return 'CRITICAL RISK';
}

/**
 * Provider-level risk profile. Derived from stored rows only:
 * price position vs benchmark, validated report volume, review status and the
 * location risk index. Nothing here is hardcoded per provider.
 */
export function providerRisk(provider: Provider, reports: Report[]) {
  const bm = benchmarkFor(provider.service_type, provider.location_id);
  const mid = (provider.price_low + provider.price_high) / 2;
  const priceComponent = clamp((mid / bm.average_price - 1) * 45);
  const providerReports = reports.filter((r) => r.provider_id === provider.id);
  const reportComponent = clamp(providerReports.length * 12);
  const statusComponent = provider.status === 'Verified' ? 5 : provider.status === 'Monitored' ? 35 : 65;
  const locationComponent = locationById(provider.location_id)?.risk_index ?? 40;
  const score = Math.round(
    0.35 * priceComponent + 0.3 * reportComponent + 0.2 * statusComponent + 0.15 * locationComponent
  );
  return {
    score: clamp(score),
    level: riskLevelFor(score),
    reports: providerReports.length,
    benchmark: bm,
    components: { priceComponent, reportComponent, statusComponent, locationComponent }
  };
}