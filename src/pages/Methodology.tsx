import React from 'react';
import { getDataSources } from '../services/api';
import { WEIGHTS } from '../services/riskEngine';

const PIPELINE = [
{ stage: 'INPUTS', items: ['Reports', 'Price', 'Location', 'Service patterns', 'Text'] },
{ stage: 'FEATURE EXTRACTION', items: ['Price deviation & ratio', 'PostGIS radius counts', 'Hotspot density', 'Pattern match', 'Sentence embedding'] },
{ stage: 'RISK SCORING', items: ['Isolation Forest anomaly', 'Weighted factor sum', 'Level classification'] },
{ stage: 'CONTEXTUAL WARNING', items: ['Evidence list', 'Recommendation', 'Safer alternatives'] }];


const FACTORS = [
{ label: 'Price anomaly', weight: WEIGHTS.price, detail: 'Deviation from the local benchmark, screened by an Isolation Forest fitted on legitimate quotes.' },
{ label: 'Complaint history', weight: WEIGHTS.complaint, detail: 'Same-service complaints within 2 km and 5 km, plus dominant complaint category.' },
{ label: 'Location risk', weight: WEIGHTS.geo, detail: 'Location risk index combined with incident density inside a 2 km radius.' },
{ label: 'Service pattern', weight: WEIGHTS.pattern, detail: 'Volume of comparable reports and the confidence of the matched stored pattern.' },
{ label: 'Text signal', weight: WEIGHTS.text, detail: 'Cosine similarity between the complaint embedding and historical complaint exemplars.' }];


const LEVELS = [
{ range: '0–30', label: 'LOW RISK', color: '#157F4A' },
{ range: '31–60', label: 'MEDIUM RISK', color: '#B7791F' },
{ range: '61–80', label: 'HIGH RISK', color: '#C2410C' },
{ range: '81–100', label: 'CRITICAL RISK', color: '#B42318' }];


const ARCHITECTURE = [
'React frontend',
'FastAPI backend',
'Tourism risk engine',
'PostgreSQL / PostGIS',
'Supabase-hosted database'];


export function Methodology() {
  const sources = getDataSources();

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-navy tracking-tight">Methodology</h1>
        <p className="mt-2.5 text-sm text-charcoal-600 leading-relaxed">
          YatraShield is a decision-support system. It surfaces signals that deviate from local baselines so a
          traveller can verify before engaging. It does not determine whether an offence occurred.
        </p>
      </header>

      {/* Pipeline */}
      <section className="mt-8 border border-line bg-white rounded-sm p-6">
        <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">SCORING PIPELINE</h2>
        <ol className="mt-5 grid md:grid-cols-4 gap-px bg-line border border-line rounded-sm overflow-hidden">
          {PIPELINE.map((p, i) =>
          <li key={p.stage} className="bg-white p-4">
              <p className="font-mono text-[11px] text-charcoal-400">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-1 text-[12px] font-semibold tracking-wide text-navy">{p.stage}</h3>
              <ul className="mt-2.5 space-y-1">
                {p.items.map((item) =>
              <li key={item} className="text-[13px] text-charcoal-600">{item}</li>
              )}
              </ul>
            </li>
          )}
        </ol>
      </section>

      {/* Weights + levels */}
      <div className="mt-6 grid lg:grid-cols-[1.4fr_0.6fr] gap-6 items-start">
        <section className="border border-line bg-white rounded-sm p-6">
          <h2 className="text-lg font-semibold text-navy tracking-tight">Factor weights</h2>
          <p className="mt-1.5 text-xs text-charcoal-400 font-mono">
            overall = price×0.30 + complaint×0.25 + geo×0.20 + pattern×0.15 + text×0.10
          </p>
          <ul className="mt-5 divide-y divide-line">
            {FACTORS.map((f) =>
            <li key={f.label} className="py-3.5 first:pt-0">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium text-charcoal">{f.label}</span>
                  <span className="font-mono tabular text-sm font-semibold text-navy shrink-0">
                    {Math.round(f.weight * 100)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-navy-100 rounded-sm overflow-hidden">
                  <div className="h-full bg-navy-500 rounded-sm" style={{ width: `${f.weight * 100 * 3.33}%` }} />
                </div>
                <p className="mt-2 text-[13px] text-charcoal-600 leading-relaxed">{f.detail}</p>
              </li>
            )}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="border border-line bg-white rounded-sm p-6">
            <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">RISK LEVELS</h2>
            <ul className="mt-4 space-y-2.5">
              {LEVELS.map((l) =>
              <li key={l.label} className="flex items-center gap-3">
                  <span className="w-1 h-6 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="font-mono tabular text-[13px] text-charcoal-600 w-16">{l.range}</span>
                  <span className="text-[13px] font-semibold text-charcoal">{l.label}</span>
                </li>
              )}
            </ul>
          </section>

          <section className="border border-line bg-white rounded-sm p-6">
            <h2 className="text-[11px] font-semibold tracking-wide text-charcoal-400">ARCHITECTURE</h2>
            <ol className="mt-4 space-y-2">
              {ARCHITECTURE.map((a, i) =>
              <li key={a} className="text-[13px] text-charcoal flex items-center gap-2">
                  <span className="font-mono text-charcoal-400 text-[11px] w-4">{i + 1}</span>
                  {a}
                </li>
              )}
            </ol>
            <p className="mt-4 pt-3 border-t border-line text-[11px] text-charcoal-400 leading-relaxed">
              Machine learning inside the engine: scikit-learn Isolation Forest for unusual price/service
              patterns and sentence embeddings for complaint-text similarity. No large language models are used.
            </p>
          </section>
        </div>
      </div>

      {/* Data sources */}
      <section className="mt-6 border border-line bg-white rounded-sm">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="text-lg font-semibold text-navy tracking-tight">Data sources</h2>
          <p className="text-xs text-charcoal-400 mt-1">
            The MVP operates without proprietary platform APIs. Prototype rows are clearly labelled.
          </p>
        </div>
        <ul className="divide-y divide-line">
          {sources.map((s) =>
          <li key={s.id} className="px-5 py-4 grid md:grid-cols-[220px_1fr_auto] gap-3 items-start">
              <div>
                <p className="text-sm font-medium text-charcoal">{s.name}</p>
                <p className="text-[11px] text-charcoal-400 mt-0.5">{s.type}</p>
              </div>
              <p className="text-[13px] text-charcoal-600 leading-relaxed">{s.description}</p>
              <div className="md:text-right">
                <span
                className={`inline-block text-[11px] font-semibold tracking-wide border rounded-sm px-2 py-0.5 ${
                s.status === 'Simulated for prototype' ?
                'bg-warn-soft text-warn border-warn/25' :
                'bg-navy-100 text-navy border-navy/15'}`
                }>
                
                  {s.status === 'Simulated for prototype' ? 'SIMULATED FOR PROTOTYPE' : s.status.toUpperCase()}
                </span>
                <p className="text-[11px] text-charcoal-400 mt-1 font-mono">{s.last_updated}</p>
              </div>
            </li>
          )}
        </ul>
      </section>

      <section className="mt-6 border border-line bg-white rounded-sm p-6">
        <h2 className="text-lg font-semibold text-navy tracking-tight">Limitations</h2>
        <ul className="mt-3 space-y-2 text-[13px] text-charcoal-600 max-w-3xl leading-relaxed">
          <li>— Scores reflect reported signals only. Absence of reports is not evidence of safety.</li>
          <li>— Benchmarks depend on tariff coverage; sparse locations fall back to national averages.</li>
          <li>— Text similarity quality depends on the loaded sentence-transformer model and language coverage.</li>
          <li>— Prototype data is synthetic. No live government feed is connected.</li>
          <li>— The platform never labels a service as a confirmed scam or guarantees that one is safe.</li>
        </ul>
      </section>
    </div>);

}