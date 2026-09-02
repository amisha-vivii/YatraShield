import { AlertTriangleIcon, FileTextIcon, IndianRupeeIcon, ShieldCheckIcon, FlagIcon } from 'lucide-react';
import React from 'react';
import type { AnalyzeResponse } from '../types';

const ACTIONS = [
{ key: 'price', label: 'COMPARE PRICES', Icon: IndianRupeeIcon },
{ key: 'alternatives', label: 'FIND SAFER ALTERNATIVE', Icon: ShieldCheckIcon },
{ key: 'evidence', label: 'VIEW EVIDENCE', Icon: FileTextIcon },
{ key: 'report', label: 'REPORT SERVICE', Icon: FlagIcon }] as
const;

export function WarningPanel({
  result,
  onAction



}: {result: AnalyzeResponse;onAction: (key: 'price' | 'alternatives' | 'evidence' | 'report') => void;}) {
  const critical = result.overall_score > 60;
  const tone = critical ?
  'border-alert/30 bg-alert-soft' :
  result.overall_score > 30 ?
  'border-warn/30 bg-warn-soft' :
  'border-good/30 bg-good-soft';
  const iconTone = critical ? 'text-alert' : result.overall_score > 30 ? 'text-warn' : 'text-good';

  return (
    <section className={`border rounded-sm ${tone}`} aria-live="polite">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon className={`w-5 h-5 mt-0.5 shrink-0 ${iconTone}`} strokeWidth={2.2} />
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-navy tracking-tight">{result.recommendation.headline}</h2>
            <p className="text-sm text-charcoal mt-0.5">{result.recommendation.message}</p>
          </div>
        </div>

        <div className="mt-4 pl-8">
          <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">RECOMMENDED</p>
          <ul className="mt-2 space-y-1.5">
            {result.recommendation.actions.map((a) =>
            <li key={a} className="text-sm text-charcoal flex gap-2">
                <span className="text-charcoal-400">—</span>
                <span>{a}</span>
              </li>
            )}
          </ul>
        </div>

        {result.ai_insight &&
        <div className="mt-4 pl-8 border-l-2 border-navy/20">
            <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">AI EXPLANATION</p>
            <p className="mt-1 text-sm text-charcoal leading-relaxed">{result.ai_insight}</p>
          </div>}

        <div className="mt-5 pl-8 flex flex-wrap gap-2">
          {ACTIONS.map(({ key, label, Icon }) =>
          <button
            key={key}
            type="button"
            onClick={() => onAction(key)}
            className="inline-flex items-center gap-1.5 border border-navy/20 bg-white text-navy text-[11px] font-semibold tracking-wide px-3 py-2 rounded-sm hover:bg-navy hover:text-white hover:border-navy transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">
            
              <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
              {label}
            </button>
          )}
        </div>
      </div>
      <p className="px-5 py-3 border-t border-white/60 text-[11px] text-charcoal-600">
        Risk score indicates potential risk and does not establish fraud.
      </p>
    </section>);

}