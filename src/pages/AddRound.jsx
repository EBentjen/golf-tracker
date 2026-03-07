import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultForm = {
  date: new Date().toISOString().slice(0, 10),
  course: '',
  score: '',
  fairways: '',
  gir: '',
  putts: '',
};

function Field({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal text-xs">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition';

export default function AddRound({ onAdd }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.course.trim()) e.course = 'Required';
    const score = Number(form.score);
    if (form.score === '' || isNaN(score) || score < 50 || score > 200) e.score = 'Enter a valid score (50–200)';
    const fairways = Number(form.fairways);
    if (form.fairways === '' || isNaN(fairways) || fairways < 0 || fairways > 18) e.fairways = '0–18';
    const gir = Number(form.gir);
    if (form.gir === '' || isNaN(gir) || gir < 0 || gir > 18) e.gir = '0–18';
    const putts = Number(form.putts);
    if (form.putts === '' || isNaN(putts) || putts < 18 || putts > 72) e.putts = 'Enter a valid putt count (18–72)';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({
      date: form.date,
      course: form.course.trim(),
      score: Number(form.score),
      fairways: Number(form.fairways),
      gir: Number(form.gir),
      putts: Number(form.putts),
    });
    navigate('/');
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Round</h1>
      <p className="text-sm text-gray-500 mb-6">Log a new golf round to your tracker.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Score" hint="total strokes" error={errors.score}>
            <input
              type="number"
              placeholder="e.g. 85"
              value={form.score}
              onChange={(e) => set('score', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Course Name" error={errors.course}>
          <input
            type="text"
            placeholder="e.g. Pebble Beach"
            value={form.course}
            onChange={(e) => set('course', e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Fairways Hit" hint="0–14" error={errors.fairways}>
            <input
              type="number"
              placeholder="8"
              value={form.fairways}
              onChange={(e) => set('fairways', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="GIR" hint="0–18" error={errors.gir}>
            <input
              type="number"
              placeholder="6"
              value={form.gir}
              onChange={(e) => set('gir', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Putts" error={errors.putts}>
            <input
              type="number"
              placeholder="32"
              value={form.putts}
              onChange={(e) => set('putts', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          Save Round
        </button>
      </form>
    </div>
  );
}
