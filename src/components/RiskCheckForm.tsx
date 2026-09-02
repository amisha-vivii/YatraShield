import { PlayIcon, SearchCheckIcon } from 'lucide-react';
import React from 'react';
import { locations } from '../data/locations';
import { routeFor, routesForService } from '../data/routes';
import { services } from '../data/services';
import type { ServiceType } from '../types';

export interface RiskCheckFormState {
  service_type: ServiceType;
  location_id: string;
  origin_location_id: string;
  destination_location_id: string;
  estimated_minutes: string;
  quoted_price: string;
  description: string;
  time_period: string;
  day_type: string;
  vehicle_type: string;
  luggage_count: string;
  toll_amount: string;
}

const label = 'block text-[11px] font-semibold tracking-wide text-charcoal-400 mb-1.5';
const field =
'w-full border border-line rounded-sm px-3 py-2.5 text-sm text-charcoal bg-white focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 transition-colors duration-150';

export function RiskCheckForm({
  value,
  onChange,
  onSubmit,
  onDemo,
  busy,
  error







}: {value: RiskCheckFormState;onChange: (next: RiskCheckFormState) => void;onSubmit: () => void;onDemo: () => void;busy: boolean;error: string | null;}) {
  const set = <K extends keyof RiskCheckFormState,>(key: K, v: RiskCheckFormState[K]) =>
  onChange({ ...value, [key]: v });

  const serviceRoutes = routesForService(value.service_type);
  const origins = locations.filter((location) => serviceRoutes.some((candidate) => candidate.origin_id === location.id));
  const origin = locations.find((location) => location.id === value.origin_location_id) ?? origins[0];
  const destinations = locations.filter((location) => serviceRoutes.some((candidate) => candidate.origin_id === origin?.id && candidate.destination_id === location.id));
  const route = serviceRoutes.find((candidate) => candidate.origin_id === origin?.id && candidate.destination_id === value.destination_location_id);

  return (
    <form
      className="border border-line bg-white rounded-sm p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="service">SERVICE TYPE</label>
          <select
            id="service"
            className={field}
            value={value.service_type}
            onChange={(e) => {
              const serviceType = e.target.value as ServiceType;
              const firstRoute = routesForService(serviceType)[0];
              onChange({ ...value, service_type: serviceType, origin_location_id: firstRoute?.origin_id ?? '', destination_location_id: firstRoute?.destination_id ?? '', location_id: firstRoute?.destination_id ?? '' });
            }}>
            
            {services.map((s) =>
            <option key={s.id} value={s.name}>{s.name}</option>
            )}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="origin">ORIGIN</label>
          <select
            id="origin"
            className={field}
            value={value.origin_location_id}
            onChange={(e) => {
              const nextOrigin = e.target.value;
              const nextDestination = locations.find((location) => serviceRoutes.some((candidate) => candidate.origin_id === nextOrigin && candidate.destination_id === location.id));
              onChange({
                ...value,
                origin_location_id: nextOrigin,
                destination_location_id: nextDestination?.id ?? value.destination_location_id,
                location_id: nextDestination?.id ?? value.location_id,
                estimated_minutes: nextDestination ? String(serviceRoutes.find((candidate) => candidate.origin_id === nextOrigin && candidate.destination_id === nextDestination.id)?.estimated_minutes ?? '') : ''
              });
            }}>
            
            {origins.map((l) =>
            <option key={l.id} value={l.id}>{l.name} · {l.city}</option>
            )}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="destination">DESTINATION</label>
          <select
            id="destination"
            className={field}
            value={value.destination_location_id}
            onChange={(e) => {
              const nextDestination = e.target.value;
              const nextRoute = serviceRoutes.find((candidate) => candidate.origin_id === value.origin_location_id && candidate.destination_id === nextDestination);
              onChange({
                ...value,
                destination_location_id: nextDestination,
                location_id: nextDestination,
                estimated_minutes: nextRoute ? String(nextRoute.estimated_minutes) : value.estimated_minutes
              });
            }}>
            {destinations.map((l) =>
            <option key={l.id} value={l.id}>{l.name} · {l.city}</option>
            )}
          </select>
          {route &&
          <p className="mt-1.5 text-[11px] text-charcoal-400">Showing routes available for {value.service_type}. Dataset route: {route.distance_km} km · about {route.estimated_minutes} min</p>}
          {!route && <p className="mt-1.5 text-[11px] text-crit">No routes available for this service.</p>}
        </div>

        <div>
          <label className={label} htmlFor="price">QUOTED PRICE (₹)</label>
          <input
            id="price"
            type="number"
            min={1}
            inputMode="numeric"
            className={`${field} font-mono tabular`}
            value={value.quoted_price}
            onChange={(e) => set('quoted_price', e.target.value)}
            placeholder="2500" />
          
        </div>

        <div>
          <label className={label} htmlFor="time">ESTIMATED TIME (MINUTES)</label>
          <input
            id="time"
            type="number"
            min={1}
            inputMode="numeric"
            className={field}
            value={value.estimated_minutes}
            onChange={(e) => set('estimated_minutes', e.target.value)}
            placeholder="35" />
        </div>
      </div>

      <div className="mt-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div><label className={label} htmlFor="travel-time">TIME PERIOD</label><select id="travel-time" className={field} value={value.time_period} onChange={(e) => set('time_period', e.target.value)}><option value="">Not specified</option><option>Day</option><option>Night</option></select></div>
          <div><label className={label} htmlFor="day-type">DAY TYPE</label><select id="day-type" className={field} value={value.day_type} onChange={(e) => set('day_type', e.target.value)}><option value="">Not specified</option><option>Weekday</option><option>Weekend</option></select></div>
          <div><label className={label} htmlFor="vehicle">VEHICLE / SERVICE</label><select id="vehicle" className={field} value={value.vehicle_type} onChange={(e) => set('vehicle_type', e.target.value)}><option value="">Not specified</option><option>Standard Sedan</option><option>SUV</option><option>Auto-rickshaw</option></select></div>
          <div><label className={label} htmlFor="luggage">LUGGAGE (BAGS)</label><input id="luggage" type="number" min={0} className={field} value={value.luggage_count} onChange={(e) => set('luggage_count', e.target.value)} placeholder="Not specified" /></div>
        </div>
        <div className="max-w-[220px] mb-4"><label className={label} htmlFor="toll">TOLL / EXTRA CHARGES (₹)</label><input id="toll" type="number" min={0} className={`${field} font-mono tabular`} value={value.toll_amount} onChange={(e) => set('toll_amount', e.target.value)} placeholder="0" /></div>
        <label className={label} htmlFor="description">DESCRIPTION</label>
        <textarea
          id="description"
          rows={3}
          className={`${field} resize-y`}
          value={value.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Driver offered airport to hotel taxi for ₹2500." />
        
        <p className="mt-1.5 text-[11px] text-charcoal-400">
          Route distance is calculated from the selected locations. Estimated time helps identify unusual
          fare-per-kilometre or fare-per-minute patterns.
        </p>
      </div>

      {error &&
      <p role="alert" className="mt-4 text-[13px] text-crit bg-crit-soft border border-crit/20 rounded-sm px-3 py-2">
          {error}
        </p>
      }

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 bg-navy text-white text-xs font-semibold tracking-wide px-5 py-3 rounded-sm hover:bg-navy-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          
          <SearchCheckIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
          {busy ? 'ANALYZING…' : 'ANALYZE RISK'}
        </button>
        <button
          type="button"
          onClick={onDemo}
          disabled={busy}
          className="inline-flex items-center gap-2 border border-line text-charcoal text-xs font-semibold tracking-wide px-5 py-3 rounded-sm hover:border-navy-500 hover:text-navy disabled:opacity-60 transition-colors duration-150">
          
          <PlayIcon className="w-3.5 h-3.5" strokeWidth={2.2} /> TRY LIVE DEMO
        </button>
      </div>
    </form>);

}