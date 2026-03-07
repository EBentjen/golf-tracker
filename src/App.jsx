import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import AddRound from './pages/AddRound';
import History from './pages/History';
import { useRounds } from './hooks/useRounds';

export default function App() {
  const { rounds, addRound, deleteRound } = useRounds();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard rounds={rounds} />} />
            <Route path="/add" element={<AddRound onAdd={addRound} />} />
            <Route path="/history" element={<History rounds={rounds} onDelete={deleteRound} />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
