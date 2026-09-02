import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiskMapCanvas, type Hotspot } from '../components/RiskMapCanvas';
import { useData } from '../contexts/DataContext';
import { locations } from '../data/locations';
import { services } from '../data/services';
import { getHotspots } from '../services/api';
import { riskLevelFor } from '../services/providerRisk';
import { inr, shortDate } from '../utils/format';

const RISK_LEVELS = ['All levels', 'LOW RISK', 'MEDIUM RISK', 'HIGH RISK', 'CRITICAL RISK'];
const WINDOWS = [
{ label: 'All dates', days: 0 },
{ label: 'Last 30 days', days: 30 },
{ label: 'Last 90 days', days: 90 },
{ label: 'Last 6 months', days: 180 }];


const control =
'w-full border border-line rounded-sm px-2.5 py-2 text-[13px] text-charcoal bg-white focus:outline-none focus:border-navy-500 transition-colors duration-150';
const controlLabel = 'block text-[11px] font-semibold tracking-wide text-charcoal-400 mb-1';

export function RiskMap() {
  const { reports } = useData();
  const [city, setCity] = useState('All cities');
  const [service, setService] = useState('All services');
  const [level, setLevel] = useState('All levels');
  const [windowDays, setWindowDays] = useState(0);
  const [category, setCategory] = useState('All complaints');
  const [selected, setSelected] = useState<Hotspot | null>(null);

  const cities = useMemo(() => ['All cities', ...new Set(locations.map((l) => l.city))], []);
  const categories = useMemo(
    () => ['All complaints', ...new Set(reports.map((r) => r.complaint_category))],
    [reports]
  );

  const filteredReports = useMemo(() => {
    const cutoff = windowDays ? Date.now() - windowDays * 86400000 : 0;
    return reports.filter((r) => {
      const loc = locations.find((l) => l.id === r.location_id);
      if (city !== 'All cities' && loc?.city !== city) return false;
      if (service !== 'All services' && r.service_type !== service) return false;
      if (category !== 'All complaints' && r.complaint_category !== category) return false;
      if (cutoff && new Date(r.created_at).getTime() < cutoff) return false;
      return true;
    });
  }, [reports, city, service, category, windowDays]);

  const hotspots = useMemo(
    () =>
    getHotspots(filteredReports).filter((h) => {
      if (city !== 'All cities' && h.city !== city) return false;
      if (level !== 'All levels' && riskLevelFor(h.risk_index) !== level) return false;
      return true;
    }),
    [filteredReports, city, level]
  );

  const detail = selected ?? hotspots[0];

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-navy tracking-tight">Risk map</h1>
          <p className="mt-2 text-sm text-charcoal-600 max-w-2xl">
            Hotspots are computed from report density within a 5 km PostGIS radius of each tourism location.
            Small markers are individual reports.
          </p>
        </div>
        <p className="text-[11px] font-semibold tracking-wide text-charcoal-400 border border-line rounded-sm px-2.5 py-1.5">
          {filteredReports.length} REPORTS IN VIEW
        </p>
      </header>

      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <div className="border border-line bg-white rounded-sm p-4 grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className={controlLabel} htmlFor="f-city">CITY</label>
              <select id="f-city" className={control} value={city} onChange={(e) => setCity(e.target.value)}>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={controlLabel} htmlFor="f-service">SERVICE</label>
              <select id="f-service" className={control} value={service} onChange={(e) => setService(e.target.value)}>
                <option>All services</option>
                {services.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={controlLabel} htmlFor="f-level">RISK LEVEL</label>
              <select id="f-level" className={control} value={level} onChange={(e) => setLevel(e.target.value)}>
                {RISK_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={controlLabel} htmlFor="f-date">DATE</label>
              <select
                id="f-date"
                className={control}
                value={windowDays}
                onChange={(e) => setWindowDays(Number(e.target.value))}>
                
                {WINDOWS.map((w) => <option key={w.label} value={w.days}>{w.label}</option>)}
              </select>
            </div>
            <div>
              <label className={controlLabel} htmlFor="f-cat">COMPLAINT TYPE</label>
              <select id="f-cat" className={control} value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <RiskMapCanvas
              hotspots={hotspots}
              reports={filteredReports}
              height={520}
              onSelect={setSelected} />
            
          </div>
        </div>

        <aside className="space-y-4">
          {detail ?
          <section className="border border-line bg-white rounded-sm">
              <div className="px-4 py-3.5 border-b border-line">
                <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">{detail.name}</h2>
                <p className="text-[11px] text-charcoal-400 mt-0.5">{detail.city}</p>
              </div>
              <dl className="px-4 py-3 divide-y divide-line text-[13px]">
                {[
              ['Risk Index', detail.risk_index],
              ['Recent complaints', detail.reports],
              ['Price anomalies', detail.price_anomalies],
              ['Incidents (2 km)', detail.incidents]].
              map(([k, v]) =>
              <div key={String(k)} className="flex justify-between py-2">
                    <dt className="text-charcoal-400">{k}</dt>
                    <dd className="font-mono tabular font-semibold text-navy">{v}</dd>
                  </div>
              )}
                <div className="py-2">
                  <dt className="text-charcoal-400">Top pattern</dt>
                  <dd className="text-charcoal font-medium mt-0.5">{detail.top_pattern}</dd>
                </div>
              </dl>
              <div className="px-4 pb-4">
                <Link
                to={`/risk-check`}
                className="block text-center border border-navy/20 text-navy text-[11px] font-semibold tracking-wide px-3 py-2 rounded-sm hover:bg-navy hover:text-white transition-colors duration-150">
                
                  CHECK A SERVICE HERE
                </Link>
              </div>
            </section> :

          <p className="border border-line bg-white rounded-sm p-4 text-sm text-charcoal-600">
              No hotspot matches the current filters.
            </p>
          }

          <section className="border border-line bg-white rounded-sm">
            <h2 className="px-4 py-3 border-b border-line text-[11px] font-semibold tracking-wide text-charcoal-400">
              LATEST REPORTS IN VIEW
            </h2>
            <ul className="divide-y divide-line max-h-[320px] overflow-y-auto">
              {filteredReports.slice(0, 12).map((r) =>
              <li key={r.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-semibold text-navy-500">{r.complaint_category}</span>
                    <span className="text-[11px] text-charcoal-400 font-mono shrink-0">{shortDate(r.created_at)}</span>
                  </div>
                  <p className="text-[13px] text-charcoal mt-1 leading-snug">{r.description}</p>
                  <p className="text-[11px] text-charcoal-400 mt-1 font-mono">
                    {r.service_type} · {inr(r.reported_price)} vs {inr(r.expected_price)}
                  </p>
                </li>
              )}
              {filteredReports.length === 0 &&
              <li className="px-4 py-4 text-sm text-charcoal-600">No reports match these filters.</li>
              }
            </ul>
          </section>
        </aside>
      </div>
    </div>);

}