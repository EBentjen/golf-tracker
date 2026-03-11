import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'score-asc', label: 'Best score' },
  { value: 'score-desc', label: 'Worst score' },
];

export default function History({ rounds, onDelete }) {
  const [sort, setSort] = useState('date-desc');
  const [confirmId, setConfirmId] = useState(null);

  if (!rounds.length) return <EmptyState />;

  const sorted = [...rounds].sort((a, b) => {
    if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sort === 'score-asc') return a.score - b.score;
    if (sort === 'score-desc') return b.score - a.score;
    return 0;
  });

  function handleDelete(id) {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">History</h1>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{rounds.length} ROUND{rounds.length !== 1 ? 'S' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Link
            to="/add"
            className="bg-emerald-500 text-slate-950 text-sm font-bold px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors"
          >
            + Add Round
          </Link>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Date', 'Course', 'H', 'Score', 'FWY', 'GIR', 'Putts', 'Bir', 'Egl', ''].map((h) => (
                <th key={h} className="text-left text-xs font-mono font-medium text-slate-500 uppercase tracking-widest px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <>
                <tr key={r.id} className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors ${r.notes ? 'border-b-0' : ''}`}>
                  <td className="px-3 py-3 text-slate-400 font-mono text-xs tabular-nums">{r.date}</td>
                  <td className="px-3 py-3 font-medium text-slate-200">{r.course}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${(r.holes ?? 18) === 9 ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {r.holes ?? 18}
                    </span>
                  </td>
                  <td className="px-3 py-3"><span className="font-bold text-emerald-400 tabular-nums text-base">{r.score}</span></td>
                  <td className="px-3 py-3 text-slate-400 tabular-nums font-mono">{r.fairways}</td>
                  <td className="px-3 py-3 text-slate-400 tabular-nums font-mono">{r.gir}</td>
                  <td className="px-3 py-3 text-slate-400 tabular-nums font-mono">{r.putts}</td>
                  <td className="px-3 py-3 tabular-nums font-mono">
                    {r.birdies != null
                      ? <span className="text-emerald-400">{r.birdies}</span>
                      : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-3 py-3 tabular-nums font-mono">
                    {r.eagles != null && r.eagles > 0
                      ? <span className="text-yellow-400">{r.eagles}</span>
                      : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/edit/${r.id}`}
                        className="text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium font-mono text-slate-500 hover:text-sky-400 hover:bg-sky-500/10"
                      >
                        edit
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium font-mono ${confirmId === r.id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-600 hover:text-red-400 hover:bg-red-500/10'}`}
                      >
                        {confirmId === r.id ? 'confirm?' : 'del'}
                      </button>
                    </div>
                  </td>
                </tr>
                {r.notes && (
                  <tr key={`${r.id}-notes`} className="border-b border-slate-800/50">
                    <td colSpan={10} className="px-3 pb-2.5">
                      <p className="text-xs text-slate-500 font-mono italic">{r.notes}</p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sorted.map((r) => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-200">{r.course}</p>
                <p className="text-xs font-mono text-slate-500">{r.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${(r.holes ?? 18) === 9 ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  {r.holes ?? 18}H
                </span>
                <span className="text-2xl font-bold text-emerald-400 tabular-nums">{r.score}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-500 mb-2">
              <span>FWY: <strong className="text-slate-300">{r.fairways}</strong></span>
              <span>GIR: <strong className="text-slate-300">{r.gir}</strong></span>
              <span>Putts: <strong className="text-slate-300">{r.putts}</strong></span>
              {r.birdies != null && (
                <span>Bir: <strong className="text-emerald-400">{r.birdies}</strong></span>
              )}
              {r.eagles != null && r.eagles > 0 && (
                <span>Egl: <strong className="text-yellow-400">{r.eagles}</strong></span>
              )}
            </div>
            {r.notes && (
              <p className="text-xs text-slate-500 font-mono italic mb-2 border-t border-slate-800 pt-2">{r.notes}</p>
            )}
            <div className="flex gap-2">
              <Link
                to={`/edit/${r.id}`}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors font-mono font-medium text-slate-500 hover:text-sky-400 hover:bg-sky-500/10"
              >
                edit
              </Link>
              <button
                onClick={() => handleDelete(r.id)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-mono font-medium ${confirmId === r.id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-600 hover:text-red-400'}`}
              >
                {confirmId === r.id ? 'confirm delete?' : 'delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
