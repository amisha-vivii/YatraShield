/**
 * Sentence-embedding layer.
 *
 * Production: FastAPI loads a lightweight multilingual sentence-transformer
 * (paraphrase-multilingual-MiniLM-L12-v2), stores complaint vectors in
 * PostgreSQL (pgvector) and compares new text with historical complaint
 * patterns using cosine similarity.
 *
 * Fallback (this module): a deterministic, dependency-free embedding —
 * a hashed bag-of-concepts vector with a synonym/concept lexicon so that
 * paraphrases still land close together. Used when the model cannot be
 * loaded, exactly as specified in the error-handling requirements.
 */

const DIMS = 128;

const STOPWORDS = new Set([
'a', 'an', 'the', 'for', 'to', 'from', 'of', 'and', 'or', 'was', 'were', 'is',
'are', 'be', 'been', 'my', 'our', 'we', 'i', 'he', 'she', 'they', 'it', 'at',
'on', 'in', 'that', 'this', 'with', 'after', 'before', 'me', 'us', 'his',
'her', 'their', 'as', 'so', 'but', 'not', 'no', 'did', 'do', 'had', 'has']
);

/** token → semantic concept tags (kept small and auditable). */
const CONCEPTS: Record<string, string[]> = {
  driver: ['operator', 'transport'],
  drivers: ['operator', 'transport'],
  taxi: ['transport', 'roadtransfer'],
  cab: ['transport', 'roadtransfer'],
  cabs: ['transport', 'roadtransfer'],
  auto: ['transport', 'roadtransfer'],
  rickshaw: ['transport', 'roadtransfer'],
  airport: ['airport', 'transithub'],
  terminal: ['airport', 'transithub'],
  arrivals: ['airport', 'transithub'],
  station: ['transithub'],
  hotel: ['accommodation', 'destination'],
  lodge: ['accommodation', 'destination'],
  room: ['accommodation'],
  guide: ['operator', 'guiding'],
  tour: ['guiding'],
  monument: ['guiding', 'destination'],
  emporium: ['retail', 'shopping'],
  shop: ['retail', 'shopping'],
  showroom: ['retail', 'shopping'],
  carpet: ['retail', 'shopping'],
  carpets: ['retail', 'shopping'],
  handicraft: ['retail', 'shopping'],
  marble: ['retail', 'shopping'],
  inlay: ['retail', 'shopping'],
  buy: ['shopping'],
  purchase: ['shopping'],
  purchased: ['shopping'],
  commission: ['shopping', 'incentive'],
  pressured: ['coercion'],
  pressure: ['coercion'],
  forced: ['coercion'],
  refused: ['coercion', 'dispute'],
  demanded: ['coercion', 'pricepressure'],
  asked: ['pricepressure'],
  charge: ['pricepressure', 'money'],
  charged: ['pricepressure', 'money'],
  charges: ['pricepressure', 'money'],
  surcharge: ['pricepressure', 'money'],
  extra: ['pricepressure', 'increase'],
  additional: ['pricepressure', 'increase'],
  increase: ['increase'],
  increased: ['increase'],
  raised: ['increase'],
  doubled: ['increase', 'overprice'],
  double: ['increase', 'overprice'],
  triple: ['increase', 'overprice'],
  times: ['overprice'],
  overcharged: ['overprice', 'money'],
  overcharging: ['overprice', 'money'],
  inflated: ['overprice', 'money'],
  expensive: ['overprice', 'money'],
  high: ['overprice'],
  fixed: ['quote'],
  flat: ['quote'],
  quoted: ['quote', 'money'],
  quote: ['quote', 'money'],
  offered: ['quote'],
  fare: ['money', 'transport'],
  price: ['money'],
  rate: ['money'],
  cash: ['money'],
  money: ['money'],
  rupees: ['money'],
  deposit: ['deposit', 'money'],
  refund: ['deposit', 'dispute'],
  damage: ['deposit', 'dispute'],
  scratch: ['deposit', 'dispute'],
  passport: ['coercion', 'document'],
  scooter: ['rental', 'transport'],
  bike: ['rental', 'transport'],
  rental: ['rental'],
  meter: ['meter', 'transport'],
  prepaid: ['meter', 'quote'],
  receipt: ['document'],
  booking: ['booking', 'document'],
  booked: ['booking'],
  confirmation: ['booking', 'document'],
  agent: ['booking', 'operator'],
  desk: ['booking', 'operator'],
  package: ['booking'],
  exist: ['nonexistent'],
  invalid: ['nonexistent'],
  boat: ['boat', 'transport'],
  shikara: ['boat', 'transport'],
  ferry: ['boat', 'transport'],
  luggage: ['transport'],
  waiting: ['increase'],
  night: ['increase'],
  drop: ['roadtransfer'],
  transfer: ['roadtransfer']
};

function tokenize(text: string): string[] {
  return text.
  toLowerCase().
  replace(/[₹$€]/g, ' currency ').
  replace(/[^\p{L}\p{N}\s]/gu, ' ').
  split(/\s+/).
  filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function hash(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % DIMS;
}

/** Deterministic sentence vector. Numeric magnitudes become price concepts. */
export function embed(text: string): Float64Array {
  const v = new Float64Array(DIMS);
  const tokens = tokenize(text);
  for (const raw of tokens) {
    const numeric = Number(raw);
    const token = Number.isFinite(numeric) && raw.length > 2 ? numeric >= 1000 ? 'highamount' : 'amount' : raw;
    v[hash(token)] += 1;
    const concepts = CONCEPTS[token] ?? (token === 'highamount' ? ['money', 'overprice'] : token === 'amount' ? ['money'] : []);
    for (const c of concepts) v[hash('#' + c)] += 1.6;
  }
  let norm = 0;
  for (let i = 0; i < DIMS; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < DIMS; i++) v[i] /= norm;
  return v;
}

export function cosine(a: Float64Array, b: Float64Array): number {
  let dot = 0;
  for (let i = 0; i < DIMS; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

/** Similarity of one text against a set of historical exemplars. */
export function similarityToExemplars(text: string, exemplars: string[]): number {
  const q = embed(text);
  const sims = exemplars.map((e) => cosine(q, embed(e)));
  const max = Math.max(...sims);
  const mean = sims.reduce((s, v) => s + v, 0) / sims.length;
  return 0.7 * max + 0.3 * mean;
}