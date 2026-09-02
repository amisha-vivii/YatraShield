import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { inr } from '../utils/format';

export function Dashboard() {
  const { account } = useAuth(); const { lastResult } = useData();
  return <div className="mx-auto max-w-[1000px] px-5 py-10"><header><p className="text-[11px] font-semibold tracking-[0.14em] text-navy-500">TRAVELER ACCOUNT</p><h1 className="mt-3 text-3xl font-semibold text-navy tracking-tight">Welcome back, {account?.fullName || 'traveler'}</h1><p className="mt-2 text-sm text-charcoal-600">Your saved safety context stays on this device in demo mode.</p></header><div className="mt-7 flex flex-wrap gap-3"><Link to="/risk-check" className="bg-navy text-white text-xs font-semibold tracking-wide px-4 py-3 rounded-sm">CHECK A SERVICE</Link><Link to="/emergency" className="border border-crit/30 text-crit text-xs font-semibold tracking-wide px-4 py-3 rounded-sm">EMERGENCY ASSISTANCE</Link></div><section className="mt-8 border border-line bg-white rounded-sm"><h2 className="px-5 py-4 border-b border-line text-[11px] font-semibold tracking-wide text-charcoal-400">RECENT RISK CHECKS</h2>{lastResult ? <div className="px-5 py-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-medium text-navy">{lastResult.location.name}</p><p className="mt-1 text-sm text-charcoal-600">{lastResult.engine.source === 'fastapi' ? 'FastAPI risk analysis' : 'Demo risk analysis'} · {inr(lastResult.price_comparison.quoted)}</p></div><p className="font-mono tabular font-semibold text-navy">{lastResult.overall_score} / 100</p></div></div> : <p className="px-5 py-5 text-sm text-charcoal-600">No saved checks yet. Run a risk check to see it here.</p>}</section></div>;
}
