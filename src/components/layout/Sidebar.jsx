import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '⬡' },
  { to: '/add', label: 'Add Round', icon: '+' },
  { to: '/history', label: 'History', icon: '≡' },
  { to: '/targets', label: 'Goals', icon: '◎' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-slate-900 border-r border-slate-800 px-4 py-6 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <span className="text-emerald-400 text-xl font-bold">⛳</span>
        <span className="text-lg font-bold text-slate-100 tracking-tight">GolfTracker</span>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <span className="text-base font-mono w-4 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-2">
        <p className="text-xs text-slate-600 font-mono">v1.0 · WHS</p>
      </div>
    </aside>
  );
}
