/**
 * Isolation Forest.
 *
 * Production: sklearn.ensemble.IsolationForest inside the FastAPI risk engine,
 * fitted on legitimate price/service observations per service type and location.
 *
 * Fallback (this module): the same algorithm implemented directly — random
 * isolation trees, expected path length normalisation
 *   s(x) = 2^(-E(h(x)) / c(n)),  c(n) = 2(ln(n-1)+γ) - 2(n-1)/n
 * with a seeded PRNG so the demo is reproducible. It identifies UNUSUAL
 * patterns; it does not prove fraud.
 */

type Node =
{leaf: true;size: number;} |
{leaf: false;feature: number;split: number;left: Node;right: Node;};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = a + 0x6d2b79f5 >>> 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function harmonicC(n: number): number {
  if (n <= 1) return 1;
  return 2 * (Math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n;
}

function buildTree(rows: number[][], depth: number, limit: number, rand: () => number): Node {
  if (depth >= limit || rows.length <= 1) return { leaf: true, size: rows.length };
  const dims = rows[0].length;
  const feature = Math.floor(rand() * dims);
  let min = Infinity;
  let max = -Infinity;
  for (const r of rows) {
    if (r[feature] < min) min = r[feature];
    if (r[feature] > max) max = r[feature];
  }
  if (min === max) return { leaf: true, size: rows.length };
  const split = min + rand() * (max - min);
  const left: number[][] = [];
  const right: number[][] = [];
  for (const r of rows) (r[feature] < split ? left : right).push(r);
  return { leaf: false, feature, split, left: buildTree(left, depth + 1, limit, rand), right: buildTree(right, depth + 1, limit, rand) };
}

function pathLength(x: number[], node: Node, depth = 0): number {
  if (node.leaf) return depth + harmonicC(node.size);
  return x[node.feature] < node.split ?
  pathLength(x, node.left, depth + 1) :
  pathLength(x, node.right, depth + 1);
}

export interface IsolationForest {
  trees: Node[];
  psi: number;
  /** 0–1 anomaly score, higher = more isolated. */
  score: (x: number[]) => number;
}

export function fitIsolationForest(samples: number[][], trees = 96, seed = 42): IsolationForest {
  const rand = mulberry32(seed);
  const psi = Math.max(2, Math.min(64, samples.length));
  const limit = Math.ceil(Math.log2(psi));
  const forest: Node[] = [];
  for (let t = 0; t < trees; t++) {
    const subsample: number[][] = [];
    for (let i = 0; i < psi; i++) subsample.push(samples[Math.floor(rand() * samples.length)]);
    forest.push(buildTree(subsample, 0, limit, rand));
  }
  const c = harmonicC(psi);
  return {
    trees: forest,
    psi,
    score: (x: number[]) => {
      const avg = forest.reduce((s, tree) => s + pathLength(x, tree), 0) / forest.length;
      return Math.pow(2, -avg / c);
    }
  };
}

/** Map the 0–1 isolation score onto the platform's 0–100 signal scale. */
export function anomalyToScore(isolationScore: number): number {
  return Math.max(0, Math.min(100, (isolationScore - 0.45) / 0.25 * 100));
}