import { SearchIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiskBadge } from '../components/RiskBadge';
import { useData } from '../contexts/DataContext';
import { locations } from '../data/locations';
import { services } from '../data/services';
import { getProviders } from '../services/api';
import { inr, shortDate } from '../utils/format';

type SortKey = 'risk' | 'name' | 'price' | 'reports';

export function ServiceExplorer() {
  const { reports } = useData();
  const [query, setQuery] = useState('');
  const [service, setService] = useState('All services');
  const [city, setCity] = useState('All cities');
  const [sort, setSort] = useState<SortKey>('risk');

  const rows = useMemo(() => {
    const all = getProviders(reports);
    const filtered = all.filter((p) => {
      if (service !== 'All services' && p.service_type !== service) return false;
      if (city !== 'All cities' && p.city !== city) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const loc = locations.find((l) => l.id === p.location_id)?.name ?? '';
        if (!`${p.name} ${p.service_type} ${p.city} ${loc}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'price') return b.price_high - a.price_high;
      if (sort === 'reports') return b.reports - a.reports;
      return b.risk_score - a.risk_score;
    });
  }, [reports, service, city, query, sort]);

  const control =
  'border border-line rounded-sm px-2.5 py-2 text-[13px] text-charcoal bg-white focus:outline-none focus:border-navy-500 transition-colors duration-150';

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10">
      <header>
        <h1 className="text-3xl font-semibold text-navy tracking-tight">Service explorer</h1>
        <p className="mt-2 text-sm text-charcoal-600 max-w-2xl">
          Provider rows from the database with a risk profile computed from price position, validated report
          volume, review status and location risk.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            className={`${control} w-full pl-9`}
            placeholder="Search provider, service or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search providers" />
          
        </div>
        <select className={control} value={service} onChange={(e) => setService(e.target.value)} aria-label="Filter by service">
          <option>All services</option>
          {services.map((s) => <option key={s.id}>{s.name}</option>)}
        </select>
        <select className={control} value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
          <option>All cities</option>
          {[...new Set(locations.map((l) => l.city))].map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={control} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort by">
          <option value="risk">Sort: highest risk</option>
          <option value="reports">Sort: most reports</option>
          <option value="price">Sort: highest price</option>
          <option value="name">Sort: name</option>
        </select>
      </div>

      <div className="mt-5 border border-line bg-white rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <caption className="sr-only">Tourism service providers and their computed risk profiles</caption>
          <thead>
            <tr className="text-[11px] font-semibold tracking-wide text-charcoal-400 border-b border-line">
              <th scope="col" className="text-left px-5 py-3">PROVIDER</th>
              <th scope="col" className="text-left px-3 py-3">SERVICE</th>
              <th scope="col" className="text-left px-3 py-3">LOCATION</th>
              <th scope="col" className="text-left px-3 py-3">PRICE</th>
              <th scope="col" className="text-left px-3 py-3">RISK</th>
              <th scope="col" className="text-right px-3 py-3">REPORTS</th>
              <th scope="col" className="text-right px-5 py-3">UPDATED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) =>
            <tr key={p.id} className="hover:bg-canvas transition-colors duration-150">
                <td className="px-5 py-3">
                  <Link to={`/services/${p.id}`} className="font-medium text-navy hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-[11px] text-charcoal-400 mt-0.5">{p.status} · {p.id}</p>
                </td>
                <td className="px-3 py-3 text-charcoal-600">{p.service_type}</td>
                <td className="px-3 py-3 text-charcoal-600">
                  {locations.find((l) => l.id === p.location_id)?.name}
                  <span className="block text-[11px] text-charcoal-400">{p.city}</span>
                </td>
                <td className="px-3 py-3 font-mono tabular text-navy">{inr(p.price_low)}–{inr(p.price_high)}</td>
                <td className="px-3 py-3"><RiskBadge level={p.risk_level} score={p.risk_score} /></td>
                <td className="px-3 py-3 text-right font-mono tabular text-charcoal-600">{p.reports}</td>
                <td className="px-5 py-3 text-right text-[11px] text-charcoal-400 font-mono">{shortDate(p.updated_at)}</td>
              </tr>
            )}
            {rows.length === 0 &&
            <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-charcoal-600">
                  No provider matches this search.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>);

}