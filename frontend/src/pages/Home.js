import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText, DollarSign, Smartphone, ArrowRight, Search } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [countries, setCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/countries`);
        setCountries(response.data.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = countries.filter(country =>
        country.country_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
      setShowDropdown(true);
    } else {
      setFilteredCountries([]);
      setShowDropdown(false);
    }
  }, [searchQuery, countries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSearchQuery('');
    setShowDropdown(false);
    // Navigate to country detail page
    navigate(`/country/${country.country_code}`);
  };
  const features = [
    {
      title: 'Best Seasons to Travel',
      description: 'Discover the perfect time to visit your dream destination with our color-coded world map.',
      icon: Calendar,
      link: '/seasons',
      color: '#E25A53'
    },
    {
      title: 'Visa Information',
      description: 'Get instant visa requirements for Indian travelers - E-visa, Visa on Arrival, or Standard Visa.',
      icon: FileText,
      link: '/visa',
      color: '#4B89AC'
    },
    {
      title: 'Live Forex Rates',
      description: 'Real-time currency exchange rates for INR to help you plan your travel budget.',
      icon: DollarSign,
      link: '/forex',
      color: '#F2A900'
    },
    {
      title: 'Top Travel Apps',
      description: 'Essential apps for transport, food, convenience, and sightseeing in every country.',
      icon: Smartphone,
      link: '/apps',
      color: '#2A9D8F'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #bae6fd 0%, #e0f7fa 10%, #f0f9ff 25%, #f8fafc 40%, #ffffff 60%)' }}>
      {/* Hero Section */}
      <div className="hero-section flex items-center justify-center px-6 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-none text-center" data-testid="hero-title">
              Pass-e-port
            </h1>
            <h2 className="text-3xl md:text-4xl text-foreground mb-6 text-center">
              Your Digital Compass for Global Travel
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed text-center" data-testid="hero-description">
              Everything Indian travelers need to know - from the best seasons to visit, visa requirements,
              live exchange rates, to the most useful apps in every destination.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for a country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white shadow-md"
                  data-testid="country-search-input"
                />
              </div>
              
              {/* Dropdown */}
              {showDropdown && filteredCountries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 w-full bg-white border border-border rounded-2xl shadow-xl max-h-80 overflow-y-auto z-50"
                  data-testid="country-dropdown"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(0,0,0,0.3) transparent'
                  }}
                >
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground px-4 py-2 uppercase tracking-wider">
                      {filteredCountries.length} {filteredCountries.length === 1 ? 'Country' : 'Countries'} Found
                    </p>
                  </div>
                  {filteredCountries.map((country, index) => (
                    <button
                      key={country.country_code}
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-6 py-3 text-left hover:bg-accent/20 transition-all duration-200 flex items-center gap-3 border-b border-border last:border-b-0 group"
                      data-testid={`country-option-${index}`}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">🌍</span>
                      <div>
                        <span className="font-medium text-foreground block">{country.country_name}</span>
                        <span className="text-xs text-muted-foreground">View travel information</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
              
              {showDropdown && searchQuery && filteredCountries.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 w-full bg-white border border-border rounded-2xl shadow-xl p-6 z-50"
                >
                  <p className="text-muted-foreground text-center">No countries found matching "{searchQuery}"</p>
                </motion.div>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/seasons"
                className="bg-primary text-white px-8 py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
                data-testid="explore-button"
              >
                Explore Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/visa"
                className="border-2 border-primary text-primary px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/10 transition-all duration-300 active:scale-95"
                data-testid="visa-info-button"
              >
                Check Visa Info
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-primary mb-4" data-testid="features-title">
            Plan Smarter, Travel Better
          </h2>
          <p className="text-lg text-muted-foreground">All your travel essentials in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={feature.link}
                  className="block bg-white rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                  data-testid={`feature-card-${index}`}
                >
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-medium text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;