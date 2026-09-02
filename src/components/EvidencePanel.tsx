import React from 'react';
import type { Evidence } from '../types';

export function EvidencePanel({ evidence }: {evidence: Evidence[];}) {
  return (
    <section aria-labelledby="evidence-heading" className="border border-line bg-white rounded-sm">
      <div className="px-5 py-4 border-b border-line">
        <h2 id="evidence-heading" className="text-lg font-semibold text-navy tracking-tight">
          Why was this service flagged?
        </h2>
        <p className="text-xs text-charcoal-400 mt-1">
          Every signal below is traceable to a stored row. No generated reasoning.
        </p>
      </div>
      <ul className="divide-y divide-line">
        {evidence.map((e) =>
        <li key={e.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="sm:w-40 shrink-0">
              <span className="text-[11px] font-semibold tracking-wide text-navy-500">{e.type}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal">{e.title}</p>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{e.description}</p>
            </div>
            <div className="sm:w-28 sm:text-right shrink-0">
              <span className="font-mono tabular text-sm font-semibold text-navy">{e.value}</span>
            </div>
          </li>
        )}
      </ul>
    </section>);

}