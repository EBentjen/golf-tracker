export default function StatCard({ label, value, sub, accent = false, color = 'emerald' }) {
  const colors = {
    emerald: 'text-emerald-400',
    sky: 'text-sky-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
  };
  return (
    <div className={`bg-slate-900 rounded-xl border p-5 flex flex-col gap-1 ${accent ? 'border-emerald-500/30' : 'border-slate-800'}`}>
      <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${accent ? colors[color] : 'text-slate-100'}`}>
        {value ?? '—'}
      </span>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}
