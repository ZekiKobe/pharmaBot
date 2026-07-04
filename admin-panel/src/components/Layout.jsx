import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconDashboard, IconClock, IconPosts, IconLogout, IconPill, IconChannel, IconSettings, IconMenu, IconClose, IconUsers } from './Icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/pending', label: 'Pending Review', icon: IconClock },
  { to: '/channels', label: 'Telegram Channels', icon: IconChannel },
  { to: '/posts', label: 'All Posts', icon: IconPosts },
  { to: '/users', label: 'Users', icon: IconUsers },
  { to: '/settings', label: 'Settings', icon: IconSettings },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle =
    navItems.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label
    || (location.pathname.startsWith('/posts/') ? (location.pathname.endsWith('/edit') ? 'Edit Post' : 'Post Details') : 'Admin');

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:hidden">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Admin Panel</p>
              <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">{pageTitle}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <button
              type="button"
              className="flex-1 bg-slate-950/35 backdrop-blur-[1px]"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="w-[88vw] max-w-sm border-l border-slate-200 bg-white shadow-2xl">
              <SidebarContent
                admin={admin}
                onSignOut={handleSignOut}
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <SidebarContent admin={admin} onSignOut={handleSignOut} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 hidden border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur-md lg:block xl:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Admin Panel</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{pageTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">Ethiopian pharmaceutical marketplace</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">{admin?.username}</p>
              <p className="text-xs capitalize text-slate-500">{admin?.role}</p>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-5 lg:px-6 lg:py-8 xl:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ admin, onSignOut, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25">
            <IconPill className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">PharmaBot</h1>
            <p className="text-xs font-medium text-slate-400">Administration</p>
          </div>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 lg:hidden"
          >
            <IconClose className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all ${
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
        <div className="mb-3 rounded-2xl bg-slate-50 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
              {(admin?.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{admin?.username}</p>
              <p className="truncate text-xs capitalize text-slate-400">{admin?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <IconLogout className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
