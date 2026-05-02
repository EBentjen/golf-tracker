import { useMemo, useState } from 'react';
import { getRandomDrill, PRACTICE_AREAS } from '../utils/practiceDrills';

const defaultForm = {
  date: new Date().toISOString().slice(0, 10),
  area: 'driver',
  focus: '',
  resultMade: '',
  resultTotal: '',
  notes: '',
};

const inputClass =
  'w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition placeholder:text-slate-600';

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

function areaLabel(area) {
  return PRACTICE_AREAS.find((item) => item.value === area)?.label ?? area;
}

function StatTile({ label, value, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1 font-mono">{sub}</p>}
    </div>
  );
}

function resultRate(session) {
  if (session.resultMade == null || !session.resultTotal) return null;
  return Math.round((Number(session.resultMade) / Number(session.resultTotal)) * 100);
}

function resultOutcome(resultMade, resultGoal) {
  if (resultMade == null || resultMade === '' || resultGoal == null) return null;
  const made = Number(resultMade);
  const goal = Number(resultGoal);
  if (Number.isNaN(made) || Number.isNaN(goal)) return null;
  if (made > goal) return { label: 'beat goal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (made === goal) return { label: 'met goal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  return { label: 'below goal', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
}

export default function Practice({ sessions, onAdd, onDelete }) {
  const [selectedArea, setSelectedArea] = useState('driver');
  const [drill, setDrill] = useState(() => getRandomDrill('driver'));
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const previewOutcome = resultOutcome(form.resultMade, drill?.goal);

  const stats = useMemo(() => {
    const lastSevenDays = new Date();
    lastSevenDays.setDate(lastSevenDays.getDate() - 7);
    const weekSessions = sessions.filter((session) => new Date(session.date) >= lastSevenDays).length;
    const scoredSessions = sessions.filter((session) => session.resultMade != null && session.resultGoal != null);
    const goalsMet = scoredSessions.filter((session) => Number(session.resultMade) >= Number(session.resultGoal)).length;
    const goalRate = scoredSessions.length ? Math.round((goalsMet / scoredSessions.length) * 100) : null;
    const topArea = PRACTICE_AREAS
      .map((area) => ({
        ...area,
        count: sessions.filter((session) => session.area === area.value).length,
      }))
      .sort((a, b) => b.count - a.count)[0];

    return { weekSessions, goalsMet, scoredCount: scoredSessions.length, goalRate, topArea };
  }, [sessions]);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function generate(area = selectedArea) {
    const next = getRandomDrill(area, drill?.title);
    setDrill(next);
    setSelectedArea(area);
    setForm((current) => ({
      ...current,
      area,
      focus: next.title,
      resultMade: '',
      resultTotal: String(next.attempts),
      notes: `${next.instructions}\n\nScore: ${next.score}`,
    }));
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.area || form.resultMade === '' || form.resultTotal === '') return;

    onAdd({
      date: form.date,
      area: form.area,
      focus: form.focus.trim() || drill?.title || areaLabel(form.area),
      drillTitle: drill?.title,
      resultLabel: drill?.resultLabel,
      resultMade: form.resultMade === '' ? undefined : Number(form.resultMade),
      resultTotal: form.resultTotal === '' ? undefined : Number(form.resultTotal),
      resultGoal: drill?.goal,
      resultOutcome: resultOutcome(form.resultMade, drill?.goal)?.label,
      notes: form.notes.trim(),
    });

    setForm({
      ...defaultForm,
      area: form.area,
      focus: drill?.title ?? '',
      resultTotal: drill?.attempts ? String(drill.attempts) : '',
    });
    setSaved(true);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">Practice</h1>
        <p className="text-sm text-slate-500 font-mono">Generate focused drills and log the work.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Sessions" value={sessions.length} sub={`${stats.weekSessions} this week`} />
        <StatTile label="Goals Met" value={stats.goalsMet} sub={stats.scoredCount ? `${stats.goalRate}% success rate` : 'start scoring'} />
        <StatTile label="Most Practiced" value={stats.topArea?.count ? stats.topArea.label : '-'} sub={stats.topArea?.count ? `${stats.topArea.count} sessions` : 'start logging'} />
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest mb-1">Drill Generator</p>
            <h2 className="text-lg font-bold text-slate-100">What are you working on?</h2>
          </div>
          <button
            type="button"
            onClick={() => generate()}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Generate Drill
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {PRACTICE_AREAS.map((area) => (
            <button
              key={area.value}
              type="button"
              onClick={() => generate(area.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors ${
                selectedArea === area.value
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-100 hover:bg-slate-700'
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{areaLabel(selectedArea)}</p>
              <h3 className="text-xl font-bold text-slate-100 mt-1">{drill.title}</h3>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
              goal {drill.goal}/{drill.attempts}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-4">{drill.setup}</p>
          <p className="text-sm text-slate-300 mt-3">{drill.instructions}</p>
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p className="text-xs font-mono text-emerald-400">{drill.score}</p>
            <p className="text-xs font-mono text-slate-500">
              log: {drill.resultLabel} · {drill.goal}/{drill.attempts} target
            </p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <p className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest mb-1">Log Session</p>
            <h2 className="text-lg font-bold text-slate-100">Save your practice</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Area">
              <select value={form.area} onChange={(e) => set('area', e.target.value)} className={inputClass}>
                {PRACTICE_AREAS.map((area) => (
                  <option key={area.value} value={area.value}>{area.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Focus">
            <input type="text" value={form.focus} onChange={(e) => set('focus', e.target.value)} placeholder="e.g. Fairway Ladder" className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Result" hint={drill.resultLabel}>
              <input
                type="number"
                min="0"
                max={form.resultTotal || undefined}
                value={form.resultMade}
                onChange={(e) => set('resultMade', e.target.value)}
                placeholder={String(drill.goal)}
                className={inputClass}
              />
            </Field>
            <Field label="Out Of" hint={`goal ${drill.goal}`}>
              <input
                type="number"
                min="1"
                max="300"
                value={form.resultTotal}
                onChange={(e) => set('resultTotal', e.target.value)}
                placeholder={String(drill.attempts)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className={`rounded-xl border px-4 py-3 ${previewOutcome?.bg ?? 'bg-slate-950/60 border-slate-800'}`}>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Outcome</p>
            <p className={`text-sm font-bold mt-1 ${previewOutcome?.color ?? 'text-slate-300'}`}>
              {previewOutcome
                ? `${previewOutcome.label}: ${form.resultMade}/${form.resultTotal || drill.attempts} ${drill.resultLabel}`
                : `Goal: ${drill.goal}/${drill.attempts} ${drill.resultLabel}`}
            </p>
          </div>

          <Field label="Notes">
            <textarea
              rows="5"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="What worked? What should you remember next time?"
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="flex items-center gap-3">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">
              Save Practice
            </button>
            {saved && <span className="text-sm text-emerald-400 font-mono">saved</span>}
          </div>
        </form>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest mb-4">Recent Practice</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No practice logged yet.</p>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 8).map((session) => (
                <div key={session.id} className="border border-slate-800 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-200">{session.focus}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {session.date} · {areaLabel(session.area)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(session.id)}
                      className="text-xs font-mono text-slate-600 hover:text-red-400"
                    >
                      del
                    </button>
                  </div>
                  {session.resultMade != null && session.resultTotal != null && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-mono rounded-full border px-2 py-0.5 ${
                        resultOutcome(session.resultMade, session.resultGoal)?.bg ?? 'bg-slate-800 border-slate-700'
                      } ${resultOutcome(session.resultMade, session.resultGoal)?.color ?? 'text-slate-400'}`}>
                        {session.resultOutcome ?? resultOutcome(session.resultMade, session.resultGoal)?.label ?? 'scored'}
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        {session.resultMade}/{session.resultTotal} {session.resultLabel ?? 'successes'}
                        {resultRate(session) != null ? ` · ${resultRate(session)}%` : ''}
                        {session.resultGoal != null ? ` · goal ${session.resultGoal}` : ''}
                      </span>
                    </div>
                  )}
                  {session.notes && <p className="text-sm text-slate-500 mt-2 whitespace-pre-line">{session.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
