import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import BackToTop from '../components/BackToTop';
import { Shield, Phone, AlertTriangle, CheckCircle, Info, Search, MapPinOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Safety = () => {
  const [safetyData, setSafetyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    const fetchSafety = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/safety`);
        setSafetyData(response.data.data);
      } catch (error) {
        console.error('Error fetching safety data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSafety();
  }, []);

  const filteredCountries = safetyData.filter(c => 
    c.country_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSafetyColor = (level) => {
    switch (level) {
      case 'very_safe': return 'bg-green-500';
      case 'safe': return 'bg-emerald-400';
      case 'moderate': return 'bg-yellow-500';
      case 'caution': return 'bg-orange-500';
      case 'high_risk': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSafetyLabel = (level) => {
    switch (level) {
      case 'very_safe': return 'Very Safe';
      case 'safe': return 'Safe';
      case 'moderate': return 'Exercise Normal Caution';
      case 'caution': return 'Exercise Increased Caution';
      case 'high_risk': return 'Reconsider Travel';
      default: return 'Unknown';
    }
  };

  const legends = [
    { color: '#22C55E', label: 'Very Safe', description: 'Low crime, stable' },
    { color: '#34D399', label: 'Safe', description: 'Generally safe for tourists' },
    { color: '#EAB308', label: 'Moderate', description: 'Exercise normal precautions' },
    { color: '#F97316', label: 'Caution', description: 'Exercise increased caution' },
    { color: '#EF4444', label: 'High Risk', description: 'Reconsider travel' },
    { color: '#D6D6D6', label: 'No Data', description: 'Information not available' }
  ];

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
              <Shield className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="safety-page-title">
                Safety & Emergency Info
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Check safety ratings and emergency contact numbers for your travel destinations
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-border">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                data-testid="safety-search"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Safety Levels</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {legends.map((legend) => (
                <div key={legend.label} className="legend-item" data-testid={`legend-${legend.label.toLowerCase().replace(/ /g, '-')}`}>
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
          <div className="map-container mb-8" data-testid="safety-map-container">
            {loading ? (
              <div className="flex items-center justify-center h-96" data-testid="loading-safety">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading safety data...</p>
                </div>
              </div>
            ) : (
              <WorldMap data={safetyData} mode="safety" />
            )}
          </div>

          {/* Country Cards */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-primary mb-6">
              Safety Information by Country {searchQuery && `(${filteredCountries.length} results)`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchQuery ? filteredCountries : safetyData).slice(0, 30).map((country) => (
                <motion.div
                  key={country.country_code}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-5 border border-border hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedCountry(selectedCountry?.country_code === country.country_code ? null : country)}
                  data-testid={`safety-card-${country.country_code}`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://flagcdn.com/w40/${country.country_code?.toLowerCase().slice(0, 2) || 'un'}.png`}
                      alt={country.country_name}
                      className="w-10 h-7 object-cover rounded shadow"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-lg">{country.country_name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`w-3 h-3 rounded-full ${getSafetyColor(country.safety_level)}`}></span>
                        <span className="text-sm font-medium">{getSafetyLabel(country.safety_level)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedCountry?.country_code === country.country_code && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      {/* Emergency Numbers */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-primary flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4" />
                          Emergency Numbers
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {country.emergency_police && (
                            <div className="bg-blue-50 p-2 rounded">
                              <span className="text-blue-600 font-medium">Police:</span> {country.emergency_police}
                            </div>
                          )}
                          {country.emergency_ambulance && (
                            <div className="bg-red-50 p-2 rounded">
                              <span className="text-red-600 font-medium">Ambulance:</span> {country.emergency_ambulance}
                            </div>
                          )}
                          {country.emergency_fire && (
                            <div className="bg-orange-50 p-2 rounded">
                              <span className="text-orange-600 font-medium">Fire:</span> {country.emergency_fire}
                            </div>
                          )}
                          {country.emergency_general && (
                            <div className="bg-green-50 p-2 rounded">
                              <span className="text-green-600 font-medium">General:</span> {country.emergency_general}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Indian Embassy */}
                      {country.indian_embassy_phone && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-primary flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4" />
                            Indian Embassy
                          </h5>
                          <div className="bg-amber-50 p-3 rounded text-sm">
                            <p><strong>Phone:</strong> {country.indian_embassy_phone}</p>
                            {country.indian_embassy_address && (
                              <p className="mt-1 text-muted-foreground">{country.indian_embassy_address}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Safety Tips */}
                      {country.safety_tips && country.safety_tips.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-primary flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4" />
                            Safety Tips
                          </h5>
                          <ul className="text-sm space-y-1">
                            {country.safety_tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas to Avoid */}
                      {country.areas_to_avoid && country.areas_to_avoid.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                            <MapPinOff className="w-4 h-4" />
                            Areas to Avoid
                          </h5>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <ul className="text-sm space-y-1">
                              {country.areas_to_avoid.map((area, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-red-800">{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Important Notice</h4>
                <p className="text-amber-700 text-sm">
                  Safety ratings and travel advisories can change rapidly. Always check the latest updates from the 
                  Ministry of External Affairs (MEA) and local embassy before traveling. Register with the Indian 
                  Embassy upon arrival in your destination country.
                </p>
                <a 
                  href="https://www.mea.gov.in/travel-advisories.htm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-amber-800 font-medium hover:underline"
                >
                  Visit MEA Travel Advisories →
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <BackToTop />
    </div>
  );
};

export default Safety;
