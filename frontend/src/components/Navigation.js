import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Calendar, FileText, DollarSign, Smartphone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/seasons', label: 'Best Seasons', icon: Calendar },
    { path: '/visa', label: 'Visa Info', icon: FileText },
    { path: '/forex', label: 'Forex Rates', icon: DollarSign },
    { path: '/apps', label: 'Top Apps', icon: Smartphone }
  ];

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50" data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu - Left */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-accent/20 transition-all"
              data-testid="hamburger-menu"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>

            {/* Logo - Center */}
            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2" data-testid="logo-link">
              <Compass className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>
                Pass-e-port
              </span>
            </Link>

            {/* Spacer for balance */}
            <div className="w-10"></div>
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
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Compass className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Pass-e-port
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/20 transition-all"
                  >
                    <X className="w-5 h-5 text-primary" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                      location.pathname === '/'
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-accent/20'
                    }`}
                    data-testid="menu-home"
                  >
                    <Compass className="w-5 h-5" />
                    <span className="font-medium">Home</span>
                  </Link>

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
                            ? 'bg-primary text-white'
                            : 'text-foreground hover:bg-accent/20'
                        }`}
                        data-testid={`menu-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
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