import type { PriceBenchmark } from '../types';

/** Mirrors the `price_benchmarks` table. Derived from published tariffs + validated reports. */
export const priceBenchmarks: PriceBenchmark[] = [
{ id: 'pb-1', service_type: 'Taxi', location_id: 'loc-1', min_price: 450, average_price: 550, max_price: 650, updated_at: '2026-08-20', route_or_distance_band: '12-18 km', vehicle_type: 'Standard Sedan', time_period: 'Night', day_type: 'Weekday', luggage_included: true, toll_included: false, p25_price: 450, median_price: 550, p75_price: 650, sample_count: 42, source_type: 'SYNTHETIC PROTOTYPE CASES' },
{ id: 'pb-2', service_type: 'Taxi', location_id: 'loc-2', min_price: 180, average_price: 260, max_price: 340, updated_at: '2026-08-09' },
{ id: 'pb-3', service_type: 'Taxi', location_id: 'loc-3', min_price: 150, average_price: 240, max_price: 320, updated_at: '2026-08-09' },
{ id: 'pb-4', service_type: 'Taxi', location_id: 'loc-5', min_price: 400, average_price: 550, max_price: 700, updated_at: '2026-08-05' },
{ id: 'pb-5', service_type: 'Taxi', location_id: 'loc-7', min_price: 350, average_price: 480, max_price: 620, updated_at: '2026-08-07' },
{ id: 'pb-6', service_type: 'Taxi', location_id: 'loc-4', min_price: 300, average_price: 420, max_price: 560, updated_at: '2026-08-02' },
{ id: 'pb-7', service_type: 'Tour Guide', location_id: 'loc-5', min_price: 600, average_price: 900, max_price: 1200, updated_at: '2026-08-04' },
{ id: 'pb-8', service_type: 'Tour Guide', location_id: 'loc-4', min_price: 500, average_price: 800, max_price: 1100, updated_at: '2026-08-04' },
{ id: 'pb-9', service_type: 'Tour Guide', location_id: 'loc-8', min_price: 400, average_price: 650, max_price: 900, updated_at: '2026-07-30' },
{ id: 'pb-10', service_type: 'Vehicle Rental', location_id: 'loc-6', min_price: 350, average_price: 500, max_price: 700, updated_at: '2026-08-08' },
{ id: 'pb-11', service_type: 'Vehicle Rental', location_id: 'loc-9', min_price: 400, average_price: 600, max_price: 850, updated_at: '2026-08-01' },
{ id: 'pb-12', service_type: 'Hotel', location_id: 'loc-3', min_price: 900, average_price: 1400, max_price: 2100, updated_at: '2026-08-10' },
{ id: 'pb-13', service_type: 'Hotel', location_id: 'loc-1', min_price: 1800, average_price: 2600, max_price: 3600, updated_at: '2026-08-10' },
{ id: 'pb-14', service_type: 'Boat Ride', location_id: 'loc-12', min_price: 500, average_price: 800, max_price: 1200, updated_at: '2026-07-28' },
{ id: 'pb-15', service_type: 'Boat Ride', location_id: 'loc-10', min_price: 300, average_price: 450, max_price: 650, updated_at: '2026-07-28' },
{ id: 'pb-16', service_type: 'Souvenir Shop', location_id: 'loc-4', min_price: 400, average_price: 900, max_price: 1600, updated_at: '2026-07-25' },
{ id: 'pb-17', service_type: 'Ticket Agent', location_id: 'loc-1', min_price: 200, average_price: 350, max_price: 500, updated_at: '2026-08-06' },
{ id: 'pb-18', service_type: 'Ticket Agent', location_id: 'loc-11', min_price: 150, average_price: 280, max_price: 420, updated_at: '2026-08-06' }];


/** National fallback averages used when a location-specific benchmark row is missing. */
export const nationalAverages: Record<string, number> = {
  Taxi: 520,
  Hotel: 2000,
  'Tour Guide': 780,
  'Vehicle Rental': 560,
  'Souvenir Shop': 900,
  'Boat Ride': 620,
  'Ticket Agent': 310,
  'Airport Transfer': 900,
  'Bus Tour': 850,
  'Train Ticket': 450,
  Restaurant: 700
};