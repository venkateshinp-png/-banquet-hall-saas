import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const publicNavItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/search', label: 'Search Halls', icon: MagnifyingGlassIcon },
];

const customerNavItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/my-bookings', label: 'My Bookings', icon: CalendarDaysIcon },
];

const ownerNavItems: NavItem[] = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/owner/halls', label: 'My Halls', icon: BuildingOffice2Icon },
  { to: '/owner/bookings', label: 'Bookings', icon: CalendarDaysIcon },
  { to: '/owner/reports', label: 'Reports', icon: DocumentChartBarIcon },
  { to: '/owner/settings', label: 'Settings', icon: Cog6ToothIcon },
];

const adminNavItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/admin/approvals', label: 'Hall Approvals', icon: ClipboardDocumentListIcon },
  { to: '/admin/users', label: 'Users', icon: UserGroupIcon },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDaysIcon },
  { to: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
  { to: '/admin/reports', label: 'Reports', icon: DocumentChartBarIcon },
];

function getNavLinksForRole(role?: UserRole): NavItem[] {
  if (!role) return [];
  switch (role) {
    case UserRole.CUSTOMER:
      return customerNavItems;
    case UserRole.OWNER:
      return ownerNavItems;
    case UserRole.MANAGER:
    case UserRole.ASSISTANT:
      return ownerNavItems;
    case UserRole.ADMIN:
      return adminNavItems;
    default:
      return [];
  }
}

function isDarkSidebar(role?: UserRole): boolean {
  return role === UserRole.OWNER || role === UserRole.MANAGER || role === UserRole.ASSISTANT || role === UserRole.ADMIN;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = getNavLinksForRole(user?.role);
  const darkSidebar = isDarkSidebar(user?.role);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className={`sticky top-0 z-50 shadow-md ${darkSidebar ? 'bg-[#1e3a8a] text-white' : 'bg-[#1e3a8a] text-white'}`}>
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {navLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10 lg:hidden"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-blue-100 transition-colors">
              <BuildingOffice2Icon className="h-6 w-6" />
              <span>BanquetBook</span>
            </Link>
            {user?.role === UserRole.ADMIN && (
              <span className="ml-2 rounded bg-white/20 px-2 py-0.5 text-xs font-bold">
                Admin
              </span>
            )}
          </div>

          {/* Desktop top nav links for public pages */}
          {!user && (
            <nav className="hidden md:flex items-center gap-1">
              {publicNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-blue-100 sm:inline">
                  Welcome, {user.fullName}
                  {user.role && (
                    <span className="ml-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                      {user.role}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                  aria-label="Logout"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1e3a8a] transition-colors hover:bg-blue-50"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {navLinks.length > 0 && (
          <>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            <aside
              className={`
                fixed top-14 bottom-0 left-0 z-40 w-64 transform shadow-xl transition-transform duration-200 ease-in-out
                lg:relative lg:top-0 lg:translate-x-0 lg:shadow-none
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                ${darkSidebar ? 'bg-[#1e3a8a] border-r border-blue-900' : 'bg-white border-r border-slate-200'}
              `}
            >
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/' || item.to === '/owner/dashboard' || item.to === '/admin/dashboard'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        darkSidebar
                          ? `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                            ${isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`
                          : `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                            ${isActive ? 'bg-[#1e3a8a] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]'}`
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
