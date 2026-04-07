import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user, isLoggedIn, setShowAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerLinks = [
    { path: '/', label: 'Home' },
    { path: '/visa', label: 'Visa' },
    { path: '/blog', label: 'Travel Tips' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)', borderBottom: 'none' }} data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left Aligned */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <Plane className="w-8 h-8 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold leading-tight text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Travito
              </span>
              <span className="text-xs text-gray-500 hidden sm:block" style={{ fontFamily: 'Inter, sans-serif' }}>.co.in</span>
            </div>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-8">
            {headerLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-all hover:text-blue-600 ${
                    isActive ? 'text-blue-600' : ''
                  }`}
                  style={{ color: isActive ? '#2563eb' : '#0B3C5D' }}
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
                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full text-white font-bold hover:shadow-lg transition-all text-sm md:text-base"
                style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #FF7A00 100%)' }}
                data-testid="user-avatar"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-white text-sm md:text-base transition-all hover:opacity-90 bg-blue-600 hover:bg-blue-700"
                data-testid="login-btn"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: '#0B3C5D' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: '#0B3C5D' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t mt-3" style={{ borderColor: 'rgba(11, 60, 93, 0.1)' }}>
            <div className="flex flex-col gap-2">
              {headerLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive ? 'bg-orange-50' : 'hover:bg-gray-100'
                    }`}
                    style={{ color: isActive ? '#FF7A00' : '#0B3C5D' }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
