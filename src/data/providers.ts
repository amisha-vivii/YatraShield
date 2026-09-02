import type { Provider } from '../types';

/** Mirrors the `providers` table. */
export const providers: Provider[] = [
{ id: 'PRV-01', name: 'CityRide Airport Taxi', service_type: 'Taxi', city: 'Delhi', location_id: 'loc-1', latitude: 28.562, longitude: 77.109, status: 'Verified', price_low: 850, price_high: 950, created_at: '2024-11-04' },
{ id: 'PRV-02', name: 'IGI Prepaid Taxi Booth', service_type: 'Taxi', city: 'Delhi', location_id: 'loc-1', latitude: 28.5575, longitude: 77.1035, status: 'Verified', price_low: 700, price_high: 900, created_at: '2023-06-18' },
{ id: 'PRV-03', name: 'Skyline Cabs', service_type: 'Taxi', city: 'Delhi', location_id: 'loc-1', latitude: 28.551, longitude: 77.096, status: 'Monitored', price_low: 1200, price_high: 1800, created_at: '2025-02-09' },
{ id: 'PRV-04', name: 'Metro Connect Taxi', service_type: 'Taxi', city: 'Delhi', location_id: 'loc-1', latitude: 28.568, longitude: 77.093, status: 'Verified', price_low: 800, price_high: 1000, created_at: '2024-08-21' },
{ id: 'PRV-05', name: 'Gateway Airport Cabs', service_type: 'Taxi', city: 'Delhi', location_id: 'loc-1', latitude: 28.559, longitude: 77.1015, status: 'Under review', price_low: 2200, price_high: 2800, created_at: '2025-12-02' },
{ id: 'PRV-06', name: 'Capital Kerb Cabs', service_type: 'Taxi', city: 'Delhi', location_id: 'loc-1', latitude: 28.5548, longitude: 77.0985, status: 'Under review', price_low: 1800, price_high: 2600, created_at: '2026-01-15' },
{ id: 'PRV-07', name: 'Terminal Tours Desk', service_type: 'Ticket Agent', city: 'Delhi', location_id: 'loc-1', latitude: 28.5628, longitude: 77.0944, status: 'Monitored', price_low: 400, price_high: 900, created_at: '2025-05-30' },
{ id: 'PRV-08', name: 'Aerocity Stay Inn', service_type: 'Hotel', city: 'Delhi', location_id: 'loc-1', latitude: 28.5535, longitude: 77.1188, status: 'Verified', price_low: 2200, price_high: 3200, created_at: '2023-09-12' },
{ id: 'PRV-09', name: 'Paharganj Backpacker Lodge', service_type: 'Hotel', city: 'Delhi', location_id: 'loc-3', latitude: 28.6451, longitude: 77.2118, status: 'Monitored', price_low: 900, price_high: 1800, created_at: '2024-03-07' },
{ id: 'PRV-10', name: 'Taj Heritage Guides', service_type: 'Tour Guide', city: 'Agra', location_id: 'loc-5', latitude: 27.1743, longitude: 78.0429, status: 'Verified', price_low: 700, price_high: 1000, created_at: '2023-12-19' },
{ id: 'PRV-11', name: 'Marble Trail Guides', service_type: 'Tour Guide', city: 'Agra', location_id: 'loc-5', latitude: 27.1756, longitude: 78.0416, status: 'Under review', price_low: 1800, price_high: 2500, created_at: '2025-10-25' },
{ id: 'PRV-12', name: 'Amber Fort Guide Collective', service_type: 'Tour Guide', city: 'Jaipur', location_id: 'loc-4', latitude: 26.9851, longitude: 75.8518, status: 'Verified', price_low: 600, price_high: 900, created_at: '2024-01-30' },
{ id: 'PRV-13', name: 'Pink City Tour Co', service_type: 'Tour Guide', city: 'Jaipur', location_id: 'loc-4', latitude: 26.9862, longitude: 75.8504, status: 'Monitored', price_low: 1200, price_high: 2000, created_at: '2025-07-11' },
{ id: 'PRV-14', name: 'Rajasthan Craft Emporium', service_type: 'Souvenir Shop', city: 'Jaipur', location_id: 'loc-4', latitude: 26.9866, longitude: 75.8526, status: 'Under review', price_low: 1500, price_high: 4000, created_at: '2025-03-16' },
{ id: 'PRV-15', name: 'Calangute Scooter Hub', service_type: 'Vehicle Rental', city: 'Goa', location_id: 'loc-6', latitude: 15.5444, longitude: 73.7546, status: 'Monitored', price_low: 450, price_high: 800, created_at: '2024-10-08' },
{ id: 'PRV-16', name: 'Beachline Rentals', service_type: 'Vehicle Rental', city: 'Goa', location_id: 'loc-6', latitude: 15.5428, longitude: 73.7568, status: 'Verified', price_low: 350, price_high: 550, created_at: '2023-11-27' },
{ id: 'PRV-17', name: 'Mall Road Bike Rentals', service_type: 'Vehicle Rental', city: 'Manali', location_id: 'loc-9', latitude: 32.2436, longitude: 77.1885, status: 'Verified', price_low: 450, price_high: 700, created_at: '2024-06-14' },
{ id: 'PRV-18', name: 'Dal Lake Shikara Union', service_type: 'Boat Ride', city: 'Srinagar', location_id: 'loc-12', latitude: 34.1133, longitude: 74.8765, status: 'Verified', price_low: 600, price_high: 900, created_at: '2023-05-02' },
{ id: 'PRV-19', name: 'Ghat Walk Guides', service_type: 'Tour Guide', city: 'Varanasi', location_id: 'loc-8', latitude: 25.3069, longitude: 83.011, status: 'Verified', price_low: 400, price_high: 700, created_at: '2024-04-23' },
{ id: 'PRV-20', name: 'Majestic Travel Desk', service_type: 'Ticket Agent', city: 'Bengaluru', location_id: 'loc-11', latitude: 12.9781, longitude: 77.5719, status: 'Under review', price_low: 300, price_high: 900, created_at: '2025-08-29' },
{ id: 'PRV-21', name: 'Harbour City Cabs', service_type: 'Taxi', city: 'Mumbai', location_id: 'loc-7', latitude: 18.9392, longitude: 72.8361, status: 'Verified', price_low: 380, price_high: 560, created_at: '2024-02-05' },
{ id: 'PRV-22', name: 'Fort Kochi Ferry Co', service_type: 'Boat Ride', city: 'Kochi', location_id: 'loc-10', latitude: 9.9652, longitude: 76.2429, status: 'Verified', price_low: 300, price_high: 500, created_at: '2023-08-16' }];


export const providerById = (id: string | null) =>
id ? providers.find((p) => p.id === id) : undefined;