import { CheckIcon, LoaderIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const STAGES = [
'Checking local price benchmark',
'Analyzing nearby complaints',
'Evaluating location risk',
'Checking service patterns',
'Analyzing complaint text',
'Calculating risk score'];


/**
 * Progress of the actual request. Stages advance as the pipeline runs and the
 * final stage only completes when FastAPI (or the local engine) has returned.
 */
export function AnalysisStages({ complete }: {complete: boolean;}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (complete) {
      setStage(STAGES.length);
      return;
    }
    const id = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 240);
    return () => window.clearInterval(id);
  }, [complete]);

  return (
    <div className="border border-line bg-white rounded-sm p-5">
      <p className="text-[11px] font-semibold tracking-wide text-charcoal-400">RISK ENGINE PIPELINE</p>
      <ol className="mt-3 space-y-2.5">
        {STAGES.map((label, i) => {
          const state = i < stage ? 'done' : i === stage ? 'active' : 'queued';
          return (
            <li key={label} className="flex items-center gap-2.5">
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {state === 'done' ?
                <CheckIcon className="w-3.5 h-3.5 text-good" strokeWidth={2.5} /> :
                state === 'active' ?
                <LoaderIcon className="w-3.5 h-3.5 text-navy-500 animate-spin" strokeWidth={2.5} /> :

                <span className="w-1.5 h-1.5 rounded-full bg-line" />
                }
              </span>
              <span
                className={`text-[13px] ${
                state === 'queued' ? 'text-charcoal-400' : 'text-charcoal font-medium'}`
                }>
                
                {label}
              </span>
            </li>);

        })}
      </ol>
    </div>);

}