import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import {
  calcAvgScore, calcBestRound, calcWorstRound,
  calcAvgFairways, calcAvgGIR, calcAvgPutts,
  scoreTrendData, statTrendData,
  calcHandicapIndex, isHandicapProvisional, handicapTrendData,
  calcRecentAvg, calcConsistency, calcScoreDistribution,
  calcCourseStats, calcTargetHitRates,
} from '../utils/stats';

const CHART_STYLE = {
  tooltip: {
    contentStyle: {
      fontSize: 12,
      borderRadius: 8,
      border: '1px solid #1e293b',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
    },
    labelStyle: { color: '#94a3b8' },
  },
  grid: '#1e293b',
  tick: { fontSize: 11, fill: '#475569' },
};

function fmt(n, decimals = 1) {
  return n != null ? n.toFixed(decimals) : '—';
}

function ChartCard({ title, badge, children, height = 220 }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest">{title}</h2>
        {badge && <span className="text-xs text-amber-400 font-mono">{badge}</span>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function HitRateBar({ label, pct, color = '#34d399' }) {
  if (pct == null) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-slate-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums w-10 text-right" style={{ color }}>{pct}%</span>
    </div>
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
  const recentAvg = calcRecentAvg(rounds, 5);
  const consistency = calcConsistency(rounds);
  const trendData = scoreTrendData(rounds);
  const statData = statTrendData(rounds);
  const handicapIndex = calcHandicapIndex(rounds);
  const handicapProvisional = handicapIndex != null && isHandicapProvisional(rounds);
  const hcpTrend = handicapTrendData(rounds);
  const scoreDist = calcScoreDistribution(rounds);
  const courseStats = calcCourseStats(rounds);
  const hitRates = calcTargetHitRates(rounds, targets);

  const recentDelta = avg != null && recentAvg != null ? recentAvg - avg : null;
  const trendUp = recentDelta != null && recentDelta < 0; // lower score = better
  const trendLabel = recentDelta != null
    ? `${trendUp ? '▼' : '▲'} ${Math.abs(recentDelta).toFixed(1)} vs avg`
    : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            {rounds.length} ROUND{rounds.length !== 1 ? 'S' : ''} · 18H NORMALIZED
          </p>
        </div>
        {handicapIndex != null && (
          <div className="text-right">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">HCP Index</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-400">{fmt(handicapIndex)}</p>
            {handicapProvisional && (
              <p className="text-xs text-amber-400 font-mono">provisional</p>
            )}
          </div>
        )}
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Score" value={fmt(avg)} accent color="emerald"
          sub={targets?.score ? (avg <= targets.score
            ? <span className="text-emerald-400 font-mono">✓ on target</span>
            : <span className="text-red-400 font-mono">target {targets.score}</span>)
            : null}
        />
        <StatCard label="Last 5 Avg" value={fmt(recentAvg)}
          sub={trendLabel
            ? <span className={trendUp ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'}>{trendLabel}</span>
            : null}
          color="sky"
        />
        <StatCard label="Best Round" value={best?.score} sub={best?.course} />
        <StatCard label="Consistency" value={consistency != null ? `±${fmt(consistency)}` : '—'}
          sub={<span className="font-mono">std deviation</span>}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Avg Fairways" value={fmt(avgFairways)}
          sub={targets?.fairways ? (avgFairways >= targets.fairways
            ? <span className="text-emerald-400 font-mono">✓ on target</span>
            : <span className="text-red-400 font-mono">target {targets.fairways}</span>)
            : null}
        />
        <StatCard label="Avg GIR" value={fmt(avgGIR)}
          sub={targets?.gir ? (avgGIR >= targets.gir
            ? <span className="text-emerald-400 font-mono">✓ on target</span>
            : <span className="text-red-400 font-mono">target {targets.gir}</span>)
            : null}
        />
        <StatCard label="Avg Putts" value={fmt(avgPutts)}
          sub={targets?.putts ? (avgPutts <= targets.putts
            ? <span className="text-emerald-400 font-mono">✓ on target</span>
            : <span className="text-red-400 font-mono">target {targets.putts}</span>)
            : null}
        />
      </div>

      {/* Target Hit Rates */}
      {hitRates && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest mb-4">Target Hit Rate</h2>
          <div className="space-y-3">
            <HitRateBar label="Score" pct={hitRates.score} color="#34d399" />
            <HitRateBar label="Fairways" pct={hitRates.fairways} color="#38bdf8" />
            <HitRateBar label="GIR" pct={hitRates.gir} color="#a78bfa" />
            <HitRateBar label="Putts" pct={hitRates.putts} color="#fb923c" />
          </div>
        </div>
      )}

      {/* Score Trend */}
      <ChartCard title="Score Trend" badge={targets?.score ? `target · ${targets.score}` : null} height={240}>
        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
          <XAxis dataKey="date" tick={CHART_STYLE.tick} />
          <YAxis tick={CHART_STYLE.tick} domain={['auto', 'auto']} />
          <Tooltip {...CHART_STYLE.tooltip} formatter={(val) => [val, 'Score']} />
          {targets?.score && (
            <ReferenceLine y={targets.score} stroke="#fbbf24" strokeDasharray="5 4" strokeWidth={1.5}
              label={{ value: `${targets.score}`, position: 'insideTopRight', fill: '#fbbf24', fontSize: 10, fontFamily: 'monospace' }}
            />
          )}
          <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2.5}
            dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ChartCard>

      {/* Score Distribution */}
      <ChartCard title="Score Distribution" height={180}>
        <BarChart data={scoreDist} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
          <XAxis dataKey="label" tick={CHART_STYLE.tick} />
          <YAxis tick={CHART_STYLE.tick} allowDecimals={false} />
          <Tooltip {...CHART_STYLE.tooltip} formatter={(val) => [val, 'Rounds']} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {scoreDist.map((entry, i) => (
              <Cell key={i} fill={['#34d399', '#38bdf8', '#a78bfa', '#fb923c'][i]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      {/* Stat trends side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Fairways" badge={targets?.fairways ? `tgt ${targets.fairways}` : null} height={160}>
          <LineChart data={statData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="date" tick={{ ...CHART_STYLE.tick, fontSize: 9 }} />
            <YAxis tick={CHART_STYLE.tick} domain={[0, 14]} />
            <Tooltip {...CHART_STYLE.tooltip} />
            {targets?.fairways && <ReferenceLine y={targets.fairways} stroke="#fbbf24" strokeDasharray="4 3" strokeWidth={1.5} />}
            <Line type="monotone" dataKey="Fairways" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="GIR" badge={targets?.gir ? `tgt ${targets.gir}` : null} height={160}>
          <LineChart data={statData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="date" tick={{ ...CHART_STYLE.tick, fontSize: 9 }} />
            <YAxis tick={CHART_STYLE.tick} domain={[0, 18]} />
            <Tooltip {...CHART_STYLE.tooltip} />
            {targets?.gir && <ReferenceLine y={targets.gir} stroke="#fbbf24" strokeDasharray="4 3" strokeWidth={1.5} />}
            <Line type="monotone" dataKey="GIR" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Putts" badge={targets?.putts ? `tgt ${targets.putts}` : null} height={160}>
          <LineChart data={statData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="date" tick={{ ...CHART_STYLE.tick, fontSize: 9 }} />
            <YAxis tick={CHART_STYLE.tick} domain={['auto', 'auto']} />
            <Tooltip {...CHART_STYLE.tooltip} />
            {targets?.putts && <ReferenceLine y={targets.putts} stroke="#fbbf24" strokeDasharray="4 3" strokeWidth={1.5} />}
            <Line type="monotone" dataKey="Putts" stroke="#fb923c" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ChartCard>
      </div>

      {/* Course breakdown */}
      {courseStats.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest mb-4">Course Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Course', 'Rounds', 'Avg Score', 'Best'].map((h) => (
                    <th key={h} className="text-left text-xs font-mono font-medium text-slate-500 uppercase tracking-widest pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courseStats.map((c, i) => (
                  <tr key={c.course} className="border-b border-slate-800/50">
                    <td className="py-2.5 pr-4 font-medium text-slate-200">
                      {i === 0 && <span className="text-emerald-400 mr-1.5 font-mono text-xs">★</span>}
                      {c.course}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-400 font-mono tabular-nums">{c.rounds}</td>
                    <td className="py-2.5 pr-4 font-bold text-slate-100 tabular-nums">{c.avg}</td>
                    <td className="py-2.5 text-emerald-400 font-mono tabular-nums">{c.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Handicap trend */}
      {hcpTrend.length >= 2 && (
        <ChartCard title="Handicap Index Trend" badge="lower = better" height={200}>
          <LineChart data={hcpTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="date" tick={CHART_STYLE.tick} />
            <YAxis tick={CHART_STYLE.tick} domain={['auto', 'auto']} />
            <Tooltip {...CHART_STYLE.tooltip} formatter={(val) => [val.toFixed(1), 'HCP Index']} />
            <Line type="monotone" dataKey="handicap" stroke="#34d399" strokeWidth={2.5}
              dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartCard>
      )}

      {/* No handicap prompt */}
      {handicapIndex == null && (
        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-5 text-center">
          <p className="text-sm font-medium text-slate-400">No Handicap Index yet</p>
          <p className="text-xs text-slate-600 mt-1 font-mono">Add Course Rating + Slope when logging rounds to calculate WHS Handicap Index</p>
        </div>
      )}
    </div>
  );
}
