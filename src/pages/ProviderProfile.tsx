import { ArrowLeftIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { RiskBadge, riskHex } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { useData } from '../contexts/DataContext';
import { locationById } from '../data/locations';
import { riskPatterns } from '../data/patterns';
import { getProvider } from '../services/api';
import { inr, shortDate } from '../utils/format';

export function ProviderProfile() {
  const { id = '' } = useParams();
  const { reports } = useData();
  const record = useMemo(() => getProvider(id, reports), [id, reports]);

  if (!record) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 py-16">
        <p className="text-sm text-charcoal-600">This provider is not in the database.</p>
        <Link to="/services" className="mt-3 inline-block text-[11px] font-semibold text-navy-500">
          ← BACK TO SERVICE EXPLORER
        </Link>
      </div>);

  }

  const { provider, risk, history } = record;
  const location = locationById(provider.location_id);
  const patterns = riskPatterns.filter((p) => p.service_type === provider.service_type);

  const priceSeries = history.
  slice().
  sort((a, b) => a.created_at > b.created_at ? 1 : -1).
  map((r) => ({ date: shortDate(r.created_at), reported: r.reported_price, benchmark: r.expected_price }));

  const riskSeries = history.
  slice().
  sort((a, b) => a.created_at > b.created_at ? 1 : -1).
  map((r, i) => ({
    date: shortDate(r.created_at),
    score: Math.round(
      0.35 * Math.min(100, ((provider.price_low + provider.price_high) / 2 / risk.benchmark.average_price - 1) * 45) +
      0.3 * Math.min(100, (i + 1) * 12) +
      0.2 * (provider.status === 'Verified' ? 5 : provider.status === 'Monitored' ? 35 : 65) +
      0.15 * (location?.risk_index ?? 40)
    )
  }));

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10">
      <Link to="/services" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-400 hover:text-navy">
        <ArrowLeftIcon className="w-3.5 h-3.5" /> SERVICE EXPLORER
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-navy tracking-tight">{provider.name}</h1>
          <p className="mt-2 text-sm text-charcoal-600">
            {provider.service_type} · {location?.name}, {provider.city} · status{' '}
            <span className="font-medium text-charcoal">{provider.status}</span> · listed {shortDate(provider.created_at)}
          </p>
        </div>
        <RiskBadge level={risk.level} score={risk.score} size="md" />
      </header>

      <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <section className="border border-line bg-white rounded-sm p-6 flex flex-col items-center">
          <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400 self-start">RISK PROFILE</h2>
          <div className="mt-4">
            <RiskGauge score={risk.score} level={risk.level} size={176} />
          </div>
          <dl className="mt-6 w-full divide-y divide-line text-[13px]">
            {[
            ['Price position', `${Math.round(risk.components.priceComponent)} / 100`],
            ['Report volume', `${risk.reports} validated`],
            ['Review status', provider.status],
            ['Location index', `${location?.risk_index}`],
            ['Local benchmark', inr(risk.benchmark.average_price)],
            ['Quoted range', `${inr(provider.price_low)}–${inr(provider.price_high)}`]].
            map(([k, v]) =>
            <div key={k} className="flex justify-between py-2 gap-3">
                <dt className="text-charcoal-400">{k}</dt>
                <dd className="text-charcoal font-medium text-right">{v}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-[11px] text-charcoal-400 leading-relaxed">
            Potential risk indicators only. This profile does not establish fraud or wrongdoing.
          </p>
        </section>

        <div className="space-y-6">
          <section className="border border-line bg-white rounded-sm p-5">
            <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">PRICE HISTORY VS BENCHMARK</h2>
            {priceSeries.length > 1 ?
            <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceSeries} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                    <CartesianGrid stroke="#E2E6EC" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
                    <YAxis tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
                    <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: '#E2E6EC' }} />
                    <Line type="monotone" dataKey="reported" stroke="#C2410C" strokeWidth={2} dot={{ r: 3 }} name="Reported" />
                    <Line type="monotone" dataKey="benchmark" stroke="#1E5EA8" strokeWidth={2} strokeDasharray="4 3" dot={false} name="Benchmark" />
                  </LineChart>
                </ResponsiveContainer>
              </div> :

            <p className="mt-3 text-sm text-charcoal-600">
                Not enough reported prices for this provider to plot a series.
              </p>
            }
          </section>

          <section className="border border-line bg-white rounded-sm p-5">
            <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">RISK HISTORY</h2>
            {riskSeries.length > 1 ?
            <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskSeries} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                    <CartesianGrid stroke="#E2E6EC" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#7A8494' }} stroke="#E2E6EC" />
                    <ReferenceLine y={60} stroke="#B7791F" strokeDasharray="3 3" />
                    <ReferenceLine y={80} stroke="#B42318" strokeDasharray="3 3" />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: '#E2E6EC' }} />
                    <Line type="monotone" dataKey="score" stroke={riskHex(risk.level)} strokeWidth={2} dot={{ r: 3 }} name="Risk score" />
                  </LineChart>
                </ResponsiveContainer>
              </div> :

            <p className="mt-3 text-sm text-charcoal-600">Risk profile has no recorded movement yet.</p>
            }
          </section>

          <section className="border border-line bg-white rounded-sm">
            <h2 className="px-5 py-4 border-b border-line text-lg font-semibold text-navy tracking-tight">
              Reported patterns & timeline
            </h2>
            {patterns.length > 0 &&
            <ul className="px-5 py-4 border-b border-line space-y-2">
                {patterns.map((p) =>
              <li key={p.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13px]">
                    <span className="font-medium text-navy">{p.name}</span>
                    <span className="text-charcoal-400">confidence <span className="font-mono tabular">{p.confidence}%</span></span>
                    <span className="text-charcoal-400">reports <span className="font-mono tabular">{p.report_count}</span></span>
                    <span className="text-[11px] font-semibold text-navy-500">{p.trend.toUpperCase()}</span>
                  </li>
              )}
              </ul>
            }
            <ol className="divide-y divide-line">
              {history.length === 0 &&
              <li className="px-5 py-6 text-sm text-charcoal-600">
                  No complaints are linked to this provider. Its profile reflects location and price position only.
                </li>
              }
              {history.map((r) =>
              <li key={r.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[11px] font-semibold text-navy-500">{r.complaint_category.toUpperCase()}</span>
                    <span className="text-[11px] text-charcoal-400 font-mono">{shortDate(r.created_at)} · {r.status}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-charcoal leading-relaxed">{r.description}</p>
                  <p className="mt-1.5 text-[11px] text-charcoal-400 font-mono">
                    reported {inr(r.reported_price)} · expected {inr(r.expected_price)} · {r.language} · {r.id}
                  </p>
                </li>
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>);

}