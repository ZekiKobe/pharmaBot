import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { IconHome, IconSearch, IconBuy, IconSell, IconList, IconPill } from './Icons';

const navItems = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/search', label: 'Search', icon: IconSearch },
  { to: '/buyer', label: 'Buy', icon: IconBuy },
  { to: '/seller', label: 'Sell', icon: IconSell },
  { to: '/my-posts', label: 'Posts', icon: IconList },
];

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.includes('/payment');
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-tg-bg">
      {!hideNav && (
        <header className={`sticky top-0 z-40 border-b border-slate-200/60 bg-tg-card/90 backdrop-blur-lg ${isHome ? '' : 'shadow-sm'}`}>
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
              <IconPill className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">PharmaBot</h1>
              <p className="text-[11px] text-slate-400">Ethiopian Pharma Marketplace</p>
            </div>
          </div>
        </header>
      )}

      <main className={hideNav ? '' : 'pb-24'}>
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-tg-card/95 px-2 py-2 backdrop-blur-lg">
          <div className="mx-auto flex max-w-lg items-center justify-around">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold no-underline transition-all ${
                    isActive ? 'text-teal-600' : 'text-slate-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-teal-600" />
                    )}
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className={isActive ? 'text-teal-600' : 'text-slate-500'}>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
