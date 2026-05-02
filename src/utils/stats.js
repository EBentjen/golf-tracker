export function calcStats(rounds) {
  if (!rounds.length) return null;
  const scores = rounds.map(r => r.score);
  const avg = r => (rounds.reduce((s, x) => s + Number(x[r]), 0) / rounds.length).toFixed(1);
  return {
    avgScore: avg('score'),
    bestScore: Math.min(...scores),
    worstScore: Math.max(...scores),
    totalRounds: rounds.length,
    avgFairways: avg('fairways'),
    avgGir: avg('gir'),
    avgPutts: avg('putts'),
  };
}
