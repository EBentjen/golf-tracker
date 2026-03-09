import { useState } from 'react';
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
  calcTotalBirdies, calcTotalEagles, calcAvgBirdiesPerRound, birdiesTrendData,
  calcScoreDifferential,
} from '../utils/stats';

const CS = {
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

function ChartCard({ title, badge, children, height = 220, hint }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest">{title}</h2>
          {hint && <p className="text-xs text-slate-600 font-mono mt-0.5">{hint}</p>}
        </div>
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
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono tabular-nums w-10 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

function StatRow({ label, value, sub, color = 'text-slate-100' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-bold tabular-nums ${color}`}>{value ?? '—'}</span>
        {sub && <span className="text-xs text-slate-600 font-mono ml-2">{sub}</span>}
      </div>
    </div>
  );
}

function RoundModal({ round, onClose }) {
  if (!round) return null;
  const diff = calcScoreDifferential(round);
  const is9 = round.holes === 9;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">{round.date}</p>
              <h3 className="text-lg font-bold text-slate-100">{round.course}</h3>
              {round.tees && <p className="text-xs text-slate-500 font-mono mt-0.5">{round.tees} tees</p>}
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold tabular-nums text-emerald-400">{round.rawScore}</p>
              <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                is9 ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>{round.holes}H</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="px-5 py-4 space-y-0">
          {round.birdies != null && (
            <StatRow label="Birdies" value={round.birdies} color="text-emerald-400" />
          )}
          {round.eagles != null && round.eagles > 0 && (
            <StatRow label="Eagles" value={round.eagles} color="text-yellow-400" />
          )}
          <StatRow
            label="Fairways"
            value={round.fairways}
            sub={`/ ${is9 ? 7 : 14}`}
            color={round.fairways >= (is9 ? 4 : 9) ? 'text-emerald-400' : 'text-slate-100'}
          />
          <StatRow
            label="GIR"
            value={round.gir}
            sub={`/ ${round.holes}`}
            color={round.gir >= (is9 ? 4 : 9) ? 'text-emerald-400' : 'text-slate-100'}
          />
          <StatRow
            label="Putts"
            value={round.putts}
            color={round.putts <= (is9 ? 16 : 32) ? 'text-emerald-400' : 'text-slate-100'}
          />
          {round.courseRating != null && (
            <StatRow label="Course Rating" value={round.courseRating} />
          )}
          {round.slopeRating != null && (
            <StatRow label="Slope Rating" value={round.slopeRating} />
          )}
          {diff != null && (
            <StatRow
              label="Score Differential"
              value={diff.toFixed(1)}
              color={diff < 0 ? 'text-emerald-400' : 'text-slate-100'}
            />
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-mono py-2.5 rounded-lg transition-colors border border-slate-700"
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ rounds, targets }) {
  const [selectedRound, setSelectedRound] = useState(null);

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
  const totalBirdies = calcTotalBirdies(rounds);
  const totalEagles = calcTotalEagles(rounds);
  const avgBirdies = calcAvgBirdiesPerRound(rounds);
  const birdieTrend = birdiesTrendData(rounds);
  const hasBirdieData = rounds.some((r) => r.birdies != null);

  const recentDelta = avg != null && recentAvg != null ? recentAvg - avg : null;
  const trendUp = recentDelta != null && recentDelta < 0;
  const trendLabel = recentDelta != null
    ? `${trendUp ? '▼' : '▲'} ${Math.abs(recentDelta).toFixed(1)} vs avg`
    : null;

  function handleChartClick(data) {
    if (data?.activePayload?.[0]?.payload) {
      setSelectedRound(data.activePayload[0].payload);
    }
  }

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
            {handicapProvisional && <p className="text-xs text-amber-400 font-mono">provisional</p>}
          </div>
        )}
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Score" value={fmt(avg)} accent color="emerald"
          sub={targets?.score ? (avg <= targets.score
            ? <span className="text-emerald-400 font-mono">✓ on target</span>
            : <span className="text-red-400 font-mono">target {targets.score}</span>) : null}
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
            : <span className="text-red-400 font-mono">target {targets.fairways}</span>) : null}
        />
        <StatCard label="Avg GIR" value={fmt(avgGIR)}
          sub={targets?.gir ? (avgGIR >= targets.gir
            ? <span className="text-emerald-400 font-mono">✓ on target</span>
            : <span className="text-red-400 font-mono">target {targets.gir}</span>) : null}
        />
        <StatCard label="Avg Putts" value={fmt(avgPutts)}
          sub={targets?.putts ? (avgPutts <= targets.putts
            ? <span className="text-emerald-400 font-mono">✓ on target</span>
            : <span className="text-red-400 font-mono">target {targets.putts}</span>) : null}
        />
      </div>

      {/* Birdie / Eagle cards */}
      {hasBirdieData && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Birdies" value={totalBirdies} accent color="emerald"
            sub={<span className="font-mono">all rounds</span>}
          />
          <StatCard label="Avg Birdies" value={fmt(avgBirdies)}
            sub={<span className="font-mono">per round</span>}
            color="emerald"
          />
          <StatCard label="Total Eagles" value={totalEagles} accent color="amber"
            sub={<span className="font-mono">all rounds</span>}
          />
        </div>
      )}

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

      {/* Score Trend — clickable */}
      <ChartCard
        title="Score Trend"
        badge={targets?.score ? `target · ${targets.score}` : null}
        hint="click a dot to see round details"
        height={240}
      >
        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CS.grid} />
          <XAxis dataKey="date" tick={CS.tick} />
          <YAxis tick={CS.tick} domain={['auto', 'auto']} />
          <Tooltip {...CS.tooltip} formatter={(val, name, props) => [props.payload.rawScore ?? val, 'Score']} />
          {targets?.score && (
            <ReferenceLine y={targets.score} stroke="#fbbf24" strokeDasharray="5 4" strokeWidth={1.5}
              label={{ value: `${targets.score}`, position: 'insideTopRight', fill: '#fbbf24', fontSize: 10, fontFamily: 'monospace' }}
            />
          )}
          <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2.5}
            dot={{ r: 5, fill: '#34d399', strokeWidth: 0, cursor: 'pointer' }} activeDot={{ r: 7, fill: '#34d399' }} />
        </LineChart>
      </ChartCard>

      {/* Score Distribution */}
      <ChartCard title="Score Distribution" height={180}>
        <BarChart data={scoreDist} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CS.grid} vertical={false} />
          <XAxis dataKey="label" tick={CS.tick} />
          <YAxis tick={CS.tick} allowDecimals={false} />
          <Tooltip {...CS.tooltip} formatter={(val) => [val, 'Rounds']} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {scoreDist.map((_, i) => (
              <Cell key={i} fill={['#34d399', '#38bdf8', '#a78bfa', '#fb923c'][i]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      {/* Birdie / Eagle trend */}
      {birdieTrend.length >= 2 && (
        <ChartCard title="Birdies & Eagles per Round" height={180}>
          <LineChart data={birdieTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CS.grid} />
            <XAxis dataKey="date" tick={CS.tick} />
            <YAxis tick={CS.tick} allowDecimals={false} />
            <Tooltip {...CS.tooltip} />
            <Line type="monotone" dataKey="birdies" stroke="#34d399" strokeWidth={2.5} name="Birdies"
              dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="eagles" stroke="#fbbf24" strokeWidth={2} name="Eagles"
              dot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartCard>
      )}

      {/* Stat trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Fairways" badge={targets?.fairways ? `tgt ${targets.fairways}` : null} height={160}>
          <LineChart data={statData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CS.grid} />
            <XAxis dataKey="date" tick={{ ...CS.tick, fontSize: 9 }} />
            <YAxis tick={CS.tick} domain={[0, 14]} />
            <Tooltip {...CS.tooltip} />
            {targets?.fairways && <ReferenceLine y={targets.fairways} stroke="#fbbf24" strokeDasharray="4 3" strokeWidth={1.5} />}
            <Line type="monotone" dataKey="Fairways" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="GIR" badge={targets?.gir ? `tgt ${targets.gir}` : null} height={160}>
          <LineChart data={statData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CS.grid} />
            <XAxis dataKey="date" tick={{ ...CS.tick, fontSize: 9 }} />
            <YAxis tick={CS.tick} domain={[0, 18]} />
            <Tooltip {...CS.tooltip} />
            {targets?.gir && <ReferenceLine y={targets.gir} stroke="#fbbf24" strokeDasharray="4 3" strokeWidth={1.5} />}
            <Line type="monotone" dataKey="GIR" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Putts" badge={targets?.putts ? `tgt ${targets.putts}` : null} height={160}>
          <LineChart data={statData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CS.grid} />
            <XAxis dataKey="date" tick={{ ...CS.tick, fontSize: 9 }} />
            <YAxis tick={CS.tick} domain={['auto', 'auto']} />
            <Tooltip {...CS.tooltip} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={CS.grid} />
            <XAxis dataKey="date" tick={CS.tick} />
            <YAxis tick={CS.tick} domain={['auto', 'auto']} />
            <Tooltip {...CS.tooltip} formatter={(val) => [val.toFixed(1), 'HCP Index']} />
            <Line type="monotone" dataKey="handicap" stroke="#34d399" strokeWidth={2.5}
              dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartCard>
      )}

      {handicapIndex == null && (
        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-5 text-center">
          <p className="text-sm font-medium text-slate-400">No Handicap Index yet</p>
          <p className="text-xs text-slate-600 mt-1 font-mono">Add Course Rating + Slope when logging rounds to calculate WHS Handicap Index</p>
        </div>
      )}

      {/* Round detail modal */}
      <RoundModal round={selectedRound} onClose={() => setSelectedRound(null)} />
    </div>
  );
}
