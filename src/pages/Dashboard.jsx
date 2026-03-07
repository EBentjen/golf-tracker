import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import {
  calcAvgScore, calcBestRound, calcWorstRound,
  calcAvgFairways, calcAvgGIR, calcAvgPutts,
  scoreTrendData,
} from '../utils/stats';

function fmt(n, decimals = 1) {
  return n != null ? n.toFixed(decimals) : '—';
}

export default function Dashboard({ rounds }) {
  if (!rounds.length) return <EmptyState />;

  const avg = calcAvgScore(rounds);
  const best = calcBestRound(rounds);
  const worst = calcWorstRound(rounds);
  const avgFairways = calcAvgFairways(rounds);
  const avgGIR = calcAvgGIR(rounds);
  const avgPutts = calcAvgPutts(rounds);
  const trendData = scoreTrendData(rounds);

  const statBarData = trendData.map((r) => {
    const full = rounds.find((x) => x.date === r.date && x.course === r.course);
    return {
      date: r.date,
      Fairways: full?.fairways ?? 0,
      GIR: full?.gir ?? 0,
      Putts: full?.putts ?? 0,
    };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{rounds.length} round{rounds.length !== 1 ? 's' : ''} tracked</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Score" value={fmt(avg)} sub="strokes per round" accent />
        <StatCard label="Best Round" value={best?.score} sub={best?.course} />
        <StatCard label="Worst Round" value={worst?.score} sub={worst?.course} />
        <StatCard label="Total Rounds" value={rounds.length} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Avg Fairways" value={fmt(avgFairways)} sub="per round" />
        <StatCard label="Avg GIR" value={fmt(avgGIR)} sub="greens in regulation" />
        <StatCard label="Avg Putts" value={fmt(avgPutts)} sub="per round" />
      </div>

      {/* Score trend chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Score Trend</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(val) => [val, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#16a34a' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fairways / GIR / Putts bar chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Fairways · GIR · Putts per Round</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={statBarData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Fairways" fill="#16a34a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="GIR" fill="#4ade80" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Putts" fill="#bbf7d0" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
