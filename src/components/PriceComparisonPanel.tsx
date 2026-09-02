import React from 'react';
import type { PriceComparison } from '../types';
import { inr } from '../utils/format';

export function PriceComparisonPanel({ data }: {data: PriceComparison;}) {
  const max = Math.max(data.quoted, data.range_high) * 1.08;
  const bar = (value: number) => `${Math.max(2, value / max * 100)}%`;

  return (
    <section aria-labelledby="price-heading" className="border border-line bg-white rounded-sm">
      <div className="px-5 py-4 border-b border-line">
        <h2 id="price-heading" className="text-lg font-semibold text-navy tracking-tight">Price comparison</h2>
        <p className="text-xs text-charcoal-400 mt-1">
          Route-adjusted benchmark using published tariffs, validated report medians, and the selected journey distance.
        </p>
        <p className="mt-2 text-xs text-charcoal-600 leading-relaxed">
          There is no single official original price for every trip. The benchmark is the typical price for this
          service and route; the local range shows the observed low-to-high prices used for comparison.
        </p>
        <p className="mt-3 text-xs font-medium text-navy">Data confidence: {data.data_confidence ?? 'Not specified'} · Based on {data.sample_count ?? 'limited'} comparable observations.</p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">YOUR QUOTE</p>
            <p className="font-mono tabular text-2xl font-semibold text-alert mt-1">{inr(data.quoted)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">LOCAL RANGE</p>
            <p className="font-mono tabular text-2xl font-semibold text-navy mt-1">
              {inr(data.range_low)}–{inr(data.range_high)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">BENCHMARK</p>
            <p className="font-mono tabular text-2xl font-semibold text-navy mt-1">{inr(data.benchmark)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] text-charcoal-600 mb-1">
              <span>Quoted</span>
              <span className="font-mono tabular">{inr(data.quoted)}</span>
            </div>
            <div className="h-3 bg-navy-100 rounded-sm overflow-hidden">
              <div className="h-full bg-alert rounded-sm transition-[width] duration-200" style={{ width: bar(data.quoted) }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-charcoal-600 mb-1">
              <span>Benchmark</span>
              <span className="font-mono tabular">{inr(data.benchmark)}</span>
            </div>
            <div className="h-3 bg-navy-100 rounded-sm overflow-hidden">
              <div className="h-full bg-navy-500 rounded-sm transition-[width] duration-200" style={{ width: bar(data.benchmark) }} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-charcoal">
          Your quote is approximately{' '}
          <span className="font-semibold font-mono tabular text-navy">{data.multiple.toFixed(1)}×</span> the benchmark
          <span className="text-charcoal-600"> ({data.deviation_pct >= 0 ? '+' : ''}{data.deviation_pct}% deviation).</span>
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs"><div className="border border-line rounded-sm px-3 py-2"><span className="text-charcoal-400">PRICE DEVIATION</span><strong className="ml-2 font-mono tabular text-alert">{data.deviation_pct >= 0 ? '+' : ''}{data.deviation_pct}%</strong><p className="mt-1 text-charcoal-500">Mathematical comparison with the contextual benchmark.</p></div><div className="border border-line rounded-sm px-3 py-2"><span className="text-charcoal-400">ANOMALY SCORE</span><strong className="ml-2 font-mono tabular text-navy">{data.anomaly_score ?? '—'} / 100</strong><p className="mt-1 text-charcoal-500">Normalized signal from comparable pricing patterns.</p></div></div>
        {data.context && <details className="mt-4 border-t border-line pt-4"><summary className="cursor-pointer text-xs font-semibold text-navy">HOW WAS THIS BENCHMARK CALCULATED?</summary><dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-charcoal-600">{Object.entries(data.context).map(([key, value]) => <div key={key}><dt className="text-charcoal-400 capitalize">{key.replace('_', ' ')}</dt><dd className="font-medium text-charcoal">{value ?? 'Not specified'}</dd></div>)}</dl></details>}

        {data.distance_km !== undefined &&
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-line pt-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">ROUTE DISTANCE</p>
              <p className="font-mono tabular text-sm font-semibold text-navy mt-1">{data.distance_km} km</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">ESTIMATED TIME</p>
              <p className="font-mono tabular text-sm font-semibold text-navy mt-1">{data.estimated_minutes ?? '—'} min</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">QUOTE / KM</p>
              <p className="font-mono tabular text-sm font-semibold text-navy mt-1">{inr(data.quoted_per_km ?? 0)}</p>
            </div>
          </div>
        }

        {data.nearby.length > 0 &&
        <div className="mt-5 border-t border-line pt-4">
            <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">NEARBY EXAMPLES</p>
            <ul className="mt-2 divide-y divide-line">
              {data.nearby.map((n) =>
            <li key={n.provider} className="py-2 flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-charcoal truncate">{n.provider}</span>
                  <span className="flex items-baseline gap-4 shrink-0">
                    <span className="font-mono tabular text-navy">{inr(n.price_low)}–{inr(n.price_high)}</span>
                    <span className="font-mono tabular text-charcoal-400 text-xs w-16 text-right">{n.distance_km} km</span>
                  </span>
                </li>
            )}
            </ul>
          </div>
        }
      </div>
    </section>);

}