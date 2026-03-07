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
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rounds.length} round{rounds.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Link
            to="/add"
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Round
          </Link>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Date', 'Course', 'Holes', 'Score', 'Fairways', 'GIR', 'Putts', ''].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-600">{r.date}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.course}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(r.holes ?? 18) === 9 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {r.holes ?? 18}H
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-gray-900">{r.score}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.fairways}</td>
                <td className="px-4 py-3 text-gray-600">{r.gir}</td>
                <td className="px-4 py-3 text-gray-600">{r.putts}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                      confirmId === r.id
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {confirmId === r.id ? 'Confirm?' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {sorted.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{r.course}</p>
                <p className="text-xs text-gray-400">{r.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(r.holes ?? 18) === 9 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {r.holes ?? 18}H
                </span>
                <span className="text-2xl font-bold text-green-700">{r.score}</span>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Fairways: <strong className="text-gray-700">{r.fairways}</strong></span>
              <span>GIR: <strong className="text-gray-700">{r.gir}</strong></span>
              <span>Putts: <strong className="text-gray-700">{r.putts}</strong></span>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className={`mt-3 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                confirmId === r.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              {confirmId === r.id ? 'Confirm delete?' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
