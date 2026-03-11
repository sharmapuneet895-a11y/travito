import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, FileText, Cloud, Zap, PartyPopper, Utensils, Smartphone, Loader2, Shield, Phone, DollarSign } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Month abbreviations
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ISO3 to ISO2 country code mapping for flags
const iso3ToIso2 = {
  'USA': 'us', 'CAN': 'ca', 'MEX': 'mx', 'GBR': 'gb', 'FRA': 'fr', 'DEU': 'de', 'ITA': 'it', 'ESP': 'es',
  'PRT': 'pt', 'NLD': 'nl', 'BEL': 'be', 'CHE': 'ch', 'AUT': 'at', 'GRC': 'gr', 'TUR': 'tr', 'RUS': 'ru',
  'CHN': 'cn', 'JPN': 'jp', 'KOR': 'kr', 'IND': 'in', 'THA': 'th', 'VNM': 'vn', 'IDN': 'id', 'MYS': 'my',
  'SGP': 'sg', 'PHL': 'ph', 'AUS': 'au', 'NZL': 'nz', 'BRA': 'br', 'ARG': 'ar', 'CHL': 'cl', 'PER': 'pe',
  'COL': 'co', 'ZAF': 'za', 'EGY': 'eg', 'MAR': 'ma', 'KEN': 'ke', 'UAE': 'ae', 'ARE': 'ae', 'SAU': 'sa',
  'ISR': 'il', 'JOR': 'jo', 'NPL': 'np', 'LKA': 'lk', 'MDV': 'mv', 'MMR': 'mm', 'KHM': 'kh', 'LAO': 'la',
  'BTN': 'bt', 'BGD': 'bd', 'PAK': 'pk', 'AFG': 'af', 'IRN': 'ir', 'IRQ': 'iq', 'SYR': 'sy', 'LBN': 'lb',
  'CUB': 'cu', 'JAM': 'jm', 'DOM': 'do', 'CRI': 'cr', 'PAN': 'pa', 'GTM': 'gt', 'ECU': 'ec', 'VEN': 've',
  'URY': 'uy', 'PRY': 'py', 'BOL': 'bo', 'HRV': 'hr', 'CZE': 'cz', 'HUN': 'hu', 'POL': 'pl', 'SWE': 'se',
  'NOR': 'no', 'DNK': 'dk', 'FIN': 'fi', 'IRL': 'ie', 'ISL': 'is', 'ROU': 'ro', 'BGR': 'bg', 'UKR': 'ua',
  'BLR': 'by', 'SRB': 'rs', 'MNE': 'me', 'ALB': 'al', 'MKD': 'mk', 'BIH': 'ba', 'SVN': 'si', 'SVK': 'sk',
  'EST': 'ee', 'LVA': 'lv', 'LTU': 'lt', 'GEO': 'ge', 'ARM': 'am', 'AZE': 'az', 'KAZ': 'kz', 'UZB': 'uz',
  'TKM': 'tm', 'TJK': 'tj', 'KGZ': 'kg', 'MNG': 'mn', 'TWN': 'tw', 'HKG': 'hk', 'MAC': 'mo', 'FJI': 'fj',
  'PNG': 'pg', 'TZA': 'tz', 'UGA': 'ug', 'ETH': 'et', 'NGA': 'ng', 'GHA': 'gh', 'SEN': 'sn', 'CIV': 'ci',
  'CMR': 'cm', 'TUN': 'tn', 'DZA': 'dz', 'LBY': 'ly', 'SDN': 'sd', 'OMN': 'om', 'QAT': 'qa', 'BHR': 'bh',
  'KWT': 'kw', 'YEM': 'ye', 'TLS': 'tl', 'BRN': 'bn', 'MUS': 'mu', 'MDG': 'mg', 'ZWE': 'zw', 'ZMB': 'zm',
  'BWA': 'bw', 'NAM': 'na', 'MOZ': 'mz', 'AGO': 'ao', 'GAB': 'ga', 'COG': 'cg', 'COD': 'cd', 'RWA': 'rw',
  'GRL': 'gl', 'LUX': 'lu', 'MLT': 'mt', 'CYP': 'cy', 'MDA': 'md'
};

const getFlag = (countryCode) => {
  const iso2 = iso3ToIso2[countryCode] || countryCode?.toLowerCase().slice(0, 2) || 'un';
  return `https://flagcdn.com/w80/${iso2}.png`;
};

const CountryDetailModal = ({ country, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [countryData, setCountryData] = useState({
    seasons: null,
    visa: null,
    weather: null,
    plugs: null,
    festivals: [],
    dishes: [],
    apps: [],
    safety: null,
    forex: null
  });
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(country.country_code);
  const currentMonth = MONTH_ABBREV[new Date().getMonth()];

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Load critical data first (fast endpoints)
        const [seasonsRes, visaRes, plugsRes, festivalsRes, dishesRes, appsRes, safetyRes, forexRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/seasons`),
          axios.get(`${BACKEND_URL}/api/visa`),
          axios.get(`${BACKEND_URL}/api/plugs`),
          axios.get(`${BACKEND_URL}/api/festivals`),
          axios.get(`${BACKEND_URL}/api/dishes`),
          axios.get(`${BACKEND_URL}/api/apps`),
          axios.get(`${BACKEND_URL}/api/safety`),
          axios.get(`${BACKEND_URL}/api/forex/rates`)
        ]);

        const code = country.country_code;
        const name = country.country_name;

        // Process dishes - handle nested structure
        let allDishes = [];
        const dishData = dishesRes.data.data?.filter(d => d.country_code === code || d.country_name === name) || [];
        dishData.forEach(d => {
          if (d.dishes && Array.isArray(d.dishes)) {
            allDishes = [...allDishes, ...d.dishes];
          } else if (d.name) {
            allDishes.push(d);
          }
        });

        // Find forex rate for this country
        const forexRates = forexRes.data?.rates || {};
        // Currency to country code mapping (expanded)
        const currencyToCountry = {
          'THB': 'THA', 'JPY': 'JPN', 'SGD': 'SGP', 'MYR': 'MYS', 'IDR': 'IDN', 'VND': 'VNM', 'PHP': 'PHL',
          'AUD': 'AUS', 'NZD': 'NZL', 'USD': 'USA', 'EUR': 'FRA', 'GBP': 'GBR', 'CHF': 'CHE', 'CAD': 'CAN',
          'AED': 'ARE', 'SAR': 'SAU', 'EGP': 'EGY', 'ZAR': 'ZAF', 'KRW': 'KOR', 'CNY': 'CHN', 'HKD': 'HKG',
          'BRL': 'BRA', 'MXN': 'MEX', 'TRY': 'TUR', 'RUB': 'RUS', 'NPR': 'NPL', 'LKR': 'LKA', 'MVR': 'MDV',
          'TWD': 'TWN', 'PKR': 'PAK', 'BDT': 'BGD', 'MMK': 'MMR', 'KHR': 'KHM', 'LAK': 'LAO', 'BTN': 'BTN',
          'AFN': 'AFG', 'IRR': 'IRN', 'IQD': 'IRQ', 'SYP': 'SYR', 'LBP': 'LBN', 'JOD': 'JOR', 'ILS': 'ISR',
          'QAR': 'QAT', 'BHD': 'BHR', 'OMR': 'OMN', 'KWD': 'KWT', 'YER': 'YEM', 'CUP': 'CUB', 'JMD': 'JAM',
          'DOP': 'DOM', 'CRC': 'CRI', 'PAB': 'PAN', 'GTQ': 'GTM', 'VES': 'VEN', 'UYU': 'URY', 'PYG': 'PRY',
          'BOB': 'BOL', 'ARS': 'ARG', 'CLP': 'CHL', 'PEN': 'PER', 'COP': 'COL', 'HRK': 'HRV', 'CZK': 'CZE',
          'HUF': 'HUN', 'PLN': 'POL', 'SEK': 'SWE', 'NOK': 'NOR', 'DKK': 'DNK', 'ISK': 'ISL', 'RON': 'ROU',
          'BGN': 'BGR', 'UAH': 'UKR', 'BYN': 'BLR', 'RSD': 'SRB', 'MKD': 'MKD', 'BAM': 'BIH', 'GEL': 'GEO',
          'AMD': 'ARM', 'AZN': 'AZE', 'KZT': 'KAZ', 'UZS': 'UZB', 'TJS': 'TJK', 'KGS': 'KGZ', 'MNT': 'MNG',
          'MAD': 'MAR', 'TND': 'TUN', 'DZD': 'DZA', 'LYD': 'LBY', 'SDG': 'SDN', 'KES': 'KEN', 'TZS': 'TZA',
          'UGX': 'UGA', 'ETB': 'ETH', 'NGN': 'NGA', 'GHS': 'GHA', 'XOF': 'SEN', 'XAF': 'CMR', 'MUR': 'MUS',
          'MGA': 'MDG', 'ZWL': 'ZWE', 'ZMW': 'ZMB', 'BWP': 'BWA', 'NAD': 'NAM', 'MZN': 'MOZ', 'AOA': 'AGO',
          'FJD': 'FJI', 'PGK': 'PNG'
        };
        // Also create reverse mapping for UAE
        currencyToCountry['AED'] = 'UAE';
        
        let countryForex = null;
        for (const [currency, rate] of Object.entries(forexRates)) {
          if (currencyToCountry[currency] === code) {
            countryForex = { currency, rate, country_name: name };
            break;
          }
        }

        setCountryData({
          seasons: seasonsRes.data.data?.find(d => d.country_code === code || d.country_name === name),
          visa: visaRes.data.data?.find(d => d.country_code === code || d.country_name === name),
          weather: null,
          plugs: plugsRes.data.data?.find(d => d.country_code === code || d.country_name === name),
          festivals: festivalsRes.data.data?.filter(d => d.country_code === code || d.country_name === name) || [],
          dishes: allDishes,
          apps: appsRes.data.data?.filter(d => d.country_code === code || d.country_name === name) || [],
          safety: safetyRes.data.data?.find(d => d.country_code === code || d.country_name === name),
          forex: countryForex
        });
        setLoading(false);
        
        // Load weather separately (slow endpoint)
        try {
          const weatherRes = await axios.get(`${BACKEND_URL}/api/weather/realtime`);
          setCountryData(prev => ({
            ...prev,
            weather: weatherRes.data.data?.find(d => d.country_code === code || d.country_name === name)
          }));
        } catch (e) {
          console.log('Weather data unavailable');
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
        setLoading(false);
      }
    };
    fetchAllData();
  }, [country]);

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(country.country_code);
    } else {
      addToWishlist(country);
    }
  };

  const getSeasonColor = (type) => {
    switch (type) {
      case 'peak': return 'bg-red-100 text-red-700';
      case 'shoulder': return 'bg-blue-100 text-blue-700';
      case 'off': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getWeatherColor = (type) => {
    switch (type) {
      case 'hot': return 'bg-red-100 text-red-700';
      case 'snow': return 'bg-blue-100 text-blue-700';
      case 'rainy': return 'bg-cyan-100 text-cyan-700';
      case 'sandy': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="country-detail-modal"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <img
                src={getFlag(country.country_code)}
                alt={country.country_name}
                className="w-12 h-8 object-cover rounded shadow"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h2 className="text-2xl font-bold text-primary">{country.country_name}</h2>
                <p className="text-sm text-muted-foreground">Country Code: {country.country_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full transition-all ${inWishlist ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400'}`}
                data-testid="wishlist-toggle-btn"
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                data-testid="close-country-modal"
              >
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading country information...</span>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best Season */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-primary">Best Season to Visit</h3>
                </div>
                {countryData.seasons ? (
                  <div>
                    {(() => {
                      const isCurrentlyBest = countryData.seasons.best_months?.includes(currentMonth);
                      return (
                        <>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            isCurrentlyBest ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {isCurrentlyBest ? '✓ BEST TIME NOW' : 'NOT IDEAL NOW'}
                          </span>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Best months: {countryData.seasons.best_months?.join(', ') || 'N/A'}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No season data available</p>
                )}
              </div>

              {/* Visa Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-primary">Visa Information</h3>
                </div>
                {countryData.visa ? (
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      countryData.visa.visa_type === 'visa_on_arrival' ? 'bg-green-100 text-green-700' :
                      countryData.visa.visa_type === 'e_visa' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {countryData.visa.visa_type?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {countryData.visa.requirements && (
                      <p className="mt-2 text-sm text-muted-foreground">{countryData.visa.requirements}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No visa data available</p>
                )}
              </div>

              {/* Weather */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-semibold text-primary">Current Weather</h3>
                </div>
                {countryData.weather ? (
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getWeatherColor(countryData.weather.weather_type)}`}>
                      {countryData.weather.weather_type?.toUpperCase()}
                    </span>
                    <p className="mt-2 text-lg font-bold text-primary">{countryData.weather.avg_temp}</p>
                    <p className="text-sm text-muted-foreground">{countryData.weather.description}</p>
                    {countryData.weather.realtime && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live Data
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                    <p className="text-sm text-cyan-600 font-medium">Updating live data...</p>
                  </div>
                )}
              </div>

              {/* Power Plugs */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-primary">Power Plugs</h3>
                </div>
                {countryData.plugs ? (
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                      Type {countryData.plugs.plug_type}
                    </span>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Voltage: {countryData.plugs.voltage}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No plug data available</p>
                )}
              </div>

              {/* Forex Rate - Moved higher */}
              <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-primary">Exchange Rate (INR)</h3>
                </div>
                {countryData.forex ? (
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-700">₹{countryData.forex.rate?.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">= 1 {countryData.forex.currency}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{countryData.forex.country_name}</p>
                      <p className="text-xs">Currency: {countryData.forex.currency}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Exchange rate not available for this country</p>
                )}
              </div>

              {/* Festivals */}
              <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-5 border border-pink-100">
                <div className="flex items-center gap-2 mb-3">
                  <PartyPopper className="w-5 h-5 text-pink-500" />
                  <h3 className="font-semibold text-primary">Famous Festivals</h3>
                </div>
                {countryData.festivals.length > 0 ? (
                  <div className="space-y-2">
                    {countryData.festivals.slice(0, 3).map((festival, idx) => {
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const monthDisplay = typeof festival.month === 'number' ? monthNames[festival.month - 1] : festival.month;
                      return (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{festival.festival_name || festival.name}</span>
                          <span className="text-muted-foreground">{monthDisplay}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No festival data available</p>
                )}
              </div>

              {/* Local Dishes */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-primary">Must-Try Dishes</h3>
                </div>
                {countryData.dishes.length > 0 ? (
                  <div className="space-y-2">
                    {countryData.dishes.slice(0, 4).map((dish, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${dish.veg === true || dish.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span>{dish.name}</span>
                        {dish.description && <span className="text-muted-foreground text-xs">- {dish.description}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No dish data available</p>
                )}
              </div>

              {/* Top Apps */}
              {countryData.apps.length > 0 && (
                <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-5 h-5 text-slate-500" />
                    <h3 className="font-semibold text-primary">Recommended Apps</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {countryData.apps.slice(0, 8).map((app, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-border">
                        <p className="font-medium text-sm">{app.app_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{app.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety & Emergency */}
              {countryData.safety && (
                <div className="md:col-span-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-primary">Safety & Emergency</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {countryData.safety.emergency_police && (
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <Phone className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-blue-600 font-medium">Police</p>
                        <p className="font-bold text-blue-800">{countryData.safety.emergency_police}</p>
                      </div>
                    )}
                    {countryData.safety.emergency_ambulance && (
                      <div className="bg-red-50 p-2 rounded text-center">
                        <Phone className="w-4 h-4 text-red-600 mx-auto mb-1" />
                        <p className="text-xs text-red-600 font-medium">Ambulance</p>
                        <p className="font-bold text-red-800">{countryData.safety.emergency_ambulance}</p>
                      </div>
                    )}
                    {countryData.safety.emergency_fire && (
                      <div className="bg-orange-50 p-2 rounded text-center">
                        <Phone className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                        <p className="text-xs text-orange-600 font-medium">Fire</p>
                        <p className="font-bold text-orange-800">{countryData.safety.emergency_fire}</p>
                      </div>
                    )}
                    {countryData.safety.indian_embassy_phone && (
                      <div className="bg-amber-50 p-2 rounded text-center">
                        <Phone className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs text-amber-600 font-medium">Indian Embassy</p>
                        <p className="font-bold text-amber-800 text-xs">{countryData.safety.indian_embassy_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-border p-4 flex justify-between items-center">
            <button
              onClick={handleWishlistToggle}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                inWishlist 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CountryDetailModal;
