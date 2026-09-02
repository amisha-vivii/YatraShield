import type { ComplaintCategory, RiskPattern, ServiceType } from '../types';

/** Mirrors the `risk_patterns` table. */
export const riskPatterns: RiskPattern[] = [
{
  id: 'pat-1',
  name: 'AIRPORT → TAXI → OVERCHARGING',
  description: 'Arrivals-kerb pickups quoted at 2–3× the metered airport tariff, often framed as a fixed "hotel drop" rate.',
  service_type: 'Taxi',
  location: 'Delhi Airport (IGI T3)',
  report_count: 37,
  confidence: 82,
  trend: 'Emerging',
  status: 'Active'
},
{
  id: 'pat-2',
  name: 'TOURIST MARKET → GUIDE → FORCED SHOPPING',
  description: 'Guides divert itineraries to commission-linked emporiums and pressure visitors into purchases.',
  service_type: 'Tour Guide',
  location: 'Jaipur / Agra',
  report_count: 24,
  confidence: 74,
  trend: 'Stable',
  status: 'Active'
},
{
  id: 'pat-3',
  name: 'BEACH → RENTAL → DEPOSIT DISPUTE',
  description: 'Scooter rentals withhold deposits citing pre-existing damage; no written condition record at handover.',
  service_type: 'Vehicle Rental',
  location: 'Calangute Beach, Goa',
  report_count: 19,
  confidence: 69,
  trend: 'Emerging',
  status: 'Active'
},
{
  id: 'pat-4',
  name: 'GHAT → BOAT RIDE → UNEXPECTED FARE INCREASE',
  description: 'Per-person fare re-quoted mid-ride as a per-boat charge after departure from the ghat.',
  service_type: 'Boat Ride',
  location: 'Varanasi / Srinagar',
  report_count: 14,
  confidence: 63,
  trend: 'Stable',
  status: 'Monitoring'
},
{
  id: 'pat-5',
  name: 'STATION → TICKET AGENT → FAKE BOOKING',
  description: 'Unauthorised desks issue non-existent tour or rail confirmations against cash payment.',
  service_type: 'Ticket Agent',
  location: 'Bengaluru / Delhi',
  report_count: 11,
  confidence: 58,
  trend: 'Declining',
  status: 'Monitoring'
}];


/**
 * Historical complaint exemplars. In production these are stored as pgvector
 * embeddings of validated complaint text; here the same strings are embedded
 * on demand by services/embeddings.ts.
 */
export interface TextPattern {
  id: string;
  label: string;
  category: ComplaintCategory;
  service_type: ServiceType | 'Any';
  exemplars: string[];
}

export const textPatterns: TextPattern[] = [
{
  id: 'tp-1',
  label: 'Unexpected fare increase',
  category: 'Unexpected fare increase',
  service_type: 'Taxi',
  exemplars: [
  'Driver demanded extra cash after reaching hotel.',
  'Fare was raised after we started the trip from the airport.',
  'Taxi driver asked for additional charge for luggage and night time.',
  'Agreed rate changed on arrival, driver refused to use the meter.']

},
{
  id: 'tp-2',
  label: 'Airport overcharging',
  category: 'Overcharging',
  service_type: 'Taxi',
  exemplars: [
  'Driver offered airport to hotel taxi for a fixed high price.',
  'Airport taxi quoted much more than the prepaid booth rate.',
  'Cab from arrivals asked 2500 rupees for a short hotel drop.',
  'Taxi outside terminal charged three times the normal fare to the hotel.']

},
{
  id: 'tp-3',
  label: 'Forced shopping detour',
  category: 'Forced shopping',
  service_type: 'Tour Guide',
  exemplars: [
  'Guide took us to a handicraft emporium and pressured us to buy carpets.',
  'Tour was diverted to a shop, guide refused to continue until we purchased.',
  'Guide earned commission from the shop and shortened the monument visit.']

},
{
  id: 'tp-4',
  label: 'Deposit not returned',
  category: 'Deposit dispute',
  service_type: 'Vehicle Rental',
  exemplars: [
  'Scooter rental kept my deposit claiming damage that was already there.',
  'Rental shop refused to refund the security deposit after returning the bike.',
  'Owner held my passport and asked for repair money for an old scratch.']

},
{
  id: 'tp-5',
  label: 'Booking not honoured',
  category: 'Fake booking',
  service_type: 'Ticket Agent',
  exemplars: [
  'Agent took cash for a tour package that did not exist.',
  'Hotel had no record of the booking made through the agent.',
  'Ticket confirmation sent by the desk was not valid at the counter.']

}];