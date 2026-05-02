import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/add', label: 'Add Round', icon: '➕' },
  { to: '/history', label: 'History', icon: '📋' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen p-4 gap-1">
      <div className="flex items-center gap-2 mb-6 px-2">
        <span className="text-2xl">⛳</span>
        <span className="font-bold text-lg text-gray-800">Golf Tracker</span>
      </div>
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <span>{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}
