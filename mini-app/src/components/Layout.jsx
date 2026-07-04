import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { IconHome, IconSearch, IconBuy, IconSell, IconList, IconPill } from './Icons';

const navItems = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/search', label: 'Search', icon: IconSearch },
  { to: '/buyer', label: 'Buy', icon: IconBuy },
  { to: '/seller', label: 'Sell', icon: IconSell },
  { to: '/my-posts', label: 'My Posts', icon: IconList },
];

export default function Layout() {
  const location = useLocation();
  const { webApp, ready } = useTelegram();
  const isHome = location.pathname === '/';
  const inTelegram = Boolean(webApp);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-tg-bg px-6 text-center text-tg-text">
        <div
          className="h-11 w-11 animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: 'color-mix(in srgb, var(--tg-theme-button-color, #0d9488) 28%, transparent)',
            borderTopColor: 'var(--tg-theme-button-color, #0d9488)',
          }}
        />
        <h1 className="mt-5 text-lg font-bold">Getting Things Ready...</h1>
        <p className="mt-1.5 text-sm text-tg-hint">Loading your marketplace experience</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text">
      {!inTelegram && (
        <header
          className={`sticky top-0 z-40 border-b bg-tg-card ${
            isHome ? '' : 'shadow-sm'
          }`}
          style={{ borderColor: 'color-mix(in srgb, var(--tg-theme-hint-color) 20%, transparent)' }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: 'var(--tg-theme-button-color, #0d9488)' }}
            >
              <IconPill className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-tg-text">PharmaBot</h1>
              <p className="text-[11px] text-tg-hint">Ethiopian Pharma Marketplace</p>
            </div>
          </div>
        </header>
      )}

      <main>
        <Outlet />
      </main>

      <nav
          className="fixed inset-x-0 bottom-0 z-50 bg-tg-card pt-1.5"
          style={{
            borderTop: '1px solid color-mix(in srgb, var(--tg-theme-hint-color) 22%, transparent)',
            paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-w-[3rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1 text-[9px] font-semibold leading-tight no-underline transition-colors ${
                    isActive ? 'text-tg-link' : 'text-tg-hint'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className="h-5 w-5"
                      style={{ color: isActive ? 'var(--tg-theme-link-color, #2dd4bf)' : 'var(--tg-theme-hint-color)' }}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
    </div>
  );
}
