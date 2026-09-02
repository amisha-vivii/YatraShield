import { motion } from 'framer-motion';
import { ArrowDownIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlternativesPanel } from '../components/AlternativesPanel';
import { AnalysisStages } from '../components/AnalysisStages';
import { EvidencePanel } from '../components/EvidencePanel';
import { FactorBars } from '../components/FactorBars';
import { PriceComparisonPanel } from '../components/PriceComparisonPanel';
import { RiskBadge } from '../components/RiskBadge';
import { RiskCheckForm, type RiskCheckFormState } from '../components/RiskCheckForm';
import { RiskGauge } from '../components/RiskGauge';
import { WarningPanel } from '../components/WarningPanel';
import { useData } from '../contexts/DataContext';
import { locationById } from '../data/locations';
import { routeFor } from '../data/routes';
import { analyze } from '../services/api';
import type { AnalyzeResponse } from '../types';

const DEMO: RiskCheckFormState = {
  service_type: 'Taxi',
  location_id: 'loc-1',
  origin_location_id: 'loc-1',
  destination_location_id: 'loc-2',
  estimated_minutes: '35',
  quoted_price: '2500',
  description: 'Driver offered airport to hotel taxi for ₹2500.', time_period: 'Night', day_type: 'Weekday', vehicle_type: 'Standard Sedan', luggage_count: '2', toll_amount: '100'
};

const EMPTY: RiskCheckFormState = {
  service_type: 'Taxi',
  location_id: 'loc-1',
  origin_location_id: 'loc-1',
  destination_location_id: 'loc-2',
  estimated_minutes: '',
  quoted_price: '',
  description: '', time_period: '', day_type: '', vehicle_type: '', luggage_count: '', toll_amount: ''
};

export function RiskCheck() {
  const { reports, setLastResult } = useData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState<RiskCheckFormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const altRef = useRef<HTMLDivElement>(null);

  const run = useCallback(
    async (state: RiskCheckFormState) => {
      const price = Number(state.quoted_price);
      if (!Number.isFinite(price) || price <= 0) {
        setError('Enter the quoted price in rupees to analyze this service.');
        return;
      }
      const estimatedMinutes = Number(state.estimated_minutes);
      if (!Number.isFinite(estimatedMinutes) || estimatedMinutes <= 0) {
        setError('Enter the estimated travel time in minutes to analyze the route.');
        return;
      }
      setError(null);
      setBusy(true);
      setResult(null);
      const started = Date.now();
      try {
        const res = await analyze(
          {
            service_type: state.service_type,
            route_id: routeFor(state.origin_location_id, state.destination_location_id)?.id,
            location_id: state.destination_location_id,
            origin_location_id: state.origin_location_id,
            destination_location_id: state.destination_location_id,
            distance_km: routeFor(state.origin_location_id, state.destination_location_id)?.distance_km,
            estimated_minutes: estimatedMinutes,
            quoted_price: price,
            description: state.description,
            provider_id: null,
            time_period: state.time_period || undefined,
            day_type: state.day_type || undefined,
            vehicle_type: state.vehicle_type || undefined,
            luggage_count: state.luggage_count ? Number(state.luggage_count) : undefined,
            toll_amount: state.toll_amount ? Number(state.toll_amount) : undefined
          },
          reports
        );
        const elapsed = Date.now() - started;
        if (elapsed < 1200) await new Promise((r) => setTimeout(r, 1200 - elapsed));
        setResult(res);
        setLastResult(res);
        window.setTimeout(
          () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          60
        );
      } catch {
        setError('The risk engine could not complete this analysis. Please try again in a moment.');
      } finally {
        setBusy(false);
      }
    },
    [reports, setLastResult]
  );

  const startDemo = useCallback(() => {
    setForm(DEMO);
    void run(DEMO);
  }, [run]);

  useEffect(() => {
    if (params.get('demo') === '1') {
      params.delete('demo');
      setParams(params, { replace: true });
      startDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAction = (key: 'price' | 'alternatives' | 'evidence' | 'report') => {
    if (key === 'report') {
      navigate(
        `/report?service=${encodeURIComponent(form.service_type)}&location=${form.location_id}&price=${form.quoted_price}`
      );
      return;
    }
    const target = key === 'price' ? priceRef : key === 'alternatives' ? altRef : evidenceRef;
    target.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const location = locationById(form.location_id);

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-navy tracking-tight">Check a service before you commit</h1>
        <p className="mt-2.5 text-sm text-charcoal-600 leading-relaxed">
          Enter what you were quoted. The request is scored by the risk engine against price benchmarks,
          nearby complaint history, location risk, service patterns and complaint text similarity.
        </p>
      </header>

      <div className="mt-8 grid lg:grid-cols-[1.35fr_0.65fr] gap-6 items-start">
        <RiskCheckForm value={form} onChange={setForm} onSubmit={() => run(form)} onDemo={startDemo} busy={busy} error={error} />

        <aside className="space-y-4">
          {busy || result ?
          <AnalysisStages complete={!!result && !busy} /> :

          <div className="border border-line bg-white rounded-sm p-5">
              <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">SELECTED CONTEXT</p>
              <dl className="mt-3 space-y-2.5 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-400">Location</dt>
                  <dd className="text-charcoal font-medium text-right">{location?.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-400">City</dt>
                  <dd className="text-charcoal font-medium text-right">{location?.city}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-400">Location risk index</dt>
                  <dd className="text-charcoal font-mono tabular font-semibold">{location?.risk_index}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-400">Reports on record</dt>
                  <dd className="text-charcoal font-mono tabular font-semibold">{reports.length}</dd>
                </div>
              </dl>
              <p className="mt-4 pt-3 border-t border-line text-[11px] text-charcoal-400 leading-relaxed">
                Scores describe potential risk from reported signals. They do not establish fraud.
              </p>
            </div>
          }
        </aside>
      </div>

      {result &&
      <motion.div
        ref={resultRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        className="mt-10 space-y-6">
        
          {/* Score */}
          <section className="border border-line bg-white rounded-sm grid lg:grid-cols-[0.9fr_1.1fr] gap-8 p-6 lg:p-8">
            <div className="flex flex-col items-center lg:items-start">
              <RiskBadge level={result.risk_level} size="md" />
              <h2 className="mt-4 text-3xl font-semibold text-navy tracking-tight text-center lg:text-left">
                {result.risk_level.replace(' RISK', '')} RISK
              </h2>
              <p className="mt-1 text-sm text-charcoal-600">Potential risk detected.</p>
              <div className="mt-6">
                <RiskGauge score={result.overall_score} level={result.risk_level} />
              </div>
              <button
              type="button"
              onClick={() => onAction('evidence')}
              className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy-500 hover:text-navy">
              
                WHY THIS SCORE? <ArrowDownIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold tracking-wide text-charcoal-400">FACTOR BREAKDOWN</h3>
              <div className="mt-4">
                <FactorBars factors={result.factors} />
              </div>
              <details className="mt-5 border-t border-line pt-4">
                <summary className="cursor-pointer text-xs font-semibold text-navy">HOW WAS THE RISK SCORE CALCULATED?</summary>
                <div className="mt-3 space-y-2 text-xs text-charcoal-600">{result.weighted_calculation.map((item) => <div key={item.label} className="flex justify-between"><span>{item.label} <span className="text-charcoal-400">({Math.round(item.weight * 100)}%)</span></span><span className="font-mono tabular">{item.score} × {Math.round(item.weight * 100)}% = {item.contribution.toFixed(1)}</span></div>)}<div className="border-t border-line pt-2 flex justify-between font-semibold text-navy"><span>TOTAL</span><span>{result.overall_score} / 100</span></div></div>
              </details>
            </div>
          </section>

          <WarningPanel result={result} onAction={onAction} />

          <div ref={evidenceRef}>
            <EvidencePanel evidence={result.evidence} />
          </div>

          <div ref={priceRef}>
            <PriceComparisonPanel data={result.price_comparison} />
          </div>

          <div ref={altRef}>
            <AlternativesPanel alternatives={result.alternatives} />
          </div>

          <section className="border border-crit/20 bg-white rounded-sm p-5 flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-lg font-semibold text-navy">Need help?</h2><p className="mt-1 text-sm text-charcoal-600">Access emergency assistance and optional location sharing.</p></div>
            <button type="button" onClick={() => navigate('/emergency')} className="border border-crit/30 text-crit px-4 py-3 rounded-sm text-xs font-semibold">EMERGENCY ASSISTANCE</button>
          </section>

        </motion.div>
      }
    </div>);

}