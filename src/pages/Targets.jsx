import { useState } from 'react';

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">
        {label}
        {hint && <span className="ml-1 text-slate-500 font-normal text-xs font-mono">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition tabular-nums';

export default function Targets({ targets, onSave }) {
  const [form, setForm] = useState(targets);
  const [saved, setSaved] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ score: Number(form.score), fairways: Number(form.fairways), gir: Number(form.gir), putts: Number(form.putts) });
    setSaved(true);
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">Goals</h1>
      <p className="text-sm text-slate-500 mb-6 font-mono">
        Set targets for 18-hole rounds. Appear as reference lines on charts.
      </p>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <Field label="Target Score" hint="strokes per 18 holes">
          <input type="number" min="50" max="200" value={form.score} onChange={(e) => set('score', e.target.value)} className={inputClass} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Fairways" hint="out of 14">
            <input type="number" min="0" max="14" value={form.fairways} onChange={(e) => set('fairways', e.target.value)} className={inputClass} />
          </Field>
          <Field label="GIR" hint="out of 18">
            <input type="number" min="0" max="18" value={form.gir} onChange={(e) => set('gir', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Putts" hint="per round">
            <input type="number" min="18" max="72" value={form.putts} onChange={(e) => set('putts', e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">
            Save Goals
          </button>
          {saved && <span className="text-sm text-emerald-400 font-mono">✓ saved</span>}
        </div>
      </form>

      <div className="mt-6 bg-slate-900 border border-amber-500/20 rounded-xl p-4 text-sm">
        <p className="font-mono font-medium text-amber-400 mb-2 text-xs uppercase tracking-widest">Reference</p>
        <ul className="space-y-1 text-xs font-mono text-slate-400">
          <li><span className="text-slate-500">Bogey (~90s)</span>  · 7 FWY · 4 GIR · 34 putts</li>
          <li><span className="text-slate-500">Solid  (~80s)</span>  · 9 FWY · 8 GIR · 32 putts</li>
          <li><span className="text-slate-500">Scratch (~70s)</span> · 11 FWY · 12 GIR · 29 putts</li>
        </ul>
      </div>
    </div>
  );
}
