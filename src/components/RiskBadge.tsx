import React from 'react';
import type { RiskLevel } from '../types';

const STYLES: Record<RiskLevel, string> = {
  'LOW RISK': 'bg-good-soft text-good border-good/25',
  'MEDIUM RISK': 'bg-warn-soft text-warn border-warn/25',
  'HIGH RISK': 'bg-alert-soft text-alert border-alert/25',
  'CRITICAL RISK': 'bg-crit-soft text-crit border-crit/25'
};

export const riskTone = (level: RiskLevel) => STYLES[level];

export const riskHex = (level: RiskLevel) =>
level === 'LOW RISK' ? '#157F4A' : level === 'MEDIUM RISK' ? '#B7791F' : level === 'HIGH RISK' ? '#C2410C' : '#B42318';

export function RiskBadge({
  level,
  score,
  size = 'sm'




}: {level: RiskLevel;score?: number;size?: 'sm' | 'md';}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-sm font-semibold tracking-wide ${STYLES[level]} ${
      size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`
      }>
      
      {level}
      {score !== undefined && <span className="font-mono tabular opacity-80">{score}</span>}
    </span>);

}