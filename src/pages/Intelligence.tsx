import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { RiskBadge } from '../components/RiskBadge';
import { useData } from '../contexts/DataContext';
import { getHotspots, getIntelligenceSummary, getPatterns } from '../services/api';
import { riskLevelFor } from '../services/providerRisk';

const OPS_IMAGE = "/7749a4e0-f59b-437c-b548-3f15d22e4af9.jpg";
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Intelligence() {
  const { reports, status } = useData();
  const summary = useMemo(() => getIntelligenceSummary(reports), [reports]);
  const hotspots = useMemo(() => getHotspots(reports).filter((h) => h.reports > 0), [reports]);
  const patterns = getPatterns();

  const monthly = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reports) {
      const key = MONTHS[new Date(r.created_at).getMonth()];
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return MONTHS.filter((m) => counts.has(m)).map((m) => ({ month: m, reports: counts.get(m) ?? 0 }));
  }, [reports]);

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reports) counts.set(r.complaint_category, (counts.get(r.complaint_category) ?? 0) + 1);
    return [...counts.entries()].
    map(([category, count]) => ({ category, count })).
    sort((a, b) => b.count - a.count);
  }, [reports]);

  const metrics = [
  { label: 'TOTAL REPORTS', value: summary.total_reports, note: `${summary.pending} pending validation` },
  { label: 'ACTIVE HOTSPOTS', value: summary.active_hotspots, note: 'risk index ≥ 55 with reports' },
  { label: 'HIGH-RISK SERVICES', value: summary.high_risk_services, note: 'provider risk score > 60' },
  { label: 'PRICE ANOMALIES', value: summary.price_anomalies, note: 'quote ≥ 1.6× benchmark' }];


  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10">
      <header className="relative overflow-hidden border border-line rounded-sm bg-navy">
        <img src={OPS_IMAGE} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-navy/80" aria-hidden />
        <div className="relative px-6 py-8">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-navy-100/80">
            AUTHORITY VIEW {status === 'demo' ? '· DEMO MODE' : ''}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white tracking-tight">Tourism Risk Intelligence</h1>
          <p className="mt-2 text-sm text-navy-100 max-w-2xl leading-relaxed">
            Aggregated view over the same PostgreSQL tables the traveller-facing risk check reads from.
            Every figure below recomputes when reports are submitted or imported.
          </p>
        </div>
      </header>

      <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-sm overflow-hidden">
        {metrics.map((m) =>
        <div key={m.label} className="bg-white px-5 py-4">
            <dt className="text-[11px] font-semibold tracking-wide text-charcoal-400">{m.label}</dt>
            <dd className="font-mono tabular text-3xl font-semibold text-navy mt-1.5">{m.value}</dd>
            <p className="text-[11px] text-charcoal-400 mt-1">{m.note}</p>
          </div>
        )}
      </dl>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <section className="border border-line bg-white rounded-sm p-5">
          <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">REPORTS PER MONTH</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="#E2E6EC" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: '#E2E6EC' }} />
                <Bar dataKey="reports" fill="#1E5EA8" radius={[2, 2, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border border-line bg-white rounded-sm p-5">
          <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">COMPLAINTS BY CATEGORY</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 40 }}>
                <CartesianGrid stroke="#E2E6EC" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
                <YAxis type="category" dataKey="category" width={132} tick={{ fontSize: 11, fill: '#4A5563' }} stroke="#E2E6EC" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: '#E2E6EC' }} />
                <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={18}>
                  {byCategory.map((d, i) =>
                  <Cell key={d.category} fill={i === 0 ? '#C2410C' : i === 1 ? '#B7791F' : '#1E5EA8'} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-6 border border-line bg-white rounded-sm">
        <div className="px-5 py-4 border-b border-line flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-navy tracking-tight">Pattern intelligence</h2>
          <span className="text-[11px] text-charcoal-400 font-mono">risk_patterns</span>
        </div>
        <ul className="divide-y divide-line">
          {patterns.map((p) =>
          <li key={p.id} className="px-5 py-4 grid md:grid-cols-[1fr_auto] gap-4 items-start">
              <div>
                <h3 className="text-sm font-semibold text-navy">{p.name}</h3>
                <p className="mt-1.5 text-[13px] text-charcoal-600 leading-relaxed max-w-3xl">{p.description}</p>
                <p className="mt-1.5 text-[11px] text-charcoal-400 font-mono">{p.location} · {p.service_type}</p>
              </div>
              <div className="flex items-center gap-6 md:justify-end">
                <div className="text-right">
                  <p className="text-[11px] text-charcoal-400">REPORTS</p>
                  <p className="font-mono tabular text-lg font-semibold text-navy">{p.report_count}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-charcoal-400">CONFIDENCE</p>
                  <p className="font-mono tabular text-lg font-semibold text-navy">{p.confidence}%</p>
                </div>
                <div className="text-right w-24">
                  <p className="text-[11px] text-charcoal-400">STATUS</p>
                  <p className="text-[13px] font-semibold text-navy-500">{p.trend}</p>
                </div>
              </div>
            </li>
          )}
        </ul>
      </section>

      <div className="mt-6">
        <section className="border border-line bg-white rounded-sm">
          <div className="px-5 py-4 border-b border-line flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-navy tracking-tight">Top hotspots</h2>
            <Link to="/risk-map" className="text-[11px] font-semibold text-navy-500 hover:text-navy">OPEN MAP →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-semibold tracking-wide text-charcoal-400 border-b border-line">
                <th scope="col" className="text-left px-5 py-2.5">LOCATION</th>
                <th scope="col" className="text-left px-3 py-2.5">RISK</th>
                <th scope="col" className="text-right px-3 py-2.5">REPORTS</th>
                <th scope="col" className="text-right px-5 py-2.5">ANOMALIES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {hotspots.slice(0, 8).map((h) =>
              <tr key={h.id}>
                  <td className="px-5 py-3">
                    <span className="font-medium text-charcoal">{h.name}</span>
                    <span className="block text-[11px] text-charcoal-400">{h.city} · {h.top_pattern}</span>
                  </td>
                  <td className="px-3 py-3"><RiskBadge level={riskLevelFor(h.risk_index)} score={h.risk_index} /></td>
                  <td className="px-3 py-3 text-right font-mono tabular text-charcoal-600">{h.reports}</td>
                  <td className="px-5 py-3 text-right font-mono tabular text-charcoal-600">{h.price_anomalies}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

      </div>
    </div>);

}