import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import { Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Seasons = () => {
  const [seasonsData, setSeasonsData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const legends = [
    { color: '#E25A53', label: 'Peak Season', description: 'High tourist activity' },
    { color: '#4B89AC', label: 'Shoulder Season', description: 'Moderate tourist activity' },
    { color: '#F2A900', label: 'Off Season', description: 'Low tourist activity' },
    { color: '#D6D6D6', label: 'No Data', description: 'Information not available' }
  ];

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
              Discover the perfect time to visit your dream destination. Our color-coded map shows peak, shoulder, and off seasons for countries around the world.
            </p>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Season Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {legends.map((legend) => (
                <div key={legend.label} className="legend-item" data-testid={`legend-${legend.label.toLowerCase().replace(' ', '-')}`}>
                  <div
                    className="legend-color"
                    style={{ backgroundColor: legend.color }}
                  />
                  <div>
                    <div className="font-medium text-sm text-foreground">{legend.label}</div>
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
              <WorldMap data={seasonsData} mode="seasons" />
            )}
          </div>

          {/* Country List */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-primary mb-6">Available Destinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seasonsData.map((country) => (
                <div
                  key={country.country_code}
                  className="bg-white rounded-lg p-4 border border-border hover:shadow-md transition-all"
                  data-testid={`country-card-${country.country_code}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor:
                          country.season_type === 'peak'
                            ? '#E25A53'
                            : country.season_type === 'shoulder'
                            ? '#4B89AC'
                            : '#F2A900'
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {country.season_type} Season
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Best: {country.best_months.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Seasons;