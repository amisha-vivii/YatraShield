import type { TravelRoute } from '../types';

/** Curated same-city route distances used by the demo when a route is selected. */
export const travelRoutes: TravelRoute[] = [
  { id: 'route-jaipur-1', origin_id: 'loc-25', destination_id: 'loc-26', distance_km: 5.8, estimated_minutes: 22 },
  { id: 'route-jaipur-2', origin_id: 'loc-25', destination_id: 'loc-4', distance_km: 11.2, estimated_minutes: 32 },
  { id: 'route-jaipur-3', origin_id: 'loc-4', destination_id: 'loc-25', distance_km: 11.2, estimated_minutes: 34 },
  { id: 'route-jaipur-4', origin_id: 'loc-4', destination_id: 'loc-26', distance_km: 7.4, estimated_minutes: 25 },
  { id: 'route-jaipur-5', origin_id: 'loc-4', destination_id: 'loc-31', distance_km: 7.1, estimated_minutes: 24 },
  { id: 'route-jaipur-6', origin_id: 'loc-4', destination_id: 'loc-32', distance_km: 7.3, estimated_minutes: 25 },
  { id: 'route-jaipur-7', origin_id: 'loc-25', destination_id: 'loc-31', distance_km: 6.0, estimated_minutes: 23 },
  { id: 'route-jaipur-8', origin_id: 'loc-25', destination_id: 'loc-32', distance_km: 6.2, estimated_minutes: 24 },
  { id: 'route-jaipur-9', origin_id: 'loc-26', destination_id: 'loc-4', distance_km: 7.4, estimated_minutes: 27 },
  { id: 'route-jaipur-10', origin_id: 'loc-26', destination_id: 'loc-25', distance_km: 5.8, estimated_minutes: 20 },
  { id: 'route-jaipur-11', origin_id: 'loc-26', destination_id: 'loc-31', distance_km: 0.4, estimated_minutes: 3 },
  { id: 'route-jaipur-12', origin_id: 'loc-26', destination_id: 'loc-32', distance_km: 0.5, estimated_minutes: 4 },
  { id: 'route-jaipur-13', origin_id: 'loc-31', destination_id: 'loc-4', distance_km: 7.1, estimated_minutes: 26 },
  { id: 'route-jaipur-14', origin_id: 'loc-31', destination_id: 'loc-25', distance_km: 6.0, estimated_minutes: 24 },
  { id: 'route-jaipur-15', origin_id: 'loc-31', destination_id: 'loc-26', distance_km: 0.4, estimated_minutes: 3 },
  { id: 'route-jaipur-16', origin_id: 'loc-31', destination_id: 'loc-32', distance_km: 0.3, estimated_minutes: 3 },
  { id: 'route-jaipur-17', origin_id: 'loc-32', destination_id: 'loc-4', distance_km: 7.3, estimated_minutes: 27 },
  { id: 'route-jaipur-18', origin_id: 'loc-32', destination_id: 'loc-25', distance_km: 6.2, estimated_minutes: 25 },
  { id: 'route-jaipur-19', origin_id: 'loc-32', destination_id: 'loc-26', distance_km: 0.5, estimated_minutes: 4 },
  { id: 'route-jaipur-20', origin_id: 'loc-32', destination_id: 'loc-31', distance_km: 0.3, estimated_minutes: 3 },
  { id: 'route-delhi-1', origin_id: 'loc-1', destination_id: 'loc-2', distance_km: 15.4, estimated_minutes: 42, service_type: 'Taxi' },
  { id: 'route-delhi-2', origin_id: 'loc-1', destination_id: 'loc-3', distance_km: 17.1, estimated_minutes: 48, service_type: 'Taxi' },
  { id: 'route-delhi-3', origin_id: 'loc-2', destination_id: 'loc-1', distance_km: 15.4, estimated_minutes: 50, service_type: 'Taxi' },
  { id: 'route-delhi-4', origin_id: 'loc-2', destination_id: 'loc-3', distance_km: 2.2, estimated_minutes: 12, service_type: 'Taxi' },
  { id: 'route-delhi-5', origin_id: 'loc-3', destination_id: 'loc-1', distance_km: 17.1, estimated_minutes: 52, service_type: 'Taxi' },
  { id: 'route-delhi-6', origin_id: 'loc-3', destination_id: 'loc-2', distance_km: 2.2, estimated_minutes: 14, service_type: 'Taxi' },
  { id: 'route-mumbai-1', origin_id: 'loc-7', destination_id: 'loc-17', distance_km: 2.7, estimated_minutes: 14 },
  { id: 'route-mumbai-2', origin_id: 'loc-17', destination_id: 'loc-7', distance_km: 2.7, estimated_minutes: 16 },
  { id: 'route-mumbai-3', origin_id: 'loc-7', destination_id: 'loc-33', distance_km: 0.4, estimated_minutes: 4 },
  { id: 'route-mumbai-4', origin_id: 'loc-17', destination_id: 'loc-33', distance_km: 2.5, estimated_minutes: 13 },
  { id: 'route-mumbai-5', origin_id: 'loc-33', destination_id: 'loc-7', distance_km: 0.4, estimated_minutes: 5 },
  { id: 'route-mumbai-6', origin_id: 'loc-33', destination_id: 'loc-17', distance_km: 2.5, estimated_minutes: 15 },
  { id: 'route-varanasi-1', origin_id: 'loc-8', destination_id: 'loc-27', distance_km: 4.3, estimated_minutes: 18 },
  { id: 'route-varanasi-2', origin_id: 'loc-27', destination_id: 'loc-8', distance_km: 4.3, estimated_minutes: 20 },
  { id: 'route-varanasi-3', origin_id: 'loc-8', destination_id: 'loc-30', distance_km: 2.6, estimated_minutes: 14 },
  { id: 'route-varanasi-4', origin_id: 'loc-27', destination_id: 'loc-30', distance_km: 5.0, estimated_minutes: 24 },
  { id: 'route-varanasi-5', origin_id: 'loc-30', destination_id: 'loc-8', distance_km: 2.6, estimated_minutes: 15 },
  { id: 'route-varanasi-6', origin_id: 'loc-30', destination_id: 'loc-27', distance_km: 5.0, estimated_minutes: 26 },
  { id: 'route-agra-1', origin_id: 'loc-5', destination_id: 'loc-28', distance_km: 4.8, estimated_minutes: 18 },
  { id: 'route-agra-2', origin_id: 'loc-5', destination_id: 'loc-29', distance_km: 2.4, estimated_minutes: 12 },
  { id: 'route-agra-3', origin_id: 'loc-28', destination_id: 'loc-5', distance_km: 4.8, estimated_minutes: 20 },
  { id: 'route-agra-4', origin_id: 'loc-28', destination_id: 'loc-29', distance_km: 3.1, estimated_minutes: 14 },
  { id: 'route-agra-5', origin_id: 'loc-29', destination_id: 'loc-5', distance_km: 2.4, estimated_minutes: 13 },
  { id: 'route-agra-6', origin_id: 'loc-29', destination_id: 'loc-28', distance_km: 3.1, estimated_minutes: 16 },
];

export function routeFor(originId: string, destinationId: string) {
  return travelRoutes.find(
    (route) => route.origin_id === originId && route.destination_id === destinationId
  );
}

export function routesForService(serviceType: string) {
  if (serviceType === 'Taxi') return travelRoutes;
  if (serviceType === 'Tour Guide') return travelRoutes.filter((route) => route.origin_id === 'loc-29' && route.destination_id === 'loc-5');
  if (serviceType === 'Boat Ride') return travelRoutes.filter((route) => route.origin_id === 'loc-17' && route.destination_id === 'loc-7');
  return [];
}