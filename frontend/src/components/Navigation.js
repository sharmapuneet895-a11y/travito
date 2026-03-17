import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Calendar, FileText, DollarSign, Smartphone, Menu, X, BookOpen, Cloud, Zap, Utensils, Heart, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, setShowAuthModal } = useAuth();

  const navItems = [
    { path: '/', label: 'Best Seasons', icon: Calendar },
    { path: '/visa', label: 'Visa Info', icon: FileText },
    { path: '/weather', label: 'Weather', icon: Cloud },
    { path: '/plugs', label: 'Power Plugs', icon: Zap },
    { path: '/festivals', label: 'Festivals & Local Dishes', icon: Utensils },
    { path: '/safety', label: 'Safety & Emergency', icon: Shield },
    { path: '/forex', label: 'Forex Rates', icon: DollarSign },
    { path: '/apps', label: 'Top Apps', icon: Smartphone },
    { path: '/blog', label: 'Travel Tips', icon: BookOpen },
    { path: '/wishlist', label: 'My Wishlist', icon: Heart }
  ];

  return (
    <>
      <nav className="sticky top-0 z-50" style={{ backgroundColor: '#F5F7FA', borderBottom: '1px solid rgba(11, 60, 93, 0.1)' }} data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu - Left */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-orange-100 transition-all"
              data-testid="hamburger-menu"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" style={{ color: '#0B3C5D' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: '#0B3C5D' }} />
              )}
            </button>

            {/* Logo - Center */}
            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2" data-testid="logo-link">
              <Compass className="w-8 h-8" style={{ color: '#FF7A00' }} />
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0B3C5D' }}>
                Pass-e-port
              </span>
            </Link>

            {/* User Avatar / Login - Right */}
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
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-accent/20 transition-all"
                data-testid="login-btn"
                aria-label="Login"
              >
                <User className="w-6 h-6 text-primary" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
              data-testid="menu-overlay"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto"
              data-testid="slide-menu"
            >
              <div className="p-6">
                {/* Menu Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: 'rgba(11, 60, 93, 0.1)' }}>
                  <div className="flex items-center gap-2">
                    <Compass className="w-8 h-8" style={{ color: '#FF7A00' }} />
                    <span className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0B3C5D' }}>
                      Pass-e-port
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-100 transition-all"
                  >
                    <X className="w-5 h-5" style={{ color: '#0B3C5D' }} />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                          isActive
                            ? 'text-white'
                            : 'hover:bg-orange-50'
                        }`}
                        style={isActive ? { backgroundColor: '#0B3C5D' } : { color: '#0B3C5D' }}
                        data-testid={`menu-${item.label.toLowerCase().replace(/ /g, '-')}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  {/* Profile Link */}
                  <div className="pt-4 border-t border-border mt-4">
                    {isLoggedIn ? (
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                          location.pathname === '/profile'
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-accent/20'
                        }`}
                        data-testid="menu-profile"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium block">{user.name}</span>
                          <span className="text-xs text-muted-foreground">View Profile</span>
                        </div>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowAuthModal(true);
                        }}
                        className="flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-foreground hover:bg-accent/20 w-full"
                        data-testid="menu-login"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Sign In</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Menu Footer */}
                <div className="mt-12 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Your Digital Compass for Global Travel
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;