import { useRef, useState } from 'react';
import { COURSES_KEY, PRACTICE_KEY } from '../hooks/useRounds';

const BACKUP_VERSION = 1;
const LAST_BACKUP_KEY = 'golf_last_backup_exported_at';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function buildBackup(rounds, targets) {
  return {
    app: 'GolfTracker',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    rounds,
    targets,
    courses: readJson(COURSES_KEY, {}),
    practiceSessions: readJson(PRACTICE_KEY, []),
  };
}

function downloadBackup(data) {
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `golf-tracker-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function validateBackup(data) {
  if (!data || typeof data !== 'object') return 'That file is not a readable backup.';
  if (data.app !== 'GolfTracker') return 'That file does not look like a GolfTracker backup.';
  if (!Array.isArray(data.rounds)) return 'The backup is missing round history.';
  if (!data.targets || typeof data.targets !== 'object') return 'The backup is missing goals.';
  if (data.courses != null && typeof data.courses !== 'object') return 'The saved course data is not readable.';
  if (data.practiceSessions != null && !Array.isArray(data.practiceSessions)) return 'The practice log is not readable.';
  return null;
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">{value}</p>
    </div>
  );
}

function daysSince(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function formatBackupDate(isoDate) {
  if (!isoDate) return 'Never';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Backup({ rounds, targets, onImport }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [lastBackupAt, setLastBackupAt] = useState(() => localStorage.getItem(LAST_BACKUP_KEY));
  const savedCourses = readJson(COURSES_KEY, {});
  const practiceSessions = readJson(PRACTICE_KEY, []);
  const courseCount = Object.keys(savedCourses).length;
  const backupAge = daysSince(lastBackupAt);
  const backupIsDue = backupAge == null || backupAge >= 14;

  function handleExport() {
    downloadBackup(buildBackup(rounds, targets));
    const exportedAt = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_KEY, exportedAt);
    setLastBackupAt(exportedAt);
    setStatus({ type: 'success', text: 'Backup downloaded. Last backup date updated.' });
  }

  function handleImport(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const error = validateBackup(data);
        if (error) {
          setStatus({ type: 'error', text: error });
          return;
        }

        onImport({
          rounds: data.rounds,
          targets: data.targets,
          courses: data.courses ?? {},
          practiceSessions: data.practiceSessions ?? [],
        });
        if (data.exportedAt) {
          localStorage.setItem(LAST_BACKUP_KEY, data.exportedAt);
          setLastBackupAt(data.exportedAt);
        }
        setStatus({
          type: 'success',
          text: `Imported ${data.rounds.length} round${data.rounds.length === 1 ? '' : 's'}. Backup date restored.`,
        });
      } catch {
        setStatus({ type: 'error', text: 'That file could not be opened.' });
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };

    reader.readAsText(file);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">Backup</h1>
      <p className="text-sm text-slate-500 mb-6 font-mono">
        Save or restore your round history, goals, and saved course ratings.
      </p>

      <div className={`mb-6 rounded-xl border px-4 py-3 ${
        backupIsDue ? 'border-amber-500/30 bg-amber-500/10' : 'border-emerald-500/30 bg-emerald-500/10'
      }`}>
        <p className={`text-xs font-mono font-medium uppercase tracking-widest ${backupIsDue ? 'text-amber-400' : 'text-emerald-400'}`}>
          {backupIsDue ? 'Backup Reminder' : 'Backup Current'}
        </p>
        <p className="text-sm text-slate-300 mt-1">
          Last export: {formatBackupDate(lastBackupAt)}
          {backupAge != null ? ` (${backupAge} day${backupAge === 1 ? '' : 's'} ago)` : ''}.
        </p>
        {backupIsDue && (
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Export a backup after adding important rounds or before bigger app changes.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Rounds" value={rounds.length} />
        <SummaryCard label="Goals" value="4" />
        <SummaryCard label="Courses" value={courseCount} />
        <SummaryCard label="Practice" value={practiceSessions.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest mb-2">Export</p>
          <h2 className="text-lg font-bold text-slate-100 mb-2">Download a backup file</h2>
          <p className="text-sm text-slate-500 mb-5">
            Keep this file somewhere safe before big app changes or after you add new rounds.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-2.5 rounded-lg transition-colors"
          >
            Export Backup
          </button>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-xs font-mono font-medium text-amber-400 uppercase tracking-widest mb-2">Import</p>
          <h2 className="text-lg font-bold text-slate-100 mb-2">Restore from a backup</h2>
          <p className="text-sm text-slate-500 mb-5">
            Importing replaces the data currently saved in this browser with the backup file.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => handleImport(e.target.files?.[0])}
            className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-slate-200 hover:file:bg-slate-700"
          />
        </section>
      </div>

      {status && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm font-mono ${
            status.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}
