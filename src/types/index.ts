export type RiskLevel = 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | 'CRITICAL RISK';

export type ServiceType =
'Taxi' |
'Hotel' |
'Tour Guide' |
'Vehicle Rental' |
'Souvenir Shop' |
'Boat Ride' |
'Ticket Agent' |
'Airport Transfer' |
'Bus Tour' |
'Train Ticket' |
'Restaurant';

export type ComplaintCategory =
'Overcharging' |
'Unexpected fare increase' |
'Forced shopping' |
'Deposit dispute' |
'Fake booking' |
'Service not delivered' |
'Aggressive solicitation';

export interface Location {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  risk_index: number;
}

export interface TravelRoute {
  id: string;
  origin_id: string;
  destination_id: string;
  distance_km: number;
  estimated_minutes: number;
  service_type?: ServiceType;
  base_price?: number;
  route_status?: string;
}

export interface Service {
  id: string;
  name: ServiceType;
  category: string;
  description: string;
}

export interface Provider {
  id: string;
  name: string;
  service_type: ServiceType;
  city: string;
  location_id: string;
  latitude: number;
  longitude: number;
  status: 'Verified' | 'Monitored' | 'Under review';
  price_low: number;
  price_high: number;
  created_at: string;
}

export interface PriceBenchmark {
  id: string;
  service_type: ServiceType;
  location_id: string;
  min_price: number;
  average_price: number;
  max_price: number;
  updated_at: string;
  route_or_distance_band?: string;
  vehicle_type?: string;
  time_period?: string;
  day_type?: string;
  luggage_included?: boolean;
  toll_included?: boolean;
  p25_price?: number;
  median_price?: number;
  p75_price?: number;
  sample_count?: number;
  source_type?: string;
}

export interface Report {
  id: string;
  service_type: ServiceType;
  location_id: string;
  provider_id: string | null;
  reported_price: number;
  expected_price: number;
  description: string;
  complaint_category: ComplaintCategory;
  latitude: number;
  longitude: number;
  language: string;
  status: 'Validated' | 'Pending validation' | 'Rejected';
  created_at: string;
}

export interface RiskPattern {
  id: string;
  name: string;
  description: string;
  service_type: ServiceType;
  location: string;
  report_count: number;
  confidence: number;
  trend: 'Emerging' | 'Stable' | 'Declining';
  status: 'Active' | 'Monitoring';
}

export interface Evidence {
  id: string;
  type: 'PRICE SIGNAL' | 'COMPLAINT SIGNAL' | 'LOCATION SIGNAL' | 'SERVICE PATTERN' | 'TEXT SIGNAL';
  title: string;
  description: string;
  value: string;
  source: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'Simulated for prototype' | 'Crowdsourced' | 'Derived';
  last_updated: string;
}

export interface RiskFactor {
  key: 'price' | 'complaint' | 'geo' | 'pattern' | 'text';
  label: string;
  score: number;
  weight: number;
  detail: string;
}

export interface PriceComparison {
  quoted: number;
  benchmark: number;
  range_low: number;
  range_high: number;
  multiple: number;
  deviation_pct: number;
  anomaly_score?: number;
  distance_km?: number;
  estimated_minutes?: number;
  quoted_per_km?: number;
  nearby: {provider: string;price_low: number;price_high: number;distance_km: number;}[];
  data_confidence?: 'High' | 'Medium' | 'Low';
  sample_count?: number;
  context?: Record<string, string | number | null>;
}

export interface Alternative {
  provider_id: string;
  provider: string;
  service: ServiceType;
  price_low: number;
  price_high: number;
  risk_score: number;
  risk_level: RiskLevel;
  distance_km: number;
  reports: number;
}

export interface AnalyzeRequest {
  service_type: ServiceType;
  location_id: string;
  origin_location_id?: string;
  destination_location_id?: string;
  distance_km?: number;
  estimated_minutes?: number;
  quoted_price: number;
  description: string;
  provider_id: string | null;
  route_id?: string;
  time_period?: string;
  day_type?: string;
  vehicle_type?: string;
  luggage_count?: number;
  toll_amount?: number;
}

export interface AnalyzeResponse {
  request_id: string;
  overall_score: number;
  risk_level: RiskLevel;
  price_score: number;
  complaint_score: number;
  geo_score: number;
  service_pattern_score: number;
  text_score: number;
  data_confidence: 'High' | 'Medium' | 'Low';
  price_deviation: number;
  benchmark_price: number;
  expected_min: number;
  expected_max: number;
  benchmark_context: Record<string, string | number | null>;
  benchmark_sample_count: number;
  weighted_calculation: {label: string;score: number;weight: number;contribution: number;}[];
  benchmark?: {min_price: number;average_price: number;max_price: number;};
  factors: RiskFactor[];
  evidence: Evidence[];
  reasons: string[];
  recommendation: {headline: string;message: string;actions: string[];};
  ai_insight?: string | null;
  price_comparison: PriceComparison;
  alternatives: Alternative[];
  matched_pattern: {name: string;similarity: number;category: ComplaintCategory;} | null;
  location: Location;
  engine: {source: 'fastapi' | 'local-fallback';anomaly_model: string;embedding_model: string;};
}