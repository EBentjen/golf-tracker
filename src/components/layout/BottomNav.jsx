import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dash', icon: '⬡' },
  { to: '/add', label: 'Add', icon: '+' },
  { to: '/history', label: 'History', icon: '≡' },
  { to: '/practice', label: 'Practice', icon: '◇' },
  { to: '/swing', label: 'Swing', icon: '◌' },
  { to: '/targets', label: 'Goals', icon: '◎' },
  { to: '/backup', label: 'Backup', icon: '⇅' },
];

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 grid grid-cols-4 gap-y-1 px-2 pt-2 z-50"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `min-h-12 flex flex-col items-center justify-center rounded-lg text-[11px] leading-none font-medium transition-colors ${
              isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500'
            }`
          }
        >
          <span className="text-base font-mono mb-1">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
