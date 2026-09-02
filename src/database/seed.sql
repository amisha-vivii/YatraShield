-- YatraShield · seed data (PROTOTYPE DATASET, synthetic)
-- Mirrors frontend/src/data/*.ts so the demo produces the same scores
-- whether it runs against FastAPI or the local reference engine.

INSERT INTO services (id, name, category, description) VALUES
  ('svc-1', 'Taxi', 'Transport', 'Point-to-point road transfer, airport and intercity pickups.'),
  ('svc-2', 'Hotel', 'Accommodation', 'Short-stay accommodation and guest houses.'),
  ('svc-3', 'Tour Guide', 'Guided experience', 'Monument and city guiding services.'),
  ('svc-4', 'Vehicle Rental', 'Transport', 'Scooter, bike and self-drive car rental.'),
  ('svc-5', 'Souvenir Shop', 'Retail', 'Handicraft and textile retail aimed at visitors.'),
  ('svc-6', 'Boat Ride', 'Guided experience', 'Lake, backwater and river boat services.'),
  ('svc-7', 'Ticket Agent', 'Booking', 'Third-party ticket and tour booking desks.'),
  ('svc-8', 'Airport Transfer', 'Transport', 'Pre-booked airport transfer and hotel drop services.'),
  ('svc-9', 'Bus Tour', 'Guided experience', 'Sightseeing bus tours and city circuits.'),
  ('svc-10', 'Train Ticket', 'Booking', 'Railway ticket and reservation assistance.'),
  ('svc-11', 'Restaurant', 'Food and dining', 'Tourist-area restaurants and dining services.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, city, latitude, longitude, risk_index) VALUES
  ('loc-1', 'Delhi Airport (IGI T3)', 'Delhi', 28.5562, 77.1000, 78),
  ('loc-2', 'Connaught Place', 'Delhi', 28.6315, 77.2167, 61),
  ('loc-3', 'Paharganj', 'Delhi', 28.6448, 77.2120, 69),
  ('loc-4', 'Amber Fort Road', 'Jaipur', 26.9855, 75.8513, 64),
  ('loc-5', 'Taj Ganj', 'Agra', 27.1750, 78.0422, 66),
  ('loc-6', 'Calangute Beach', 'Goa', 15.5439, 73.7553, 57),
  ('loc-7', 'CSMT Precinct', 'Mumbai', 18.9398, 72.8355, 47),
  ('loc-8', 'Dashashwamedh Ghat', 'Varanasi', 25.3072, 83.0107, 52),
  ('loc-9', 'Mall Road', 'Manali', 32.2432, 77.1892, 39),
  ('loc-10', 'Fort Kochi', 'Kochi', 9.9658, 76.2422, 31),
  ('loc-11', 'Majestic Bus Stand', 'Bengaluru', 12.9776, 77.5713, 44),
  ('loc-12', 'Dal Lake Boulevard', 'Srinagar', 34.1130, 74.8770, 43),
  ('loc-13', 'City Palace', 'Udaipur', 24.5760, 73.6833, 36),
  ('loc-14', 'Howrah Station', 'Kolkata', 22.5836, 88.3426, 48),
  ('loc-15', 'Marina Beach', 'Chennai', 13.0505, 80.2824, 42),
  ('loc-16', 'Charminar', 'Hyderabad', 17.3616, 78.4747, 54),
  ('loc-17', 'Gateway of India', 'Mumbai', 18.9220, 72.8347, 51),
  ('loc-18', 'Golden Temple', 'Amritsar', 31.6200, 74.8765, 46),
  ('loc-19', 'Rishikesh Ghat', 'Rishikesh', 30.0869, 78.2676, 40),
  ('loc-20', 'Bodh Gaya Temple', 'Bodh Gaya', 24.6961, 84.9913, 38),
  ('loc-21', 'Puri Beach', 'Puri', 19.8135, 85.8312, 44),
  ('loc-22', 'Mysore Palace', 'Mysuru', 12.3052, 76.6552, 34),
  ('loc-23', 'Kaziranga Gate', 'Kohora', 26.5775, 93.1711, 29),
  ('loc-24', 'Leh Market', 'Leh', 34.1650, 77.5840, 35),
  ('loc-25', 'Jaipur Junction', 'Jaipur', 26.9196, 75.7878, 49),
  ('loc-26', 'Hawa Mahal', 'Jaipur', 26.9239, 75.8267, 58),
  ('loc-27', 'Varanasi Cantt Station', 'Varanasi', 25.3330, 82.9980, 45),
  ('loc-28', 'Agra Cantt Station', 'Agra', 27.1577, 77.9958, 48),
  ('loc-29', 'Agra Fort', 'Agra', 27.1795, 78.0211, 57),
  ('loc-30', 'Assi Ghat', 'Varanasi', 25.2890, 83.0060, 47),
  ('loc-31', 'Jantar Mantar', 'Jaipur', 26.9247, 75.8246, 52),
  ('loc-32', 'Jaipur City Palace', 'Jaipur', 26.9258, 75.8237, 50),
  ('loc-33', 'Chhatrapati Shivaji Terminus', 'Mumbai', 18.9402, 72.8356, 49)
ON CONFLICT (id) DO NOTHING;

INSERT INTO travel_routes (id, origin_id, destination_id, distance_km, estimated_minutes) VALUES
  ('route-jaipur-1', 'loc-25', 'loc-26', 5.8, 22),
  ('route-jaipur-2', 'loc-25', 'loc-4', 11.2, 32),
  ('route-jaipur-3', 'loc-4', 'loc-25', 11.2, 34),
  ('route-jaipur-4', 'loc-4', 'loc-26', 7.4, 25),
  ('route-jaipur-5', 'loc-4', 'loc-31', 7.1, 24),
  ('route-jaipur-6', 'loc-4', 'loc-32', 7.3, 25),
  ('route-jaipur-7', 'loc-25', 'loc-31', 6.0, 23),
  ('route-jaipur-8', 'loc-25', 'loc-32', 6.2, 24),
  ('route-jaipur-9', 'loc-26', 'loc-4', 7.4, 27),
  ('route-jaipur-10', 'loc-26', 'loc-25', 5.8, 20),
  ('route-jaipur-11', 'loc-26', 'loc-31', 0.4, 3),
  ('route-jaipur-12', 'loc-26', 'loc-32', 0.5, 4),
  ('route-jaipur-13', 'loc-31', 'loc-4', 7.1, 26),
  ('route-jaipur-14', 'loc-31', 'loc-25', 6.0, 24),
  ('route-jaipur-15', 'loc-31', 'loc-26', 0.4, 3),
  ('route-jaipur-16', 'loc-31', 'loc-32', 0.3, 3),
  ('route-jaipur-17', 'loc-32', 'loc-4', 7.3, 27),
  ('route-jaipur-18', 'loc-32', 'loc-25', 6.2, 25),
  ('route-jaipur-19', 'loc-32', 'loc-26', 0.5, 4),
  ('route-jaipur-20', 'loc-32', 'loc-31', 0.3, 3),
  ('route-delhi-1', 'loc-1', 'loc-2', 15.4, 42),
  ('route-delhi-2', 'loc-1', 'loc-3', 17.1, 48),
  ('route-delhi-3', 'loc-2', 'loc-1', 15.4, 50),
  ('route-delhi-4', 'loc-2', 'loc-3', 2.2, 12),
  ('route-delhi-5', 'loc-3', 'loc-1', 17.1, 52),
  ('route-delhi-6', 'loc-3', 'loc-2', 2.2, 14),
  ('route-mumbai-1', 'loc-7', 'loc-17', 2.7, 14),
  ('route-mumbai-2', 'loc-17', 'loc-7', 2.7, 16),
  ('route-mumbai-3', 'loc-7', 'loc-33', 0.4, 4),
  ('route-mumbai-4', 'loc-17', 'loc-33', 2.5, 13),
  ('route-mumbai-5', 'loc-33', 'loc-7', 0.4, 5),
  ('route-mumbai-6', 'loc-33', 'loc-17', 2.5, 15),
  ('route-varanasi-1', 'loc-8', 'loc-27', 4.3, 18),
  ('route-varanasi-2', 'loc-27', 'loc-8', 4.3, 20),
  ('route-varanasi-3', 'loc-8', 'loc-30', 2.6, 14),
  ('route-varanasi-4', 'loc-27', 'loc-30', 5.0, 24),
  ('route-varanasi-5', 'loc-30', 'loc-8', 2.6, 15),
  ('route-varanasi-6', 'loc-30', 'loc-27', 5.0, 26),
  ('route-agra-1', 'loc-5', 'loc-28', 4.8, 18),
  ('route-agra-2', 'loc-5', 'loc-29', 2.4, 12),
  ('route-agra-3', 'loc-28', 'loc-5', 4.8, 20),
  ('route-agra-4', 'loc-28', 'loc-29', 3.1, 14),
  ('route-agra-5', 'loc-29', 'loc-5', 2.4, 13),
  ('route-agra-6', 'loc-29', 'loc-28', 3.1, 16)
ON CONFLICT (id) DO NOTHING;

INSERT INTO service_routes (id, service_type, origin_id, destination_id, origin_name, destination_name, distance_km, estimated_duration_minutes, base_price) VALUES
  ('sr-taxi-delhi-cp', 'Taxi', 'loc-1', 'loc-2', 'Delhi Airport (IGI T3)', 'Connaught Place', 15.4, 42, 900),
  ('sr-taxi-delhi-paharganj', 'Taxi', 'loc-1', 'loc-3', 'Delhi Airport (IGI T3)', 'Paharganj', 17.1, 48, 1000),
  ('sr-taxi-cp-airport', 'Taxi', 'loc-2', 'loc-1', 'Connaught Place', 'Delhi Airport (IGI T3)', 15.4, 50, 900),
  ('sr-taxi-agra-fort', 'Taxi', 'loc-5', 'loc-29', 'Taj Ganj', 'Agra Fort', 2.4, 12, 300),
  ('sr-tour-agra', 'Tour Guide', 'loc-29', 'loc-5', 'Agra Fort', 'Taj Ganj', 2.4, 12, 800),
  ('sr-boat-mumbai', 'Boat Ride', 'loc-17', 'loc-7', 'Gateway of India', 'CSMT Precinct', 2.7, 14, 650)
ON CONFLICT (id) DO NOTHING;

INSERT INTO price_benchmarks (id, service_type, location_id, min_price, average_price, max_price, route_or_distance_band, vehicle_type, time_period, day_type, luggage_included, toll_included, p25_price, median_price, p75_price, sample_count, source_type, last_updated) VALUES
  ('pb-1', 'Taxi', 'loc-1', 450, 550, 650, '12-18 km', 'Standard Sedan', 'Night', 'Weekday', true, false, 450, 550, 650, 42, 'SYNTHETIC PROTOTYPE CASES', '2026-08-20');

INSERT INTO price_benchmarks (id, service_type, location_id, min_price, average_price, max_price) VALUES
  ('pb-2', 'Taxi', 'loc-2', 180, 260, 340),
  ('pb-4', 'Taxi', 'loc-5', 400, 550, 700),
  ('pb-7', 'Tour Guide', 'loc-5', 600, 900, 1200),
  ('pb-10', 'Vehicle Rental', 'loc-6', 350, 500, 700),
  ('pb-13', 'Hotel', 'loc-1', 1800, 2600, 3600),
  ('pb-17', 'Ticket Agent', 'loc-1', 200, 350, 500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO providers (id, name, service_type, city, location_id, latitude, longitude, price_low, price_high, status) VALUES
  ('PRV-01', 'CityRide Airport Taxi', 'Taxi', 'Delhi', 'loc-1', 28.5620, 77.1090, 850, 950, 'Verified'),
  ('PRV-02', 'IGI Prepaid Taxi Booth', 'Taxi', 'Delhi', 'loc-1', 28.5575, 77.1035, 700, 900, 'Verified'),
  ('PRV-03', 'Skyline Cabs', 'Taxi', 'Delhi', 'loc-1', 28.5510, 77.0960, 1200, 1800, 'Monitored'),
  ('PRV-04', 'Metro Connect Taxi', 'Taxi', 'Delhi', 'loc-1', 28.5680, 77.0930, 800, 1000, 'Verified'),
  ('PRV-05', 'Gateway Airport Cabs', 'Taxi', 'Delhi', 'loc-1', 28.5590, 77.1015, 2200, 2800, 'Under review'),
  ('PRV-06', 'Capital Kerb Cabs', 'Taxi', 'Delhi', 'loc-1', 28.5548, 77.0985, 1800, 2600, 'Under review')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, service_type, location_id, provider_id, reported_price, expected_price,
                     description, complaint_category, latitude, longitude, language, status, created_at) VALUES
  ('RPT-1001', 'Taxi', 'loc-1', 'PRV-05', 2400, 850, 'Driver at arrivals kerb asked 2400 for a hotel drop and refused the meter.', 'Overcharging', 28.5570, 77.1012, 'English', 'Validated', '2026-08-14'),
  ('RPT-1002', 'Taxi', 'loc-1', 'PRV-06', 2200, 850, 'Cab from terminal 3 charged almost three times the prepaid booth rate.', 'Overcharging', 28.5595, 77.1035, 'English', 'Validated', '2026-08-10'),
  ('RPT-1003', 'Taxi', 'loc-1', 'PRV-05', 2600, 850, 'Driver demanded extra cash after reaching hotel, said luggage charge was separate.', 'Unexpected fare increase', 28.5610, 77.0960, 'English', 'Validated', '2026-08-06'),
  ('RPT-1004', 'Taxi', 'loc-1', 'PRV-03', 1900, 850, 'Agreed fare changed once we left the airport, night charge added without notice.', 'Unexpected fare increase', 28.5500, 77.1050, 'Hindi', 'Validated', '2026-07-29'),
  ('RPT-1005', 'Taxi', 'loc-1', 'PRV-06', 2500, 850, 'Taxi outside the terminal quoted a fixed 2500 for a 12 km hotel transfer.', 'Overcharging', 28.5480, 77.0930, 'English', 'Validated', '2026-07-21'),
  ('RPT-1006', 'Taxi', 'loc-1', 'PRV-05', 2050, 850, 'Driver said meter was broken and asked for a flat high rate to Aerocity.', 'Overcharging', 28.5670, 77.1080, 'English', 'Validated', '2026-07-12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO risk_patterns (id, name, description, service_type, location, report_count, confidence, trend, status) VALUES
  ('pat-1', 'AIRPORT → TAXI → OVERCHARGING', 'Arrivals-kerb pickups quoted at 2-3x the metered airport tariff.', 'Taxi', 'Delhi Airport (IGI T3)', 37, 82, 'Emerging', 'Active'),
  ('pat-2', 'TOURIST MARKET → GUIDE → FORCED SHOPPING', 'Guides divert itineraries to commission-linked emporiums.', 'Tour Guide', 'Jaipur / Agra', 24, 74, 'Stable', 'Active'),
  ('pat-3', 'BEACH → RENTAL → DEPOSIT DISPUTE', 'Rentals withhold deposits citing pre-existing damage.', 'Vehicle Rental', 'Calangute Beach, Goa', 19, 69, 'Emerging', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO data_sources (id, name, type, description, status) VALUES
  ('ds-1', 'Government tourism feedback', 'Public sector feedback', 'Visitor grievance records and helpline transcripts.', 'Simulated for prototype'),
  ('ds-2', 'Crowdsourced traveller reports', 'First-party submissions', 'Incidents submitted through YatraShield.', 'Crowdsourced'),
  ('ds-4', 'Price benchmarks', 'Derived reference data', 'Published tariffs and validated report medians.', 'Derived'),
  ('ds-5', 'Location data', 'Geospatial', 'OpenStreetMap geometry stored as PostGIS geography.', 'Derived')
ON CONFLICT (id) DO NOTHING;
