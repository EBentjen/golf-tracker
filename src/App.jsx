import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import AddRound from './pages/AddRound';
import History from './pages/History';
import Targets from './pages/Targets';
import Backup from './pages/Backup';
import Practice from './pages/Practice';
import SwingAnalyzer from './pages/SwingAnalyzer';
import { COURSES_KEY, PRACTICE_KEY, usePracticeSessions, useRounds, useTargets } from './hooks/useRounds';

export default function App() {
  const { rounds, addRound, deleteRound, replaceRounds } = useRounds();
  const { targets, saveTargets } = useTargets();
  const {
    sessions,
    addPracticeSession,
    deletePracticeSession,
    replacePracticeSessions,
  } = usePracticeSessions();

  function importBackup({ rounds: importedRounds, targets: importedTargets, courses, practiceSessions }) {
    replaceRounds(importedRounds);
    saveTargets(importedTargets);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses ?? {}));
    replacePracticeSessions(practiceSessions);
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(practiceSessions ?? []));
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 pb-36 md:pb-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard rounds={rounds} targets={targets} />} />
            <Route path="/add" element={<AddRound onAdd={addRound} />} />
            <Route path="/history" element={<History rounds={rounds} onDelete={deleteRound} />} />
            <Route path="/practice" element={<Practice sessions={sessions} onAdd={addPracticeSession} onDelete={deletePracticeSession} />} />
            <Route path="/swing" element={<SwingAnalyzer />} />
            <Route path="/targets" element={<Targets targets={targets} onSave={saveTargets} />} />
            <Route path="/backup" element={<Backup rounds={rounds} targets={targets} onImport={importBackup} />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
