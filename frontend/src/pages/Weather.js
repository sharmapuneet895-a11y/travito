import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import BackToTop from '../components/BackToTop';
import { Cloud, RefreshCw, Calendar, Sun, Snowflake, CloudRain, Wind } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Month abbreviations and names
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Anticipated weather by country and month (hot/cold/snow/rainy/mild)
const anticipatedWeatherData = {
  // North America
  'USA': { hot: [6, 7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [4, 5], mild: [3, 4, 5, 9, 10, 11] },
  'CAN': { hot: [7, 8], cold: [11, 12, 1, 2, 3], snow: [11, 12, 1, 2, 3, 4], rainy: [5], mild: [5, 6, 9, 10] },
  'MEX': { hot: [4, 5, 6], cold: [], snow: [], rainy: [6, 7, 8, 9], mild: [10, 11, 12, 1, 2, 3] },
  
  // Europe
  'GBR': { hot: [], cold: [12, 1, 2], snow: [1, 2], rainy: [10, 11, 12], mild: [3, 4, 5, 6, 7, 8, 9] },
  'FRA': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [10, 11], mild: [3, 4, 5, 6, 9] },
  'DEU': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [6, 7], mild: [3, 4, 5, 9, 10, 11] },
  'ITA': { hot: [6, 7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [10, 11], mild: [3, 4, 5, 9] },
  'ESP': { hot: [6, 7, 8], cold: [1, 2], snow: [1, 2], rainy: [10, 11], mild: [3, 4, 5, 9, 12] },
  'PRT': { hot: [7, 8], cold: [], snow: [], rainy: [10, 11, 12], mild: [1, 2, 3, 4, 5, 6, 9] },
  'NLD': { hot: [], cold: [12, 1, 2], snow: [1, 2], rainy: [10, 11, 12], mild: [3, 4, 5, 6, 7, 8, 9] },
  'CHE': { hot: [7, 8], cold: [11, 12, 1, 2, 3], snow: [11, 12, 1, 2, 3, 4], rainy: [5, 6], mild: [5, 9, 10] },
  'AUT': { hot: [7, 8], cold: [11, 12, 1, 2, 3], snow: [11, 12, 1, 2, 3], rainy: [5, 6], mild: [4, 9, 10] },
  'GRC': { hot: [6, 7, 8], cold: [], snow: [], rainy: [11, 12, 1, 2], mild: [3, 4, 5, 9, 10] },
  'TUR': { hot: [6, 7, 8], cold: [1, 2], snow: [1, 2], rainy: [3, 4, 11, 12], mild: [5, 9, 10] },
  'NOR': { hot: [], cold: [11, 12, 1, 2, 3, 4], snow: [11, 12, 1, 2, 3, 4], rainy: [9, 10], mild: [5, 6, 7, 8] },
  'SWE': { hot: [], cold: [11, 12, 1, 2, 3], snow: [11, 12, 1, 2, 3], rainy: [9, 10], mild: [4, 5, 6, 7, 8] },
  'FIN': { hot: [], cold: [11, 12, 1, 2, 3, 4], snow: [11, 12, 1, 2, 3, 4], rainy: [8, 9], mild: [5, 6, 7, 10] },
  'DNK': { hot: [], cold: [12, 1, 2, 3], snow: [1, 2], rainy: [10, 11], mild: [4, 5, 6, 7, 8, 9] },
  'ISL': { hot: [], cold: [11, 12, 1, 2, 3, 4], snow: [11, 12, 1, 2, 3, 4], rainy: [9, 10], mild: [5, 6, 7, 8] },
  'IRL': { hot: [], cold: [], snow: [], rainy: [10, 11, 12, 1, 2], mild: [3, 4, 5, 6, 7, 8, 9] },
  'POL': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'CZE': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'HUN': { hot: [7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'HRV': { hot: [6, 7, 8], cold: [1, 2], snow: [1, 2], rainy: [11], mild: [3, 4, 5, 9, 10, 12] },
  'RUS': { hot: [7, 8], cold: [11, 12, 1, 2, 3, 4], snow: [11, 12, 1, 2, 3, 4], rainy: [5, 9], mild: [5, 6, 9, 10] },
  
  // Asia
  'JPN': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [6, 9], mild: [3, 4, 5, 10, 11] },
  'CHN': { hot: [6, 7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'KOR': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [6, 7], mild: [3, 4, 5, 9, 10, 11] },
  'IND': { hot: [3, 4, 5, 6], cold: [], snow: [], rainy: [6, 7, 8, 9], mild: [10, 11, 12, 1, 2] },
  'THA': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2] },
  'VNM': { hot: [4, 5, 6, 7, 8], cold: [], snow: [], rainy: [7, 8, 9], mild: [10, 11, 12, 1, 2, 3] },
  'SGP': { hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], cold: [], snow: [], rainy: [11, 12, 1], mild: [] },
  'MYS': { hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], cold: [], snow: [], rainy: [10, 11, 12], mild: [] },
  'IDN': { hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], cold: [], snow: [], rainy: [12, 1, 2, 3], mild: [] },
  'PHL': { hot: [3, 4, 5], cold: [], snow: [], rainy: [6, 7, 8, 9, 10, 11], mild: [12, 1, 2] },
  'NPL': { hot: [4, 5, 6], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [6, 7, 8, 9], mild: [3, 10, 11] },
  'LKA': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 10, 11], mild: [12, 1, 2, 6, 7, 8, 9] },
  'MDV': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2] },
  'UAE': { hot: [5, 6, 7, 8, 9], cold: [], snow: [], rainy: [], mild: [10, 11, 12, 1, 2, 3, 4] },
  'SAU': { hot: [5, 6, 7, 8, 9], cold: [], snow: [], rainy: [], mild: [10, 11, 12, 1, 2, 3, 4] },
  'HKG': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [4, 5, 6, 7, 8], mild: [10, 11, 12, 1, 2, 3] },
  'TWN': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [5, 6, 7, 8], mild: [10, 11, 12, 1, 2, 3, 4] },
  'MNG': { hot: [7, 8], cold: [11, 12, 1, 2, 3, 4], snow: [11, 12, 1, 2, 3, 4], rainy: [7, 8], mild: [5, 6, 9, 10] },
  
  // Middle East
  'EGY': { hot: [5, 6, 7, 8, 9], cold: [], snow: [], rainy: [], mild: [10, 11, 12, 1, 2, 3, 4] },
  'JOR': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [12, 1, 2], mild: [3, 4, 5, 10, 11] },
  'ISR': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [12, 1, 2], mild: [3, 4, 5, 10, 11] },
  'OMN': { hot: [4, 5, 6, 7, 8, 9], cold: [], snow: [], rainy: [], mild: [10, 11, 12, 1, 2, 3] },
  'QAT': { hot: [5, 6, 7, 8, 9, 10], cold: [], snow: [], rainy: [], mild: [11, 12, 1, 2, 3, 4] },
  
  // Africa
  'ZAF': { hot: [12, 1, 2], cold: [6, 7, 8], snow: [], rainy: [10, 11, 12], mild: [3, 4, 5, 9] },
  'MAR': { hot: [7, 8], cold: [], snow: [], rainy: [11, 12, 1, 2, 3], mild: [4, 5, 6, 9, 10] },
  'KEN': { hot: [1, 2, 3], cold: [], snow: [], rainy: [3, 4, 5, 10, 11], mild: [6, 7, 8, 9, 12] },
  'TZA': { hot: [10, 11, 12, 1, 2], cold: [], snow: [], rainy: [3, 4, 5, 11, 12], mild: [6, 7, 8, 9] },
  'MUS': { hot: [11, 12, 1, 2, 3, 4], cold: [], snow: [], rainy: [1, 2, 3], mild: [5, 6, 7, 8, 9, 10] },
  
  // Oceania
  'AUS': { hot: [12, 1, 2], cold: [6, 7, 8], snow: [], rainy: [2, 3], mild: [3, 4, 5, 9, 10, 11] },
  'NZL': { hot: [1, 2], cold: [6, 7, 8], snow: [6, 7, 8], rainy: [6, 7], mild: [3, 4, 5, 9, 10, 11, 12] },
  'FJI': { hot: [11, 12, 1, 2, 3, 4], cold: [], snow: [], rainy: [12, 1, 2, 3], mild: [5, 6, 7, 8, 9, 10] },
  
  // South America
  'BRA': { hot: [12, 1, 2, 3], cold: [], snow: [], rainy: [12, 1, 2, 3], mild: [4, 5, 6, 7, 8, 9, 10, 11] },
  'ARG': { hot: [12, 1, 2], cold: [6, 7, 8], snow: [6, 7, 8], rainy: [3, 4], mild: [3, 4, 5, 9, 10, 11] },
  'CHL': { hot: [12, 1, 2], cold: [6, 7, 8], snow: [6, 7, 8], rainy: [5, 6, 7], mild: [3, 4, 9, 10, 11] },
  'PER': { hot: [12, 1, 2, 3], cold: [], snow: [], rainy: [12, 1, 2, 3], mild: [4, 5, 6, 7, 8, 9, 10, 11] },
  'COL': { hot: [1, 2, 7, 8], cold: [], snow: [], rainy: [4, 5, 10, 11], mild: [3, 6, 9, 12] },
  'CRI': { hot: [3, 4], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10, 11], mild: [12, 1, 2] },
  
  // Caribbean
  'CUB': { hot: [5, 6, 7, 8, 9, 10], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2, 3, 4] },
  'JAM': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [5, 10, 11], mild: [12, 1, 2, 3, 4] },
  'DOM': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [5, 8, 9, 10, 11], mild: [12, 1, 2, 3, 4] },
  
  // Additional Europe
  'BEL': { hot: [7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [10, 11], mild: [3, 4, 5, 6, 9] },
  'LUX': { hot: [7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [10, 11], mild: [3, 4, 5, 6, 9] },
  'MCO': { hot: [7, 8], cold: [], snow: [], rainy: [10, 11], mild: [1, 2, 3, 4, 5, 6, 9, 12] },
  'MLT': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [11, 12], mild: [1, 2, 3, 4, 5, 10] },
  'CYP': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [12, 1, 2], mild: [3, 4, 5, 10, 11] },
  'SVN': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'SVK': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'EST': { hot: [7, 8], cold: [11, 12, 1, 2, 3], snow: [12, 1, 2, 3], rainy: [9, 10], mild: [4, 5, 6] },
  'LVA': { hot: [7, 8], cold: [11, 12, 1, 2, 3], snow: [12, 1, 2, 3], rainy: [9, 10], mild: [4, 5, 6] },
  'LTU': { hot: [7, 8], cold: [11, 12, 1, 2, 3], snow: [12, 1, 2, 3], rainy: [9, 10], mild: [4, 5, 6] },
  'SRB': { hot: [7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'MNE': { hot: [7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [11], mild: [3, 4, 5, 6, 9, 10] },
  'BIH': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  'ALB': { hot: [7, 8], cold: [1, 2], snow: [1, 2], rainy: [11, 12], mild: [3, 4, 5, 6, 9, 10] },
  'MKD': { hot: [7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [5, 6], mild: [3, 4, 9, 10, 11] },
  
  // Additional Africa
  'DZA': { hot: [6, 7, 8], cold: [], snow: [], rainy: [12, 1, 2], mild: [3, 4, 5, 9, 10, 11] },
  'TUN': { hot: [7, 8], cold: [], snow: [], rainy: [11, 12, 1, 2], mild: [3, 4, 5, 6, 9, 10] },
  'NGA': { hot: [2, 3, 4], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1] },
  'GHA': { hot: [2, 3, 4], cold: [], snow: [], rainy: [4, 5, 6, 9, 10], mild: [11, 12, 1, 7, 8] },
  'ETH': { hot: [3, 4, 5], cold: [], snow: [], rainy: [6, 7, 8, 9], mild: [10, 11, 12, 1, 2] },
  'RWA': { hot: [], cold: [], snow: [], rainy: [3, 4, 5, 10, 11], mild: [1, 2, 6, 7, 8, 9, 12] },
  'UGA': { hot: [1, 2], cold: [], snow: [], rainy: [3, 4, 5, 10, 11], mild: [6, 7, 8, 9, 12] },
  'BWA': { hot: [10, 11, 12, 1, 2], cold: [6, 7], snow: [], rainy: [1, 2, 3], mild: [3, 4, 5, 8, 9] },
  'NAM': { hot: [11, 12, 1, 2], cold: [6, 7], snow: [], rainy: [1, 2, 3], mild: [3, 4, 5, 8, 9, 10] },
  'ZMB': { hot: [9, 10, 11], cold: [6, 7], snow: [], rainy: [11, 12, 1, 2, 3], mild: [4, 5, 8] },
  'ZWE': { hot: [10, 11], cold: [6, 7], snow: [], rainy: [11, 12, 1, 2, 3], mild: [4, 5, 8, 9] },
  'MDG': { hot: [12, 1, 2, 3], cold: [], snow: [], rainy: [12, 1, 2, 3], mild: [4, 5, 6, 7, 8, 9, 10, 11] },
  'SEN': { hot: [4, 5, 10, 11], cold: [], snow: [], rainy: [7, 8, 9], mild: [12, 1, 2, 3, 6] },
  
  // Additional Asia
  'PAK': { hot: [4, 5, 6, 7], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [7, 8], mild: [3, 9, 10, 11] },
  'BGD': { hot: [3, 4, 5, 6], cold: [], snow: [], rainy: [6, 7, 8, 9], mild: [10, 11, 12, 1, 2] },
  'KHM': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2] },
  'LAO': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9], mild: [10, 11, 12, 1, 2] },
  'MMR': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2] },
  'BTN': { hot: [], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [6, 7, 8], mild: [3, 4, 5, 9, 10, 11] },
  'KAZ': { hot: [7, 8], cold: [11, 12, 1, 2, 3], snow: [11, 12, 1, 2, 3], rainy: [4, 5], mild: [5, 6, 9, 10] },
  'UZB': { hot: [6, 7, 8], cold: [12, 1, 2], snow: [12, 1], rainy: [3, 4], mild: [3, 5, 9, 10, 11] },
  'AFG': { hot: [6, 7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [3, 4], mild: [5, 9, 10, 11] },
  'IRN': { hot: [6, 7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [3, 4, 11], mild: [5, 9, 10] },
  'IRQ': { hot: [5, 6, 7, 8, 9], cold: [1, 2], snow: [], rainy: [12, 1, 2], mild: [3, 4, 10, 11, 12] },
  'SYR': { hot: [6, 7, 8], cold: [1, 2], snow: [], rainy: [12, 1, 2], mild: [3, 4, 5, 9, 10, 11] },
  'LBN': { hot: [7, 8], cold: [1, 2], snow: [1, 2], rainy: [12, 1, 2], mild: [3, 4, 5, 6, 9, 10, 11] },
  'KWT': { hot: [5, 6, 7, 8, 9], cold: [], snow: [], rainy: [], mild: [10, 11, 12, 1, 2, 3, 4] },
  'BHR': { hot: [5, 6, 7, 8, 9], cold: [], snow: [], rainy: [], mild: [10, 11, 12, 1, 2, 3, 4] },
  'YEM': { hot: [5, 6, 7, 8, 9], cold: [], snow: [], rainy: [7, 8], mild: [10, 11, 12, 1, 2, 3, 4] },
  'GEO': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5, 10], mild: [3, 4, 6, 9, 11] },
  'ARM': { hot: [7, 8], cold: [12, 1, 2], snow: [12, 1, 2], rainy: [5], mild: [3, 4, 6, 9, 10, 11] },
  'AZE': { hot: [7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [4, 5, 10], mild: [3, 6, 9, 11] },
  
  // Additional Americas
  'ECU': { hot: [1, 2, 3, 4], cold: [], snow: [], rainy: [1, 2, 3, 4], mild: [5, 6, 7, 8, 9, 10, 11, 12] },
  'VEN': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2] },
  'PAN': { hot: [1, 2, 3, 4], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10, 11], mild: [12] },
  'GTM': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2] },
  'HND': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10, 11], mild: [12, 1, 2] },
  'NIC': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10, 11], mild: [12, 1, 2] },
  'SLV': { hot: [3, 4, 5], cold: [], snow: [], rainy: [5, 6, 7, 8, 9, 10], mild: [11, 12, 1, 2] },
  'BLZ': { hot: [4, 5, 6], cold: [], snow: [], rainy: [6, 7, 8, 9, 10, 11], mild: [12, 1, 2, 3] },
  'PRY': { hot: [12, 1, 2], cold: [6, 7, 8], snow: [], rainy: [10, 11], mild: [3, 4, 5, 9] },
  'URY': { hot: [12, 1, 2], cold: [6, 7, 8], snow: [], rainy: [4, 5], mild: [3, 9, 10, 11] },
  'BOL': { hot: [10, 11, 12, 1], cold: [6, 7], snow: [6, 7], rainy: [12, 1, 2, 3], mild: [4, 5, 8, 9] },
  'GUY': { hot: [9, 10, 11], cold: [], snow: [], rainy: [5, 6, 7, 12, 1], mild: [2, 3, 4, 8] },
  'SUR': { hot: [9, 10, 11], cold: [], snow: [], rainy: [4, 5, 6, 7, 12, 1], mild: [2, 3, 8] },
  'TTO': { hot: [1, 2, 3, 4, 5, 9, 10], cold: [], snow: [], rainy: [6, 7, 8, 11, 12], mild: [] },
  'BHS': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [5, 6, 9, 10, 11], mild: [12, 1, 2, 3, 4] },
  'BRB': { hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], cold: [], snow: [], rainy: [6, 7, 8, 9, 10, 11], mild: [] },
  'HTI': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [4, 5, 8, 9, 10, 11], mild: [12, 1, 2, 3] },
  'PRI': { hot: [6, 7, 8, 9], cold: [], snow: [], rainy: [8, 9, 10, 11], mild: [12, 1, 2, 3, 4, 5] },
  
  // Default for countries not listed
  'DEFAULT_TROPICAL': { hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], cold: [], snow: [], rainy: [6, 7, 8, 9], mild: [] },
  'DEFAULT_TEMPERATE': { hot: [6, 7, 8], cold: [12, 1, 2], snow: [1, 2], rainy: [3, 4, 10, 11], mild: [5, 9] },
};

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Month selector state
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const selectedMonthName = MONTH_NAMES[selectedMonth];
  const selectedMonthNum = selectedMonth + 1; // 1-12

  const fetchWeather = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    try {
      // Use realtime endpoint for live weather data
      const response = await axios.get(`${BACKEND_URL}/api/weather/realtime`);
      setWeatherData(response.data.data);
      setIsRealtime(response.data.realtime || false);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback to static weather endpoint
      try {
        const fallbackResponse = await axios.get(`${BACKEND_URL}/api/weather`);
        setWeatherData(fallbackResponse.data.data);
        setIsRealtime(false);
      } catch (fallbackError) {
        console.error('Error fetching fallback weather data:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleRefresh = () => {
    fetchWeather(true);
  };

  // Get anticipated weather for a country in selected month
  const getAnticipatedWeather = (countryCode) => {
    const data = anticipatedWeatherData[countryCode] || anticipatedWeatherData['DEFAULT_TEMPERATE'];
    
    if (data.hot.includes(selectedMonthNum)) return 'hot';
    if (data.snow.includes(selectedMonthNum)) return 'snow';
    if (data.cold.includes(selectedMonthNum)) return 'cold';
    if (data.rainy.includes(selectedMonthNum)) return 'rainy';
    if (data.mild.includes(selectedMonthNum)) return 'mild';
    return 'mild';
  };

  // Process weather data with anticipated weather for the map
  const processedWeatherData = useMemo(() => {
    return weatherData.map(country => ({
      ...country,
      weather_type: getAnticipatedWeather(country.country_code),
      anticipated: true
    }));
  }, [weatherData, selectedMonth]);

  const legends = [
    { color: '#E25A53', label: 'Hot', description: `Hot weather in ${selectedMonthName}`, icon: Sun },
    { color: '#FFFFFF', label: 'Snow/Cold', description: `Cold/snowy in ${selectedMonthName}`, border: true, icon: Snowflake },
    { color: '#4B89AC', label: 'Rainy', description: `Monsoon/rainy season`, icon: CloudRain },
    { color: '#87CEEB', label: 'Mild', description: 'Pleasant weather', icon: Wind },
    { color: '#E8E8E6', label: 'No Data', description: 'Information not available', icon: null }
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
              See anticipated weather conditions for any month. Select a month to see which countries will be hot, cold, snowy, or rainy.
            </p>
            {isRealtime && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live Weather Data
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-primary rounded-full text-sm font-medium hover:bg-accent/30 transition-colors disabled:opacity-50"
                  data-testid="refresh-weather-btn"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Month Selector */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-primary">Select Month to View Weather Forecast</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {MONTH_NAMES.map((month, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMonth(idx)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedMonth === idx
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid={`weather-month-${month.toLowerCase()}`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Showing anticipated weather conditions for <span className="font-bold text-primary">{selectedMonthName}</span>
            </p>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Weather Types for {selectedMonthName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {legends.map((legend) => (
                <div key={legend.label} className="legend-item" data-testid={`legend-${legend.label.toLowerCase().replace(/[/ ]/g, '-')}`}>
                  <div
                    className="legend-color flex items-center justify-center"
                    style={{ 
                      backgroundColor: legend.color,
                      border: legend.border ? '2px solid #D0D0D0' : 'none'
                    }}
                  >
                    {legend.icon && <legend.icon className={`w-4 h-4 ${legend.border ? 'text-blue-400' : 'text-white'}`} />}
                  </div>
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
              <WorldMap data={processedWeatherData} mode="weather" />
            )}
          </div>

          {/* Country List */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-primary mb-6">Weather by Country for {selectedMonthName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {processedWeatherData.map((country) => {
                const weatherType = country.weather_type;
                return (
                  <div
                    key={country.country_code}
                    className="bg-white rounded-lg p-4 border border-border hover:shadow-md transition-all"
                    data-testid={`weather-country-card-${country.country_code}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor:
                            weatherType === 'hot' ? '#E25A53' :
                            weatherType === 'snow' || weatherType === 'cold' ? '#FFFFFF' :
                            weatherType === 'rainy' ? '#4B89AC' :
                            '#87CEEB',
                          border: (weatherType === 'snow' || weatherType === 'cold') ? '2px solid #D0D0D0' : 'none'
                        }}
                      >
                        {weatherType === 'hot' && <Sun className="w-4 h-4 text-white" />}
                        {(weatherType === 'snow' || weatherType === 'cold') && <Snowflake className="w-4 h-4 text-blue-400" />}
                        {weatherType === 'rainy' && <CloudRain className="w-4 h-4 text-white" />}
                        {weatherType === 'mild' && <Wind className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                        <p className="text-sm text-muted-foreground capitalize mb-1">
                          {weatherType === 'snow' ? 'Cold/Snowy' : weatherType === 'cold' ? 'Cold' : weatherType}
                          {selectedMonth === today.getMonth() && country.avg_temp ? ` • ${country.avg_temp}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {country.description || `Typical ${weatherType} weather expected in ${selectedMonthName}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
      <BackToTop />
    </div>
  );
};

export default Weather;