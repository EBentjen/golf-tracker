// Normalize a 9-hole round to 18-hole equivalent for stats/charts
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
