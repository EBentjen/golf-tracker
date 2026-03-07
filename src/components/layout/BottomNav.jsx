import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '⬡' },
  { to: '/add', label: 'Add', icon: '+' },
  { to: '/history', label: 'History', icon: '≡' },
  { to: '/targets', label: 'Goals', icon: '◎' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-50">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-500'
            }`
          }
        >
          <span className="text-lg font-mono mb-0.5">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
