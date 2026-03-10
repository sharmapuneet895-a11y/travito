import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import { Calendar, Sun, CloudSun, Cloud } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Month abbreviations
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Seasons = () => {
  const [seasonsData, setSeasonsData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth(); // 0-11
  const currentMonthName = MONTH_ABBREV[currentMonth];

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/seasons`);
        const rawData = response.data.data;
        setSeasonsData(rawData);
        
        // Process data to determine current month's season status
        const processed = rawData.map(country => {
          const bestMonths = country.best_months || [];
          const isCurrentMonthBest = bestMonths.includes(currentMonthName);
          
          // Determine season status for current month
          let currentSeasonType;
          if (isCurrentMonthBest) {
            currentSeasonType = 'peak'; // Current month is one of the best months
          } else {
            // Check if we're within 1-2 months of best season (shoulder)
            const bestMonthIndices = bestMonths.map(m => MONTH_ABBREV.indexOf(m));
            const isNearBest = bestMonthIndices.some(idx => {
              const diff = Math.abs(currentMonth - idx);
              return diff <= 2 || diff >= 10; // Within 2 months (accounting for year wrap)
            });
            currentSeasonType = isNearBest ? 'shoulder' : 'off';
          }
          
          return {
            ...country,
            current_season: currentSeasonType,
            is_best_now: isCurrentMonthBest
          };
        });
        
        setProcessedData(processed);
      } catch (error) {
        console.error('Error fetching seasons data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [currentMonth, currentMonthName]);

  const legends = [
    { color: '#E25A53', label: 'Best Time Now', description: 'Ideal to visit this month', icon: Sun },
    { color: '#4B89AC', label: 'Good Time', description: 'Near peak season', icon: CloudSun },
    { color: '#F2A900', label: 'Off Season', description: 'Not ideal this month', icon: Cloud },
    { color: '#D6D6D6', label: 'No Data', description: 'Information not available', icon: null }
  ];

  // Separate countries by current season status
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
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="seasons-page-title">
                Best Seasons to Travel
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See which destinations are ideal to visit <span className="font-semibold text-primary">right now in {currentMonthName}</span>. Colors show travel conditions for the current month.
            </p>
          </div>

          {/* Current Month Indicator */}
          <div className="bg-accent/10 rounded-xl p-4 mb-6 text-center">
            <span className="text-lg font-semibold text-primary">
              📅 Showing travel conditions for: <span className="text-accent">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </span>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">What the colors mean for {currentMonthName}</h3>
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

          {/* Map - Pass processed data with current_season */}
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
                  season_type: c.current_season // Override with current month's status
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
                  Best Time to Visit Now ({peakCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {peakCountries.map((country) => (
                    <div
                      key={country.country_code}
                      className="bg-red-50 rounded-lg p-4 border border-red-200 hover:shadow-md transition-all"
                      data-testid={`country-card-${country.country_code}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                        <div>
                          <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                          <p className="text-sm text-green-700 font-medium">✓ Ideal in {currentMonthName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
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
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all"
                      data-testid={`country-card-${country.country_code}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-blue-500" />
                        <div>
                          <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                          <p className="text-sm text-blue-700 font-medium">○ Near peak season</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
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
                      className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all"
                      data-testid={`country-card-${country.country_code}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                        <div>
                          <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                          <p className="text-sm text-amber-700 font-medium">△ Not ideal now</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
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
    </div>
  );
};

export default Seasons;
