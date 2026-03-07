import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/add', label: 'Add Round', icon: '➕' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/targets', label: 'Goals', icon: '🎯' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-green-600' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl mb-0.5">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
