import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const primaryLinks = [
  { to: '/', label: 'Home', icon: '⬡' },
  { to: '/add', label: 'Add', icon: '+' },
  { to: '/practice', label: 'Practice', icon: '◇' },
];

const menuLinks = [
  { to: '/history', label: 'Round History', description: 'Scores and past rounds', icon: '≡' },
  { to: '/swing', label: 'Swing Analyzer', description: 'Upload video for feedback', icon: '◌' },
  { to: '/targets', label: 'Goals', description: 'Scoring targets', icon: '◎' },
  { to: '/backup', label: 'Backup', description: 'Export and import data', icon: '⇅' },
];

export default function BottomNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMenuActive = menuLinks.some(({ to }) => location.pathname.startsWith(to));

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed left-3 right-3 z-50 transition-all duration-200 md:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
        style={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/98 shadow-2xl shadow-slate-950/60">
          <div className="border-b border-slate-800 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Menu</p>
          </div>
          <nav className="p-2">
            {menuLinks.map(({ to, label, description, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                    isActive ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-lg text-emerald-300">
                  {icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block truncate text-xs text-slate-500">{description}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 gap-1 border-t border-slate-800 bg-slate-900/95 px-2 pt-2 backdrop-blur md:hidden"
        style={{ paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom))' }}
      >
        {primaryLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center rounded-xl text-[12px] font-semibold leading-none transition-colors ${
                isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500'
              }`
            }
          >
            <span className="mb-1 font-mono text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label="Open navigation menu"
          onClick={() => setIsOpen((open) => !open)}
          className={`min-h-14 rounded-xl text-[12px] font-semibold leading-none transition-colors ${
            isOpen || isMenuActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500'
          }`}
        >
          <span className="mb-1 block font-mono text-lg">{isOpen ? '×' : '•••'}</span>
          Menu
        </button>
      </nav>
    </>
  );
}
