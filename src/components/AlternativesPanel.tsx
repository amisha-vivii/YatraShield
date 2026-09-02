import { ArrowRightIcon } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import type { Alternative } from '../types';
import { inr } from '../utils/format';
import { RiskBadge } from './RiskBadge';

export function AlternativesPanel({ alternatives }: {alternatives: Alternative[];}) {
  return (
    <section aria-labelledby="alt-heading" className="border border-line bg-white rounded-sm">
      <div className="px-5 py-4 border-b border-line">
        <h2 id="alt-heading" className="text-lg font-semibold text-navy tracking-tight">Safer alternatives nearby</h2>
        <p className="text-xs text-charcoal-400 mt-1">
          Providers retrieved from the database, ranked by computed risk profile.
        </p>
      </div>

      {alternatives.length === 0 ?
      <p className="px-5 py-6 text-sm text-charcoal-600">
          No lower-risk provider is on record for this service within 12 km. Prefer a prepaid or metered
          option and confirm the fare before you start.
        </p> :

      <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-[11px] font-semibold tracking-wide text-charcoal-400 border-b border-line">
                <th scope="col" className="text-left px-5 py-2.5">PROVIDER</th>
                <th scope="col" className="text-left px-3 py-2.5">SERVICE</th>
                <th scope="col" className="text-left px-3 py-2.5">PRICE</th>
                <th scope="col" className="text-left px-3 py-2.5">RISK</th>
                <th scope="col" className="text-right px-3 py-2.5">DISTANCE</th>
                <th scope="col" className="text-right px-3 py-2.5">REPORTS</th>
                <th scope="col" className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {alternatives.map((a) =>
            <tr key={a.provider_id} className="hover:bg-canvas transition-colors duration-150">
                  <td className="px-5 py-3 font-medium text-charcoal">{a.provider}</td>
                  <td className="px-3 py-3 text-charcoal-600">{a.service}</td>
                  <td className="px-3 py-3 font-mono tabular text-navy">{inr(a.price_low)}–{inr(a.price_high)}</td>
                  <td className="px-3 py-3"><RiskBadge level={a.risk_level} score={a.risk_score} /></td>
                  <td className="px-3 py-3 text-right font-mono tabular text-charcoal-600">{a.distance_km} km</td>
                  <td className="px-3 py-3 text-right font-mono tabular text-charcoal-600">{a.reports}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                  to={`/services/${a.provider_id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-500 hover:text-navy">
                  
                      PROFILE <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }
    </section>);

}