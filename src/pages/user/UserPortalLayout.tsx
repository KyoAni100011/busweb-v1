import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BookingProvider } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Search Trips', to: '/' },
  { label: 'Guest Lookup', to: '/booking/lookup' },
];

const authNavLinks = [
  { label: 'Search Trips', to: '/' },
  { label: 'My Dashboard', to: '/user' },
  { label: 'My Bookings', to: '/user/bookings' },
];

const activeClass = 'text-primary font-semibold';
const inactiveClass = 'text-muted-foreground hover:text-primary';

export const UserPortalLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const links = isAuthenticated ? authNavLinks : navLinks;

  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to="/" className="text-xl font-bold text-primary">
              tempProject
            </Link>
            <nav className="hidden gap-6 md:flex">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </NavLink>
                  <NavLink to="/register">
                    <Button size="sm">Register</Button>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/user" className="text-sm text-muted-foreground hover:text-primary">
                    Hi, {user?.name || user?.email}
                  </NavLink>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">
          <Outlet />
        </main>
        <footer className="border-t bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} tempProject. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="#" className="hover:text-primary">Privacy Policy</Link>
              <Link to="#" className="hover:text-primary">Terms of Service</Link>
              <Link to="#" className="hover:text-primary">Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </BookingProvider>
  );
};
