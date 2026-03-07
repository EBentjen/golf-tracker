import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useRounds';

const defaultForm = {
  date: new Date().toISOString().slice(0, 10),
  course: '',
  tees: '',
  holes: 18,
  score: '',
  fairways: '',
  gir: '',
  putts: '',
  courseRating: '',
  slopeRating: '',
};

function Field({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">
        {label}
        {hint && <span className="ml-1 text-slate-500 font-normal text-xs font-mono">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition placeholder:text-slate-600';

export default function AddRound({ onAdd }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [autoFilled, setAutoFilled] = useState(false);
  const navigate = useNavigate();
  const { saveCourseData, lookupCourse } = useCourses();

  const is9 = form.holes === 9;

  function set(field, value) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'course' || field === 'tees') {
        const course = field === 'course' ? value : prev.course;
        const tees = field === 'tees' ? value : prev.tees;
        const saved = lookupCourse(course, tees);
        if (saved) {
          setAutoFilled(true);
          return { ...updated, courseRating: String(saved.courseRating), slopeRating: String(saved.slopeRating) };
        } else {
          setAutoFilled(false);
        }
      }
      return updated;
    });
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.course.trim()) e.course = 'Required';
    if (form.courseRating !== '') {
      const cr = Number(form.courseRating);
      if (isNaN(cr) || cr < 20 || cr > 90) e.courseRating = 'Typically 30–80';
    }
    if (form.slopeRating !== '') {
      const sr = Number(form.slopeRating);
      if (isNaN(sr) || sr < 55 || sr > 155) e.slopeRating = '55–155';
    }
    const score = Number(form.score);
    if (is9) {
      if (form.score === '' || isNaN(score) || score < 25 || score > 100) e.score = '25–100';
    } else {
      if (form.score === '' || isNaN(score) || score < 50 || score > 200) e.score = '50–200';
    }
    const fairways = Number(form.fairways);
    const maxFairways = is9 ? 7 : 14;
    if (form.fairways === '' || isNaN(fairways) || fairways < 0 || fairways > maxFairways) e.fairways = `0–${maxFairways}`;
    const gir = Number(form.gir);
    if (form.gir === '' || isNaN(gir) || gir < 0 || gir > form.holes) e.gir = `0–${form.holes}`;
    const putts = Number(form.putts);
    if (is9) {
      if (form.putts === '' || isNaN(putts) || putts < 9 || putts > 36) e.putts = '9–36';
    } else {
      if (form.putts === '' || isNaN(putts) || putts < 18 || putts > 72) e.putts = '18–72';
    }
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (form.courseRating !== '' && form.slopeRating !== '' && form.tees.trim()) {
      saveCourseData(form.course, form.tees, Number(form.courseRating), Number(form.slopeRating));
    }
    onAdd({
      date: form.date,
      course: form.course.trim(),
      tees: form.tees.trim() || undefined,
      holes: form.holes,
      score: Number(form.score),
      fairways: Number(form.fairways),
      gir: Number(form.gir),
      putts: Number(form.putts),
      ...(form.courseRating !== '' && { courseRating: Number(form.courseRating) }),
      ...(form.slopeRating !== '' && { slopeRating: Number(form.slopeRating) }),
    });
    navigate('/');
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">Add Round</h1>
      <p className="text-xs font-mono text-slate-500 mb-6">Log a new round to your tracker.</p>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">

        {/* Holes toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Holes</label>
          <div className="flex rounded-lg border border-slate-700 overflow-hidden w-fit">
            {[9, 18].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => set('holes', h)}
                className={`px-6 py-2 text-sm font-mono font-medium transition-colors ${
                  form.holes === h
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {h}H
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" error={errors.date}>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Score" hint="total strokes" error={errors.score}>
            <input type="number" placeholder={is9 ? '42' : '85'} value={form.score} onChange={(e) => set('score', e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Course Name" error={errors.course}>
            <input type="text" placeholder="e.g. Pebble Beach" value={form.course} onChange={(e) => set('course', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Tees" hint="optional">
            <input type="text" placeholder="e.g. White, Blue" value={form.tees} onChange={(e) => set('tees', e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Fairways" hint={`0–${is9 ? 7 : 14}`} error={errors.fairways}>
            <input type="number" placeholder={is9 ? '4' : '8'} value={form.fairways} onChange={(e) => set('fairways', e.target.value)} className={inputClass} />
          </Field>
          <Field label="GIR" hint={`0–${form.holes}`} error={errors.gir}>
            <input type="number" placeholder={is9 ? '3' : '6'} value={form.gir} onChange={(e) => set('gir', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Putts" error={errors.putts}>
            <input type="number" placeholder={is9 ? '16' : '32'} value={form.putts} onChange={(e) => set('putts', e.target.value)} className={inputClass} />
          </Field>
        </div>

        {/* Handicap data */}
        <div>
          <p className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest mb-3">
            Handicap Data{' '}
            {autoFilled
              ? <span className="normal-case text-emerald-400">· auto-filled</span>
              : <span className="normal-case text-slate-600">· optional</span>
            }
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Course Rating" hint={is9 ? 'e.g. 35.2' : 'e.g. 72.1'} error={errors.courseRating}>
              <input type="number" step="0.1" placeholder={is9 ? '35.2' : '72.1'} value={form.courseRating} onChange={(e) => set('courseRating', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Slope Rating" hint="55–155" error={errors.slopeRating}>
              <input type="number" placeholder="113" value={form.slopeRating} onChange={(e) => set('slopeRating', e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-2.5 rounded-lg transition-colors">
          Save Round
        </button>
      </form>
    </div>
  );
}
