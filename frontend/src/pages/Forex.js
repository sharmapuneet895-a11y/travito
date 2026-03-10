import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { DollarSign, RefreshCw, TrendingUp, ArrowRightLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Forex = () => {
  const [forexData, setForexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [swappedCurrencies, setSwappedCurrencies] = useState({});

  const fetchForexRates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/forex/rates`);
      setForexData(response.data);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching forex rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForexRates();
  }, []);

  const toggleSwap = (currency) => {
    setSwappedCurrencies(prev => ({
      ...prev,
      [currency]: !prev[currency]
    }));
  };

  // Currency data with country info
  const currencyData = {
    USD: { name: 'US Dollar', country: 'United States', flag: '🇺🇸', symbol: '$' },
    EUR: { name: 'Euro', country: 'European Union', flag: '🇪🇺', symbol: '€' },
    GBP: { name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', symbol: '£' },
    JPY: { name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵', symbol: '¥' },
    AUD: { name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺', symbol: 'A$' },
    CAD: { name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦', symbol: 'C$' },
    CHF: { name: 'Swiss Franc', country: 'Switzerland', flag: '🇨🇭', symbol: 'CHF' },
    CNY: { name: 'Chinese Yuan', country: 'China', flag: '🇨🇳', symbol: '¥' },
    SGD: { name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬', symbol: 'S$' },
    AED: { name: 'UAE Dirham', country: 'United Arab Emirates', flag: '🇦🇪', symbol: 'د.إ' },
    THB: { name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭', symbol: '฿' },
    NZD: { name: 'New Zealand Dollar', country: 'New Zealand', flag: '🇳🇿', symbol: 'NZ$' }
  };

  // Mini country shape SVGs (simplified outlines)
  const countryShapes = {
    USD: <path d="M10 5 L25 3 L30 8 L28 15 L22 18 L15 20 L8 18 L5 12 L8 7 Z" fill="currentColor" opacity="0.15"/>,
    EUR: <path d="M12 4 L22 4 L26 8 L24 14 L20 18 L14 18 L10 14 L8 8 Z" fill="currentColor" opacity="0.15"/>,
    GBP: <path d="M14 2 L18 2 L20 6 L19 10 L21 14 L18 18 L14 18 L12 14 L11 10 L13 6 Z" fill="currentColor" opacity="0.15"/>,
    JPY: <path d="M8 5 L12 3 L16 4 L18 8 L20 6 L24 8 L22 14 L18 18 L12 16 L8 12 Z" fill="currentColor" opacity="0.15"/>,
    AUS: <path d="M5 8 L28 8 L30 14 L25 20 L10 20 L5 15 Z" fill="currentColor" opacity="0.15"/>,
    CAD: <path d="M5 5 L30 5 L30 8 L28 12 L25 10 L20 12 L15 10 L10 12 L5 10 Z" fill="currentColor" opacity="0.15"/>,
    CHF: <path d="M12 4 L20 4 L22 8 L20 14 L16 16 L12 14 L10 8 Z" fill="currentColor" opacity="0.15"/>,
    CNY: <path d="M5 5 L30 5 L28 10 L30 15 L25 18 L15 18 L8 15 L5 10 Z" fill="currentColor" opacity="0.15"/>,
    SGD: <path d="M10 8 L22 8 L22 16 L10 16 Z" fill="currentColor" opacity="0.15"/>,
    AED: <path d="M8 8 L25 8 L28 12 L25 16 L8 16 L5 12 Z" fill="currentColor" opacity="0.15"/>,
    THB: <path d="M12 3 L18 3 L20 8 L22 5 L25 8 L23 15 L18 20 L12 18 L10 12 Z" fill="currentColor" opacity="0.15"/>,
    NZD: <path d="M8 6 L15 4 L20 6 L18 12 L22 14 L18 18 L12 16 L8 12 Z" fill="currentColor" opacity="0.15"/>
  };

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
              <DollarSign className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="forex-page-title">
                Live Forex Exchange Rates
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Currency exchange rates for Indian Rupee (INR). Click the swap button to interchange currencies.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-accent" />
                <div>
                  <h3 className="font-semibold text-foreground">Base Currency: Indian Rupee (INR) 🇮🇳</h3>
                  <p className="text-sm text-muted-foreground">Click <ArrowRightLeft className="w-4 h-4 inline" /> to swap conversion direction</p>
                </div>
              </div>
              <button
                onClick={fetchForexRates}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                data-testid="refresh-rates-button"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Rates
              </button>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-4">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>

          {/* Rates Grid */}
          {loading && !forexData ? (
            <div className="flex items-center justify-center h-96" data-testid="loading-forex">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading exchange rates...</p>
              </div>
            </div>
          ) : forexData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(forexData.rates).map(([currency, rate]) => {
                const isSwapped = swappedCurrencies[currency];
                const inverseRate = 1 / rate;
                const info = currencyData[currency] || { name: currency, country: 'Unknown', flag: '🌍', symbol: currency };
                
                return (
                  <motion.div
                    key={currency}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`forex-card relative overflow-hidden ${isSwapped ? 'ring-2 ring-accent' : ''}`}
                    data-testid={`forex-card-${currency}`}
                  >
                    {/* Mini country shape background */}
                    <svg 
                      className="absolute right-0 top-0 w-24 h-24 text-primary"
                      viewBox="0 0 35 25"
                    >
                      {countryShapes[currency] || countryShapes.USD}
                    </svg>
                    
                    {/* Swap Button */}
                    <button
                      onClick={() => toggleSwap(currency)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-accent/10 hover:bg-accent/20 transition-all group z-10"
                      title="Swap currencies"
                      data-testid={`swap-btn-${currency}`}
                    >
                      <ArrowRightLeft className={`w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-300 ${isSwapped ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="relative z-10">
                      {/* Flag and Currency Info */}
                      <div className="flex items-start gap-3 mb-4 pr-10">
                        <span className="text-4xl">{info.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-bold text-primary">{currency}</div>
                          <div className="text-sm text-muted-foreground truncate">{info.name}</div>
                          <div className="text-xs text-muted-foreground/70 truncate">{info.country}</div>
                        </div>
                      </div>

                      {!isSwapped ? (
                        <>
                          {/* INR to Foreign Currency */}
                          <div className="text-3xl font-bold text-primary mb-2">
                            {rate.toFixed(4)}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            1 INR = {rate.toFixed(4)} {currency}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                            ₹1,000 = {info.symbol}{(rate * 1000).toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Foreign Currency to INR */}
                          <div className="text-3xl font-bold text-accent mb-2">
                            ₹{inverseRate.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            1 {currency} = ₹{inverseRate.toFixed(2)} INR
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                            {info.symbol}100 = ₹{(inverseRate * 100).toFixed(2)}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Unable to load exchange rates. Please try again.</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-12 bg-muted/30 rounded-xl p-6 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Note:</strong> Exchange rates are indicative and may vary. Please check with your bank or exchange service for exact rates.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Forex;
