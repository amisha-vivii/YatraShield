import React from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from 'react-leaflet';
import type { Report } from '../types';
import { inr } from '../utils/format';

export interface Hotspot {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  risk_index: number;
  reports: number;
  price_anomalies: number;
  incidents: number;
  top_pattern: string;
}

function tone(risk: number) {
  if (risk >= 70) return '#B42318';
  if (risk >= 55) return '#C2410C';
  if (risk >= 40) return '#B7791F';
  return '#157F4A';
}

export function RiskMapCanvas({
  hotspots,
  reports = [],
  height = 460,
  center = [22.8, 79],
  zoom = 5,
  compact = false,
  onSelect








}: {hotspots: Hotspot[];reports?: Report[];height?: number | string;center?: [number, number];zoom?: number;compact?: boolean;onSelect?: (h: Hotspot) => void;}) {
  return (
    <div style={{ height }} className="w-full overflow-hidden border border-line rounded-sm bg-navy-100">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={!compact}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}>
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        

        {!compact &&
        reports.map((r) =>
        <CircleMarker
          key={r.id}
          center={[r.latitude, r.longitude]}
          radius={3}
          pathOptions={{ color: '#173A61', weight: 1, fillColor: '#173A61', fillOpacity: 0.5 }}>
          
              <Popup>
                <div className="p-3 w-56">
                  <p className="text-[11px] font-semibold tracking-wide text-navy-500">{r.complaint_category.toUpperCase()}</p>
                  <p className="text-xs text-charcoal mt-1 leading-relaxed">{r.description}</p>
                  <p className="text-[11px] text-charcoal-400 mt-2 font-mono">
                    {r.service_type} · quoted {inr(r.reported_price)} vs {inr(r.expected_price)} · {r.created_at}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
        )}

        {hotspots.map((h) =>
        <CircleMarker
          key={h.id}
          center={[h.latitude, h.longitude]}
          radius={compact ? 6 + Math.min(8, h.reports) : 8 + Math.min(14, h.reports * 1.1)}
          pathOptions={{
            color: tone(h.risk_index),
            weight: 1.5,
            fillColor: tone(h.risk_index),
            fillOpacity: 0.18
          }}
          eventHandlers={{ click: () => onSelect?.(h) }}>
          
            {compact ?
          <Tooltip direction="top" offset={[0, -4]}>
                <span className="text-[11px] font-semibold">
                  {h.name} · index {h.risk_index}
                </span>
              </Tooltip> :

          <Popup>
                <div className="p-3 w-64">
                  <p className="text-sm font-semibold text-navy uppercase tracking-wide">{h.name}</p>
                  <p className="text-[11px] text-charcoal-400">{h.city}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                    <dt className="text-charcoal-400">Risk Index</dt>
                    <dd className="font-mono tabular font-semibold text-right" style={{ color: tone(h.risk_index) }}>{h.risk_index}</dd>
                    <dt className="text-charcoal-400">Recent complaints</dt>
                    <dd className="font-mono tabular text-right text-charcoal">{h.reports}</dd>
                    <dt className="text-charcoal-400">Price anomalies</dt>
                    <dd className="font-mono tabular text-right text-charcoal">{h.price_anomalies}</dd>
                    <dt className="text-charcoal-400">Incidents (2 km)</dt>
                    <dd className="font-mono tabular text-right text-charcoal">{h.incidents}</dd>
                  </dl>
                  <p className="mt-3 pt-2 border-t border-line text-[11px] text-charcoal-600">
                    Top pattern: <span className="font-medium text-charcoal">{h.top_pattern}</span>
                  </p>
                </div>
              </Popup>
          }
          </CircleMarker>
        )}
      </MapContainer>
    </div>);

}