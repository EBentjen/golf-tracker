export function calcAvgScore(rounds) {
  if (!rounds.length) return null;
  return rounds.reduce((sum, r) => sum + r.score, 0) / rounds.length;
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
  return rounds.reduce((sum, r) => sum + r.fairways, 0) / rounds.length;
}

export function calcAvgGIR(rounds) {
  if (!rounds.length) return null;
  return rounds.reduce((sum, r) => sum + r.gir, 0) / rounds.length;
}

export function calcAvgPutts(rounds) {
  if (!rounds.length) return null;
  return rounds.reduce((sum, r) => sum + r.putts, 0) / rounds.length;
}

export function scoreTrendData(rounds) {
  return [...rounds]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((r) => ({
      date: r.date,
      score: r.score,
      course: r.course,
    }));
}
