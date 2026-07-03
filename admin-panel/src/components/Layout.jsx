import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconDashboard, IconClock, IconPosts, IconLogout, IconPill } from './Icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/pending', label: 'Pending Review', icon: IconClock },
  { to: '/posts', label: 'All Posts', icon: IconPosts },
];

const pageTitles = {
  '/': 'Dashboard',
  '/pending': 'Pending Review',
  '/posts': 'All Posts',
};

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = pageTitles[location.pathname]
    || (location.pathname.startsWith('/posts/') ? 'Post Details' : 'Admin');

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-brand-950 shadow-sidebar">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
            <IconPill className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">PharmaBot</h1>
            <p className="text-[11px] font-medium uppercase tracking-wider text-brand-400/80">
              Admin Console
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-brand-500/60">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-white shadow-sm'
                    : 'text-brand-300/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-brand-300' : 'text-brand-500/60 group-hover:text-brand-300'}`} />
                  {item.label}
                  {item.to === '/pending' && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
              {admin?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{admin?.username}</p>
              <p className="truncate text-xs capitalize text-brand-400/70">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-300/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            <IconLogout className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="ml-[260px] flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-8 py-4 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">PharmaBot</p>
          <h2 className="text-lg font-semibold text-slate-900">{pageTitle}</h2>
        </header>

        <main className="flex-1 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
