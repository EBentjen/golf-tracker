// --- Handicap (World Handicap System) ---

// Score Differential = (113 / Slope Rating) × (Score - Course Rating)
export function calcScoreDifferential(round) {
  const { score, courseRating, slopeRating } = round;
  if (courseRating == null || slopeRating == null || score == null) return null;
  return (113 / slopeRating) * (score - courseRating);
}

// Returns [countToUse, adjustment] per WHS table for n score differentials
function whsParams(n) {
  if (n >= 20) return [8, 0];
  if (n === 19) return [7, 0];
  if (n >= 17) return [6, 0];
  if (n >= 15) return [5, 0];
  if (n >= 12) return [4, 0];
  if (n >= 9)  return [3, 0];
  if (n >= 7)  return [2, 0];
  if (n === 6) return [2, -1.0];
  if (n === 5) return [1, 0];
  if (n === 4) return [1, -1.0];
  if (n === 3) return [1, -2.0];
  if (n === 2) return [1, -1.0]; // provisional
  if (n === 1) return [1, -2.0]; // provisional
  return null;
}

// Calculate Handicap Index from an array of rounds
export function calcHandicapIndex(rounds) {
  const last20 = [...rounds]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-20);

  const diffs = last20.map(calcScoreDifferential).filter((d) => d != null);
  if (!diffs.length) return null;

  const params = whsParams(diffs.length);
  if (!params) return null;
  const [count, adjustment] = params;

  const sorted = [...diffs].sort((a, b) => a - b);
  const avg = sorted.slice(0, count).reduce((s, d) => s + d, 0) / count;

  const index = Math.min(avg + adjustment, 54.0);
  return Math.round(index * 10) / 10;
}

// Returns true if the handicap is provisional (fewer than 3 rated rounds in last 20)
export function isHandicapProvisional(rounds) {
  const last20 = [...rounds]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-20);
  const count = last20.filter((r) => calcScoreDifferential(r) != null).length;
  return count < 3;
}

// Historical handicap index — one data point per round that has rating data
export function handicapTrendData(rounds) {
  const sorted = [...rounds].sort((a, b) => new Date(a.date) - new Date(b.date));
  const result = [];
  sorted.forEach((r, i) => {
    const idx = calcHandicapIndex(sorted.slice(0, i + 1));
    if (idx != null) result.push({ date: r.date, handicap: idx });
  });
  return result;
}

// --- Normalize a 9-hole round to 18-hole equivalent for stats/charts ---
export function normalizeRound(round) {
  if ((round.holes ?? 18) === 9) {
    return { ...round, score: round.score * 2, fairways: round.fairways * 2, gir: round.gir * 2, putts: round.putts * 2 };
  }
  return round;
}

export function calcAvgScore(rounds) {
  if (!rounds.length) return null;
  const normed = rounds.map(normalizeRound);
  return normed.reduce((sum, r) => sum + r.score, 0) / normed.length;
}

export function calcBestRound(rounds) {
  if (!rounds.length) return null;
  return rounds.reduce((best, r) => (r.score < best.score ? r : best));
}

export function calcWorstRound(rounds) {
  if (!rounds.length) return null;
  return rounds.reduce((worst, r) => (r.score > worst.score ? r : worst));
}

export function calcAvgFairways(rounds) {
  if (!rounds.length) return null;
  const normed = rounds.map(normalizeRound);
  return normed.reduce((sum, r) => sum + r.fairways, 0) / normed.length;
}

export function calcAvgGIR(rounds) {
  if (!rounds.length) return null;
  const normed = rounds.map(normalizeRound);
  return normed.reduce((sum, r) => sum + r.gir, 0) / normed.length;
}

export function calcAvgPutts(rounds) {
  if (!rounds.length) return null;
  const normed = rounds.map(normalizeRound);
  return normed.reduce((sum, r) => sum + r.putts, 0) / normed.length;
}

export function scoreTrendData(rounds) {
  return [...rounds]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((r) => {
      const norm = normalizeRound(r);
      return { date: r.date, score: norm.score, course: r.course, holes: r.holes ?? 18 };
    });
}

export function statTrendData(rounds) {
  return [...rounds]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((r) => {
      const norm = normalizeRound(r);
      return {
        date: r.date,
        Fairways: norm.fairways,
        GIR: norm.gir,
        Putts: norm.putts,
        holes: r.holes ?? 18,
      };
    });
}
