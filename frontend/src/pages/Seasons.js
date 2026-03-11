import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import CountryDetailModal from '../components/CountryDetailModal';
import BackToTop from '../components/BackToTop';
import { Calendar, Sun, CloudSun, Cloud, Search, MapPin, Heart, Palmtree, Mountain, Building2, Compass, Landmark, Trees } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Month abbreviations
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Category definitions
const CATEGORIES = [
  { id: 'all', label: 'All Destinations', icon: Compass, color: 'gray' },
  { id: 'beach', label: 'Beach', icon: Palmtree, color: 'cyan' },
  { id: 'mountain', label: 'Mountain', icon: Mountain, color: 'emerald' },
  { id: 'city', label: 'City', icon: Building2, color: 'violet' },
  { id: 'culture', label: 'Culture', icon: Landmark, color: 'amber' },
  { id: 'adventure', label: 'Adventure', icon: Compass, color: 'orange' },
  { id: 'nature', label: 'Nature', icon: Trees, color: 'green' },
];

const Seasons = () => {
  const [seasonsData, setSeasonsData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToWishlist, isInWishlist } = useWishlist();
  
  // Date state - default to current month
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const selectedMonthAbbrev = MONTH_ABBREV[selectedMonth];
  const selectedMonthName = MONTH_NAMES[selectedMonth];

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/seasons`);
        setSeasonsData(response.data.data);
      } catch (error) {
        console.error('Error fetching seasons data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  // Process data when seasons data or selected month changes
  useEffect(() => {
    if (seasonsData.length === 0) return;
    
    const processed = seasonsData.map(country => {
      const bestMonths = country.best_months || [];
      const isSelectedMonthBest = bestMonths.includes(selectedMonthAbbrev);
      
      // Determine season status for selected month
      let currentSeasonType;
      if (isSelectedMonthBest) {
        currentSeasonType = 'peak';
      } else {
        const bestMonthIndices = bestMonths.map(m => MONTH_ABBREV.indexOf(m));
        const isNearBest = bestMonthIndices.some(idx => {
          const diff = Math.abs(selectedMonth - idx);
          return diff <= 2 || diff >= 10;
        });
        currentSeasonType = isNearBest ? 'shoulder' : 'off';
      }
      
      return {
        ...country,
        current_season: currentSeasonType,
        is_best_now: isSelectedMonthBest
      };
    });
    
    setProcessedData(processed);
  }, [seasonsData, selectedMonth, selectedMonthAbbrev]);

  // Filter countries based on search and category
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    let filtered = processedData.filter(c => 
      c.country_name?.toLowerCase().includes(query)
    );
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.categories?.includes(selectedCategory));
    }
    return filtered.slice(0, 8);
  }, [searchQuery, processedData, selectedCategory]);

  // Filter data by category for display
  const categoryFilteredData = useMemo(() => {
    if (selectedCategory === 'all') return processedData;
    return processedData.filter(c => c.categories?.includes(selectedCategory));
  }, [processedData, selectedCategory]);

  const handleCountrySelect = (country) => {
    setSearchQuery(country.country_name);
    setShowDropdown(false);
    // Open the country detail modal
    setSelectedCountry(country);
  };

  const handleCountryCardClick = (country) => {
    setSelectedCountry(country);
  };

  const legends = [
    { color: '#E25A53', label: 'Best Time', description: `Ideal to visit in ${selectedMonthName}`, icon: Sun },
    { color: '#4B89AC', label: 'Good Time', description: 'Near peak season', icon: CloudSun },
    { color: '#F2A900', label: 'Off Season', description: `Not ideal in ${selectedMonthName}`, icon: Cloud },
    { color: '#D6D6D6', label: 'No Data', description: 'Information not available', icon: null }
  ];

  // Separate countries by current season status (using category filtered data)
  const peakCountries = categoryFilteredData.filter(c => c.current_season === 'peak');
  const shoulderCountries = categoryFilteredData.filter(c => c.current_season === 'shoulder');
  const offCountries = categoryFilteredData.filter(c => c.current_season === 'off');

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="seasons-page-title">
                Best Seasons to Travel
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find the perfect time to visit your dream destination
            </p>
          </div>

          {/* Search and Date Filter Section */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Travelling To Search */}
              <div className="relative">
                <label className="block text-sm font-semibold text-primary mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Travelling To
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search country..."
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    data-testid="country-search"
                  />
                </div>
                
                {/* Search Dropdown */}
                {showDropdown && filteredCountries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-20 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto"
                  >
                    {filteredCountries.map((country) => (
                      <button
                        key={country.country_code}
                        onClick={() => handleCountrySelect(country)}
                        className="w-full px-4 py-3 text-left hover:bg-accent/20 flex items-center justify-between transition-all"
                      >
                        <span className="font-medium text-foreground">{country.country_name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          country.current_season === 'peak' ? 'bg-red-100 text-red-700' :
                          country.current_season === 'shoulder' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {country.current_season === 'peak' ? 'Best Time' :
                           country.current_season === 'shoulder' ? 'Good' : 'Off Season'}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Travel Date
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="month-selector"
                  >
                    {MONTH_NAMES.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-28 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="year-selector"
                  >
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Current Selection Indicator */}
          <div className="bg-accent/10 rounded-xl p-4 mb-6 text-center">
            <span className="text-lg font-semibold text-primary">
              📅 Showing travel conditions for: <span className="text-accent">{selectedMonthName} {selectedYear}</span>
              {selectedCategory !== 'all' && (
                <span className="ml-2 text-muted-foreground">
                  • Filtered by: <span className="text-accent capitalize">{selectedCategory}</span>
                </span>
              )}
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-border overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                      isActive 
                        ? `bg-${cat.color}-100 text-${cat.color}-700 border-2 border-${cat.color}-300` 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    style={isActive ? {
                      backgroundColor: cat.color === 'gray' ? '#f3f4f6' : undefined,
                      borderColor: cat.color === 'gray' ? '#9ca3af' : undefined,
                    } : {}}
                    data-testid={`category-tab-${cat.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                    {cat.id !== 'all' && (
                      <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded-full">
                        {categoryFilteredData.filter(c => 
                          cat.id === 'all' ? true : c.categories?.includes(cat.id)
                        ).length || processedData.filter(c => c.categories?.includes(cat.id)).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">What the colors mean for {selectedMonthName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {legends.map((legend) => (
                <div key={legend.label} className="legend-item" data-testid={`legend-${legend.label.toLowerCase().replace(/ /g, '-')}`}>
                  <div
                    className="legend-color"
                    style={{ backgroundColor: legend.color }}
                  />
                  <div>
                    <div className="font-medium text-sm text-foreground flex items-center gap-1">
                      {legend.icon && <legend.icon className="w-4 h-4" />}
                      {legend.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{legend.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="map-container" data-testid="seasons-map-container">
            {loading ? (
              <div className="flex items-center justify-center h-96" data-testid="loading-seasons">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading season data...</p>
                </div>
              </div>
            ) : (
              <WorldMap 
                data={processedData.map(c => ({
                  ...c,
                  season_type: c.current_season
                }))} 
                mode="seasons" 
              />
            )}
          </div>

          {/* Country Lists by Season */}
          <div className="mt-12 space-y-8">
            {/* Best Time Now */}
            {peakCountries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-red-500" />
                  Best Time to Visit in {selectedMonthName} ({peakCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {peakCountries.map((country) => (
                    <div
                      key={country.country_code}
                      className="bg-red-50 rounded-lg p-4 border border-red-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(country);
                              }}
                              className={`p-1 rounded-full transition-all ${
                                isInWishlist(country.country_code) 
                                  ? 'text-red-500' 
                                  : 'text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(country.country_code) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-green-700 font-medium">✓ Ideal in {selectedMonthAbbrev}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Good Time (Shoulder) */}
            {shoulderCountries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <CloudSun className="w-6 h-6 text-blue-500" />
                  Good Time to Visit ({shoulderCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shoulderCountries.map((country) => (
                    <div
                      key={country.country_code}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(country);
                              }}
                              className={`p-1 rounded-full transition-all ${
                                isInWishlist(country.country_code) 
                                  ? 'text-red-500' 
                                  : 'text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(country.country_code) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-blue-700 font-medium">○ Near peak season</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Off Season */}
            {offCountries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-amber-500" />
                  Off Season ({offCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {offCountries.slice(0, 12).map((country) => (
                    <div
                      key={country.country_code}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(country);
                              }}
                              className={`p-1 rounded-full transition-all ${
                                isInWishlist(country.country_code) 
                                  ? 'text-red-500' 
                                  : 'text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(country.country_code) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-amber-700 font-medium">△ Not ideal in {selectedMonthAbbrev}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {offCountries.length > 12 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        +{offCountries.length - 12} more destinations
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <CountryDetailModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      <BackToTop />
    </div>
  );
};

export default Seasons;
