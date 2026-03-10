import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import { Cloud } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/weather`);
        setWeatherData(response.data.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const legends = [
    { color: '#E25A53', label: 'Hot Weather', description: 'Tropical & hot climate' },
    { color: '#FFFFFF', label: 'Snow/Cold', description: 'Cold with snow', border: true },
    { color: '#F2A900', label: 'Sandy/Desert', description: 'Desert & dusty' },
    { color: '#4B89AC', label: 'Rainy', description: 'Monsoon & rainy climate' },
    { color: '#E8E8E6', label: 'No Data', description: 'Information not available' }
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
              <Cloud className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="weather-page-title">
                Weather & Climate Guide
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Understand the typical weather patterns of countries around the world. Plan your wardrobe and activities accordingly.
            </p>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Weather Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {legends.map((legend) => (
                <div key={legend.label} className="legend-item" data-testid={`legend-${legend.label.toLowerCase().replace(' ', '-')}`}>
                  <div
                    className="legend-color"
                    style={{ 
                      backgroundColor: legend.color,
                      border: legend.border ? '2px solid #D0D0D0' : 'none'
                    }}
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
          <div className="map-container" data-testid="weather-map-container">
            {loading ? (
              <div className="flex items-center justify-center h-96" data-testid="loading-weather">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading weather data...</p>
                </div>
              </div>
            ) : (
              <WorldMap data={weatherData} mode="weather" />
            )}
          </div>

          {/* Country List */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-primary mb-6">Weather by Country</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {weatherData.map((country) => (
                <div
                  key={country.country_code}
                  className="bg-white rounded-lg p-4 border border-border hover:shadow-md transition-all"
                  data-testid={`weather-country-card-${country.country_code}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor:
                          country.weather_type === 'hot'
                            ? '#E25A53'
                            : country.weather_type === 'snow'
                            ? '#FFFFFF'
                            : country.weather_type === 'sandy'
                            ? '#F2A900'
                            : '#4B89AC',
                        border: country.weather_type === 'snow' ? '2px solid #D0D0D0' : 'none'
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize mb-1">
                        {country.weather_type === 'sandy' ? 'Sandy/Desert' : country.weather_type} • {country.avg_temp}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {country.description}
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

export default Weather;