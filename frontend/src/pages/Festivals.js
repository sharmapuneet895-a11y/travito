import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import { PartyPopper, Calendar, MapPin, Filter } from 'lucide-react';

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
  1: '#3B82F6',   // January - Blue (Winter)
  2: '#EC4899',   // February - Pink (Valentine)
  3: '#10B981',   // March - Green (Spring)
  4: '#F59E0B',   // April - Yellow (Spring)
  5: '#8B5CF6',   // May - Purple (Flowers)
  6: '#EF4444',   // June - Red (Summer)
  7: '#F97316',   // July - Orange (Summer)
  8: '#06B6D4',   // August - Cyan (Late Summer)
  9: '#84CC16',   // September - Lime (Fall)
  10: '#F59E0B',  // October - Amber (Halloween)
  11: '#A855F7',  // November - Purple (Harvest)
  12: '#EF4444'   // December - Red (Christmas)
};

const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [filteredFestivals, setFilteredFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/festivals`);
        setFestivals(response.data.data);
        setFilteredFestivals(response.data.data);
        
        // Create map data - aggregate by country with festival count
        const countryFestivals = {};
        response.data.data.forEach(f => {
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
        console.error('Error fetching festivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, []);

  useEffect(() => {
    if (selectedMonth === 0) {
      setFilteredFestivals(festivals);
    } else {
      setFilteredFestivals(festivals.filter(f => f.month === selectedMonth));
    }
  }, [selectedMonth, festivals]);

  // Group festivals by month for display
  const festivalsByMonth = filteredFestivals.reduce((acc, festival) => {
    const monthName = MONTHS.find(m => m.value === festival.month)?.label || 'Unknown';
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
              Discover the world's most spectacular festivals and cultural celebrations. Plan your trip around these unforgettable experiences.
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

          {/* Legend for map */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Festival Destinations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#E25A53' }} />
                <div>
                  <div className="font-medium text-sm">Many Festivals</div>
                  <div className="text-xs text-muted-foreground">3+ festivals</div>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#F2A900' }} />
                <div>
                  <div className="font-medium text-sm">Some Festivals</div>
                  <div className="text-xs text-muted-foreground">2 festivals</div>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#4B89AC' }} />
                <div>
                  <div className="font-medium text-sm">Few Festivals</div>
                  <div className="text-xs text-muted-foreground">1 festival</div>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#E8E8E6' }} />
                <div>
                  <div className="font-medium text-sm">No Data</div>
                  <div className="text-xs text-muted-foreground">Not yet covered</div>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthFestivals.map((festival, idx) => (
                      <motion.div
                        key={`${festival.country_code}-${festival.festival_name}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-xl p-5 border border-border hover:shadow-lg transition-all group"
                        data-testid={`festival-card-${festival.country_code}`}
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: `${MONTH_COLORS[festival.month]}20` }}
                          >
                            <PartyPopper 
                              className="w-6 h-6" 
                              style={{ color: MONTH_COLORS[festival.month] }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-lg mb-1 truncate">
                              {festival.festival_name}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{festival.country_name} • {festival.highlight}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {festival.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
    </div>
  );
};

export default Festivals;
