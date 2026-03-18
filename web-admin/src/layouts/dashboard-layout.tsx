import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../providers/theme-provider';
import { useAuth } from '../providers/auth-provider';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Members', path: '/members' },
  { label: 'Categories', path: '/categories' },
  { label: 'Products', path: '/products' },
  { label: 'Event Media', path: '/event-media' },
  { label: 'Binary Tree', path: '/binary-tree' },
  { label: 'Orders', path: '/orders' },
  { label: 'Coupons', path: '/coupons' },
  { label: 'Settings', path: '/settings' },
];

export const DashboardLayout = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { member, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 border-r border-white/10 hidden md:flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-sm text-white/60 uppercase">NetShop</p>
            <h1 className="font-bold text-lg tracking-tight">MLM Control</h1>
          </div>
          <button className="text-white/80" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-primary/80 text-white py-2 text-sm font-semibold"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} Toggle theme
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Control Room</p>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-white">Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            {member && (
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700 dark:text-white">{member.fullName}</p>
                <p className="text-xs text-slate-400">{member.role}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-slate-900 text-white dark:bg-white/10 dark:text-white border border-slate-200 dark:border-white/10"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
