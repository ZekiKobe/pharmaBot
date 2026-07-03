import { Outlet, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/search', label: 'Search', icon: '🔍' },
  { to: '/buyer', label: 'Buy', icon: '🔍' },
  { to: '/seller', label: 'Sell', icon: '💊' },
  { to: '/my-posts', label: 'My Posts', icon: '📋' },
];

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.includes('/payment');

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-5 text-center text-white">
        <h1 className="text-xl font-bold">💊 PharmaBot</h1>
        <p className="mt-1 text-sm opacity-90">Ethiopian Pharmaceutical Marketplace</p>
      </header>

      <main className="min-h-[calc(100vh-140px)]">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-tg-card px-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[0.7rem] font-medium no-underline ${
                  isActive ? 'text-blue-600' : 'text-tg-hint'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
