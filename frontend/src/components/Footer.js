import React from 'react';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t" style={{ borderColor: '#E2E8F0' }}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left - Travito Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Plane className="w-6 h-6 transition-transform group-hover:rotate-12" style={{ color: '#FF7A00' }} />
            <span className="text-xl font-bold" style={{ color: '#0B3C5D', fontFamily: 'Poppins, sans-serif' }}>
              Travito
            </span>
          </Link>

          {/* Right - About and Contact */}
          <div className="flex items-center gap-6">
            <Link 
              to="/blog" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#64748B' }}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#64748B' }}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
