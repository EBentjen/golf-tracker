import { useRounds } from '../hooks/useRounds';
import { calcStats } from '../utils/stats';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { rounds } = useRounds();
  const stats = calcStats(rounds);
  const chartData = [...rounds].reverse().map(r => ({
    name: r.date,
    score: r.score,
    putts: r.putts,
  }));

  if (!stats) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <EmptyState />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Avg Score" value={stats.avgScore} color="green" />
        <StatCard label="Best Round" value={stats.bestScore} color="blue" />
        <StatCard label="Worst Round" value={stats.worstScore} color="rose" />
        <StatCard label="Total Rounds" value={stats.totalRounds} color="purple" />
        <StatCard label="Avg Fairways" value={stats.avgFairways} sub="per round" color="green" />
        <StatCard label="Avg GIR" value={stats.avgGir} sub="per round" color="blue" />
        <StatCard label="Avg Putts" value={stats.avgPutts} sub="per round" color="amber" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Score Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Score by Round</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="score" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
