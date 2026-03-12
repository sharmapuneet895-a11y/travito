import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import BackToTop from '../components/BackToTop';
import { DollarSign, RefreshCw, TrendingUp, ArrowRightLeft, Search, Filter, Globe } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Extended currency data with estimated rates for countries not in live API
const allCurrencyData = {
  // Major World Currencies (from API)
  USD: { name: 'US Dollar', country: 'United States', countryCode: 'us', symbol: '$', region: 'Americas', estimatedRate: 0.0109 },
  EUR: { name: 'Euro', country: 'European Union', countryCode: 'eu', symbol: '€', region: 'Europe', estimatedRate: 0.0094 },
  GBP: { name: 'British Pound', country: 'United Kingdom', countryCode: 'gb', symbol: '£', region: 'Europe', estimatedRate: 0.0081 },
  JPY: { name: 'Japanese Yen', country: 'Japan', countryCode: 'jp', symbol: '¥', region: 'Asia', estimatedRate: 1.72 },
  CHF: { name: 'Swiss Franc', country: 'Switzerland', countryCode: 'ch', symbol: 'CHF', region: 'Europe', estimatedRate: 0.0085 },
  AUD: { name: 'Australian Dollar', country: 'Australia', countryCode: 'au', symbol: 'A$', region: 'Oceania', estimatedRate: 0.0152 },
  CAD: { name: 'Canadian Dollar', country: 'Canada', countryCode: 'ca', symbol: 'C$', region: 'Americas', estimatedRate: 0.0148 },
  CNY: { name: 'Chinese Yuan', country: 'China', countryCode: 'cn', symbol: '¥', region: 'Asia', estimatedRate: 0.0746 },
  NZD: { name: 'New Zealand Dollar', country: 'New Zealand', countryCode: 'nz', symbol: 'NZ$', region: 'Oceania', estimatedRate: 0.0184 },
  
  // Southeast Asia
  SGD: { name: 'Singapore Dollar', country: 'Singapore', countryCode: 'sg', symbol: 'S$', region: 'Asia', estimatedRate: 0.0138 },
  THB: { name: 'Thai Baht', country: 'Thailand', countryCode: 'th', symbol: '฿', region: 'Asia', estimatedRate: 0.345 },
  MYR: { name: 'Malaysian Ringgit', country: 'Malaysia', countryCode: 'my', symbol: 'RM', region: 'Asia', estimatedRate: 0.0475 },
  IDR: { name: 'Indonesian Rupiah', country: 'Indonesia', countryCode: 'id', symbol: 'Rp', region: 'Asia', estimatedRate: 172.5 },
  PHP: { name: 'Philippine Peso', country: 'Philippines', countryCode: 'ph', symbol: '₱', region: 'Asia', estimatedRate: 0.62 },
  VND: { name: 'Vietnamese Dong', country: 'Vietnam', countryCode: 'vn', symbol: '₫', region: 'Asia', estimatedRate: 265.8 },
  KHR: { name: 'Cambodian Riel', country: 'Cambodia', countryCode: 'kh', symbol: '៛', region: 'Asia', estimatedRate: 44.2 },
  MMK: { name: 'Myanmar Kyat', country: 'Myanmar', countryCode: 'mm', symbol: 'K', region: 'Asia', estimatedRate: 22.8 },
  
  // East Asia
  KRW: { name: 'South Korean Won', country: 'South Korea', countryCode: 'kr', symbol: '₩', region: 'Asia', estimatedRate: 14.2 },
  HKD: { name: 'Hong Kong Dollar', country: 'Hong Kong', countryCode: 'hk', symbol: 'HK$', region: 'Asia', estimatedRate: 0.085 },
  TWD: { name: 'Taiwan Dollar', country: 'Taiwan', countryCode: 'tw', symbol: 'NT$', region: 'Asia', estimatedRate: 0.35 },
  MNT: { name: 'Mongolian Tugrik', country: 'Mongolia', countryCode: 'mn', symbol: '₮', region: 'Asia', estimatedRate: 36.8 },
  
  // South Asia
  NPR: { name: 'Nepalese Rupee', country: 'Nepal', countryCode: 'np', symbol: 'रू', region: 'Asia', estimatedRate: 1.44 },
  LKR: { name: 'Sri Lankan Rupee', country: 'Sri Lanka', countryCode: 'lk', symbol: 'Rs', region: 'Asia', estimatedRate: 3.42 },
  PKR: { name: 'Pakistani Rupee', country: 'Pakistan', countryCode: 'pk', symbol: 'Rs', region: 'Asia', estimatedRate: 3.05 },
  BDT: { name: 'Bangladeshi Taka', country: 'Bangladesh', countryCode: 'bd', symbol: '৳', region: 'Asia', estimatedRate: 1.19 },
  MVR: { name: 'Maldivian Rufiyaa', country: 'Maldives', countryCode: 'mv', symbol: 'Rf', region: 'Asia', estimatedRate: 0.167 },
  
  // Middle East
  AED: { name: 'UAE Dirham', country: 'United Arab Emirates', countryCode: 'ae', symbol: 'د.إ', region: 'Middle East', estimatedRate: 0.04 },
  SAR: { name: 'Saudi Riyal', country: 'Saudi Arabia', countryCode: 'sa', symbol: 'ر.س', region: 'Middle East', estimatedRate: 0.041 },
  QAR: { name: 'Qatari Riyal', country: 'Qatar', countryCode: 'qa', symbol: 'ر.ق', region: 'Middle East', estimatedRate: 0.04 },
  KWD: { name: 'Kuwaiti Dinar', country: 'Kuwait', countryCode: 'kw', symbol: 'د.ك', region: 'Middle East', estimatedRate: 0.0033 },
  BHD: { name: 'Bahraini Dinar', country: 'Bahrain', countryCode: 'bh', symbol: '.د.ب', region: 'Middle East', estimatedRate: 0.0041 },
  OMR: { name: 'Omani Rial', country: 'Oman', countryCode: 'om', symbol: 'ر.ع.', region: 'Middle East', estimatedRate: 0.0042 },
  JOD: { name: 'Jordanian Dinar', country: 'Jordan', countryCode: 'jo', symbol: 'د.أ', region: 'Middle East', estimatedRate: 0.0077 },
  ILS: { name: 'Israeli Shekel', country: 'Israel', countryCode: 'il', symbol: '₪', region: 'Middle East', estimatedRate: 0.04 },
  TRY: { name: 'Turkish Lira', country: 'Turkey', countryCode: 'tr', symbol: '₺', region: 'Middle East', estimatedRate: 0.352 },
  
  // Europe
  RUB: { name: 'Russian Ruble', country: 'Russia', countryCode: 'ru', symbol: '₽', region: 'Europe', estimatedRate: 0.97 },
  SEK: { name: 'Swedish Krona', country: 'Sweden', countryCode: 'se', symbol: 'kr', region: 'Europe', estimatedRate: 0.112 },
  NOK: { name: 'Norwegian Krone', country: 'Norway', countryCode: 'no', symbol: 'kr', region: 'Europe', estimatedRate: 0.115 },
  DKK: { name: 'Danish Krone', country: 'Denmark', countryCode: 'dk', symbol: 'kr', region: 'Europe', estimatedRate: 0.073 },
  PLN: { name: 'Polish Zloty', country: 'Poland', countryCode: 'pl', symbol: 'zł', region: 'Europe', estimatedRate: 0.043 },
  CZK: { name: 'Czech Koruna', country: 'Czech Republic', countryCode: 'cz', symbol: 'Kč', region: 'Europe', estimatedRate: 0.248 },
  HUF: { name: 'Hungarian Forint', country: 'Hungary', countryCode: 'hu', symbol: 'Ft', region: 'Europe', estimatedRate: 3.92 },
  RON: { name: 'Romanian Leu', country: 'Romania', countryCode: 'ro', symbol: 'lei', region: 'Europe', estimatedRate: 0.05 },
  BGN: { name: 'Bulgarian Lev', country: 'Bulgaria', countryCode: 'bg', symbol: 'лв', region: 'Europe', estimatedRate: 0.019 },
  HRK: { name: 'Croatian Kuna', country: 'Croatia', countryCode: 'hr', symbol: 'kn', region: 'Europe', estimatedRate: 0.073 },
  ISK: { name: 'Icelandic Króna', country: 'Iceland', countryCode: 'is', symbol: 'kr', region: 'Europe', estimatedRate: 1.49 },
  UAH: { name: 'Ukrainian Hryvnia', country: 'Ukraine', countryCode: 'ua', symbol: '₴', region: 'Europe', estimatedRate: 0.40 },
  
  // Africa
  EGP: { name: 'Egyptian Pound', country: 'Egypt', countryCode: 'eg', symbol: 'E£', region: 'Africa', estimatedRate: 0.336 },
  ZAR: { name: 'South African Rand', country: 'South Africa', countryCode: 'za', symbol: 'R', region: 'Africa', estimatedRate: 0.197 },
  MAD: { name: 'Moroccan Dirham', country: 'Morocco', countryCode: 'ma', symbol: 'د.م.', region: 'Africa', estimatedRate: 0.108 },
  KES: { name: 'Kenyan Shilling', country: 'Kenya', countryCode: 'ke', symbol: 'KSh', region: 'Africa', estimatedRate: 1.76 },
  NGN: { name: 'Nigerian Naira', country: 'Nigeria', countryCode: 'ng', symbol: '₦', region: 'Africa', estimatedRate: 8.42 },
  GHS: { name: 'Ghanaian Cedi', country: 'Ghana', countryCode: 'gh', symbol: '₵', region: 'Africa', estimatedRate: 0.132 },
  TZS: { name: 'Tanzanian Shilling', country: 'Tanzania', countryCode: 'tz', symbol: 'TSh', region: 'Africa', estimatedRate: 27.5 },
  MUR: { name: 'Mauritian Rupee', country: 'Mauritius', countryCode: 'mu', symbol: '₨', region: 'Africa', estimatedRate: 0.49 },
  
  // Americas
  BRL: { name: 'Brazilian Real', country: 'Brazil', countryCode: 'br', symbol: 'R$', region: 'Americas', estimatedRate: 0.054 },
  MXN: { name: 'Mexican Peso', country: 'Mexico', countryCode: 'mx', symbol: 'MX$', region: 'Americas', estimatedRate: 0.185 },
  ARS: { name: 'Argentine Peso', country: 'Argentina', countryCode: 'ar', symbol: 'AR$', region: 'Americas', estimatedRate: 9.12 },
  CLP: { name: 'Chilean Peso', country: 'Chile', countryCode: 'cl', symbol: 'CLP$', region: 'Americas', estimatedRate: 10.1 },
  COP: { name: 'Colombian Peso', country: 'Colombia', countryCode: 'co', symbol: 'COL$', region: 'Americas', estimatedRate: 42.8 },
  PEN: { name: 'Peruvian Sol', country: 'Peru', countryCode: 'pe', symbol: 'S/', region: 'Americas', estimatedRate: 0.0408 },
  CRC: { name: 'Costa Rican Colón', country: 'Costa Rica', countryCode: 'cr', symbol: '₡', region: 'Americas', estimatedRate: 5.56 },
  DOP: { name: 'Dominican Peso', country: 'Dominican Republic', countryCode: 'do', symbol: 'RD$', region: 'Americas', estimatedRate: 0.64 },
  JMD: { name: 'Jamaican Dollar', country: 'Jamaica', countryCode: 'jm', symbol: 'J$', region: 'Americas', estimatedRate: 1.68 },
  
  // Oceania
  FJD: { name: 'Fijian Dollar', country: 'Fiji', countryCode: 'fj', symbol: 'FJ$', region: 'Oceania', estimatedRate: 0.024 },
  PGK: { name: 'Papua New Guinea Kina', country: 'Papua New Guinea', countryCode: 'pg', symbol: 'K', region: 'Oceania', estimatedRate: 0.039 },
};

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa', 'Oceania'];

const Forex = () => {
  const [forexData, setForexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [swappedCurrencies, setSwappedCurrencies] = useState({});
  const [isRealtime, setIsRealtime] = useState(false);
  const [dataSource, setDataSource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [showAllCurrencies, setShowAllCurrencies] = useState(true);

  const fetchForexRates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/forex/rates`);
      setForexData(response.data);
      setLastUpdated(new Date().toLocaleString());
      setIsRealtime(response.data.realtime || false);
      setDataSource(response.data.source || 'unknown');
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

  // Get flag image URL from flagcdn.com
  const getFlagUrl = (countryCode) => {
    return `https://flagcdn.com/w80/${countryCode}.png`;
  };

  // Combine API rates with estimated rates for full coverage
  const combinedCurrencies = useMemo(() => {
    const result = {};
    const apiRates = forexData?.rates || {};
    
    Object.entries(allCurrencyData).forEach(([currency, info]) => {
      result[currency] = {
        ...info,
        rate: apiRates[currency] || info.estimatedRate,
        isLive: !!apiRates[currency]
      };
    });
    
    return result;
  }, [forexData]);

  // Filter currencies by search and region
  const filteredCurrencies = useMemo(() => {
    return Object.entries(combinedCurrencies).filter(([currency, info]) => {
      const matchesSearch = searchQuery === '' || 
        currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = selectedRegion === 'All' || info.region === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });
  }, [combinedCurrencies, searchQuery, selectedRegion]);

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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Base Currency: Indian Rupee (INR)</h3>
                  <img 
                    src="https://flagcdn.com/w40/in.png" 
                    alt="India" 
                    className="w-6 h-4 object-cover rounded-sm"
                  />
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
            <p className="text-sm text-muted-foreground mt-2">
              Click <ArrowRightLeft className="w-4 h-4 inline" /> to swap conversion direction
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-4 mt-2">
                {isRealtime && (
                  <span className="inline-flex items-center gap-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live Rates ({dataSource})
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated}
                </p>
              </div>
            )}
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-border">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search currency or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="forex-search-input"
                />
              </div>
              
              {/* Region Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Globe className="w-5 h-5 text-muted-foreground" />
                {REGIONS.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedRegion === region
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    data-testid={`region-filter-${region.toLowerCase().replace(' ', '-')}`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-primary">{filteredCurrencies.length}</span> currencies
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Live
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Estimated
                </span>
              </div>
            </div>
          </div>

          {/* Rates Grid */}
          {loading && !forexData ? (
            <div className="flex items-center justify-center h-96" data-testid="loading-forex">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading exchange rates...</p>
              </div>
            </div>
          ) : filteredCurrencies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCurrencies.map(([currency, info]) => {
                const isSwapped = swappedCurrencies[currency];
                const rate = info.rate;
                const inverseRate = 1 / rate;
                
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
                        <img 
                          src={getFlagUrl(info.countryCode)} 
                          alt={info.country}
                          className="w-12 h-8 object-cover rounded shadow-sm border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="text-xl font-bold text-primary">{currency}</div>
                          <div className="text-sm text-muted-foreground">{info.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
                            <img 
                              src={getFlagUrl(info.countryCode)} 
                              alt="" 
                              className="w-4 h-3 object-cover rounded-sm"
                            />
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

                    {/* Live/Estimated Badge */}
                    <div className="mb-3">
                      {info.isLive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Live Rate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          Estimated
                        </span>
                      )}
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
              <p>No currencies found matching your search criteria.</p>
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
      <BackToTop />
    </div>
  );
};

export default Forex;
