import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconDashboard, IconClock, IconPosts, IconLogout, IconPill } from './Icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/pending', label: 'Pending', icon: IconClock },
  { to: '/posts', label: 'All Posts', icon: IconPosts },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle =
    navItems.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label
    || (location.pathname.startsWith('/posts/') ? 'Post Details' : 'Admin');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <IconPill className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">PharmaBot</h1>
            <p className="text-[11px] font-medium text-slate-400">Administration</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className={isActive ? 'text-white' : ''}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
              {admin?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{admin?.username}</p>
              <p className="truncate text-xs capitalize text-slate-400">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <IconLogout className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-8 py-5 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-900">{pageTitle}</h2>
          <p className="text-sm text-slate-500">Ethiopian pharmaceutical marketplace</p>
        </header>
        <main className="flex-1 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
