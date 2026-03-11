import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import BackToTop from '../components/BackToTop';
import { FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Visa = () => {
  const [visaData, setVisaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisa = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/visa`);
        setVisaData(response.data.data);
      } catch (error) {
        console.error('Error fetching visa data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisa();
  }, []);

  const legends = [
    { color: '#E25A53', label: 'Visa on Arrival', description: 'Get visa at airport' },
    { color: '#4B89AC', label: 'E-Visa', description: 'Apply online' },
    { color: '#F2A900', label: 'Visa Required', description: 'Embassy/Consulate application' },
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
              <FileText className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="visa-page-title">
                Visa Information for Indians
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Check visa requirements for Indian passport holders. Find out if you can get visa on arrival, apply for e-visa, or need to visit embassy.
            </p>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Visa Types</h3>
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
          <div className="map-container" data-testid="visa-map-container">
            {loading ? (
              <div className="flex items-center justify-center h-96" data-testid="loading-visa">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading visa data...</p>
                </div>
              </div>
            ) : (
              <WorldMap data={visaData} mode="visa" />
            )}
          </div>

          {/* Country List */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-primary mb-6">Visa Requirements by Country</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visaData.map((country) => (
                <div
                  key={country.country_code}
                  className="bg-white rounded-lg p-4 border border-border hover:shadow-md transition-all"
                  data-testid={`visa-country-card-${country.country_code}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor:
                          country.visa_type === 'visa_on_arrival'
                            ? '#E25A53'
                            : country.visa_type === 'e_visa'
                            ? '#4B89AC'
                            : '#F2A900'
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {country.visa_type.replace('_', ' ')}
                      </p>
                      {country.requirements && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {country.requirements}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <BackToTop />
    </div>
  );
};

export default Visa;