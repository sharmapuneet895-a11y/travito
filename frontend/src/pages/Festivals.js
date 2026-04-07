import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BackToTop from '../components/BackToTop';
import { PartyPopper, Calendar, MapPin, Filter, Utensils, Leaf, Drumstick, ChevronDown, ChevronUp, Sparkles, Music, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MONTHS = [
  { value: 0, label: 'All Months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const MONTH_COLORS = {
  1: '#3B82F6',  // Blue - January
  2: '#EC4899',  // Pink - February
  3: '#10B981',  // Green - March
  4: '#F59E0B',  // Amber - April
  5: '#8B5CF6',  // Purple - May
  6: '#EF4444',  // Red - June
  7: '#F97316',  // Orange - July
  8: '#06B6D4',  // Cyan - August
  9: '#84CC16',  // Lime - September
  10: '#F59E0B', // Amber - October
  11: '#A855F7', // Violet - November
  12: '#EF4444'  // Red - December
};

const MONTH_GRADIENTS = {
  1: 'from-blue-500 to-blue-600',
  2: 'from-pink-500 to-rose-600',
  3: 'from-emerald-500 to-green-600',
  4: 'from-amber-500 to-orange-600',
  5: 'from-violet-500 to-purple-600',
  6: 'from-red-500 to-rose-600',
  7: 'from-orange-500 to-amber-600',
  8: 'from-cyan-500 to-teal-600',
  9: 'from-lime-500 to-green-600',
  10: 'from-amber-500 to-yellow-600',
  11: 'from-purple-500 to-violet-600',
  12: 'from-red-500 to-pink-600'
};

// Helper to normalize month to number (1-12)
const normalizeMonth = (month) => {
  if (typeof month === 'number' && month >= 1 && month <= 12) {
    return month;
  }
  if (typeof month === 'string') {
    const monthMap = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
      'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    return monthMap[month.toLowerCase()] || 0;
  }
  return 0; // Unknown/Various
};

const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [filteredFestivals, setFilteredFestivals] = useState([]);
  const [dishes, setDishes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [expandedFestival, setExpandedFestival] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [festivalsRes, dishesRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/festivals`),
          axios.get(`${BACKEND_URL}/api/dishes`)
        ]);
        
        setFestivals(festivalsRes.data.data);
        setFilteredFestivals(festivalsRes.data.data);
        
        // Create dishes lookup by country code
        const dishesLookup = {};
        dishesRes.data.data.forEach(d => {
          dishesLookup[d.country_code] = d.dishes;
        });
        setDishes(dishesLookup);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMonth === 0) {
      setFilteredFestivals(festivals);
    } else {
      setFilteredFestivals(festivals.filter(f => normalizeMonth(f.month) === selectedMonth));
    }
  }, [selectedMonth, festivals]);

  // Group festivals by month (normalized)
  const festivalsByMonth = filteredFestivals.reduce((acc, festival) => {
    const monthNum = normalizeMonth(festival.month);
    const monthName = monthNum > 0 ? MONTHS.find(m => m.value === monthNum)?.label : 'Various';
    if (!acc[monthName]) {
      acc[monthName] = [];
    }
    acc[monthName].push(festival);
    return acc;
  }, {});

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: 'linear-gradient(to bottom, #bae6fd 0%, #e0f7fa 10%, #f0f9ff 25%, #f8fafc 40%, #ffffff 60%)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <PartyPopper className="w-14 h-14 text-amber-500" />
                <Sparkles className="w-6 h-6 text-pink-500 absolute -top-1 -right-1" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-rose-500 to-violet-600 bg-clip-text text-transparent" data-testid="festivals-page-title">
                Famous Festivals
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the world's most spectacular festivals and must-try local dishes.
            </p>
          </div>

          {/* Month Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-violet-600" />
                <span className="font-semibold text-gray-700">Filter by Month:</span>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border-2 border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-700 font-medium"
                data-testid="month-filter"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 bg-violet-100 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 inline mr-1 text-violet-500" />
                {filteredFestivals.length} festival{filteredFestivals.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Dish Indicators Legend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
            <div className="flex flex-wrap gap-8 items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  Dish Indicators
                </h3>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md">
                      <Leaf className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-md">
                      <Drumstick className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium text-gray-700">Non-Veg</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
                <Music className="w-4 h-4 text-amber-500" />
                Click on any festival card to see more details
              </div>
            </div>
          </div>

          {/* Festival List by Month */}
          <div className="space-y-10">
            {Object.entries(festivalsByMonth)
              .sort((a, b) => {
                const monthA = MONTHS.findIndex(m => m.label === a[0]);
                const monthB = MONTHS.findIndex(m => m.label === b[0]);
                return monthA - monthB;
              })
              .map(([month, monthFestivals]) => {
                const monthValue = MONTHS.find(m => m.label === month)?.value || 1;
                const gradient = MONTH_GRADIENTS[monthValue] || 'from-violet-500 to-purple-600';
                return (
                <div key={month} data-testid={`festival-month-${month.toLowerCase()}`}>
                  <div className={`flex items-center gap-3 mb-6 bg-gradient-to-r ${gradient} p-4 rounded-2xl shadow-lg`}>
                    <Calendar className="w-8 h-8 text-white" />
                    <h3 className="text-2xl font-bold text-white">{month}</h3>
                    <span className="text-sm bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                      {monthFestivals.length} festival{monthFestivals.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {monthFestivals.map((festival, idx) => {
                      const countryDishes = dishes[festival.country_code] || [];
                      const festivalName = festival.festival_name || festival.name || 'Festival';
                      const festivalKey = `${festival.country_code}-${festivalName}-${idx}`;
                      const isExpanded = expandedFestival === festivalKey;
                      const monthColor = MONTH_COLORS[festival.month] || '#8B5CF6';
                      
                      return (
                        <motion.div
                          key={festivalKey}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-2xl border-2 border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                          data-testid={`festival-card-${festival.country_code}`}
                          onClick={() => setExpandedFestival(isExpanded ? null : festivalKey)}
                        >
                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${monthColor}40, ${monthColor}80)` }}
                              >
                                <PartyPopper 
                                  className="w-7 h-7 text-white drop-shadow-md" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-gray-800 text-lg mb-1">
                                    {festival.festival_name || festival.name || 'Festival'}
                                  </h4>
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-violet-500" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                  <MapPin className="w-4 h-4 text-rose-500" />
                                  <span className="font-medium">{festival.country_name}</span>
                                </div>
                                {festival.date && (
                                  <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: monthColor }}>
                                    <Calendar className="w-4 h-4" />
                                    <span>{festival.date}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-5 pt-0 border-t border-border">
                                  {/* Location & Highlights */}
                                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-3">
                                      <h5 className="font-semibold text-blue-700 text-sm mb-1">Location</h5>
                                      <p className="text-sm text-blue-600">{festival.highlight || festival.country_name}</p>
                                    </div>
                                    <div className="bg-amber-50 rounded-lg p-3">
                                      <h5 className="font-semibold text-amber-700 text-sm mb-1">Highlights</h5>
                                      <p className="text-sm text-amber-600">
                                        {festival.description || 'A vibrant celebration of culture and tradition'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Festival Description */}
                                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                                    <h5 className="font-semibold text-gray-700 text-sm mb-2">About the Festival</h5>
                                    <p className="text-sm text-gray-600">
                                      {festival.description || `${festivalName} is one of the most celebrated festivals in ${festival.country_name}. Join locals and tourists alike in experiencing this unique cultural celebration.`}
                                    </p>
                                  </div>
                                  
                                  {/* Must-Try Local Dishes */}
                                  {countryDishes.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-border">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Utensils className="w-4 h-4 text-accent" />
                                        <span className="text-sm font-semibold text-primary">Must-Try Dishes in {festival.country_name}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {countryDishes.slice(0, 6).map((dish, i) => (
                                          <span 
                                            key={i}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                              dish.veg 
                                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}
                                            title={dish.description}
                                          >
                                            {dish.veg ? (
                                              <Leaf className="w-3 h-3" />
                                            ) : (
                                              <Drumstick className="w-3 h-3" />
                                            )}
                                            {dish.name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
              })}
          </div>

          {filteredFestivals.length === 0 && !loading && (
            <div className="text-center py-12">
              <PartyPopper className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No festivals found for the selected month.</p>
            </div>
          )}
        </motion.div>
      </div>
      <BackToTop />
    </div>
  );
};

export default Festivals;
