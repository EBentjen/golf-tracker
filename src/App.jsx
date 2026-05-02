import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import AddRound from './pages/AddRound';
import History from './pages/History';

export default function App() {
  return (
    <BrowserRouter basename="/golf-tracker">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddRound />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </BrowserRouter>
  );
}
