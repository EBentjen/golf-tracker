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

export function calcRecentAvg(rounds, n = 5) {
  if (!rounds.length) return null;
  const sorted = [...rounds].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, n).map(normalizeRound);
  return recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
}

export function calcConsistency(rounds) {
  if (rounds.length < 2) return null;
  const normed = rounds.map(normalizeRound);
  const avg = normed.reduce((s, r) => s + r.score, 0) / normed.length;
  const variance = normed.reduce((s, r) => s + Math.pow(r.score - avg, 2), 0) / normed.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

export function calcScoreDistribution(rounds) {
  const brackets = [
    { label: '≤79', min: 0, max: 79 },
    { label: '80s', min: 80, max: 89 },
    { label: '90s', min: 90, max: 99 },
    { label: '100+', min: 100, max: Infinity },
  ];
  const normed = rounds.map(normalizeRound);
  return brackets.map((b) => ({
    label: b.label,
    count: normed.filter((r) => r.score >= b.min && r.score <= b.max).length,
  }));
}

export function calcCourseStats(rounds) {
  const map = {};
  rounds.forEach((r) => {
    const key = r.course || 'Unknown';
    if (!map[key]) map[key] = { course: key, scores: [] };
    map[key].scores.push(normalizeRound(r).score);
  });
  return Object.values(map)
    .map((c) => ({
      course: c.course,
      rounds: c.scores.length,
      avg: Math.round((c.scores.reduce((s, v) => s + v, 0) / c.scores.length) * 10) / 10,
      best: Math.min(...c.scores),
    }))
    .sort((a, b) => a.avg - b.avg);
}

export function calcTargetHitRates(rounds, targets) {
  if (!rounds.length || !targets) return null;
  const normed = rounds.map(normalizeRound);
  const n = normed.length;
  return {
    score: targets.score != null ? Math.round((normed.filter((r) => r.score <= targets.score).length / n) * 100) : null,
    fairways: targets.fairways != null ? Math.round((normed.filter((r) => r.fairways >= targets.fairways).length / n) * 100) : null,
    gir: targets.gir != null ? Math.round((normed.filter((r) => r.gir >= targets.gir).length / n) * 100) : null,
    putts: targets.putts != null ? Math.round((normed.filter((r) => r.putts <= targets.putts).length / n) * 100) : null,
  };
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
