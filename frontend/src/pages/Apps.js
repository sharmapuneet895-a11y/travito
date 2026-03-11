import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import BackToTop from '../components/BackToTop';
import { Smartphone, Car, Package, Utensils, MapPin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Apps = () => {
  const [appsData, setAppsData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Smartphone, color: '#2C3E50' },
    { value: 'transport', label: 'Transport', icon: Car, color: '#E25A53' },
    { value: 'convenience', label: 'Convenience', icon: Package, color: '#4B89AC' },
    { value: 'food', label: 'Food', icon: Utensils, color: '#F2A900' },
    { value: 'sightseeing', label: 'Sightseeing', icon: MapPin, color: '#2A9D8F' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsResponse, countriesResponse] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/apps`),
          axios.get(`${BACKEND_URL}/api/countries`)
        ]);
        setAppsData(appsResponse.data.data);
        setCountries(countriesResponse.data.data);
      } catch (error) {
        console.error('Error fetching apps data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredApps = appsData.filter((app) => {
    const matchesCountry = selectedCountry === 'all' || app.country_code === selectedCountry;
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesCountry && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.color : '#2C3E50';
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Smartphone className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="apps-page-title">
                Top Travel Apps by Country
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the most useful apps for transport, convenience, food, and sightseeing in every destination.
            </p>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.value;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`category-badge ${isActive ? 'active' : ''}`}
                    style={{
                      backgroundColor: isActive ? category.color : `${category.color}20`,
                      color: isActive ? 'white' : category.color
                    }}
                    data-testid={`category-${category.value}`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country Filter */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Filter by Country</h3>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full md:w-auto px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="country-select"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country.country_code} value={country.country_code}>
                  {country.country_name}
                </option>
              ))}
            </select>
          </div>

          {/* Apps Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-96" data-testid="loading-apps">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading apps data...</p>
              </div>
            </div>
          ) : filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app, index) => {
                const CategoryIcon = categories.find((c) => c.value === app.category)?.icon || Smartphone;
                return (
                  <motion.div
                    key={`${app.country_code}-${app.app_name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="app-card"
                    data-testid={`app-card-${index}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${getCategoryColor(app.category)}20` }}
                      >
                        <CategoryIcon className="w-6 h-6" style={{ color: getCategoryColor(app.category) }} />
                      </div>
                      <span
                        className="text-xs font-medium px-3 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor: `${getCategoryColor(app.category)}20`,
                          color: getCategoryColor(app.category)
                        }}
                      >
                        {app.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-2">{app.app_name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{app.description}</p>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground">
                        🌍 {app.country_name}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12" data-testid="no-apps-found">
              <Smartphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No apps found for the selected filters.</p>
              <button
                onClick={() => {
                  setSelectedCountry('all');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(1).map((category) => {
              const Icon = category.icon;
              const count = appsData.filter((app) => app.category === category.value).length;
              return (
                <div
                  key={category.value}
                  className="bg-white rounded-xl p-6 text-center shadow-sm"
                  data-testid={`stat-${category.value}`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: category.color }} />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{category.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
      <BackToTop />
    </div>
  );
};

export default Apps;