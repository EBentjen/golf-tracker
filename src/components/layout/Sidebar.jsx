import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/add', label: 'Add Round', icon: '➕' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/targets', label: 'Goals', icon: '🎯' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-gray-200 px-4 py-6 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <span className="text-2xl">⛳</span>
        <span className="text-lg font-bold text-gray-900">GolfTracker</span>
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
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
