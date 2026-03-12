import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import CountryDetailModal from '../components/CountryDetailModal';
import CostEstimator from '../components/CostEstimator';
import BackToTop from '../components/BackToTop';
import { Calendar, Sun, CloudSun, Cloud, Search, MapPin, Heart, Palmtree, Mountain, Building2, Compass, Landmark, Trees, Calculator, Snowflake } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Month abbreviations
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Category definitions with specific colors
const CATEGORIES = [
  { id: 'all', label: 'All Peak Destinations', icon: Compass, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700', activeColor: 'bg-gray-700 text-white' },
  { id: 'beach', label: 'Beach', icon: Palmtree, color: 'cyan', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700', activeColor: 'bg-cyan-500 text-white' },
  { id: 'mountain', label: 'Mountain', icon: Mountain, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', activeColor: 'bg-green-700 text-white' },
  { id: 'snow', label: 'Snowy Experience', icon: Snowflake, color: 'sky', bgColor: 'bg-sky-100', textColor: 'text-sky-700', activeColor: 'bg-sky-500 text-white' },
  { id: 'city', label: 'City', icon: Building2, color: 'slate', bgColor: 'bg-slate-100', textColor: 'text-slate-700', activeColor: 'bg-slate-600 text-white' },
  { id: 'culture', label: 'Culture', icon: Landmark, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', activeColor: 'bg-purple-600 text-white' },
  { id: 'adventure', label: 'Adventure', icon: Compass, color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', activeColor: 'bg-orange-500 text-white' },
  { id: 'nature', label: 'Nature', icon: Trees, color: 'lime', bgColor: 'bg-lime-100', textColor: 'text-lime-700', activeColor: 'bg-lime-500 text-white' },
];

// ISO3 to ISO2 country code mapping for flags
const iso3ToIso2 = {
  'USA': 'us', 'CAN': 'ca', 'MEX': 'mx', 'GBR': 'gb', 'FRA': 'fr', 'DEU': 'de', 'ITA': 'it', 'ESP': 'es',
  'PRT': 'pt', 'NLD': 'nl', 'BEL': 'be', 'CHE': 'ch', 'AUT': 'at', 'GRC': 'gr', 'TUR': 'tr', 'RUS': 'ru',
  'CHN': 'cn', 'JPN': 'jp', 'KOR': 'kr', 'IND': 'in', 'THA': 'th', 'VNM': 'vn', 'IDN': 'id', 'MYS': 'my',
  'SGP': 'sg', 'PHL': 'ph', 'AUS': 'au', 'NZL': 'nz', 'BRA': 'br', 'ARG': 'ar', 'CHL': 'cl', 'PER': 'pe',
  'COL': 'co', 'ZAF': 'za', 'EGY': 'eg', 'MAR': 'ma', 'KEN': 'ke', 'UAE': 'ae', 'ARE': 'ae', 'SAU': 'sa',
  'ISR': 'il', 'JOR': 'jo', 'NPL': 'np', 'LKA': 'lk', 'MDV': 'mv', 'MMR': 'mm', 'KHM': 'kh', 'LAO': 'la',
  'BTN': 'bt', 'BGD': 'bd', 'PAK': 'pk', 'AFG': 'af', 'IRN': 'ir', 'IRQ': 'iq', 'SYR': 'sy', 'LBN': 'lb',
  'CUB': 'cu', 'JAM': 'jm', 'DOM': 'do', 'CRI': 'cr', 'PAN': 'pa', 'GTM': 'gt', 'ECU': 'ec', 'VEN': 've',
  'URY': 'uy', 'PRY': 'py', 'BOL': 'bo', 'HRV': 'hr', 'CZE': 'cz', 'HUN': 'hu', 'POL': 'pl', 'SWE': 'se',
  'NOR': 'no', 'DNK': 'dk', 'FIN': 'fi', 'IRL': 'ie', 'ISL': 'is', 'ROU': 'ro', 'BGR': 'bg', 'UKR': 'ua',
  'BLR': 'by', 'SRB': 'rs', 'MNE': 'me', 'ALB': 'al', 'MKD': 'mk', 'BIH': 'ba', 'SVN': 'si', 'SVK': 'sk',
  'EST': 'ee', 'LVA': 'lv', 'LTU': 'lt', 'GEO': 'ge', 'ARM': 'am', 'AZE': 'az', 'KAZ': 'kz', 'UZB': 'uz',
  'TKM': 'tm', 'TJK': 'tj', 'KGZ': 'kg', 'MNG': 'mn', 'TWN': 'tw', 'HKG': 'hk', 'MAC': 'mo', 'FJI': 'fj',
  'PNG': 'pg', 'TZA': 'tz', 'UGA': 'ug', 'ETH': 'et', 'NGA': 'ng', 'GHA': 'gh', 'SEN': 'sn', 'CIV': 'ci',
  'CMR': 'cm', 'TUN': 'tn', 'DZA': 'dz', 'LBY': 'ly', 'SDN': 'sd', 'OMN': 'om', 'QAT': 'qa', 'BHR': 'bh',
  'KWT': 'kw', 'YEM': 'ye', 'TLS': 'tl', 'BRN': 'bn', 'MUS': 'mu', 'MDG': 'mg', 'ZWE': 'zw', 'ZMB': 'zm',
  'BWA': 'bw', 'NAM': 'na', 'MOZ': 'mz', 'AGO': 'ao', 'GAB': 'ga', 'COG': 'cg', 'COD': 'cd', 'RWA': 'rw',
  'GRL': 'gl', 'LUX': 'lu', 'MLT': 'mt', 'CYP': 'cy', 'MDA': 'md'
};

const getFlag = (countryCode) => {
  const iso2 = iso3ToIso2[countryCode] || countryCode?.toLowerCase().slice(0, 2) || 'un';
  return `https://flagcdn.com/w40/${iso2}.png`;
};

// Top destinations with ratings and highlights for each month
const topDestinationsData = {
  'Jan': [
    { code: 'THA', name: 'Thailand', highlight: 'Perfect beach weather, festivals', rating: 4.9, category: 'beach' },
    { code: 'MDV', name: 'Maldives', highlight: 'Dry season, clear waters', rating: 4.8, category: 'beach' },
    { code: 'LKA', name: 'Sri Lanka', highlight: 'Cultural festivals, wildlife', rating: 4.7, category: 'culture' },
    { code: 'UAE', name: 'UAE', highlight: 'Dubai Shopping Festival', rating: 4.6, category: 'city' },
    { code: 'AUS', name: 'Australia', highlight: 'Summer, beaches', rating: 4.5, category: 'adventure' },
  ],
  'Feb': [
    { code: 'BRA', name: 'Brazil', highlight: 'Rio Carnival', rating: 4.9, category: 'culture' },
    { code: 'THA', name: 'Thailand', highlight: 'Ideal weather continues', rating: 4.8, category: 'beach' },
    { code: 'ITA', name: 'Italy', highlight: 'Venice Carnival', rating: 4.7, category: 'culture' },
    { code: 'VNM', name: 'Vietnam', highlight: 'Tet celebrations', rating: 4.6, category: 'culture' },
    { code: 'NZL', name: 'New Zealand', highlight: 'Summer hiking', rating: 4.5, category: 'adventure' },
  ],
  'Mar': [
    { code: 'JPN', name: 'Japan', highlight: 'Cherry blossom season', rating: 4.9, category: 'nature' },
    { code: 'IND', name: 'India', highlight: 'Holi festival', rating: 4.8, category: 'culture' },
    { code: 'EGY', name: 'Egypt', highlight: 'Perfect weather', rating: 4.7, category: 'culture' },
    { code: 'MAR', name: 'Morocco', highlight: 'Spring bloom', rating: 4.6, category: 'adventure' },
    { code: 'PER', name: 'Peru', highlight: 'Machu Picchu ideal', rating: 4.5, category: 'adventure' },
  ],
  'Apr': [
    { code: 'JPN', name: 'Japan', highlight: 'Peak cherry blossoms', rating: 4.9, category: 'nature' },
    { code: 'NLD', name: 'Netherlands', highlight: 'Tulip season', rating: 4.8, category: 'nature' },
    { code: 'THA', name: 'Thailand', highlight: 'Songkran festival', rating: 4.7, category: 'culture' },
    { code: 'GRC', name: 'Greece', highlight: 'Easter celebrations', rating: 4.6, category: 'culture' },
    { code: 'TUR', name: 'Turkey', highlight: 'Spring weather', rating: 4.5, category: 'culture' },
  ],
  'May': [
    { code: 'FRA', name: 'France', highlight: 'Cannes Film Festival', rating: 4.9, category: 'culture' },
    { code: 'ITA', name: 'Italy', highlight: 'Perfect weather', rating: 4.8, category: 'culture' },
    { code: 'ESP', name: 'Spain', highlight: 'Spring festivals', rating: 4.7, category: 'culture' },
    { code: 'PRT', name: 'Portugal', highlight: 'Beach season starts', rating: 4.6, category: 'beach' },
    { code: 'KOR', name: 'South Korea', highlight: 'Buddha\'s birthday', rating: 4.5, category: 'culture' },
  ],
  'Jun': [
    { code: 'GRC', name: 'Greece', highlight: 'Island hopping', rating: 4.9, category: 'beach' },
    { code: 'HRV', name: 'Croatia', highlight: 'Adriatic beaches', rating: 4.8, category: 'beach' },
    { code: 'ISL', name: 'Iceland', highlight: 'Midnight sun', rating: 4.7, category: 'nature' },
    { code: 'NOR', name: 'Norway', highlight: 'Fjords, midnight sun', rating: 4.6, category: 'nature' },
    { code: 'KEN', name: 'Kenya', highlight: 'Great Migration starts', rating: 4.5, category: 'adventure' },
  ],
  'Jul': [
    { code: 'KEN', name: 'Kenya', highlight: 'Great Migration peak', rating: 4.9, category: 'adventure' },
    { code: 'TZA', name: 'Tanzania', highlight: 'Serengeti migration', rating: 4.8, category: 'adventure' },
    { code: 'FRA', name: 'France', highlight: 'Lavender fields', rating: 4.7, category: 'nature' },
    { code: 'CHE', name: 'Switzerland', highlight: 'Alpine hiking', rating: 4.6, category: 'mountain' },
    { code: 'CAN', name: 'Canada', highlight: 'Summer festivals', rating: 4.5, category: 'nature' },
  ],
  'Aug': [
    { code: 'ESP', name: 'Spain', highlight: 'La Tomatina', rating: 4.9, category: 'culture' },
    { code: 'IDN', name: 'Indonesia', highlight: 'Bali dry season', rating: 4.8, category: 'beach' },
    { code: 'SWE', name: 'Sweden', highlight: 'Crayfish parties', rating: 4.7, category: 'culture' },
    { code: 'MNG', name: 'Mongolia', highlight: 'Naadam festival', rating: 4.6, category: 'adventure' },
    { code: 'AUT', name: 'Austria', highlight: 'Salzburg Festival', rating: 4.5, category: 'culture' },
  ],
  'Sep': [
    { code: 'DEU', name: 'Germany', highlight: 'Oktoberfest starts', rating: 4.9, category: 'culture' },
    { code: 'FRA', name: 'France', highlight: 'Wine harvest', rating: 4.8, category: 'culture' },
    { code: 'CHN', name: 'China', highlight: 'Mid-Autumn Festival', rating: 4.7, category: 'culture' },
    { code: 'TUR', name: 'Turkey', highlight: 'Perfect weather', rating: 4.6, category: 'culture' },
    { code: 'PRT', name: 'Portugal', highlight: 'Wine season', rating: 4.5, category: 'culture' },
  ],
  'Oct': [
    { code: 'JPN', name: 'Japan', highlight: 'Autumn colors', rating: 4.9, category: 'nature' },
    { code: 'DEU', name: 'Germany', highlight: 'Oktoberfest', rating: 4.8, category: 'culture' },
    { code: 'NPL', name: 'Nepal', highlight: 'Dashain, trekking', rating: 4.7, category: 'adventure' },
    { code: 'MEX', name: 'Mexico', highlight: 'Day of the Dead', rating: 4.6, category: 'culture' },
    { code: 'USA', name: 'United States', highlight: 'Fall foliage', rating: 4.5, category: 'nature' },
  ],
  'Nov': [
    { code: 'IND', name: 'India', highlight: 'Diwali celebrations', rating: 4.9, category: 'culture' },
    { code: 'THA', name: 'Thailand', highlight: 'Loi Krathong', rating: 4.8, category: 'culture' },
    { code: 'NPL', name: 'Nepal', highlight: 'Tihar festival', rating: 4.7, category: 'culture' },
    { code: 'UAE', name: 'UAE', highlight: 'Pleasant weather', rating: 4.6, category: 'city' },
    { code: 'VNM', name: 'Vietnam', highlight: 'Cool season starts', rating: 4.5, category: 'culture' },
  ],
  'Dec': [
    { code: 'DEU', name: 'Germany', highlight: 'Christmas markets', rating: 4.9, category: 'culture' },
    { code: 'AUT', name: 'Austria', highlight: 'Winter wonderland', rating: 4.8, category: 'culture' },
    { code: 'MDV', name: 'Maldives', highlight: 'Peak season', rating: 4.7, category: 'beach' },
    { code: 'AUS', name: 'Australia', highlight: 'Summer, NYE', rating: 4.6, category: 'city' },
    { code: 'ZAF', name: 'South Africa', highlight: 'Safari season', rating: 4.5, category: 'adventure' },
  ],
};

const Seasons = () => {
  const [seasonsData, setSeasonsData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCostEstimator, setShowCostEstimator] = useState(false);
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

  // Filter countries based on search and category - only show PEAK season countries for categories
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    let filtered = processedData.filter(c => 
      c.country_name?.toLowerCase().includes(query)
    );
    return filtered.slice(0, 8);
  }, [searchQuery, processedData]);

  // Filter data by category for display - ONLY PEAK SEASON countries for category tabs
  const categoryFilteredData = useMemo(() => {
    // Get only peak season countries first
    const peakOnly = processedData.filter(c => c.current_season === 'peak');
    
    if (selectedCategory === 'all') return peakOnly;
    return peakOnly.filter(c => c.categories?.includes(selectedCategory));
  }, [processedData, selectedCategory]);

  // Count for each category (only peak season)
  const categoryCounts = useMemo(() => {
    const peakOnly = processedData.filter(c => c.current_season === 'peak');
    const counts = {};
    CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = peakOnly.length;
      } else {
        counts[cat.id] = peakOnly.filter(c => c.categories?.includes(cat.id)).length;
      }
    });
    return counts;
  }, [processedData]);

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

  // For the all destinations view (without category filter)
  const peakCountries = processedData.filter(c => c.current_season === 'peak');
  const shoulderCountries = processedData.filter(c => c.current_season === 'shoulder');
  const offCountries = processedData.filter(c => c.current_season === 'off');

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

          {/* Current Selection Indicator + Cost Estimator Button */}
          <div className="bg-accent/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-lg font-semibold text-primary">
              📅 Showing travel conditions for: <span className="text-accent">{selectedMonthName} {selectedYear}</span>
              {selectedCategory !== 'all' && (
                <span className="ml-2 text-muted-foreground">
                  • Filtered by: <span className="text-accent capitalize">{selectedCategory}</span>
                </span>
              )}
            </span>
            <button
              onClick={() => setShowCostEstimator(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:opacity-90 transition-all shadow-lg"
              data-testid="open-cost-estimator-btn"
            >
              <Calculator className="w-5 h-5" />
              Trip Cost Estimator
            </button>
          </div>

          {/* Top 5 Destinations This Month */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200" data-testid="top-destinations-section">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-primary">Top 5 Destinations for {selectedMonthName}</h3>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">RECOMMENDED</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topDestinationsData[selectedMonthAbbrev]?.map((dest, idx) => {
                const categoryData = CATEGORIES.find(c => c.id === dest.category);
                return (
                  <motion.div
                    key={dest.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => {
                      const country = processedData.find(c => c.country_code === dest.code);
                      if (country) setSelectedCountry(country);
                    }}
                    className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border border-amber-100 group"
                    data-testid={`top-dest-${dest.code}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-bold text-amber-500">#{idx + 1}</span>
                      <img
                        src={getFlag(dest.code)}
                        alt={dest.name}
                        className="w-8 h-6 object-cover rounded shadow-sm"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <h4 className="font-bold text-primary group-hover:text-amber-600 transition-colors">{dest.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{dest.highlight}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-sm">★</span>
                        <span className="text-sm font-semibold text-amber-700">{dest.rating}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryData?.bgColor || 'bg-gray-100'} ${categoryData?.textColor || 'text-gray-600'}`}>
                        {dest.category}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Category Filter Tabs - Shows only PEAK SEASON destinations */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-border">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-red-500" />
              Best Time to Visit in {selectedMonthName} - Filter by Type:
            </h3>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      // Scroll to destinations section after a short delay
                      setTimeout(() => {
                        const destinationsSection = document.getElementById('destinations-section');
                        if (destinationsSection) {
                          destinationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    disabled={count === 0 && cat.id !== 'all'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap border-2 ${
                      isActive 
                        ? cat.activeColor + ' border-transparent shadow-md' 
                        : count === 0 && cat.id !== 'all'
                        ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed'
                        : cat.bgColor + ' ' + cat.textColor + ' border-transparent hover:shadow-sm'
                    }`}
                    data-testid={`category-tab-${cat.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-white/50'}`}>
                      {count}
                    </span>
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
          <div className="mt-12 space-y-8" id="destinations-section">
            {/* Category Filtered Peak Destinations */}
            {selectedCategory !== 'all' && categoryFilteredData.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-red-500" />
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label} Destinations - Best in {selectedMonthName} ({categoryFilteredData.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryFilteredData.map((country, idx) => (
                    <div
                      key={`${country.country_code}-${idx}`}
                      className="bg-red-50 rounded-lg p-4 border border-red-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`category-country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
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
                          <p className="text-sm text-green-700 font-medium">✓ Best in {selectedMonthAbbrev}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          {country.categories && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {country.categories.slice(0, 3).map(cat => (
                                <span key={cat} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 capitalize">{cat}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Peak Destinations (when no category filter) */}
            {selectedCategory === 'all' && peakCountries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-red-500" />
                  Best Time to Visit in {selectedMonthName} ({peakCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {peakCountries.map((country, idx) => (
                    <div
                      key={`${country.country_code}-${idx}`}
                      className="bg-red-50 rounded-lg p-4 border border-red-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
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
                  {shoulderCountries.map((country, idx) => (
                    <div
                      key={`shoulder-${country.country_code}-${idx}`}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
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
                  {offCountries.slice(0, 12).map((country, idx) => (
                    <div
                      key={`off-${country.country_code}-${idx}`}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
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

      {/* Cost Estimator Modal */}
      <CostEstimator 
        isOpen={showCostEstimator} 
        onClose={() => setShowCostEstimator(false)} 
      />

      <BackToTop />
    </div>
  );
};

export default Seasons;
