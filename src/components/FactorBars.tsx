import { motion } from 'framer-motion';
import React from 'react';
import type { RiskFactor } from '../types';

function tone(score: number) {
  if (score >= 81) return '#B42318';
  if (score >= 61) return '#C2410C';
  if (score >= 31) return '#B7791F';
  return '#157F4A';
}

export function FactorBars({ factors }: {factors: RiskFactor[];}) {
  return (
    <ul className="divide-y divide-line">
      {factors.map((f, i) =>
      <li key={f.key} className="py-3.5 first:pt-0 last:pb-0">
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[11px] font-semibold tracking-wide text-charcoal">{f.label}</span>
              <span className="text-[11px] text-charcoal-400 font-mono tabular shrink-0">
                {Math.round(f.weight * 100)}%
              </span>
            </div>
            <span className="font-mono tabular text-sm font-semibold text-navy shrink-0">{f.score} / 100</span>
          </div>
          <div className="mt-2 h-1.5 bg-navy-100 rounded-sm overflow-hidden">
            <motion.div
            className="h-full rounded-sm"
            style={{ backgroundColor: tone(f.score) }}
            initial={{ width: 0 }}
            animate={{ width: `${f.score}%` }}
            transition={{ duration: 0.26, delay: 0.04 * i, ease: [0.23, 1, 0.32, 1] }} />
          
          </div>
          <p className="mt-2 text-xs text-charcoal-600 leading-relaxed">{f.detail}</p>
        </li>
      )}
    </ul>);

}