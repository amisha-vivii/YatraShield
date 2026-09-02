import React, { useMemo } from 'react';
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
import { RiskMapCanvas } from '../components/RiskMapCanvas';
import { useData } from '../contexts/DataContext';
import { getHotspots, getIntelligenceSummary, getPatterns } from '../services/api';
import { riskLevelFor } from '../services/providerRisk';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartColors = ['#C2410C', '#B7791F', '#1E5EA8', '#157F4A'];

export function Admin() {
  const { reports, status } = useData();
  const summary = useMemo(() => getIntelligenceSummary(reports), [reports]);
  const hotspots = useMemo(() => getHotspots(reports).filter((hotspot) => hotspot.reports > 0), [reports]);
  const patterns = getPatterns();

  const monthly = useMemo(() => {
    const counts = new Map<string, number>();
    reports.forEach((report) => {
      const month = MONTHS[new Date(report.created_at).getMonth()];
      counts.set(month, (counts.get(month) ?? 0) + 1);
    });
    return MONTHS.filter((month) => counts.has(month)).map((month) => ({ month, reports: counts.get(month) ?? 0 }));
  }, [reports]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    reports.forEach((report) => counts.set(report.complaint_category, (counts.get(report.complaint_category) ?? 0) + 1));
    return [...counts.entries()].
    map(([category, count]) => ({ category, count })).
    sort((a, b) => b.count - a.count);
  }, [reports]);

  const metrics = [
  ['TOTAL INCIDENTS', summary.total_reports, 'All reports in the intelligence dataset'],
  ['ACTIVE RISK HOTSPOTS', summary.active_hotspots, 'Risk index >= 55 with reports'],
  ['PENDING REPORTS', summary.pending, 'Awaiting validation'],
  ['PRICE ANOMALIES', summary.price_anomalies, 'Quote >= 1.6x benchmark']];

  return <div className="mx-auto max-w-[1240px] px-5 py-10">
    <header className="border border-line bg-navy rounded-sm px-6 py-8">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-amber-200">ADMINISTRATION {status === 'demo' ? '· DEMO / PROTOTYPE MODE' : ''}</p>
      <h1 className="mt-3 text-3xl font-semibold text-white tracking-tight">YatraShield Administration</h1>
      <p className="mt-2 text-sm text-navy-100 max-w-2xl leading-relaxed">Manage tourism intelligence, incident reports and benchmark data.</p>
    </header>

    <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-sm overflow-hidden">
      {metrics.map(([label, value, note]) => <div key={label} className="bg-white px-5 py-4">
        <dt className="text-[11px] font-semibold tracking-wide text-charcoal-400">{label}</dt>
        <dd className="font-mono tabular text-3xl font-semibold text-navy mt-1.5">{value || 'No data available'}</dd>
        <p className="text-[11px] text-charcoal-400 mt-1">{note}</p>
      </div>)}
    </dl>

    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <section className="border border-line bg-white rounded-sm p-5">
        <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">REPORTS PER MONTH</h2>
        {monthly.length ? <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#E2E6EC" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: '#E2E6EC' }} />
            <Bar dataKey="reports" fill="#1E5EA8" radius={[2, 2, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer></div> : <p className="mt-6 text-sm text-charcoal-600">No data available</p>}
      </section>

      <section className="border border-line bg-white rounded-sm p-5">
        <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">COMPLAINTS BY CATEGORY</h2>
        {categories.length ? <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={categories} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 40 }}>
            <CartesianGrid stroke="#E2E6EC" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
            <YAxis type="category" dataKey="category" width={132} tick={{ fontSize: 11, fill: '#4A5563' }} stroke="#E2E6EC" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: '#E2E6EC' }} />
            <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={18}>{categories.map((item, index) => <Cell key={item.category} fill={chartColors[index % chartColors.length]} />)}</Bar>
          </BarChart>
        </ResponsiveContainer></div> : <p className="mt-6 text-sm text-charcoal-600">No data available</p>}
      </section>
    </div>

    <section className="mt-6 border border-line bg-white rounded-sm p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-navy tracking-tight">Risk Intelligence Map</h2><p className="mt-1 text-[12px] text-charcoal-400">Marker size reflects report volume. Risk color reflects the existing location index.</p></div>
        <div className="flex flex-wrap gap-4 text-[11px] text-charcoal-600">{[['#157F4A', 'Low'], ['#B7791F', 'Medium'], ['#C2410C', 'High'], ['#B42318', 'Critical']].map(([color, label]) => <span key={label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}</div>
      </div>
      <div className="mt-4"><RiskMapCanvas hotspots={hotspots} reports={reports} height={430} /></div>
      {!hotspots.length && <p className="mt-3 text-sm text-charcoal-600">No data available</p>}
    </section>

    <section className="mt-6 border border-line bg-white rounded-sm">
      <div className="px-5 py-4 border-b border-line"><h2 className="text-lg font-semibold text-navy tracking-tight">Patterns Under Watch</h2><p className="mt-1 text-[12px] text-charcoal-400">Recurring signals are indicators for review, not proof of fraud.</p></div>
      <ul className="divide-y divide-line">{patterns.map((pattern) => <li key={pattern.id} className="px-5 py-4 grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div><h3 className="text-sm font-semibold text-navy">{pattern.name}</h3><p className="mt-1.5 text-[13px] text-charcoal-600 leading-relaxed">{pattern.description}</p><p className="mt-1.5 text-[11px] text-charcoal-400 font-mono">{pattern.location} · {pattern.service_type}</p></div>
        <div className="flex items-center gap-6 md:justify-end"><div className="text-right"><p className="text-[11px] text-charcoal-400">REPORTS</p><p className="font-mono tabular text-lg font-semibold text-navy">{pattern.report_count}</p></div><div className="text-right"><p className="text-[11px] text-charcoal-400">PATTERN CONFIDENCE</p><p className="font-mono tabular text-lg font-semibold text-navy">{pattern.confidence}%</p></div><div className="text-right"><p className="text-[11px] text-charcoal-400">TREND</p><p className="text-[13px] font-semibold text-navy-500">{pattern.trend}</p></div></div>
      </li>)}</ul>
    </section>

    <section className="mt-6 border border-line bg-white rounded-sm">
      <div className="px-5 py-4 border-b border-line"><h2 className="text-lg font-semibold text-navy tracking-tight">Top hotspots</h2></div>
      {hotspots.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-[11px] font-semibold tracking-wide text-charcoal-400 border-b border-line"><th className="text-left px-5 py-2.5">LOCATION</th><th className="text-left px-3 py-2.5">RISK</th><th className="text-right px-3 py-2.5">REPORTS</th><th className="text-right px-5 py-2.5">ANOMALIES</th></tr></thead><tbody className="divide-y divide-line">{hotspots.slice(0, 8).map((hotspot) => <tr key={hotspot.id}><td className="px-5 py-3"><span className="font-medium text-charcoal">{hotspot.name}</span><span className="block text-[11px] text-charcoal-400">{hotspot.city} · {hotspot.top_pattern}</span></td><td className="px-3 py-3"><RiskBadge level={riskLevelFor(hotspot.risk_index)} score={hotspot.risk_index} /></td><td className="px-3 py-3 text-right font-mono tabular text-charcoal-600">{hotspot.reports}</td><td className="px-5 py-3 text-right font-mono tabular text-charcoal-600">{hotspot.price_anomalies}</td></tr>)}</tbody></table></div> : <p className="px-5 py-4 text-sm text-charcoal-600">No data available</p>}
    </section>
  </div>;
}