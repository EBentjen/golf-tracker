import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRounds } from '../hooks/useRounds';

const empty = { date: '', course: '', score: '', fairways: '', gir: '', putts: '' };

export default function AddRound() {
  const [form, setForm] = useState({ ...empty, date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});
  const { addRound } = useRounds();
  const nav = useNavigate();

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.course.trim()) e.course = 'Required';
    if (!form.score || form.score < 50 || form.score > 200) e.score = 'Enter a valid score (50–200)';
    if (form.fairways === '' || form.fairways < 0 || form.fairways > 14) e.fairways = '0–14';
    if (form.gir === '' || form.gir < 0 || form.gir > 18) e.gir = '0–18';
    if (form.putts === '' || form.putts < 18 || form.putts > 72) e.putts = '18–72';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    addRound({ ...form, score: +form.score, fairways: +form.fairways, gir: +form.gir, putts: +form.putts });
    nav('/');
  }

  function field(label, key, type = 'number', extra = {}) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
          {...extra}
        />
        {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Round</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-5">
        {field('Date', 'date', 'date')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <input
            type="text"
            value={form.course}
            onChange={e => { setForm(f => ({ ...f, course: e.target.value })); setErrors(er => ({ ...er, course: '' })); }}
            placeholder="Course name"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.course ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
        </div>
        {field('Score', 'score', 'number', { placeholder: 'e.g. 82' })}
        {field('Fairways Hit', 'fairways', 'number', { placeholder: '0–14', min: 0, max: 14 })}
        {field('Greens in Regulation (GIR)', 'gir', 'number', { placeholder: '0–18', min: 0, max: 18 })}
        {field('Putts', 'putts', 'number', { placeholder: 'e.g. 34', min: 18, max: 72 })}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Save Round
        </button>
      </form>
    </div>
  );
}
