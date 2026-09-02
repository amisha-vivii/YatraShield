import type { DataSource } from '../types';

/** Mirrors the `data_sources` table. */
export const dataSources: DataSource[] = [
{
  id: 'ds-1',
  name: 'Government tourism feedback',
  type: 'Public sector feedback',
  description: 'Official source adapter reserved for a verified data.gov.in or state tourism resource. No government records are bundled.',
  status: 'Unavailable',
  last_updated: '2026-08-11'
},
{
  id: 'ds-2',
  name: 'Crowdsourced traveller reports',
  type: 'First-party submissions',
  description: 'Incidents submitted through the YatraShield report form, pending analyst validation.',
  status: 'Crowdsourced',
  last_updated: '2026-08-18'
},
{
  id: 'ds-3',
  name: 'Review signals',
  type: 'Aggregated text signals',
  description: 'Complaint-like sentences extracted from openly published reviews. No proprietary platform APIs are used.',
  status: 'Simulated for prototype',
  last_updated: '2026-08-14'
},
{
  id: 'ds-4',
  name: 'Price benchmarks',
  type: 'Derived reference data',
  description: 'Prototype values remain unverified until an official tariff resource is configured.',
  status: 'Unavailable',
  last_updated: '2026-08-11'
},
{
  id: 'ds-5',
  name: 'Location data',
  type: 'Geospatial',
  description: 'Prototype coordinates remain unverified until an official tourism location resource is configured.',
  status: 'Unavailable',
  last_updated: '2026-08-01'
},
{
  id: 'ds-6',
  name: 'Prototype synthetic dataset',
  type: 'Synthetic',
  description: 'Seed rows generated for demonstration so the pipeline can be evaluated end to end without live feeds.',
  status: 'Simulated for prototype',
  last_updated: '2026-08-18'
}];