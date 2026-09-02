import { motion } from 'framer-motion';
import React from 'react';
import type { RiskLevel } from '../types';
import { riskHex } from './RiskBadge';

export function RiskGauge({
  score,
  level,
  size = 208




}: {score: number;level: RiskLevel;size?: number;}) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = riskHex(level);

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Risk score ${score} of 100, ${level}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E6EC" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }} />
        
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono tabular font-semibold text-navy leading-none" style={{ fontSize: size * 0.26 }}>
          {score}
        </div>
        <div className="text-[11px] font-medium text-charcoal-400 mt-1">/ 100</div>
      </div>
    </div>);

}