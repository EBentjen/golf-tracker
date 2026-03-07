import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import AddRound from './pages/AddRound';
import History from './pages/History';
import Targets from './pages/Targets';
import { useRounds, useTargets } from './hooks/useRounds';

export default function App() {
  const { rounds, addRound, deleteRound } = useRounds();
  const { targets, saveTargets } = useTargets();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard rounds={rounds} targets={targets} />} />
            <Route path="/add" element={<AddRound onAdd={addRound} />} />
            <Route path="/history" element={<History rounds={rounds} onDelete={deleteRound} />} />
            <Route path="/targets" element={<Targets targets={targets} onSave={saveTargets} />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
