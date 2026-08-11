import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/authApi';
import { useUIStore } from '../../store/uiStore';
import { NotificationCenter } from '../ui/NotificationCenter';
import { ChatWidget } from '../../features/chat/ChatWidget';
import plnLogo from '../../assets/Logo_PLN.svg';

interface NavItem {
  label: string;
  path: string;
  roles?: string[];
  icon: string;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    section: 'General',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'Projects',
    path: '/projects',
    section: 'General',
    icon: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  },
  {
    label: 'Review Queue',
    path: '/reviews',
    section: 'General',
    roles: ['REVIEWER', 'CHECKER', 'APPROVER', 'PIC_CONSULTANT'],
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    label: 'User Management',
    path: '/admin/users',
    section: 'Administration',
    roles: ['ADMIN'],
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    label: 'Institutions',
    path: '/admin/institutions',
    section: 'Administration',
    roles: ['ADMIN'],
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
];

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-500',
  PIC_PROJECT: 'bg-primary-400',
  REVIEWER: 'bg-yellow-500',
  CHECKER: 'bg-orange-500',
  APPROVER: 'bg-green-600',
  VENDOR: 'bg-pink-500',
  VIEWER: 'bg-gray-500',
};

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const sections = [...new Set(visibleNav.map((i) => i.section))];

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    addToast('info', 'Logged out successfully');
    navigate('/login');
  };

  const activeNav = visibleNav.find(
    (i) => location.pathname === i.path || location.pathname.startsWith(i.path + '/')
  );

  // Routes that are reachable but intentionally not in the sidebar nav (e.g.
  // linked from the user menu, not a primary section) still need a real
  // header title instead of falling back to the app brand name.
  const NON_NAV_TITLES: Record<string, string> = {
    '/profile': 'My Profile',
  };
  const pageTitle = activeNav?.label ?? NON_NAV_TITLES[location.pathname] ?? 'Pusat Manajemen Proyek';

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0e4f65 0%, #0a3d50 100%)' }}>

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex flex-col items-start gap-1.5">
          <img src={plnLogo} alt="PLN Logo" className="h-8 w-auto mb-0.5" />
          <p className="text-white font-bold text-sm leading-tight">Pusat Manajemen Proyek</p>
          <p className="text-[11px]" style={{ color: '#A1DBEE', opacity: 0.75 }}>Field QA Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {sections.map((section) => (
          <div key={section}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
               style={{ color: 'rgba(161,219,238,0.5)' }}>
              {section}
            </p>
            <div className="space-y-0.5">
              {visibleNav
                .filter((i) => i.section === section)
                .map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + '/');
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'hover:bg-white/10'
                      }`}
                      style={isActive ? { backgroundColor: '#44B8DE' } : { color: '#A1DBEE' }}
                    >
                      <Icon d={item.icon} />
                      {item.label}
                    </NavLink>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-white/5">
          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-xs"
               style={{ backgroundColor: '#44B8DE' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-[10px] truncate" style={{ color: '#A1DBEE' }}>{user?.email}</p>
          </div>
        </div>
        {user?.role && (
          <div className="px-3 mb-2">
            <span className={`inline-block text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] ?? 'bg-gray-500'}`}>
              {user.role.replace('_', ' ')}
            </span>
          </div>
        )}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              isActive ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`
          }
          style={({ isActive }) => ({ color: isActive ? '#ffffff' : '#A1DBEE' })}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-white/10"
          style={{ color: '#A1DBEE' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-60 h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center gap-4 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-base font-semibold text-gray-800">
            {pageTitle}
          </h1>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Notification Center */}
            <NotificationCenter />

            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                 style={{ backgroundColor: '#44B8DE' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mounted here rather than in App so it is authenticated-only by
          construction — AppLayout renders only inside AuthGuard. */}
      <ChatWidget />
    </div>
  );
}
