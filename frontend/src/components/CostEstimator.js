import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Plane, Hotel, Utensils, Camera, ShoppingBag, Loader2, IndianRupee, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// Month data for scrollable selector
const MONTHS = [
  { value: 1, label: 'Jan', full: 'January' },
  { value: 2, label: 'Feb', full: 'February' },
  { value: 3, label: 'Mar', full: 'March' },
  { value: 4, label: 'Apr', full: 'April' },
  { value: 5, label: 'May', full: 'May' },
  { value: 6, label: 'Jun', full: 'June' },
  { value: 7, label: 'Jul', full: 'July' },
  { value: 8, label: 'Aug', full: 'August' },
  { value: 9, label: 'Sep', full: 'September' },
  { value: 10, label: 'Oct', full: 'October' },
  { value: 11, label: 'Nov', full: 'November' },
  { value: 12, label: 'Dec', full: 'December' }
];

// Seasonal multipliers (peak/shoulder/off-season)
const seasonalMultipliers = {
  'Thailand': { peak: [11, 12, 1, 2], shoulder: [3, 4, 10], off: [5, 6, 7, 8, 9] },
  'Indonesia': { peak: [6, 7, 8, 12], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11] },
  'Malaysia': { peak: [12, 1, 7], shoulder: [2, 3, 6, 8], off: [4, 5, 9, 10, 11] },
  'Singapore': { peak: [12, 1, 6], shoulder: [2, 3, 5, 7], off: [4, 8, 9, 10, 11] },
  'Vietnam': { peak: [12, 1, 2], shoulder: [3, 4, 10, 11], off: [5, 6, 7, 8, 9] },
  'Philippines': { peak: [12, 1, 4], shoulder: [2, 3, 11], off: [5, 6, 7, 8, 9, 10] },
  'Cambodia': { peak: [11, 12, 1, 2], shoulder: [3, 10], off: [4, 5, 6, 7, 8, 9] },
  'Laos': { peak: [11, 12, 1, 2], shoulder: [3, 10], off: [4, 5, 6, 7, 8, 9] },
  'Myanmar': { peak: [11, 12, 1, 2], shoulder: [3, 10], off: [4, 5, 6, 7, 8, 9] },
  'Japan': { peak: [3, 4, 10, 11], shoulder: [5, 9, 12], off: [1, 2, 6, 7, 8] },
  'South Korea': { peak: [4, 5, 9, 10], shoulder: [3, 6, 11], off: [1, 2, 7, 8, 12] },
  'China': { peak: [1, 2, 10], shoulder: [4, 5, 9], off: [3, 6, 7, 8, 11, 12] },
  'Taiwan': { peak: [2, 10, 11], shoulder: [1, 3, 4, 12], off: [5, 6, 7, 8, 9] },
  'Hong Kong': { peak: [10, 11, 12], shoulder: [1, 2, 3, 4], off: [5, 6, 7, 8, 9] },
  'Maldives': { peak: [12, 1, 2, 3], shoulder: [4, 11], off: [5, 6, 7, 8, 9, 10] },
  'Sri Lanka': { peak: [12, 1, 2], shoulder: [3, 7, 8], off: [4, 5, 6, 9, 10, 11] },
  'Nepal': { peak: [10, 11, 3], shoulder: [2, 4, 9, 12], off: [1, 5, 6, 7, 8] },
  'Bhutan': { peak: [3, 4, 9, 10, 11], shoulder: [2, 5, 12], off: [1, 6, 7, 8] },
  'UAE': { peak: [11, 12, 1, 2], shoulder: [3, 4, 10], off: [5, 6, 7, 8, 9] },
  'Turkey': { peak: [6, 7, 8], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11, 12] },
  'Jordan': { peak: [3, 4, 10, 11], shoulder: [2, 5, 9], off: [1, 6, 7, 8, 12] },
  'Israel': { peak: [3, 4, 9, 10], shoulder: [5, 11], off: [1, 2, 6, 7, 8, 12] },
  'Oman': { peak: [10, 11, 2], shoulder: [1, 3, 12], off: [4, 5, 6, 7, 8, 9] },
  'Qatar': { peak: [11, 12, 1], shoulder: [2, 3, 10], off: [4, 5, 6, 7, 8, 9] },
  'Saudi Arabia': { peak: [10, 11, 1], shoulder: [2, 3, 12], off: [4, 5, 6, 7, 8, 9] },
  'Egypt': { peak: [10, 11, 12], shoulder: [1, 2, 3, 4], off: [5, 6, 7, 8, 9] },
  'Morocco': { peak: [3, 4, 10, 11], shoulder: [2, 5, 9], off: [1, 6, 7, 8, 12] },
  'South Africa': { peak: [12, 1, 7], shoulder: [2, 6, 8, 11], off: [3, 4, 5, 9, 10] },
  'Kenya': { peak: [7, 8, 9], shoulder: [1, 2, 6, 10], off: [3, 4, 5, 11, 12] },
  'Tanzania': { peak: [6, 7, 8, 9, 10], shoulder: [1, 2, 11, 12], off: [3, 4, 5] },
  'Mauritius': { peak: [12, 1, 7], shoulder: [2, 6, 8, 11], off: [3, 4, 5, 9, 10] },
  'Greece': { peak: [6, 7, 8], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11, 12] },
  'Italy': { peak: [6, 7, 8], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11, 12] },
  'France': { peak: [6, 7, 8, 12], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11] },
  'Spain': { peak: [6, 7, 8], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11, 12] },
  'Portugal': { peak: [6, 7, 8], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11, 12] },
  'Switzerland': { peak: [7, 8, 12], shoulder: [1, 2, 6, 9], off: [3, 4, 5, 10, 11] },
  'Austria': { peak: [7, 8, 12], shoulder: [1, 2, 6, 9], off: [3, 4, 5, 10, 11] },
  'Germany': { peak: [6, 7, 12], shoulder: [5, 8, 9], off: [1, 2, 3, 4, 10, 11] },
  'United Kingdom': { peak: [6, 7, 8, 12], shoulder: [4, 5, 9], off: [1, 2, 3, 10, 11] },
  'Netherlands': { peak: [4, 5, 7], shoulder: [6, 8, 9], off: [1, 2, 3, 10, 11, 12] },
  'Belgium': { peak: [6, 7, 8], shoulder: [4, 5, 9], off: [1, 2, 3, 10, 11, 12] },
  'Czech Republic': { peak: [6, 7, 12], shoulder: [4, 5, 8, 9], off: [1, 2, 3, 10, 11] },
  'Hungary': { peak: [6, 7, 8], shoulder: [4, 5, 9], off: [1, 2, 3, 10, 11, 12] },
  'Poland': { peak: [6, 7, 8], shoulder: [5, 9], off: [1, 2, 3, 4, 10, 11, 12] },
  'Croatia': { peak: [6, 7, 8], shoulder: [5, 9], off: [1, 2, 3, 4, 10, 11, 12] },
  'Iceland': { peak: [6, 7, 8], shoulder: [5, 9], off: [1, 2, 3, 4, 10, 11, 12] },
  'Norway': { peak: [6, 7, 12], shoulder: [5, 8], off: [1, 2, 3, 4, 9, 10, 11] },
  'Sweden': { peak: [6, 7, 12], shoulder: [5, 8], off: [1, 2, 3, 4, 9, 10, 11] },
  'Finland': { peak: [6, 7, 12], shoulder: [8, 1, 2], off: [3, 4, 5, 9, 10, 11] },
  'Denmark': { peak: [6, 7, 8], shoulder: [5, 9], off: [1, 2, 3, 4, 10, 11, 12] },
  'Ireland': { peak: [6, 7, 8], shoulder: [5, 9], off: [1, 2, 3, 4, 10, 11, 12] },
  'United States': { peak: [6, 7, 12], shoulder: [3, 4, 5, 8, 9, 10, 11], off: [1, 2] },
  'Canada': { peak: [6, 7, 8], shoulder: [5, 9, 12], off: [1, 2, 3, 4, 10, 11] },
  'Mexico': { peak: [12, 1, 3], shoulder: [2, 4, 7, 8, 11], off: [5, 6, 9, 10] },
  'Brazil': { peak: [12, 1, 2], shoulder: [7, 11], off: [3, 4, 5, 6, 8, 9, 10] },
  'Argentina': { peak: [12, 1, 7], shoulder: [2, 3, 11], off: [4, 5, 6, 8, 9, 10] },
  'Peru': { peak: [6, 7, 8], shoulder: [4, 5, 9, 10], off: [1, 2, 3, 11, 12] },
  'Chile': { peak: [12, 1, 2], shoulder: [3, 11], off: [4, 5, 6, 7, 8, 9, 10] },
  'Colombia': { peak: [12, 1, 6], shoulder: [2, 3, 7, 8], off: [4, 5, 9, 10, 11] },
  'Costa Rica': { peak: [12, 1, 3], shoulder: [2, 4, 7, 8, 11], off: [5, 6, 9, 10] },
  'Cuba': { peak: [12, 1, 2], shoulder: [3, 4, 11], off: [5, 6, 7, 8, 9, 10] },
  'Australia': { peak: [12, 1, 7], shoulder: [2, 6, 8], off: [3, 4, 5, 9, 10, 11] },
  'New Zealand': { peak: [12, 1, 2], shoulder: [3, 11], off: [4, 5, 6, 7, 8, 9, 10] },
  'Fiji': { peak: [7, 8, 9], shoulder: [6, 10], off: [1, 2, 3, 4, 5, 11, 12] },
  'Mongolia': { peak: [6, 7, 8], shoulder: [5, 9], off: [1, 2, 3, 4, 10, 11, 12] },
  'Uzbekistan': { peak: [4, 5, 9, 10], shoulder: [3, 6, 11], off: [1, 2, 7, 8, 12] },
  'Kazakhstan': { peak: [5, 6, 9], shoulder: [4, 7, 8], off: [1, 2, 3, 10, 11, 12] },
  'Greenland': { peak: [6, 7, 8], shoulder: [5, 9], off: [1, 2, 3, 4, 10, 11, 12] },
  'Russia': { peak: [6, 7, 8], shoulder: [5, 9, 12], off: [1, 2, 3, 4, 10, 11] },
};

const CostEstimator = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const [formData, setFormData] = useState({
    country: '',
    duration: 7,
    travelers: 1,
    budget_type: 'mid_range',
    travel_month: currentMonth
  });

  // Country cost data (per day in INR) - Expanded to 60+ countries
  const countryData = {
    // Southeast Asia
    'Thailand': { budget: { hotel: 1500, food: 800, transport: 400, activities: 500, misc: 300 }, mid: { hotel: 4000, food: 1500, transport: 800, activities: 1200, misc: 600 }, luxury: { hotel: 12000, food: 3500, transport: 2000, activities: 3000, misc: 1500 }, flight: { budget: 15000, mid: 25000, luxury: 55000 } },
    'Indonesia': { budget: { hotel: 1200, food: 600, transport: 350, activities: 400, misc: 250 }, mid: { hotel: 3500, food: 1200, transport: 700, activities: 1000, misc: 500 }, luxury: { hotel: 10000, food: 3000, transport: 1800, activities: 2500, misc: 1200 }, flight: { budget: 18000, mid: 28000, luxury: 60000 } },
    'Malaysia': { budget: { hotel: 1800, food: 700, transport: 400, activities: 500, misc: 300 }, mid: { hotel: 4500, food: 1400, transport: 800, activities: 1200, misc: 600 }, luxury: { hotel: 12000, food: 3200, transport: 2000, activities: 2800, misc: 1400 }, flight: { budget: 12000, mid: 20000, luxury: 45000 } },
    'Singapore': { budget: { hotel: 4000, food: 1200, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 8000, food: 2500, transport: 1000, activities: 1800, misc: 800 }, luxury: { hotel: 20000, food: 5000, transport: 2500, activities: 4000, misc: 2000 }, flight: { budget: 10000, mid: 18000, luxury: 40000 } },
    'Vietnam': { budget: { hotel: 1000, food: 500, transport: 300, activities: 400, misc: 200 }, mid: { hotel: 2800, food: 1000, transport: 600, activities: 900, misc: 400 }, luxury: { hotel: 8000, food: 2500, transport: 1500, activities: 2200, misc: 1000 }, flight: { budget: 16000, mid: 26000, luxury: 55000 } },
    'Philippines': { budget: { hotel: 1200, food: 500, transport: 300, activities: 400, misc: 200 }, mid: { hotel: 3000, food: 1000, transport: 600, activities: 900, misc: 400 }, luxury: { hotel: 9000, food: 2500, transport: 1500, activities: 2200, misc: 1000 }, flight: { budget: 18000, mid: 28000, luxury: 60000 } },
    'Cambodia': { budget: { hotel: 800, food: 400, transport: 250, activities: 300, misc: 150 }, mid: { hotel: 2200, food: 800, transport: 500, activities: 700, misc: 300 }, luxury: { hotel: 7000, food: 2000, transport: 1200, activities: 1800, misc: 800 }, flight: { budget: 20000, mid: 32000, luxury: 70000 } },
    'Laos': { budget: { hotel: 700, food: 350, transport: 200, activities: 300, misc: 150 }, mid: { hotel: 2000, food: 700, transport: 400, activities: 600, misc: 300 }, luxury: { hotel: 6000, food: 1800, transport: 1000, activities: 1500, misc: 700 }, flight: { budget: 22000, mid: 35000, luxury: 75000 } },
    'Myanmar': { budget: { hotel: 900, food: 400, transport: 250, activities: 350, misc: 150 }, mid: { hotel: 2500, food: 800, transport: 500, activities: 800, misc: 350 }, luxury: { hotel: 7500, food: 2000, transport: 1200, activities: 2000, misc: 900 }, flight: { budget: 18000, mid: 30000, luxury: 65000 } },
    // East Asia
    'Japan': { budget: { hotel: 4000, food: 1500, transport: 1000, activities: 1200, misc: 500 }, mid: { hotel: 8000, food: 3000, transport: 1800, activities: 2500, misc: 1000 }, luxury: { hotel: 20000, food: 6000, transport: 4000, activities: 5000, misc: 2500 }, flight: { budget: 35000, mid: 55000, luxury: 120000 } },
    'South Korea': { budget: { hotel: 3000, food: 1200, transport: 800, activities: 1000, misc: 400 }, mid: { hotel: 6000, food: 2200, transport: 1500, activities: 2000, misc: 800 }, luxury: { hotel: 15000, food: 4500, transport: 3000, activities: 4000, misc: 2000 }, flight: { budget: 28000, mid: 45000, luxury: 100000 } },
    'China': { budget: { hotel: 2000, food: 800, transport: 500, activities: 600, misc: 300 }, mid: { hotel: 5000, food: 1500, transport: 1000, activities: 1500, misc: 700 }, luxury: { hotel: 12000, food: 3500, transport: 2500, activities: 3500, misc: 1700 }, flight: { budget: 22000, mid: 35000, luxury: 80000 } },
    'Taiwan': { budget: { hotel: 2500, food: 800, transport: 500, activities: 600, misc: 300 }, mid: { hotel: 5000, food: 1500, transport: 1000, activities: 1500, misc: 700 }, luxury: { hotel: 12000, food: 3500, transport: 2500, activities: 3500, misc: 1500 }, flight: { budget: 25000, mid: 40000, luxury: 90000 } },
    'Hong Kong': { budget: { hotel: 4000, food: 1200, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 8000, food: 2500, transport: 1000, activities: 1800, misc: 800 }, luxury: { hotel: 20000, food: 5000, transport: 2500, activities: 4000, misc: 2000 }, flight: { budget: 22000, mid: 35000, luxury: 80000 } },
    // South Asia
    'Maldives': { budget: { hotel: 6000, food: 2000, transport: 500, activities: 2000, misc: 500 }, mid: { hotel: 15000, food: 4000, transport: 1000, activities: 4000, misc: 1000 }, luxury: { hotel: 50000, food: 8000, transport: 3000, activities: 10000, misc: 3000 }, flight: { budget: 15000, mid: 25000, luxury: 55000 } },
    'Sri Lanka': { budget: { hotel: 1500, food: 600, transport: 400, activities: 500, misc: 250 }, mid: { hotel: 3500, food: 1200, transport: 800, activities: 1000, misc: 500 }, luxury: { hotel: 10000, food: 2800, transport: 1800, activities: 2500, misc: 1200 }, flight: { budget: 8000, mid: 14000, luxury: 30000 } },
    'Nepal': { budget: { hotel: 800, food: 400, transport: 300, activities: 400, misc: 200 }, mid: { hotel: 2000, food: 800, transport: 500, activities: 800, misc: 400 }, luxury: { hotel: 6000, food: 2000, transport: 1200, activities: 2000, misc: 800 }, flight: { budget: 8000, mid: 14000, luxury: 30000 } },
    'Bhutan': { budget: { hotel: 3000, food: 1500, transport: 800, activities: 1000, misc: 500 }, mid: { hotel: 8000, food: 3000, transport: 1500, activities: 2500, misc: 1000 }, luxury: { hotel: 18000, food: 5000, transport: 3000, activities: 5000, misc: 2000 }, flight: { budget: 18000, mid: 30000, luxury: 60000 } },
    // Middle East
    'UAE': { budget: { hotel: 3500, food: 1000, transport: 500, activities: 600, misc: 400 }, mid: { hotel: 7000, food: 2000, transport: 1000, activities: 1500, misc: 800 }, luxury: { hotel: 18000, food: 4500, transport: 2500, activities: 4000, misc: 2000 }, flight: { budget: 12000, mid: 22000, luxury: 50000 } },
    'Turkey': { budget: { hotel: 2500, food: 1000, transport: 500, activities: 600, misc: 300 }, mid: { hotel: 5500, food: 2000, transport: 1000, activities: 1500, misc: 700 }, luxury: { hotel: 14000, food: 4000, transport: 2500, activities: 3500, misc: 1500 }, flight: { budget: 25000, mid: 40000, luxury: 90000 } },
    'Jordan': { budget: { hotel: 2000, food: 800, transport: 400, activities: 800, misc: 300 }, mid: { hotel: 5000, food: 1500, transport: 800, activities: 2000, misc: 700 }, luxury: { hotel: 12000, food: 3500, transport: 2000, activities: 4000, misc: 1500 }, flight: { budget: 22000, mid: 38000, luxury: 85000 } },
    'Israel': { budget: { hotel: 4000, food: 1500, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 8000, food: 3000, transport: 1200, activities: 2000, misc: 800 }, luxury: { hotel: 18000, food: 5500, transport: 2500, activities: 4000, misc: 2000 }, flight: { budget: 28000, mid: 45000, luxury: 100000 } },
    'Oman': { budget: { hotel: 2500, food: 900, transport: 500, activities: 600, misc: 300 }, mid: { hotel: 6000, food: 1800, transport: 1000, activities: 1500, misc: 700 }, luxury: { hotel: 15000, food: 4000, transport: 2500, activities: 3500, misc: 1500 }, flight: { budget: 15000, mid: 25000, luxury: 55000 } },
    'Qatar': { budget: { hotel: 4000, food: 1200, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 8000, food: 2500, transport: 1200, activities: 2000, misc: 800 }, luxury: { hotel: 20000, food: 5500, transport: 3000, activities: 4500, misc: 2000 }, flight: { budget: 18000, mid: 30000, luxury: 70000 } },
    'Saudi Arabia': { budget: { hotel: 3000, food: 1000, transport: 500, activities: 600, misc: 300 }, mid: { hotel: 7000, food: 2000, transport: 1000, activities: 1500, misc: 700 }, luxury: { hotel: 18000, food: 4500, transport: 2500, activities: 4000, misc: 2000 }, flight: { budget: 18000, mid: 30000, luxury: 70000 } },
    // Africa
    'Egypt': { budget: { hotel: 1800, food: 700, transport: 400, activities: 600, misc: 300 }, mid: { hotel: 4000, food: 1400, transport: 800, activities: 1200, misc: 600 }, luxury: { hotel: 10000, food: 3000, transport: 2000, activities: 3000, misc: 1500 }, flight: { budget: 20000, mid: 35000, luxury: 80000 } },
    'Morocco': { budget: { hotel: 1500, food: 600, transport: 400, activities: 500, misc: 300 }, mid: { hotel: 3500, food: 1200, transport: 800, activities: 1200, misc: 600 }, luxury: { hotel: 10000, food: 3000, transport: 2000, activities: 3000, misc: 1500 }, flight: { budget: 28000, mid: 45000, luxury: 100000 } },
    'South Africa': { budget: { hotel: 2500, food: 1000, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 5500, food: 2000, transport: 1200, activities: 1800, misc: 800 }, luxury: { hotel: 14000, food: 4500, transport: 3000, activities: 4000, misc: 2000 }, flight: { budget: 35000, mid: 55000, luxury: 120000 } },
    'Kenya': { budget: { hotel: 2000, food: 800, transport: 500, activities: 1500, misc: 400 }, mid: { hotel: 5000, food: 1500, transport: 1000, activities: 3500, misc: 800 }, luxury: { hotel: 15000, food: 3500, transport: 2500, activities: 8000, misc: 2000 }, flight: { budget: 30000, mid: 50000, luxury: 110000 } },
    'Tanzania': { budget: { hotel: 2000, food: 800, transport: 500, activities: 1500, misc: 400 }, mid: { hotel: 5000, food: 1500, transport: 1000, activities: 4000, misc: 800 }, luxury: { hotel: 18000, food: 4000, transport: 2500, activities: 10000, misc: 2500 }, flight: { budget: 32000, mid: 52000, luxury: 115000 } },
    'Mauritius': { budget: { hotel: 3000, food: 1200, transport: 500, activities: 800, misc: 400 }, mid: { hotel: 7000, food: 2500, transport: 1000, activities: 2000, misc: 800 }, luxury: { hotel: 18000, food: 5000, transport: 2500, activities: 5000, misc: 2000 }, flight: { budget: 28000, mid: 45000, luxury: 100000 } },
    // Europe
    'Greece': { budget: { hotel: 4000, food: 1500, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 8000, food: 3000, transport: 1200, activities: 2000, misc: 800 }, luxury: { hotel: 18000, food: 5500, transport: 2500, activities: 4000, misc: 2000 }, flight: { budget: 35000, mid: 55000, luxury: 120000 } },
    'Italy': { budget: { hotel: 5000, food: 2000, transport: 800, activities: 1000, misc: 500 }, mid: { hotel: 10000, food: 3500, transport: 1500, activities: 2500, misc: 1000 }, luxury: { hotel: 25000, food: 7000, transport: 3500, activities: 5000, misc: 2500 }, flight: { budget: 40000, mid: 65000, luxury: 140000 } },
    'France': { budget: { hotel: 5500, food: 2200, transport: 900, activities: 1200, misc: 600 }, mid: { hotel: 12000, food: 4000, transport: 1800, activities: 2800, misc: 1200 }, luxury: { hotel: 30000, food: 8000, transport: 4000, activities: 6000, misc: 3000 }, flight: { budget: 38000, mid: 60000, luxury: 130000 } },
    'Spain': { budget: { hotel: 4500, food: 1800, transport: 700, activities: 900, misc: 450 }, mid: { hotel: 9000, food: 3200, transport: 1400, activities: 2200, misc: 900 }, luxury: { hotel: 22000, food: 6500, transport: 3200, activities: 4500, misc: 2200 }, flight: { budget: 35000, mid: 55000, luxury: 120000 } },
    'Portugal': { budget: { hotel: 3500, food: 1500, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 7000, food: 2800, transport: 1200, activities: 1800, misc: 800 }, luxury: { hotel: 16000, food: 5500, transport: 2800, activities: 4000, misc: 1800 }, flight: { budget: 38000, mid: 60000, luxury: 130000 } },
    'Switzerland': { budget: { hotel: 8000, food: 3000, transport: 1500, activities: 1500, misc: 800 }, mid: { hotel: 15000, food: 5000, transport: 2500, activities: 3500, misc: 1500 }, luxury: { hotel: 35000, food: 10000, transport: 5000, activities: 8000, misc: 4000 }, flight: { budget: 45000, mid: 70000, luxury: 150000 } },
    'Austria': { budget: { hotel: 5000, food: 2000, transport: 800, activities: 1000, misc: 500 }, mid: { hotel: 10000, food: 3500, transport: 1500, activities: 2500, misc: 1000 }, luxury: { hotel: 25000, food: 7000, transport: 3500, activities: 5000, misc: 2500 }, flight: { budget: 42000, mid: 65000, luxury: 140000 } },
    'Germany': { budget: { hotel: 4500, food: 1800, transport: 800, activities: 1000, misc: 500 }, mid: { hotel: 9000, food: 3200, transport: 1500, activities: 2200, misc: 1000 }, luxury: { hotel: 22000, food: 6500, transport: 3500, activities: 4500, misc: 2500 }, flight: { budget: 38000, mid: 60000, luxury: 130000 } },
    'United Kingdom': { budget: { hotel: 5000, food: 2000, transport: 1000, activities: 1200, misc: 600 }, mid: { hotel: 10000, food: 3500, transport: 2000, activities: 2500, misc: 1200 }, luxury: { hotel: 25000, food: 7000, transport: 4000, activities: 5500, misc: 3000 }, flight: { budget: 40000, mid: 65000, luxury: 140000 } },
    'Netherlands': { budget: { hotel: 5000, food: 1800, transport: 600, activities: 900, misc: 450 }, mid: { hotel: 10000, food: 3200, transport: 1200, activities: 2000, misc: 900 }, luxury: { hotel: 24000, food: 6500, transport: 2800, activities: 4200, misc: 2200 }, flight: { budget: 40000, mid: 62000, luxury: 135000 } },
    'Belgium': { budget: { hotel: 4500, food: 1700, transport: 600, activities: 800, misc: 400 }, mid: { hotel: 9000, food: 3000, transport: 1200, activities: 1800, misc: 800 }, luxury: { hotel: 22000, food: 6000, transport: 2800, activities: 4000, misc: 2000 }, flight: { budget: 40000, mid: 62000, luxury: 135000 } },
    'Czech Republic': { budget: { hotel: 3000, food: 1200, transport: 500, activities: 700, misc: 350 }, mid: { hotel: 6000, food: 2200, transport: 1000, activities: 1500, misc: 700 }, luxury: { hotel: 15000, food: 4500, transport: 2500, activities: 3500, misc: 1800 }, flight: { budget: 38000, mid: 58000, luxury: 125000 } },
    'Hungary': { budget: { hotel: 2500, food: 1000, transport: 400, activities: 600, misc: 300 }, mid: { hotel: 5500, food: 2000, transport: 800, activities: 1400, misc: 600 }, luxury: { hotel: 14000, food: 4000, transport: 2000, activities: 3200, misc: 1500 }, flight: { budget: 38000, mid: 58000, luxury: 125000 } },
    'Poland': { budget: { hotel: 2500, food: 1000, transport: 400, activities: 600, misc: 300 }, mid: { hotel: 5500, food: 2000, transport: 900, activities: 1400, misc: 600 }, luxury: { hotel: 14000, food: 4000, transport: 2200, activities: 3200, misc: 1500 }, flight: { budget: 38000, mid: 58000, luxury: 125000 } },
    'Croatia': { budget: { hotel: 3500, food: 1400, transport: 500, activities: 700, misc: 350 }, mid: { hotel: 7000, food: 2600, transport: 1000, activities: 1700, misc: 700 }, luxury: { hotel: 18000, food: 5500, transport: 2500, activities: 4000, misc: 1800 }, flight: { budget: 40000, mid: 62000, luxury: 135000 } },
    'Iceland': { budget: { hotel: 7000, food: 2800, transport: 1500, activities: 1500, misc: 800 }, mid: { hotel: 14000, food: 5000, transport: 3000, activities: 3500, misc: 1500 }, luxury: { hotel: 35000, food: 10000, transport: 6000, activities: 8000, misc: 4000 }, flight: { budget: 50000, mid: 80000, luxury: 170000 } },
    'Norway': { budget: { hotel: 6500, food: 2500, transport: 1200, activities: 1200, misc: 600 }, mid: { hotel: 12000, food: 4500, transport: 2500, activities: 3000, misc: 1200 }, luxury: { hotel: 30000, food: 9000, transport: 5000, activities: 7000, misc: 3000 }, flight: { budget: 45000, mid: 70000, luxury: 150000 } },
    'Sweden': { budget: { hotel: 5500, food: 2200, transport: 1000, activities: 1000, misc: 500 }, mid: { hotel: 11000, food: 4000, transport: 2000, activities: 2500, misc: 1000 }, luxury: { hotel: 28000, food: 8000, transport: 4500, activities: 6000, misc: 2500 }, flight: { budget: 42000, mid: 65000, luxury: 140000 } },
    'Finland': { budget: { hotel: 5000, food: 2000, transport: 900, activities: 1000, misc: 500 }, mid: { hotel: 10000, food: 3800, transport: 1800, activities: 2500, misc: 1000 }, luxury: { hotel: 25000, food: 7500, transport: 4000, activities: 6000, misc: 2500 }, flight: { budget: 42000, mid: 65000, luxury: 140000 } },
    'Denmark': { budget: { hotel: 5500, food: 2200, transport: 900, activities: 1000, misc: 500 }, mid: { hotel: 11000, food: 4000, transport: 1800, activities: 2500, misc: 1000 }, luxury: { hotel: 28000, food: 8000, transport: 4000, activities: 6000, misc: 2500 }, flight: { budget: 42000, mid: 65000, luxury: 140000 } },
    'Ireland': { budget: { hotel: 5000, food: 2000, transport: 800, activities: 1000, misc: 500 }, mid: { hotel: 10000, food: 3500, transport: 1600, activities: 2200, misc: 1000 }, luxury: { hotel: 25000, food: 7000, transport: 3500, activities: 5000, misc: 2500 }, flight: { budget: 42000, mid: 65000, luxury: 140000 } },
    // Americas
    'United States': { budget: { hotel: 6000, food: 2500, transport: 1200, activities: 1500, misc: 800 }, mid: { hotel: 12000, food: 4500, transport: 2500, activities: 3500, misc: 1500 }, luxury: { hotel: 30000, food: 9000, transport: 5000, activities: 7000, misc: 4000 }, flight: { budget: 55000, mid: 85000, luxury: 180000 } },
    'Canada': { budget: { hotel: 5500, food: 2200, transport: 1000, activities: 1200, misc: 600 }, mid: { hotel: 11000, food: 4000, transport: 2000, activities: 3000, misc: 1200 }, luxury: { hotel: 28000, food: 8000, transport: 4500, activities: 6500, misc: 3000 }, flight: { budget: 55000, mid: 85000, luxury: 180000 } },
    'Mexico': { budget: { hotel: 2000, food: 800, transport: 400, activities: 600, misc: 300 }, mid: { hotel: 5000, food: 1600, transport: 900, activities: 1500, misc: 700 }, luxury: { hotel: 14000, food: 4000, transport: 2200, activities: 3800, misc: 1800 }, flight: { budget: 55000, mid: 80000, luxury: 170000 } },
    'Brazil': { budget: { hotel: 2500, food: 1000, transport: 500, activities: 700, misc: 350 }, mid: { hotel: 6000, food: 2000, transport: 1100, activities: 1700, misc: 700 }, luxury: { hotel: 15000, food: 4500, transport: 2800, activities: 4000, misc: 1800 }, flight: { budget: 50000, mid: 75000, luxury: 160000 } },
    'Argentina': { budget: { hotel: 2000, food: 800, transport: 400, activities: 600, misc: 300 }, mid: { hotel: 5000, food: 1800, transport: 900, activities: 1500, misc: 700 }, luxury: { hotel: 14000, food: 4000, transport: 2200, activities: 3800, misc: 1800 }, flight: { budget: 55000, mid: 85000, luxury: 180000 } },
    'Peru': { budget: { hotel: 1800, food: 700, transport: 350, activities: 600, misc: 300 }, mid: { hotel: 4500, food: 1500, transport: 800, activities: 1500, misc: 600 }, luxury: { hotel: 12000, food: 3500, transport: 2000, activities: 3500, misc: 1500 }, flight: { budget: 55000, mid: 85000, luxury: 180000 } },
    'Chile': { budget: { hotel: 2500, food: 1000, transport: 500, activities: 700, misc: 350 }, mid: { hotel: 6000, food: 2000, transport: 1100, activities: 1700, misc: 700 }, luxury: { hotel: 16000, food: 4500, transport: 2800, activities: 4000, misc: 1800 }, flight: { budget: 60000, mid: 90000, luxury: 190000 } },
    'Colombia': { budget: { hotel: 1800, food: 700, transport: 350, activities: 500, misc: 250 }, mid: { hotel: 4500, food: 1500, transport: 800, activities: 1300, misc: 550 }, luxury: { hotel: 12000, food: 3500, transport: 2000, activities: 3200, misc: 1400 }, flight: { budget: 55000, mid: 85000, luxury: 180000 } },
    'Costa Rica': { budget: { hotel: 2500, food: 1000, transport: 500, activities: 800, misc: 400 }, mid: { hotel: 6000, food: 2000, transport: 1100, activities: 2000, misc: 800 }, luxury: { hotel: 16000, food: 4500, transport: 2800, activities: 5000, misc: 2000 }, flight: { budget: 58000, mid: 88000, luxury: 185000 } },
    'Cuba': { budget: { hotel: 2000, food: 700, transport: 350, activities: 500, misc: 250 }, mid: { hotel: 5000, food: 1500, transport: 800, activities: 1300, misc: 550 }, luxury: { hotel: 14000, food: 3500, transport: 2000, activities: 3000, misc: 1400 }, flight: { budget: 60000, mid: 90000, luxury: 190000 } },
    // Oceania
    'Australia': { budget: { hotel: 5000, food: 2200, transport: 1000, activities: 1200, misc: 600 }, mid: { hotel: 10000, food: 4000, transport: 2000, activities: 3000, misc: 1200 }, luxury: { hotel: 25000, food: 8000, transport: 4500, activities: 6000, misc: 3000 }, flight: { budget: 45000, mid: 70000, luxury: 150000 } },
    'New Zealand': { budget: { hotel: 4500, food: 2000, transport: 1200, activities: 1500, misc: 600 }, mid: { hotel: 9000, food: 3500, transport: 2200, activities: 3000, misc: 1200 }, luxury: { hotel: 22000, food: 7000, transport: 4500, activities: 6000, misc: 3000 }, flight: { budget: 50000, mid: 80000, luxury: 170000 } },
    'Fiji': { budget: { hotel: 3000, food: 1200, transport: 500, activities: 1000, misc: 400 }, mid: { hotel: 8000, food: 2500, transport: 1200, activities: 2500, misc: 900 }, luxury: { hotel: 22000, food: 5500, transport: 3000, activities: 6000, misc: 2500 }, flight: { budget: 48000, mid: 75000, luxury: 160000 } },
    // Central Asia
    'Mongolia': { budget: { hotel: 1500, food: 600, transport: 400, activities: 600, misc: 300 }, mid: { hotel: 4000, food: 1200, transport: 900, activities: 1500, misc: 600 }, luxury: { hotel: 10000, food: 3000, transport: 2200, activities: 3500, misc: 1500 }, flight: { budget: 32000, mid: 50000, luxury: 110000 } },
    'Uzbekistan': { budget: { hotel: 1200, food: 500, transport: 300, activities: 400, misc: 200 }, mid: { hotel: 3000, food: 1000, transport: 600, activities: 1000, misc: 400 }, luxury: { hotel: 8000, food: 2500, transport: 1500, activities: 2500, misc: 1000 }, flight: { budget: 28000, mid: 45000, luxury: 100000 } },
    'Kazakhstan': { budget: { hotel: 2000, food: 800, transport: 400, activities: 500, misc: 300 }, mid: { hotel: 5000, food: 1500, transport: 900, activities: 1300, misc: 600 }, luxury: { hotel: 12000, food: 3500, transport: 2200, activities: 3200, misc: 1500 }, flight: { budget: 30000, mid: 48000, luxury: 105000 } },
    'Greenland': { budget: { hotel: 8000, food: 3000, transport: 2000, activities: 2000, misc: 1000 }, mid: { hotel: 16000, food: 5500, transport: 4000, activities: 4500, misc: 2000 }, luxury: { hotel: 40000, food: 12000, transport: 8000, activities: 10000, misc: 5000 }, flight: { budget: 65000, mid: 100000, luxury: 200000 } },
    'Russia': { budget: { hotel: 2500, food: 1000, transport: 500, activities: 700, misc: 350 }, mid: { hotel: 6000, food: 2200, transport: 1100, activities: 1700, misc: 700 }, luxury: { hotel: 15000, food: 5000, transport: 2800, activities: 4000, misc: 1800 }, flight: { budget: 28000, mid: 45000, luxury: 100000 } },
  };

  const countries = Object.keys(countryData).sort();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'duration' || name === 'travelers' || name === 'travel_month' ? parseInt(value) : value }));
  };

  const getSeasonMultiplier = (country, month) => {
    const seasons = seasonalMultipliers[country];
    if (!seasons) return { multiplier: 1, season: 'regular' };
    
    if (seasons.peak.includes(month)) return { multiplier: 1.25, season: 'peak' };
    if (seasons.off.includes(month)) return { multiplier: 0.8, season: 'off' };
    return { multiplier: 1, season: 'shoulder' };
  };

  const calculateCost = () => {
    if (!formData.country || !countryData[formData.country]) return;
    
    setLoading(true);
    setTimeout(() => {
      const data = countryData[formData.country];
      const budgetKey = formData.budget_type === 'budget' ? 'budget' : formData.budget_type === 'mid_range' ? 'mid' : 'luxury';
      const dailyCosts = data[budgetKey];
      const flightCost = data.flight[budgetKey];
      
      // Get seasonal multiplier
      const { multiplier, season } = getSeasonMultiplier(formData.country, formData.travel_month);
      
      const perDayTotal = Object.values(dailyCosts).reduce((a, b) => a + b, 0);
      const adjustedPerDay = Math.round(perDayTotal * multiplier);
      const totalDailyCost = adjustedPerDay * formData.duration * formData.travelers;
      const totalFlightCost = Math.round(flightCost * multiplier * formData.travelers);
      const grandTotal = totalDailyCost + totalFlightCost;
      
      setResult({
        country: formData.country,
        duration: formData.duration,
        travelers: formData.travelers,
        budget_type: formData.budget_type,
        travel_month: formData.travel_month,
        season: season,
        seasonMultiplier: multiplier,
        breakdown: {
          flight: totalFlightCost,
          hotel: Math.round(dailyCosts.hotel * multiplier * formData.duration * formData.travelers),
          food: Math.round(dailyCosts.food * multiplier * formData.duration * formData.travelers),
          transport: Math.round(dailyCosts.transport * multiplier * formData.duration * formData.travelers),
          activities: Math.round(dailyCosts.activities * multiplier * formData.duration * formData.travelers),
          misc: Math.round(dailyCosts.misc * multiplier * formData.duration * formData.travelers)
        },
        perDayPerPerson: adjustedPerDay,
        totalDailyCost,
        totalFlightCost,
        grandTotal
      });
      setLoading(false);
    }, 500);
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const getBudgetLabel = (type) => {
    switch(type) {
      case 'budget': return 'Budget';
      case 'mid_range': return 'Mid-Range';
      case 'luxury': return 'Luxury';
      default: return type;
    }
  };

  const resetForm = () => {
    setResult(null);
    setFormData({
      country: '',
      duration: 7,
      travelers: 1,
      budget_type: 'mid_range',
      travel_month: currentMonth
    });
  };

  const scrollMonth = (direction) => {
    setFormData(prev => {
      let newMonth = prev.travel_month + direction;
      if (newMonth > 12) newMonth = 1;
      if (newMonth < 1) newMonth = 12;
      return { ...prev, travel_month: newMonth };
    });
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="cost-estimator-modal"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Trip Cost Estimator</h2>
                  <p className="text-purple-100 text-sm">Plan your budget for your next adventure</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      data-testid="cost-country-select"
                    >
                      <option value="">Select country</option>
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Month Selector */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Travel Month
                    </label>
                    <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl p-3">
                      <button
                        type="button"
                        onClick={() => scrollMonth(-1)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-all"
                        data-testid="month-prev-btn"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      <div className="flex gap-1 overflow-hidden">
                        {MONTHS.map((month) => (
                          <button
                            key={month.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, travel_month: month.value }))}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              formData.travel_month === month.value
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-purple-50'
                            }`}
                            data-testid={`month-btn-${month.label.toLowerCase()}`}
                          >
                            {month.label}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => scrollMonth(1)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-all"
                        data-testid="month-next-btn"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    {formData.country && seasonalMultipliers[formData.country] && (
                      <div className="mt-2 text-center">
                        {(() => {
                          const { season } = getSeasonMultiplier(formData.country, formData.travel_month);
                          return (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              season === 'peak' ? 'bg-red-100 text-red-700' :
                              season === 'off' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {season === 'peak' ? '🔥 Peak Season (+25% costs)' :
                               season === 'off' ? '💰 Off Season (-20% costs)' :
                               '⚖️ Shoulder Season (Regular prices)'}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Duration (Days)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="90"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Travelers</label>
                    <input
                      type="number"
                      name="travelers"
                      value={formData.travelers}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Budget Type</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'budget', label: 'Budget', desc: 'Hostels, street food, public transport', color: 'green' },
                        { id: 'mid_range', label: 'Mid-Range', desc: '3-4 star hotels, restaurants, taxis', color: 'blue' },
                        { id: 'luxury', label: 'Luxury', desc: '5-star hotels, fine dining, private tours', color: 'purple' }
                      ].map(option => (
                        <div
                          key={option.id}
                          onClick={() => setFormData(prev => ({ ...prev, budget_type: option.id }))}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.budget_type === option.id 
                              ? `border-${option.color}-500 bg-${option.color}-50` 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`font-semibold ${formData.budget_type === option.id ? `text-${option.color}-700` : 'text-gray-800'}`}>
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={calculateCost}
                  disabled={!formData.country || loading}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Calculate Trip Cost
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Header */}
                <div className="text-center pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {result.duration}-Day Trip to {result.country}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {result.travelers} traveler{result.travelers > 1 ? 's' : ''} • {getBudgetLabel(result.budget_type)} Budget • {MONTHS.find(m => m.value === result.travel_month)?.full}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    result.season === 'peak' ? 'bg-red-100 text-red-700' :
                    result.season === 'off' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.season === 'peak' ? '🔥 Peak Season' :
                     result.season === 'off' ? '💰 Off Season (Best Value!)' :
                     '⚖️ Shoulder Season'}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 text-center">
                  <div className="text-sm text-purple-600 font-medium mb-1">Estimated Total Cost</div>
                  <div className="text-4xl font-bold text-purple-700 flex items-center justify-center gap-2">
                    <IndianRupee className="w-8 h-8" />
                    {formatINR(result.grandTotal).replace('₹', '')}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formatINR(result.perDayPerPerson)} per person per day
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Cost Breakdown</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Plane className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Flights (Round Trip)</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatINR(result.breakdown.flight)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Hotel className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Accommodation</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatINR(result.breakdown.hotel)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Utensils className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-700">Food & Dining</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatINR(result.breakdown.food)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Activities & Tours</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatINR(result.breakdown.activities)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      <span className="text-gray-700">Local Transport</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatINR(result.breakdown.transport)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Shopping & Miscellaneous</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatINR(result.breakdown.misc)}</span>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">💡 Money Saving Tips</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Book flights 2-3 months in advance for best prices</li>
                    <li>• Consider traveling during shoulder season</li>
                    <li>• Use local transport apps for cheaper rides</li>
                    <li>• Look for accommodation with breakfast included</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    Calculate Another
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CostEstimator;
