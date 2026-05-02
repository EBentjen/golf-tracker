import { Link } from 'react-router-dom';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <span className="text-6xl mb-4">⛳</span>
      <p className="text-lg font-medium text-gray-500">No rounds yet</p>
      <p className="text-sm mb-6">Start tracking by adding your first round</p>
      <Link
        to="/add"
        className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Add First Round
      </Link>
    </div>
  );
}
