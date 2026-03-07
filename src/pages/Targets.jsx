import { useState } from 'react';

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition';

export default function Targets({ targets, onSave }) {
  const [form, setForm] = useState(targets);
  const [saved, setSaved] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      score: Number(form.score),
      fairways: Number(form.fairways),
      gir: Number(form.gir),
      putts: Number(form.putts),
    });
    setSaved(true);
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Goals</h1>
      <p className="text-sm text-gray-500 mb-6">
        Set your targets for an 18-hole round. These will appear as reference lines on your dashboard charts.
        9-hole rounds are automatically scaled for comparison.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        <Field label="Target Score" hint="strokes per 18 holes">
          <input
            type="number"
            min="50"
            max="200"
            value={form.score}
            onChange={(e) => set('score', e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Fairways Hit" hint="out of 14">
            <input
              type="number"
              min="0"
              max="14"
              value={form.fairways}
              onChange={(e) => set('fairways', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="GIR" hint="out of 18">
            <input
              type="number"
              min="0"
              max="18"
              value={form.gir}
              onChange={(e) => set('gir', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Putts" hint="per round">
            <input
              type="number"
              min="18"
              max="72"
              value={form.putts}
              onChange={(e) => set('putts', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            Save Goals
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </form>

      {/* Reference card */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">What are good targets?</p>
        <ul className="space-y-0.5 text-amber-700">
          <li>Bogey golfer (~90s): 7 fairways · 4 GIR · 34 putts</li>
          <li>Solidgolfer (~80s): 9 fairways · 8 GIR · 32 putts</li>
          <li>Scratch golfer (~70s): 11 fairways · 12 GIR · 29 putts</li>
        </ul>
      </div>
    </div>
  );
}
