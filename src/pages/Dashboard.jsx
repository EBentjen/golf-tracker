import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import {
  calcAvgScore, calcBestRound, calcWorstRound,
  calcAvgFairways, calcAvgGIR, calcAvgPutts,
  scoreTrendData, statTrendData,
  calcHandicapIndex, isHandicapProvisional, handicapTrendData,
} from '../utils/stats';

function fmt(n, decimals = 1) {
  return n != null ? n.toFixed(decimals) : '—';
}

// lower is better for score/putts, higher is better for fairways/gir
function TargetBadge({ value, target, lowerIsBetter }) {
  if (value == null || target == null) return null;
  const meeting = lowerIsBetter ? value <= target : value >= target;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meeting ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {meeting ? 'On target' : `Target: ${target}`}
    </span>
  );
}

export default function Dashboard({ rounds, targets }) {
  if (!rounds.length) return <EmptyState />;

  const avg = calcAvgScore(rounds);
  const best = calcBestRound(rounds);
  const worst = calcWorstRound(rounds);
  const avgFairways = calcAvgFairways(rounds);
  const avgGIR = calcAvgGIR(rounds);
  const avgPutts = calcAvgPutts(rounds);
  const trendData = scoreTrendData(rounds);
  const statData = statTrendData(rounds);
  const handicapIndex = calcHandicapIndex(rounds);
  const handicapProvisional = handicapIndex != null && isHandicapProvisional(rounds);
  const hcpTrend = handicapTrendData(rounds);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{rounds.length} round{rounds.length !== 1 ? 's' : ''} tracked · stats normalized to 18 holes</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Score"
          value={fmt(avg)}
          sub={<TargetBadge value={avg} target={targets?.score} lowerIsBetter />}
          accent
        />
        <StatCard label="Best Round" value={best?.score} sub={best?.course} />
        <StatCard label="Worst Round" value={worst?.score} sub={worst?.course} />
        <StatCard label="Total Rounds" value={rounds.length} />
      </div>

      {/* Handicap Index card */}
      {handicapIndex != null && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Handicap Index</p>
            <p className="text-4xl font-bold text-green-700 tabular-nums">{fmt(handicapIndex)}</p>
            {handicapProvisional && (
              <p className="text-xs text-amber-600 mt-1 font-medium">Provisional — add more rated rounds for an official index</p>
            )}
          </div>
          <div className="flex-1 min-w-0 text-xs text-gray-400 leading-relaxed border-l border-gray-100 pl-6">
            <p>Based on World Handicap System (WHS).</p>
            <p>Score Differential = (113 / Slope) × (Score − Course Rating)</p>
            <p className="mt-1">Uses best {hcpTrend.length > 0 ? 'differentials' : 'N/A'} from last 20 rated rounds × 0.96.</p>
            <p className="mt-1 text-gray-300">Enter Course Rating + Slope when adding rounds to calculate.</p>
          </div>
        </div>
      )}

      {handicapIndex == null && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5 text-center">
          <p className="text-sm font-medium text-gray-500">No Handicap Index yet</p>
          <p className="text-xs text-gray-400 mt-1">Add Course Rating and Slope Rating when logging rounds to calculate your WHS Handicap Index.</p>
        </div>
      )}

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Avg Fairways"
          value={fmt(avgFairways)}
          sub={<TargetBadge value={avgFairways} target={targets?.fairways} lowerIsBetter={false} />}
        />
        <StatCard
          label="Avg GIR"
          value={fmt(avgGIR)}
          sub={<TargetBadge value={avgGIR} target={targets?.gir} lowerIsBetter={false} />}
        />
        <StatCard
          label="Avg Putts"
          value={fmt(avgPutts)}
          sub={<TargetBadge value={avgPutts} target={targets?.putts} lowerIsBetter />}
        />
      </div>

      {/* Score trend chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Score Trend</h2>
          {targets?.score && (
            <span className="text-xs text-amber-600 font-medium">— Target: {targets.score}</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(val, name) => [val, name === 'score' ? 'Score' : name]}
            />
            {targets?.score && (
              <ReferenceLine
                y={targets.score}
                stroke="#f59e0b"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: `Goal ${targets.score}`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }}
              />
            )}
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

      {/* Fairways trend */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Fairways Hit per Round</h2>
          {targets?.fairways && (
            <span className="text-xs text-amber-600 font-medium">— Target: {targets.fairways}</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={statData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 14]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            {targets?.fairways && (
              <ReferenceLine
                y={targets.fairways}
                stroke="#f59e0b"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: `Goal ${targets.fairways}`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }}
              />
            )}
            <Line type="monotone" dataKey="Fairways" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GIR trend */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Greens in Regulation per Round</h2>
          {targets?.gir && (
            <span className="text-xs text-amber-600 font-medium">— Target: {targets.gir}</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={statData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 18]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            {targets?.gir && (
              <ReferenceLine
                y={targets.gir}
                stroke="#f59e0b"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: `Goal ${targets.gir}`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }}
              />
            )}
            <Line type="monotone" dataKey="GIR" stroke="#4ade80" strokeWidth={2.5} dot={{ r: 4, fill: '#4ade80' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Putts trend */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Putts per Round</h2>
          {targets?.putts && (
            <span className="text-xs text-amber-600 font-medium">— Target: {targets.putts}</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={statData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            {targets?.putts && (
              <ReferenceLine
                y={targets.putts}
                stroke="#f59e0b"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: `Goal ${targets.putts}`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }}
              />
            )}
            <Line type="monotone" dataKey="Putts" stroke="#86efac" strokeWidth={2.5} dot={{ r: 4, fill: '#86efac' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Handicap Index trend */}
      {hcpTrend.length >= 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Handicap Index Trend</h2>
            <span className="text-xs text-gray-400 font-medium">Lower = better</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={hcpTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(val) => [val.toFixed(1), 'Handicap Index']}
              />
              <Line
                type="monotone"
                dataKey="handicap"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#16a34a' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
