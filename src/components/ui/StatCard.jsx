export default function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1 ${accent ? 'border-green-200 bg-green-50' : ''}`}>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${accent ? 'text-green-700' : 'text-gray-900'}`}>
        {value ?? '—'}
      </span>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
