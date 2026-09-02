import type { Location } from '../types';

/** Mirrors the `locations` table (PostgreSQL/PostGIS, geom GEOGRAPHY(Point,4326)). */
export const locations: Location[] = [
{ id: 'loc-1', name: 'Delhi Airport (IGI T3)', city: 'Delhi', latitude: 28.5562, longitude: 77.1, risk_index: 78 },
{ id: 'loc-2', name: 'Connaught Place', city: 'Delhi', latitude: 28.6315, longitude: 77.2167, risk_index: 61 },
{ id: 'loc-3', name: 'Paharganj', city: 'Delhi', latitude: 28.6448, longitude: 77.212, risk_index: 69 },
{ id: 'loc-4', name: 'Amber Fort Road', city: 'Jaipur', latitude: 26.9855, longitude: 75.8513, risk_index: 64 },
{ id: 'loc-5', name: 'Taj Ganj', city: 'Agra', latitude: 27.175, longitude: 78.0422, risk_index: 66 },
{ id: 'loc-6', name: 'Calangute Beach', city: 'Goa', latitude: 15.5439, longitude: 73.7553, risk_index: 57 },
{ id: 'loc-7', name: 'CSMT Precinct', city: 'Mumbai', latitude: 18.9398, longitude: 72.8355, risk_index: 47 },
{ id: 'loc-8', name: 'Dashashwamedh Ghat', city: 'Varanasi', latitude: 25.3072, longitude: 83.0107, risk_index: 52 },
{ id: 'loc-9', name: 'Mall Road', city: 'Manali', latitude: 32.2432, longitude: 77.1892, risk_index: 39 },
{ id: 'loc-10', name: 'Fort Kochi', city: 'Kochi', latitude: 9.9658, longitude: 76.2422, risk_index: 31 },
{ id: 'loc-11', name: 'Majestic Bus Stand', city: 'Bengaluru', latitude: 12.9776, longitude: 77.5713, risk_index: 44 },
{ id: 'loc-12', name: 'Dal Lake Boulevard', city: 'Srinagar', latitude: 34.113, longitude: 74.877, risk_index: 43 },
{ id: 'loc-13', name: 'City Palace', city: 'Udaipur', latitude: 24.576, longitude: 73.6833, risk_index: 36 },
{ id: 'loc-14', name: 'Howrah Station', city: 'Kolkata', latitude: 22.5836, longitude: 88.3426, risk_index: 48 },
{ id: 'loc-15', name: 'Marina Beach', city: 'Chennai', latitude: 13.0505, longitude: 80.2824, risk_index: 42 },
{ id: 'loc-16', name: 'Charminar', city: 'Hyderabad', latitude: 17.3616, longitude: 78.4747, risk_index: 54 },
{ id: 'loc-17', name: 'Gateway of India', city: 'Mumbai', latitude: 18.922, longitude: 72.8347, risk_index: 51 },
{ id: 'loc-18', name: 'Golden Temple', city: 'Amritsar', latitude: 31.6200, longitude: 74.8765, risk_index: 46 },
{ id: 'loc-19', name: 'Rishikesh Ghat', city: 'Rishikesh', latitude: 30.0869, longitude: 78.2676, risk_index: 40 },
{ id: 'loc-20', name: 'Bodh Gaya Temple', city: 'Bodh Gaya', latitude: 24.6961, longitude: 84.9913, risk_index: 38 },
{ id: 'loc-21', name: 'Puri Beach', city: 'Puri', latitude: 19.8135, longitude: 85.8312, risk_index: 44 },
{ id: 'loc-22', name: 'Mysore Palace', city: 'Mysuru', latitude: 12.3052, longitude: 76.6552, risk_index: 34 },
{ id: 'loc-23', name: 'Kaziranga Gate', city: 'Kohora', latitude: 26.5775, longitude: 93.1711, risk_index: 29 },
{ id: 'loc-24', name: 'Leh Market', city: 'Leh', latitude: 34.165, longitude: 77.584, risk_index: 35 },
{ id: 'loc-25', name: 'Jaipur Junction', city: 'Jaipur', latitude: 26.9196, longitude: 75.7878, risk_index: 49 },
{ id: 'loc-26', name: 'Hawa Mahal', city: 'Jaipur', latitude: 26.9239, longitude: 75.8267, risk_index: 58 },
{ id: 'loc-27', name: 'Varanasi Cantt Station', city: 'Varanasi', latitude: 25.333, longitude: 82.998, risk_index: 45 },
{ id: 'loc-28', name: 'Agra Cantt Station', city: 'Agra', latitude: 27.1577, longitude: 77.9958, risk_index: 48 },
{ id: 'loc-29', name: 'Agra Fort', city: 'Agra', latitude: 27.1795, longitude: 78.0211, risk_index: 57 },
{ id: 'loc-30', name: 'Assi Ghat', city: 'Varanasi', latitude: 25.289, longitude: 83.006, risk_index: 47 },
{ id: 'loc-31', name: 'Jantar Mantar', city: 'Jaipur', latitude: 26.9247, longitude: 75.8246, risk_index: 52 },
{ id: 'loc-32', name: 'Jaipur City Palace', city: 'Jaipur', latitude: 26.9258, longitude: 75.8237, risk_index: 50 },
{ id: 'loc-33', name: 'Chhatrapati Shivaji Terminus', city: 'Mumbai', latitude: 18.9402, longitude: 72.8356, risk_index: 49 }];


export const locationById = (id: string) => locations.find((l) => l.id === id);