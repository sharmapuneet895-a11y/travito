import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import BackToTop from '../components/BackToTop';
import { PartyPopper, Calendar, MapPin, Filter, Utensils, Leaf, Drumstick } from 'lucide-react';

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
  1: '#3B82F6',
  2: '#EC4899',
  3: '#10B981',
  4: '#F59E0B',
  5: '#8B5CF6',
  6: '#EF4444',
  7: '#F97316',
  8: '#06B6D4',
  9: '#84CC16',
  10: '#F59E0B',
  11: '#A855F7',
  12: '#EF4444'
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
  const [mapData, setMapData] = useState([]);

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
        
        // Create map data
        const countryFestivals = {};
        festivalsRes.data.data.forEach(f => {
          if (!countryFestivals[f.country_code]) {
            countryFestivals[f.country_code] = {
              country_code: f.country_code,
              country_name: f.country_name,
              festival_count: 0,
              festivals: []
            };
          }
          countryFestivals[f.country_code].festival_count++;
          countryFestivals[f.country_code].festivals.push(f.festival_name);
        });
        setMapData(Object.values(countryFestivals));
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
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <PartyPopper className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="festivals-page-title">
                Famous Festivals
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the world's most spectacular festivals and must-try local dishes.
            </p>
          </div>

          {/* Month Filter */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Filter by Month:</span>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="month-filter"
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">
                Showing {filteredFestivals.length} festival{filteredFestivals.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Map */}
          <div className="map-container mb-12" data-testid="festivals-map-container">
            {loading ? (
              <div className="flex items-center justify-center h-96" data-testid="loading-festivals">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading festivals...</p>
                </div>
              </div>
            ) : (
              <WorldMap 
                data={mapData.map(d => ({
                  ...d,
                  festival_type: d.festival_count > 2 ? 'many' : d.festival_count > 1 ? 'some' : 'few'
                }))} 
                mode="festivals" 
              />
            )}
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-wrap gap-8 items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Festival Destinations</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#E25A53' }} />
                    <span className="text-sm">Many (3+)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#F2A900' }} />
                    <span className="text-sm">Some (2)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#4B89AC' }} />
                    <span className="text-sm">Few (1)</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Dish Indicators</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                      <Leaf className="w-4 h-4" />
                    </span>
                    <span className="text-sm">Vegetarian</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                      <Drumstick className="w-4 h-4" />
                    </span>
                    <span className="text-sm">Non-Veg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Festival List by Month */}
          <div className="space-y-8">
            {Object.entries(festivalsByMonth)
              .sort((a, b) => {
                const monthA = MONTHS.findIndex(m => m.label === a[0]);
                const monthB = MONTHS.findIndex(m => m.label === b[0]);
                return monthA - monthB;
              })
              .map(([month, monthFestivals]) => (
                <div key={month} data-testid={`festival-month-${month.toLowerCase()}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar 
                      className="w-6 h-6" 
                      style={{ color: MONTH_COLORS[MONTHS.find(m => m.label === month)?.value] || '#4B89AC' }}
                    />
                    <h3 className="text-2xl font-semibold text-primary">{month}</h3>
                    <span className="text-sm text-muted-foreground bg-accent/20 px-2 py-1 rounded-full">
                      {monthFestivals.length} festival{monthFestivals.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {monthFestivals.map((festival, idx) => {
                      const countryDishes = dishes[festival.country_code] || [];
                      
                      return (
                        <motion.div
                          key={`${festival.country_code}-${festival.festival_name}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-xl p-5 border border-border hover:shadow-lg transition-all"
                          data-testid={`festival-card-${festival.country_code}`}
                        >
                          <div className="flex items-start gap-4">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${MONTH_COLORS[festival.month]}20` }}
                            >
                              <PartyPopper 
                                className="w-6 h-6" 
                                style={{ color: MONTH_COLORS[festival.month] }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-lg mb-1">
                                {festival.festival_name}
                              </h4>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4" />
                                <span>{festival.country_name} • {festival.highlight}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {festival.description}
                              </p>
                              
                              {/* Must-Try Local Dishes */}
                              {countryDishes.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Utensils className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-semibold text-primary">Must-Try Dishes</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {countryDishes.slice(0, 4).map((dish, i) => (
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
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
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
