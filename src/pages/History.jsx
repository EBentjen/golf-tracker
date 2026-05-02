import { useRounds } from '../hooks/useRounds';
import EmptyState from '../components/ui/EmptyState';

export default function History() {
  const { rounds, deleteRound } = useRounds();

  if (!rounds.length) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">History</h1>
      <EmptyState />
    </div>
  );

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">History</h1>
      <div className="space-y-3">
        {rounds.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{r.course}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.date}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span>FW: {r.fairways}</span>
                <span>GIR: {r.gir}</span>
                <span>Putts: {r.putts}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-green-600">{r.score}</span>
              <button
                onClick={() => deleteRound(r.id)}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
