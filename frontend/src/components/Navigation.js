import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Calendar, FileText, DollarSign, Smartphone } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Compass },
    { path: '/seasons', label: 'Best Seasons', icon: Calendar },
    { path: '/visa', label: 'Visa Info', icon: FileText },
    { path: '/forex', label: 'Forex Rates', icon: DollarSign },
    { path: '/apps', label: 'Top Apps', icon: Smartphone }
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>
              Pass-e-port
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-accent/20'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu - simplified */}
          <div className="md:hidden flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-full transition-all ${
                    isActive ? 'bg-primary text-white' : 'text-foreground'
                  }`}
                  data-testid={`nav-mobile-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;