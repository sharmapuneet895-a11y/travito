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
                    className={`bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-all ${isSwapped ? 'ring-2 ring-accent' : ''}`}
                    data-testid={`forex-card-${currency}`}
                  >
                    {/* Header with Flag and Currency */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{info.flag}</span>
                        <div>
                          <div className="text-xl font-bold text-primary">{currency}</div>
                          <div className="text-sm text-muted-foreground">{info.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                            <span className="text-base">{info.flag}</span>
                            <span>{info.country}</span>
                          </div>
                        </div>
                      </div>
                      {/* Swap Button */}
                      <button
                        onClick={() => toggleSwap(currency)}
                        className="p-2 rounded-full bg-accent/10 hover:bg-accent/20 transition-all group"
                        title="Swap currencies"
                        data-testid={`swap-btn-${currency}`}
                      >
                        <ArrowRightLeft className={`w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-300 ${isSwapped ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Rate Display */}
                    {!isSwapped ? (
                      <>
                        <div className="text-3xl font-bold text-primary mb-1">
                          {rate.toFixed(4)}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          1 INR = {rate.toFixed(4)} {currency}
                        </div>
                        <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                          ₹1,000 = {info.symbol}{(rate * 1000).toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-accent mb-1">
                          ₹{inverseRate.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          1 {currency} = ₹{inverseRate.toFixed(2)} INR
                        </div>
                        <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                          {info.symbol}100 = ₹{(inverseRate * 100).toFixed(2)}
                        </div>
                      </>
                    )}
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
