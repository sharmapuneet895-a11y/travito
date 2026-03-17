import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user, isLoggedIn, setShowAuthModal } = useAuth();

  const headerLinks = [
    { path: '/', label: 'Home' },
    { path: '/visa', label: 'Visa' },
    { path: '/blog', label: 'Travel Tips' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: '#F5F7FA', borderBottom: '1px solid rgba(11, 60, 93, 0.1)' }} data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left Aligned */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <Plane className="w-8 h-8" style={{ color: '#FF7A00' }} />
            <span className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: '#0B3C5D' }}>
              Travito
            </span>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-8">
            {headerLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-all hover:text-orange-500 ${
                    isActive ? 'text-orange-500' : ''
                  }`}
                  style={{ color: isActive ? '#FF7A00' : '#0B3C5D' }}
                  data-testid={`nav-${link.label.toLowerCase().replace(/ /g, '-')}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Avatar / Login - Right */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold hover:shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #FF7A00 100%)' }}
                data-testid="user-avatar"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-full font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#FF7A00' }}
                data-testid="login-btn"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="md:hidden flex items-center justify-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(11, 60, 93, 0.1)' }}>
          {headerLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all ${
                  isActive ? 'text-orange-500' : ''
                }`}
                style={{ color: isActive ? '#FF7A00' : '#0B3C5D' }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
