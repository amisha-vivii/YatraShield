import { UploadCloudIcon } from 'lucide-react';
import Papa from 'papaparse';
import React, { useRef, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { locations } from '../data/locations';
import { services } from '../data/services';
import type { ComplaintCategory, Report, ServiceType } from '../types';

const FIELDS = [
'incident_id',
'date',
'city',
'latitude',
'longitude',
'service_type',
'complaint_category',
'quoted_price',
'benchmark_price',
'description',
'provider_id',
'status'];


interface Rejection {
  row: number;
  reason: string;
}

export function DataImportPanel() {
  const { importReports } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<number>(0);
  const [valid, setValid] = useState<Report[]>([]);
  const [rejected, setRejected] = useState<Rejection[]>([]);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (rows: Record<string, string>[]) => {
    const accepted: Report[] = [];
    const errors: Rejection[] = [];
    const serviceNames = services.map((s) => s.name as string);

    rows.forEach((row, i) => {
      const lat = Number(row.latitude);
      const lon = Number(row.longitude);
      const quoted = Number(row.quoted_price);
      const benchmark = Number(row.benchmark_price);
      const missing = ['date', 'service_type', 'complaint_category', 'quoted_price'].filter((f) => !row[f]);

      if (missing.length) {
        errors.push({ row: i + 2, reason: `missing ${missing.join(', ')}` });
        return;
      }
      if (!serviceNames.includes(row.service_type)) {
        errors.push({ row: i + 2, reason: `unknown service_type "${row.service_type}"` });
        return;
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        errors.push({ row: i + 2, reason: 'invalid coordinates' });
        return;
      }
      if (!Number.isFinite(quoted) || quoted <= 0) {
        errors.push({ row: i + 2, reason: 'invalid quoted_price' });
        return;
      }

      const nearest = locations.
      map((l) => ({ l, d: Math.hypot(l.latitude - lat, l.longitude - lon) })).
      sort((a, b) => a.d - b.d)[0].l;

      accepted.push({
        id: row.incident_id || `IMP-${Date.now().toString().slice(-5)}-${i}`,
        service_type: row.service_type as ServiceType,
        location_id: nearest.id,
        provider_id: row.provider_id || null,
        reported_price: quoted,
        expected_price: Number.isFinite(benchmark) && benchmark > 0 ? benchmark : quoted,
        description: row.description || 'Imported record without description.',
        complaint_category: row.complaint_category as ComplaintCategory || 'Overcharging',
        latitude: lat,
        longitude: lon,
        language: 'English',
        status: row.status === 'Validated' ? 'Validated' : 'Pending validation',
        created_at: row.date.slice(0, 10)
      });
    });

    setValid(accepted);
    setRejected(errors);
    setParsed(rows.length);
    setApplied(false);
  };

  const onFile = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are accepted.');
      return;
    }
    if (file.size > 2_000_000) {
      setError('File exceeds the 2 MB prototype limit.');
      return;
    }
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => validate(res.data ?? []),
      error: () => setError('The file could not be read. Check that it is a valid CSV export.')
    });
  };

  return (
    <section className="border border-line bg-white rounded-sm">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="text-lg font-semibold text-navy tracking-tight">Data import</h2>
        <p className="text-xs text-charcoal-400 mt-1">
          Rows are validated in the browser, then posted to <span className="font-mono">POST /api/data/import</span> for
          insertion into PostgreSQL. Expected columns: <span className="font-mono">{FIELDS.join(', ')}</span>
        </p>
      </div>

      <div className="p-5">
        <div className="border border-dashed border-line rounded-sm px-5 py-8 text-center">
          <UploadCloudIcon className="w-6 h-6 text-charcoal-400 mx-auto" strokeWidth={2} />
          <p className="mt-2 text-sm text-charcoal">{fileName ?? 'Select an incident CSV to validate'}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }} />
          
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 border border-navy/20 text-navy text-[11px] font-semibold tracking-wide px-4 py-2 rounded-sm hover:bg-navy hover:text-white transition-colors duration-150">
            
            CHOOSE CSV
          </button>
        </div>

        {error &&
        <p role="alert" className="mt-4 text-[13px] text-crit bg-crit-soft border border-crit/20 rounded-sm px-3 py-2">
            {error}
          </p>
        }

        {parsed > 0 &&
        <>
            <dl className="mt-5 grid grid-cols-3 gap-px bg-line border border-line rounded-sm overflow-hidden">
              {[
            ['IMPORTED', parsed],
            ['VALID', valid.length],
            ['REJECTED', rejected.length]].
            map(([k, v]) =>
            <div key={String(k)} className="bg-white px-4 py-3">
                  <dt className="text-[11px] font-semibold tracking-wide text-charcoal-400">{k}</dt>
                  <dd className="font-mono tabular text-2xl font-semibold text-navy mt-1">{v}</dd>
                </div>
            )}
            </dl>

            {rejected.length > 0 &&
          <ul className="mt-4 border border-line rounded-sm divide-y divide-line max-h-40 overflow-y-auto">
                {rejected.slice(0, 20).map((r) =>
            <li key={`${r.row}-${r.reason}`} className="px-3 py-2 text-[12px] text-charcoal-600 font-mono">
                    row {r.row} — {r.reason}
                  </li>
            )}
              </ul>
          }

            <button
            type="button"
            disabled={valid.length === 0 || applied}
            onClick={() => {
              importReports(valid);
              setApplied(true);
            }}
            className="mt-5 bg-navy text-white text-xs font-semibold tracking-wide px-5 py-3 rounded-sm hover:bg-navy-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
            
              {applied ? 'RISK UPDATE COMPLETE' : 'RUN RISK UPDATE'}
            </button>
            {applied &&
          <p className="mt-3 text-[13px] text-good">
                {valid.length} rows inserted. Hotspots, complaint counts and provider risk profiles have been
                recomputed across the platform.
              </p>
          }
          </>
        }
      </div>
    </section>);

}