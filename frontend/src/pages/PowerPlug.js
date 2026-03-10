import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import { Zap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PowerPlug = () => {
  const [plugData, setPlugData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlugs = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/plugs`);
        setPlugData(response.data.data);
      } catch (error) {
        console.error('Error fetching plug data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugs();
  }, []);

  const plugTypes = [
    { type: 'A', color: '#E25A53', countries: 'USA, Japan, Canada' },
    { type: 'B', color: '#F2A900', countries: 'USA, Mexico' },
    { type: 'C', color: '#4B89AC', countries: 'Europe, Asia' },
    { type: 'D', color: '#9B59B6', countries: 'India, Nepal' },
    { type: 'E', color: '#2A9D8F', countries: 'France, Belgium' },
    { type: 'F', color: '#E74C3C', countries: 'Germany' },
    { type: 'G', color: '#3498DB', countries: 'UK, Singapore, UAE' },
    { type: 'I', color: '#F39C12', countries: 'Australia, China' },
    { type: 'Mixed', color: '#95A5A6', countries: 'Multiple types' }
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
              <Zap className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="plug-page-title">
                Power Plug Types by Country
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Know what power adapter you need before traveling. Different countries use different plug types and voltages.
            </p>
          </div>

          {/* Plug Types Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Plug Type Reference</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {plugTypes.map((plug) => (
                <div key={plug.type} className="text-center" data-testid={`plug-type-${plug.type}`}>
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${plug.color}20` }}
                  >
                    <span className="text-2xl font-bold" style={{ color: plug.color }}>
                      {plug.type}
                    </span>
                  </div>
                  <div className="font-medium text-sm text-foreground">Type {plug.type}</div>
                  <div className="text-xs text-muted-foreground">{plug.countries}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="map-container" data-testid="plug-map-container">
            {loading ? (
              <div className="flex items-center justify-center h-96" data-testid="loading-plugs">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading power plug data...</p>
                </div>
              </div>
            ) : (
              <WorldMap data={plugData} mode="plug" />
            )}
          </div>

          {/* Country List */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-primary mb-6">Power Details by Country</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plugData.map((country) => {
                const plugColor = plugTypes.find(p => p.type === country.plug_type || (country.plug_type === 'mixed' && p.type === 'Mixed'))?.color || '#95A5A6';
                return (
                  <div
                    key={country.country_code}
                    className="bg-white rounded-lg p-4 border border-border hover:shadow-md transition-all"
                    data-testid={`plug-country-card-${country.country_code}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${plugColor}20` }}
                      >
                        <span className="text-xl font-bold" style={{ color: plugColor }}>
                          {country.plug_type === 'mixed' ? 'M' : country.plug_type}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{country.country_name}</h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          Type: <span className="font-medium">{country.plug_type === 'mixed' ? 'Mixed' : country.plug_type}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {country.voltage} | {country.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-12 bg-accent/10 rounded-xl p-6 border border-accent/30">
            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Important Travel Tip
            </h3>
            <p className="text-muted-foreground mb-2">
              Always carry a universal travel adapter when visiting multiple countries. Check both the plug type AND voltage compatibility for your devices.
            </p>
            <p className="text-sm text-muted-foreground">
              Most modern electronics (phones, laptops) support 100-240V, but check your device specifications before plugging in.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PowerPlug;