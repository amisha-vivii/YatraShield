import { CheckCircle2Icon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { locationById, locations } from '../data/locations';
import { providers } from '../data/providers';
import { services } from '../data/services';
import { benchmarkFor } from '../services/providerRisk';
import type { ComplaintCategory, ServiceType } from '../types';
import { inr } from '../utils/format';

const CATEGORIES: ComplaintCategory[] = [
'Overcharging',
'Unexpected fare increase',
'Forced shopping',
'Deposit dispute',
'Fake booking',
'Service not delivered',
'Aggressive solicitation'];


const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Kannada', 'Malayalam', 'Urdu', 'French', 'German'];

const label = 'block text-[11px] font-semibold tracking-wide text-charcoal-400 mb-1.5';
const field =
'w-full border border-line rounded-sm px-3 py-2.5 text-sm text-charcoal bg-white focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 transition-colors duration-150';

export function ReportIncident() {
  const [params] = useSearchParams();
  const { addReport } = useData();

  const [serviceType, setServiceType] = useState<ServiceType>(params.get('service') as ServiceType || 'Taxi');
  const [locationId, setLocationId] = useState(params.get('location') || 'loc-1');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [price, setPrice] = useState(params.get('price') || '');
  const [category, setCategory] = useState<ComplaintCategory>('Overcharging');
  const [description, setDescription] = useState('');
  const [providerId, setProviderId] = useState('');
  const [language, setLanguage] = useState('English');
  const [anonymous, setAnonymous] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);

  const benchmark = useMemo(() => benchmarkFor(serviceType, locationId), [serviceType, locationId]);
  const [expected, setExpected] = useState('');

  const matching = providers.filter((p) => p.service_type === serviceType && p.location_id === locationId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = Number(price);
    if (!Number.isFinite(paid) || paid <= 0) {
      setError('Enter the amount you were asked to pay.');
      return;
    }
    if (description.trim().length < 12) {
      setError('Please describe what happened in a sentence or two so the text signal can be computed.');
      return;
    }
    const loc = locationById(locationId)!;
    setError(null);
    const id = addReport({
      service_type: serviceType,
      location_id: locationId,
      provider_id: providerId || null,
      reported_price: paid,
      expected_price: Number(expected) || benchmark.average_price,
      description: description.trim(),
      complaint_category: category,
      latitude: loc.latitude,
      longitude: loc.longitude,
      language
    });
    setReceipt(id);
  };

  if (receipt) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-16">
        <div className="border border-good/25 bg-good-soft rounded-sm p-8 text-center">
          <CheckCircle2Icon className="w-8 h-8 text-good mx-auto" strokeWidth={2} />
          <h1 className="mt-4 text-2xl font-semibold text-navy tracking-tight">REPORT RECEIVED</h1>
          <p className="mt-2 font-mono tabular text-lg text-navy">{receipt}</p>
          <p className="mt-3 text-sm text-charcoal">
            Status: <span className="font-semibold">Pending validation</span>
          </p>
          <p className="mt-4 text-[13px] text-charcoal-600 leading-relaxed max-w-md mx-auto">
            The report is stored in the reports table and already contributes to nearby complaint counts.
            Analysts validate submissions before they influence published pattern confidence.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/risk-map" className="border border-navy/20 bg-white text-navy text-[11px] font-semibold tracking-wide px-4 py-2.5 rounded-sm hover:bg-navy hover:text-white transition-colors duration-150">
              SEE IT ON THE MAP
            </Link>
            <button
              type="button"
              onClick={() => {
                setReceipt(null);
                setDescription('');
                setPrice('');
              }}
              className="border border-line bg-white text-charcoal text-[11px] font-semibold tracking-wide px-4 py-2.5 rounded-sm hover:border-navy-500 hover:text-navy transition-colors duration-150">
              
              SUBMIT ANOTHER
            </button>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="mx-auto max-w-[880px] px-5 py-10">
      <header>
        <h1 className="text-3xl font-semibold text-navy tracking-tight">Report a tourism incident</h1>
      </header>

      <form onSubmit={submit} className="mt-8 border border-line bg-white rounded-sm p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="r-service">SERVICE</label>
            <select id="r-service" className={field} value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
              {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="r-location">LOCATION</label>
            <select id="r-location" className={field} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="r-date">DATE</label>
            <input id="r-date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
          </div>
          <div>
            <label className={label} htmlFor="r-category">COMPLAINT TYPE</label>
            <select id="r-category" className={field} value={category} onChange={(e) => setCategory(e.target.value as ComplaintCategory)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="r-price">PRICE ASKED (₹)</label>
            <input id="r-price" type="number" min={1} className={`${field} font-mono tabular`} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="r-expected">EXPECTED PRICE (₹)</label>
            <input
              id="r-expected"
              type="number"
              min={1}
              className={`${field} font-mono tabular`}
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder={String(benchmark.average_price)} />
            
            <p className="mt-1 text-[11px] text-charcoal-400">
              Local benchmark: {inr(benchmark.average_price)} ({inr(benchmark.min_price)}–{inr(benchmark.max_price)})
            </p>
          </div>
          <div>
            <label className={label} htmlFor="r-provider">PROVIDER (OPTIONAL)</label>
            <select id="r-provider" className={field} value={providerId} onChange={(e) => setProviderId(e.target.value)}>
              <option value="">Not known</option>
              {matching.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="r-language">LANGUAGE</label>
            <select id="r-language" className={field} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="r-description">DESCRIPTION</label>
          <textarea
            id="r-description"
            rows={4}
            className={`${field} resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, including how the price changed." />
          
        </div>

        <label className="mt-4 flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-4 h-4 accent-navy-500" />
          
          <span className="text-[13px] text-charcoal">
            Submit anonymously — no contact details are stored with this report
          </span>
        </label>

        {error &&
        <p role="alert" className="mt-4 text-[13px] text-crit bg-crit-soft border border-crit/20 rounded-sm px-3 py-2">
            {error}
          </p>
        }

        <button
          type="submit"
          className="mt-6 inline-flex items-center bg-navy text-white text-xs font-semibold tracking-wide px-5 py-3 rounded-sm hover:bg-navy-700 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          
          SUBMIT REPORT
        </button>
      </form>
    </div>);

}