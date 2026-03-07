import { Link } from 'react-router-dom';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">⛳</span>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">No rounds yet</h2>
      <p className="text-sm text-slate-500 mb-6">Log your first round to see stats and charts.</p>
      <Link
        to="/add"
        className="bg-emerald-500 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors"
      >
        Add Your First Round
      </Link>
    </div>
  );
}
