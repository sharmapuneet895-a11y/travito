import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import CountryDetailModal from '../components/CountryDetailModal';
import CostEstimator from '../components/CostEstimator';
import BackToTop from '../components/BackToTop';
import { Calendar, Sun, CloudSun, Cloud, Search, MapPin, Heart, Palmtree, Mountain, Building2, Compass, Landmark, Trees, Calculator, Snowflake, Sparkles, CloudRain, Wind, ThermometerSun } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Month abbreviations
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Category definitions with specific colors
const CATEGORIES = [
  { id: 'all', label: 'All Peak Destinations', icon: Compass, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700', activeColor: 'bg-gray-700 text-white' },
  { id: 'beach', label: 'Beach', icon: Palmtree, color: 'cyan', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700', activeColor: 'bg-cyan-500 text-white' },
  { id: 'mountain', label: 'Mountain', icon: Mountain, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', activeColor: 'bg-green-700 text-white' },
  { id: 'snow', label: 'Snowy Experience', icon: Snowflake, color: 'sky', bgColor: 'bg-sky-100', textColor: 'text-sky-700', activeColor: 'bg-sky-500 text-white' },
  { id: 'city', label: 'City', icon: Building2, color: 'slate', bgColor: 'bg-slate-100', textColor: 'text-slate-700', activeColor: 'bg-slate-600 text-white' },
  { id: 'culture', label: 'Culture', icon: Landmark, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', activeColor: 'bg-purple-600 text-white' },
  { id: 'adventure', label: 'Adventure', icon: Compass, color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', activeColor: 'bg-orange-500 text-white' },
  { id: 'nature', label: 'Nature', icon: Trees, color: 'lime', bgColor: 'bg-lime-100', textColor: 'text-lime-700', activeColor: 'bg-lime-500 text-white' },
];

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
  return `https://flagcdn.com/w40/${iso2}.png`;
};

// Top destinations with ratings and highlights for each month
const topDestinationsData = {
  'Jan': [
    { code: 'THA', name: 'Thailand', highlight: 'Perfect beach weather, festivals', rating: 4.9, category: 'beach' },
    { code: 'MDV', name: 'Maldives', highlight: 'Dry season, clear waters', rating: 4.8, category: 'beach' },
    { code: 'LKA', name: 'Sri Lanka', highlight: 'Cultural festivals, wildlife', rating: 4.7, category: 'culture' },
    { code: 'UAE', name: 'UAE', highlight: 'Dubai Shopping Festival', rating: 4.6, category: 'city' },
    { code: 'AUS', name: 'Australia', highlight: 'Summer, beaches', rating: 4.5, category: 'adventure' },
  ],
  'Feb': [
    { code: 'BRA', name: 'Brazil', highlight: 'Rio Carnival', rating: 4.9, category: 'culture' },
    { code: 'THA', name: 'Thailand', highlight: 'Ideal weather continues', rating: 4.8, category: 'beach' },
    { code: 'ITA', name: 'Italy', highlight: 'Venice Carnival', rating: 4.7, category: 'culture' },
    { code: 'VNM', name: 'Vietnam', highlight: 'Tet celebrations', rating: 4.6, category: 'culture' },
    { code: 'NZL', name: 'New Zealand', highlight: 'Summer hiking', rating: 4.5, category: 'adventure' },
  ],
  'Mar': [
    { code: 'JPN', name: 'Japan', highlight: 'Cherry blossom season', rating: 4.9, category: 'nature' },
    { code: 'IND', name: 'India', highlight: 'Holi festival', rating: 4.8, category: 'culture' },
    { code: 'EGY', name: 'Egypt', highlight: 'Perfect weather', rating: 4.7, category: 'culture' },
    { code: 'MAR', name: 'Morocco', highlight: 'Spring bloom', rating: 4.6, category: 'adventure' },
    { code: 'PER', name: 'Peru', highlight: 'Machu Picchu ideal', rating: 4.5, category: 'adventure' },
  ],
  'Apr': [
    { code: 'JPN', name: 'Japan', highlight: 'Peak cherry blossoms', rating: 4.9, category: 'nature' },
    { code: 'NLD', name: 'Netherlands', highlight: 'Tulip season', rating: 4.8, category: 'nature' },
    { code: 'THA', name: 'Thailand', highlight: 'Songkran festival', rating: 4.7, category: 'culture' },
    { code: 'GRC', name: 'Greece', highlight: 'Easter celebrations', rating: 4.6, category: 'culture' },
    { code: 'TUR', name: 'Turkey', highlight: 'Spring weather', rating: 4.5, category: 'culture' },
  ],
  'May': [
    { code: 'FRA', name: 'France', highlight: 'Cannes Film Festival', rating: 4.9, category: 'culture' },
    { code: 'ITA', name: 'Italy', highlight: 'Perfect weather', rating: 4.8, category: 'culture' },
    { code: 'ESP', name: 'Spain', highlight: 'Spring festivals', rating: 4.7, category: 'culture' },
    { code: 'PRT', name: 'Portugal', highlight: 'Beach season starts', rating: 4.6, category: 'beach' },
    { code: 'KOR', name: 'South Korea', highlight: 'Buddha\'s birthday', rating: 4.5, category: 'culture' },
  ],
  'Jun': [
    { code: 'GRC', name: 'Greece', highlight: 'Island hopping', rating: 4.9, category: 'beach' },
    { code: 'HRV', name: 'Croatia', highlight: 'Adriatic beaches', rating: 4.8, category: 'beach' },
    { code: 'ISL', name: 'Iceland', highlight: 'Midnight sun', rating: 4.7, category: 'nature' },
    { code: 'NOR', name: 'Norway', highlight: 'Fjords, midnight sun', rating: 4.6, category: 'nature' },
    { code: 'KEN', name: 'Kenya', highlight: 'Great Migration starts', rating: 4.5, category: 'adventure' },
  ],
  'Jul': [
    { code: 'KEN', name: 'Kenya', highlight: 'Great Migration peak', rating: 4.9, category: 'adventure' },
    { code: 'TZA', name: 'Tanzania', highlight: 'Serengeti migration', rating: 4.8, category: 'adventure' },
    { code: 'FRA', name: 'France', highlight: 'Lavender fields', rating: 4.7, category: 'nature' },
    { code: 'CHE', name: 'Switzerland', highlight: 'Alpine hiking', rating: 4.6, category: 'mountain' },
    { code: 'CAN', name: 'Canada', highlight: 'Summer festivals', rating: 4.5, category: 'nature' },
  ],
  'Aug': [
    { code: 'ESP', name: 'Spain', highlight: 'La Tomatina', rating: 4.9, category: 'culture' },
    { code: 'IDN', name: 'Indonesia', highlight: 'Bali dry season', rating: 4.8, category: 'beach' },
    { code: 'SWE', name: 'Sweden', highlight: 'Crayfish parties', rating: 4.7, category: 'culture' },
    { code: 'MNG', name: 'Mongolia', highlight: 'Naadam festival', rating: 4.6, category: 'adventure' },
    { code: 'AUT', name: 'Austria', highlight: 'Salzburg Festival', rating: 4.5, category: 'culture' },
  ],
  'Sep': [
    { code: 'DEU', name: 'Germany', highlight: 'Oktoberfest starts', rating: 4.9, category: 'culture' },
    { code: 'FRA', name: 'France', highlight: 'Wine harvest', rating: 4.8, category: 'culture' },
    { code: 'CHN', name: 'China', highlight: 'Mid-Autumn Festival', rating: 4.7, category: 'culture' },
    { code: 'TUR', name: 'Turkey', highlight: 'Perfect weather', rating: 4.6, category: 'culture' },
    { code: 'PRT', name: 'Portugal', highlight: 'Wine season', rating: 4.5, category: 'culture' },
  ],
  'Oct': [
    { code: 'JPN', name: 'Japan', highlight: 'Autumn colors', rating: 4.9, category: 'nature' },
    { code: 'DEU', name: 'Germany', highlight: 'Oktoberfest', rating: 4.8, category: 'culture' },
    { code: 'NPL', name: 'Nepal', highlight: 'Dashain, trekking', rating: 4.7, category: 'adventure' },
    { code: 'MEX', name: 'Mexico', highlight: 'Day of the Dead', rating: 4.6, category: 'culture' },
    { code: 'USA', name: 'United States', highlight: 'Fall foliage', rating: 4.5, category: 'nature' },
  ],
  'Nov': [
    { code: 'IND', name: 'India', highlight: 'Diwali celebrations', rating: 4.9, category: 'culture' },
    { code: 'THA', name: 'Thailand', highlight: 'Loi Krathong', rating: 4.8, category: 'culture' },
    { code: 'NPL', name: 'Nepal', highlight: 'Tihar festival', rating: 4.7, category: 'culture' },
    { code: 'UAE', name: 'UAE', highlight: 'Pleasant weather', rating: 4.6, category: 'city' },
    { code: 'VNM', name: 'Vietnam', highlight: 'Cool season starts', rating: 4.5, category: 'culture' },
  ],
  'Dec': [
    { code: 'DEU', name: 'Germany', highlight: 'Christmas markets', rating: 4.9, category: 'culture' },
    { code: 'AUT', name: 'Austria', highlight: 'Winter wonderland', rating: 4.8, category: 'culture' },
    { code: 'MDV', name: 'Maldives', highlight: 'Peak season', rating: 4.7, category: 'beach' },
    { code: 'AUS', name: 'Australia', highlight: 'Summer, NYE', rating: 4.6, category: 'city' },
    { code: 'ZAF', name: 'South Africa', highlight: 'Safari season', rating: 4.5, category: 'adventure' },
  ],
};

// Weather-based destination recommendations
const weatherGuideData = {
  sunny: {
    icon: Sun,
    label: 'Sunny & Warm',
    description: 'Perfect beach weather and sunshine',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    destinations: {
      'Jan': [
        { code: 'THA', name: 'Thailand', temp: '28-32°C', highlight: 'Tropical paradise' },
        { code: 'MDV', name: 'Maldives', temp: '27-30°C', highlight: 'Crystal clear waters' },
        { code: 'AUS', name: 'Australia', temp: '25-35°C', highlight: 'Summer beaches' },
        { code: 'UAE', name: 'UAE', temp: '22-26°C', highlight: 'Desert warmth' },
        { code: 'LKA', name: 'Sri Lanka', temp: '28-32°C', highlight: 'West coast beaches' },
        { code: 'PHL', name: 'Philippines', temp: '26-31°C', highlight: 'Island hopping' },
        { code: 'MYS', name: 'Malaysia', temp: '27-32°C', highlight: 'Langkawi beaches' },
        { code: 'OMN', name: 'Oman', temp: '20-26°C', highlight: 'Desert & coast' },
      ],
      'Feb': [
        { code: 'THA', name: 'Thailand', temp: '28-33°C', highlight: 'Peak dry season' },
        { code: 'VNM', name: 'Vietnam', temp: '24-28°C', highlight: 'Central coast' },
        { code: 'LKA', name: 'Sri Lanka', temp: '28-32°C', highlight: 'West coast beaches' },
        { code: 'MEX', name: 'Mexico', temp: '25-30°C', highlight: 'Riviera Maya' },
        { code: 'MDV', name: 'Maldives', temp: '28-31°C', highlight: 'Peak season' },
        { code: 'CUB', name: 'Cuba', temp: '24-28°C', highlight: 'Dry season' },
        { code: 'DOM', name: 'Dominican Rep', temp: '26-30°C', highlight: 'Caribbean sun' },
        { code: 'BRB', name: 'Barbados', temp: '26-29°C', highlight: 'Perfect beach' },
      ],
      'Mar': [
        { code: 'EGY', name: 'Egypt', temp: '22-28°C', highlight: 'Perfect weather' },
        { code: 'MAR', name: 'Morocco', temp: '18-24°C', highlight: 'Spring warmth' },
        { code: 'IND', name: 'India (Goa)', temp: '28-34°C', highlight: 'Beach season end' },
        { code: 'CUB', name: 'Cuba', temp: '26-30°C', highlight: 'Dry season' },
        { code: 'THA', name: 'Thailand', temp: '29-35°C', highlight: 'Hot but great' },
        { code: 'JOR', name: 'Jordan', temp: '18-25°C', highlight: 'Spring bloom' },
        { code: 'SEN', name: 'Senegal', temp: '24-30°C', highlight: 'Dry season' },
        { code: 'CPV', name: 'Cape Verde', temp: '22-26°C', highlight: 'Pleasant breeze' },
      ],
      'Apr': [
        { code: 'GRC', name: 'Greece', temp: '18-24°C', highlight: 'Spring islands' },
        { code: 'TUR', name: 'Turkey', temp: '17-23°C', highlight: 'Coastal warmth' },
        { code: 'ESP', name: 'Spain', temp: '18-25°C', highlight: 'Andalusia sun' },
        { code: 'JOR', name: 'Jordan', temp: '22-28°C', highlight: 'Desert adventures' },
        { code: 'CYP', name: 'Cyprus', temp: '20-25°C', highlight: 'Mediterranean spring' },
        { code: 'MLT', name: 'Malta', temp: '18-22°C', highlight: 'Island charm' },
        { code: 'ISR', name: 'Israel', temp: '20-27°C', highlight: 'Holy Land spring' },
        { code: 'TUN', name: 'Tunisia', temp: '18-24°C', highlight: 'Coastal warmth' },
      ],
      'May': [
        { code: 'ITA', name: 'Italy', temp: '20-28°C', highlight: 'Mediterranean sun' },
        { code: 'GRC', name: 'Greece', temp: '22-28°C', highlight: 'Island hopping' },
        { code: 'PRT', name: 'Portugal', temp: '18-24°C', highlight: 'Algarve beaches' },
        { code: 'HRV', name: 'Croatia', temp: '20-26°C', highlight: 'Adriatic coast' },
        { code: 'ESP', name: 'Spain', temp: '22-28°C', highlight: 'Costa del Sol' },
        { code: 'FRA', name: 'France', temp: '18-25°C', highlight: 'Riviera awakens' },
        { code: 'MNE', name: 'Montenegro', temp: '20-26°C', highlight: 'Hidden gem' },
        { code: 'ALB', name: 'Albania', temp: '20-26°C', highlight: 'Albanian Riviera' },
      ],
      'Jun': [
        { code: 'GRC', name: 'Greece', temp: '26-32°C', highlight: 'Peak island season' },
        { code: 'HRV', name: 'Croatia', temp: '24-30°C', highlight: 'Dalmatian coast' },
        { code: 'ESP', name: 'Spain', temp: '26-34°C', highlight: 'Beach paradise' },
        { code: 'ITA', name: 'Italy', temp: '25-32°C', highlight: 'Amalfi Coast' },
        { code: 'TUR', name: 'Turkey', temp: '26-32°C', highlight: 'Turquoise coast' },
        { code: 'CYP', name: 'Cyprus', temp: '28-33°C', highlight: 'Peak season' },
        { code: 'MNE', name: 'Montenegro', temp: '26-30°C', highlight: 'Kotor Bay' },
        { code: 'MLT', name: 'Malta', temp: '26-30°C', highlight: 'Blue lagoons' },
      ],
      'Jul': [
        { code: 'GRC', name: 'Greece', temp: '28-35°C', highlight: 'Hot summers' },
        { code: 'HRV', name: 'Croatia', temp: '26-32°C', highlight: 'Beach festivals' },
        { code: 'FRA', name: 'France (Riviera)', temp: '26-32°C', highlight: 'Cote dAzur' },
        { code: 'CYP', name: 'Cyprus', temp: '28-34°C', highlight: 'Endless sun' },
        { code: 'ESP', name: 'Spain', temp: '28-36°C', highlight: 'Ibiza & Mallorca' },
        { code: 'ITA', name: 'Italy', temp: '28-34°C', highlight: 'Sardinia beaches' },
        { code: 'PRT', name: 'Portugal', temp: '24-30°C', highlight: 'Algarve peak' },
        { code: 'TUR', name: 'Turkey', temp: '30-36°C', highlight: 'Aegean coast' },
      ],
      'Aug': [
        { code: 'IDN', name: 'Indonesia', temp: '27-32°C', highlight: 'Bali dry season' },
        { code: 'GRC', name: 'Greece', temp: '28-35°C', highlight: 'Island life' },
        { code: 'ESP', name: 'Spain', temp: '28-38°C', highlight: 'Costa Brava' },
        { code: 'MLT', name: 'Malta', temp: '28-34°C', highlight: 'Mediterranean gem' },
        { code: 'HRV', name: 'Croatia', temp: '28-33°C', highlight: 'Hvar parties' },
        { code: 'ITA', name: 'Italy', temp: '28-35°C', highlight: 'Sicily beaches' },
        { code: 'CYP', name: 'Cyprus', temp: '30-36°C', highlight: 'Hot summer' },
        { code: 'MNE', name: 'Montenegro', temp: '28-32°C', highlight: 'Budva nights' },
      ],
      'Sep': [
        { code: 'TUR', name: 'Turkey', temp: '24-30°C', highlight: 'Perfect warmth' },
        { code: 'GRC', name: 'Greece', temp: '24-30°C', highlight: 'Less crowded' },
        { code: 'PRT', name: 'Portugal', temp: '22-28°C', highlight: 'Extended summer' },
        { code: 'HRV', name: 'Croatia', temp: '22-28°C', highlight: 'Late season' },
        { code: 'ESP', name: 'Spain', temp: '24-30°C', highlight: 'Warm September' },
        { code: 'ITA', name: 'Italy', temp: '24-30°C', highlight: 'Shoulder season' },
        { code: 'CYP', name: 'Cyprus', temp: '26-32°C', highlight: 'Still hot' },
        { code: 'MLT', name: 'Malta', temp: '26-30°C', highlight: 'Perfect temps' },
      ],
      'Oct': [
        { code: 'EGY', name: 'Egypt', temp: '26-32°C', highlight: 'Red Sea diving' },
        { code: 'MAR', name: 'Morocco', temp: '22-28°C', highlight: 'Desert trips' },
        { code: 'UAE', name: 'UAE', temp: '28-34°C', highlight: 'Cooling down' },
        { code: 'JOR', name: 'Jordan', temp: '24-30°C', highlight: 'Petra season' },
        { code: 'OMN', name: 'Oman', temp: '28-34°C', highlight: 'Desert coast' },
        { code: 'TUN', name: 'Tunisia', temp: '22-28°C', highlight: 'Autumn sun' },
        { code: 'CYP', name: 'Cyprus', temp: '24-28°C', highlight: 'Late warmth' },
        { code: 'GRC', name: 'Greece', temp: '20-26°C', highlight: 'Autumn islands' },
      ],
      'Nov': [
        { code: 'THA', name: 'Thailand', temp: '27-32°C', highlight: 'Season begins' },
        { code: 'UAE', name: 'UAE', temp: '24-30°C', highlight: 'Perfect weather' },
        { code: 'MDV', name: 'Maldives', temp: '28-31°C', highlight: 'Dry season' },
        { code: 'VNM', name: 'Vietnam', temp: '24-28°C', highlight: 'Beach time' },
        { code: 'OMN', name: 'Oman', temp: '24-30°C', highlight: 'Pleasant coast' },
        { code: 'EGY', name: 'Egypt', temp: '22-28°C', highlight: 'Perfect temps' },
        { code: 'JOR', name: 'Jordan', temp: '18-24°C', highlight: 'Autumn beauty' },
        { code: 'MUS', name: 'Mauritius', temp: '26-30°C', highlight: 'Summer starts' },
      ],
      'Dec': [
        { code: 'THA', name: 'Thailand', temp: '26-31°C', highlight: 'Peak season' },
        { code: 'MDV', name: 'Maldives', temp: '27-30°C', highlight: 'Holiday paradise' },
        { code: 'AUS', name: 'Australia', temp: '24-32°C', highlight: 'Summer Down Under' },
        { code: 'ZAF', name: 'South Africa', temp: '22-30°C', highlight: 'Cape Town' },
      ],
    }
  },
  snow: {
    icon: Snowflake,
    label: 'Snow & Winter',
    description: 'Skiing, snowboarding, and winter magic',
    color: 'from-sky-400 to-blue-500',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    destinations: {
      'Jan': [
        { code: 'CHE', name: 'Switzerland', temp: '-5 to 5°C', highlight: 'Alps skiing' },
        { code: 'JPN', name: 'Japan', temp: '-5 to 3°C', highlight: 'Powder snow' },
        { code: 'CAN', name: 'Canada', temp: '-15 to -5°C', highlight: 'Whistler' },
        { code: 'AUT', name: 'Austria', temp: '-5 to 3°C', highlight: 'Ski resorts' },
        { code: 'FRA', name: 'France', temp: '-3 to 5°C', highlight: 'French Alps' },
        { code: 'ITA', name: 'Italy', temp: '-4 to 4°C', highlight: 'Dolomites' },
        { code: 'USA', name: 'Colorado', temp: '-8 to 2°C', highlight: 'Aspen & Vail' },
        { code: 'NOR', name: 'Norway', temp: '-10 to 0°C', highlight: 'Nordic skiing' },
      ],
      'Feb': [
        { code: 'CHE', name: 'Switzerland', temp: '-3 to 6°C', highlight: 'Peak ski' },
        { code: 'JPN', name: 'Japan', temp: '-3 to 5°C', highlight: 'Niseko powder' },
        { code: 'NOR', name: 'Norway', temp: '-8 to 2°C', highlight: 'Northern lights' },
        { code: 'FIN', name: 'Finland', temp: '-12 to -3°C', highlight: 'Lapland magic' },
        { code: 'AUT', name: 'Austria', temp: '-4 to 5°C', highlight: 'Kitzbühel' },
        { code: 'SWE', name: 'Sweden', temp: '-10 to -2°C', highlight: 'Åre skiing' },
        { code: 'CAN', name: 'Canada', temp: '-12 to -3°C', highlight: 'Banff powder' },
        { code: 'USA', name: 'Utah', temp: '-5 to 3°C', highlight: 'Best snow on Earth' },
      ],
      'Mar': [
        { code: 'CHE', name: 'Switzerland', temp: '0 to 10°C', highlight: 'Spring skiing' },
        { code: 'CAN', name: 'Canada', temp: '-8 to 3°C', highlight: 'Late season' },
        { code: 'AUT', name: 'Austria', temp: '-2 to 8°C', highlight: 'Sunny slopes' },
        { code: 'USA', name: 'Colorado', temp: '-5 to 8°C', highlight: 'Rocky Mountains' },
        { code: 'FRA', name: 'France', temp: '0 to 10°C', highlight: 'Spring skiing' },
        { code: 'JPN', name: 'Japan', temp: '0 to 8°C', highlight: 'Late powder' },
        { code: 'ITA', name: 'Italy', temp: '-2 to 10°C', highlight: 'Sunny Dolomites' },
        { code: 'AND', name: 'Andorra', temp: '0 to 10°C', highlight: 'Budget skiing' },
      ],
      'Apr': [
        { code: 'NOR', name: 'Norway', temp: '0 to 8°C', highlight: 'Spring skiing' },
        { code: 'ISL', name: 'Iceland', temp: '0 to 8°C', highlight: 'Late snow' },
        { code: 'CHE', name: 'Switzerland', temp: '5 to 15°C', highlight: 'High altitude' },
        { code: 'CAN', name: 'Canada', temp: '-2 to 10°C', highlight: 'Final runs' },
        { code: 'FIN', name: 'Finland', temp: '-3 to 5°C', highlight: 'Lapland spring' },
        { code: 'SWE', name: 'Sweden', temp: '-2 to 6°C', highlight: 'Northern slopes' },
        { code: 'AUT', name: 'Austria', temp: '2 to 12°C', highlight: 'Glacier skiing' },
        { code: 'USA', name: 'California', temp: '0 to 10°C', highlight: 'Mammoth late' },
      ],
      'May': [
        { code: 'NOR', name: 'Norway', temp: '5 to 12°C', highlight: 'Glacier skiing' },
        { code: 'ARG', name: 'Argentina', temp: '5 to 15°C', highlight: 'Southern Alps' },
        { code: 'CHL', name: 'Chile', temp: '5 to 12°C', highlight: 'Andes start' },
        { code: 'NZL', name: 'New Zealand', temp: '5 to 12°C', highlight: 'Early snow' },
        { code: 'CHE', name: 'Switzerland', temp: '8 to 18°C', highlight: 'Glacier only' },
        { code: 'AUT', name: 'Austria', temp: '8 to 18°C', highlight: 'Hintertux' },
        { code: 'FRA', name: 'France', temp: '8 to 18°C', highlight: 'Tignes glacier' },
        { code: 'ITA', name: 'Italy', temp: '8 to 18°C', highlight: 'Cervinia glacier' },
      ],
      'Jun': [
        { code: 'ARG', name: 'Argentina', temp: '0 to 10°C', highlight: 'Bariloche' },
        { code: 'CHL', name: 'Chile', temp: '-2 to 8°C', highlight: 'Valle Nevado' },
        { code: 'NZL', name: 'New Zealand', temp: '2 to 10°C', highlight: 'Queenstown' },
        { code: 'AUS', name: 'Australia', temp: '0 to 8°C', highlight: 'Snowy Mountains' },
        { code: 'AUT', name: 'Austria', temp: '10 to 20°C', highlight: 'Hintertux glacier' },
        { code: 'CHE', name: 'Switzerland', temp: '10 to 20°C', highlight: 'Zermatt glacier' },
        { code: 'FRA', name: 'France', temp: '10 to 20°C', highlight: "Les 2 Alpes" },
        { code: 'ITA', name: 'Italy', temp: '10 to 20°C', highlight: 'Passo Stelvio' },
      ],
      'Jul': [
        { code: 'ARG', name: 'Argentina', temp: '-5 to 5°C', highlight: 'Peak season' },
        { code: 'CHL', name: 'Chile', temp: '-5 to 5°C', highlight: 'Best powder' },
        { code: 'NZL', name: 'New Zealand', temp: '0 to 8°C', highlight: 'Peak snow' },
        { code: 'AUS', name: 'Australia', temp: '-2 to 6°C', highlight: 'Thredbo' },
        { code: 'BOL', name: 'Bolivia', temp: '-5 to 5°C', highlight: 'Chacaltaya' },
        { code: 'AUT', name: 'Austria', temp: '12 to 22°C', highlight: 'Glacier skiing' },
        { code: 'CHE', name: 'Switzerland', temp: '12 to 22°C', highlight: 'Saas Fee' },
        { code: 'FRA', name: 'France', temp: '12 to 22°C', highlight: 'Tignes summer' },
      ],
      'Aug': [
        { code: 'ARG', name: 'Argentina', temp: '-3 to 7°C', highlight: 'Great conditions' },
        { code: 'CHL', name: 'Chile', temp: '-2 to 8°C', highlight: 'Late season' },
        { code: 'NZL', name: 'New Zealand', temp: '2 to 10°C', highlight: 'Snow sports' },
        { code: 'AUS', name: 'Australia', temp: '0 to 8°C', highlight: 'Perisher' },
        { code: 'BOL', name: 'Bolivia', temp: '-3 to 7°C', highlight: 'Andes skiing' },
        { code: 'PER', name: 'Peru', temp: '-2 to 8°C', highlight: 'High Andes' },
        { code: 'AUT', name: 'Austria', temp: '12 to 22°C', highlight: 'Summer glacier' },
        { code: 'CHE', name: 'Switzerland', temp: '12 to 22°C', highlight: 'Glacier camps' },
      ],
      'Sep': [
        { code: 'NZL', name: 'New Zealand', temp: '5 to 12°C', highlight: 'Spring snow' },
        { code: 'ARG', name: 'Argentina', temp: '5 to 15°C', highlight: 'End season' },
        { code: 'CHL', name: 'Chile', temp: '5 to 15°C', highlight: 'Spring skiing' },
        { code: 'AUS', name: 'Australia', temp: '3 to 12°C', highlight: 'Late runs' },
        { code: 'AUT', name: 'Austria', temp: '5 to 15°C', highlight: 'Glacier open' },
        { code: 'CHE', name: 'Switzerland', temp: '5 to 15°C', highlight: 'Zermatt open' },
        { code: 'FRA', name: 'France', temp: '5 to 15°C', highlight: 'Tignes glacier' },
        { code: 'ITA', name: 'Italy', temp: '5 to 15°C', highlight: 'Val Senales' },
      ],
      'Oct': [
        { code: 'AUT', name: 'Austria', temp: '2 to 12°C', highlight: 'Glacier opens' },
        { code: 'CHE', name: 'Switzerland', temp: '3 to 12°C', highlight: 'Early snow' },
        { code: 'FRA', name: 'France (Alps)', temp: '2 to 10°C', highlight: 'First flakes' },
        { code: 'ITA', name: 'Italy (Dolomites)', temp: '0 to 10°C', highlight: 'Season start' },
        { code: 'AND', name: 'Andorra', temp: '3 to 12°C', highlight: 'Early openings' },
        { code: 'NOR', name: 'Norway', temp: '-2 to 8°C', highlight: 'Early snow' },
        { code: 'FIN', name: 'Finland', temp: '-5 to 5°C', highlight: 'Lapland opens' },
        { code: 'SWE', name: 'Sweden', temp: '-3 to 7°C', highlight: 'First lifts' },
      ],
      'Nov': [
        { code: 'AUT', name: 'Austria', temp: '-3 to 5°C', highlight: 'Season opens' },
        { code: 'CHE', name: 'Switzerland', temp: '-2 to 6°C', highlight: 'Fresh snow' },
        { code: 'CAN', name: 'Canada', temp: '-10 to 0°C', highlight: 'Early bird' },
        { code: 'USA', name: 'Colorado', temp: '-8 to 5°C', highlight: 'Thanksgiving' },
        { code: 'FRA', name: 'France', temp: '-2 to 8°C', highlight: 'Val Thorens' },
        { code: 'ITA', name: 'Italy', temp: '-2 to 8°C', highlight: 'Cervinia opens' },
        { code: 'JPN', name: 'Japan', temp: '-3 to 5°C', highlight: 'Season starts' },
        { code: 'NOR', name: 'Norway', temp: '-8 to 2°C', highlight: 'Full swing' },
      ],
      'Dec': [
        { code: 'AUT', name: 'Austria', temp: '-5 to 3°C', highlight: 'Christmas skiing' },
        { code: 'CHE', name: 'Switzerland', temp: '-6 to 2°C', highlight: 'Winter magic' },
        { code: 'JPN', name: 'Japan', temp: '-5 to 2°C', highlight: 'Powder paradise' },
        { code: 'CAN', name: 'Canada', temp: '-12 to -2°C', highlight: 'Holiday slopes' },
        { code: 'FRA', name: 'France', temp: '-5 to 3°C', highlight: 'Val dIsere' },
        { code: 'ITA', name: 'Italy', temp: '-4 to 4°C', highlight: 'Dolomites magic' },
        { code: 'USA', name: 'Utah', temp: '-8 to 2°C', highlight: 'Greatest snow' },
        { code: 'FIN', name: 'Finland', temp: '-12 to -3°C', highlight: 'Santa Claus' },
      ],
    }
  },
  mild: {
    icon: Wind,
    label: 'Mild & Pleasant',
    description: 'Perfect for sightseeing and outdoor activities',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    destinations: {
      'Jan': [
        { code: 'ZAF', name: 'South Africa', temp: '18-28°C', highlight: 'Cape Town summer' },
        { code: 'ARG', name: 'Argentina', temp: '18-28°C', highlight: 'Buenos Aires' },
        { code: 'CHL', name: 'Chile', temp: '15-25°C', highlight: 'Patagonia' },
        { code: 'NZL', name: 'New Zealand', temp: '15-25°C', highlight: 'Summer hikes' },
      ],
      'Feb': [
        { code: 'ZAF', name: 'South Africa', temp: '18-27°C', highlight: 'Wine country' },
        { code: 'ARG', name: 'Argentina', temp: '17-27°C', highlight: 'Tango season' },
        { code: 'NZL', name: 'New Zealand', temp: '16-24°C', highlight: 'Outdoor paradise' },
        { code: 'AUS', name: 'Australia', temp: '18-26°C', highlight: 'Melbourne' },
      ],
      'Mar': [
        { code: 'JPN', name: 'Japan', temp: '10-18°C', highlight: 'Cherry blossoms' },
        { code: 'ESP', name: 'Spain', temp: '12-20°C', highlight: 'Spring time' },
        { code: 'PRT', name: 'Portugal', temp: '12-18°C', highlight: 'Lisbon charm' },
        { code: 'ITA', name: 'Italy', temp: '12-18°C', highlight: 'Rome & Florence' },
      ],
      'Apr': [
        { code: 'JPN', name: 'Japan', temp: '12-20°C', highlight: 'Peak sakura' },
        { code: 'NLD', name: 'Netherlands', temp: '10-16°C', highlight: 'Tulip fields' },
        { code: 'FRA', name: 'France', temp: '12-18°C', highlight: 'Paris spring' },
        { code: 'USA', name: 'Washington DC', temp: '12-20°C', highlight: 'Cherry blossoms' },
      ],
      'May': [
        { code: 'GBR', name: 'United Kingdom', temp: '12-18°C', highlight: 'English gardens' },
        { code: 'IRL', name: 'Ireland', temp: '10-16°C', highlight: 'Green landscapes' },
        { code: 'FRA', name: 'France', temp: '15-22°C', highlight: 'Loire Valley' },
        { code: 'DEU', name: 'Germany', temp: '14-20°C', highlight: 'Castle country' },
      ],
      'Jun': [
        { code: 'ISL', name: 'Iceland', temp: '8-14°C', highlight: 'Midnight sun' },
        { code: 'NOR', name: 'Norway', temp: '12-18°C', highlight: 'Fjord season' },
        { code: 'CAN', name: 'Canada', temp: '15-22°C', highlight: 'National parks' },
        { code: 'USA', name: 'Pacific NW', temp: '15-22°C', highlight: 'Seattle summer' },
      ],
      'Jul': [
        { code: 'CAN', name: 'Canada', temp: '18-26°C', highlight: 'Banff & Jasper' },
        { code: 'USA', name: 'Alaska', temp: '12-18°C', highlight: 'Midnight sun' },
        { code: 'GBR', name: 'Scotland', temp: '12-18°C', highlight: 'Highlands' },
        { code: 'IRL', name: 'Ireland', temp: '14-18°C', highlight: 'Green summer' },
      ],
      'Aug': [
        { code: 'SWE', name: 'Sweden', temp: '16-22°C', highlight: 'Stockholm' },
        { code: 'DNK', name: 'Denmark', temp: '16-22°C', highlight: 'Copenhagen' },
        { code: 'POL', name: 'Poland', temp: '18-25°C', highlight: 'Krakow' },
        { code: 'CZE', name: 'Czech Republic', temp: '18-26°C', highlight: 'Prague' },
      ],
      'Sep': [
        { code: 'DEU', name: 'Germany', temp: '14-22°C', highlight: 'Munich beauty' },
        { code: 'FRA', name: 'France', temp: '15-24°C', highlight: 'Provence' },
        { code: 'ITA', name: 'Italy', temp: '18-26°C', highlight: 'Tuscany' },
        { code: 'USA', name: 'New England', temp: '14-22°C', highlight: 'Fall colors begin' },
      ],
      'Oct': [
        { code: 'JPN', name: 'Japan', temp: '14-22°C', highlight: 'Autumn leaves' },
        { code: 'USA', name: 'New England', temp: '10-18°C', highlight: 'Peak foliage' },
        { code: 'CAN', name: 'Canada', temp: '8-16°C', highlight: 'Fall colors' },
        { code: 'KOR', name: 'South Korea', temp: '12-20°C', highlight: 'Autumn beauty' },
      ],
      'Nov': [
        { code: 'IND', name: 'India', temp: '18-28°C', highlight: 'Perfect touring' },
        { code: 'NPL', name: 'Nepal', temp: '12-22°C', highlight: 'Trekking season' },
        { code: 'MYS', name: 'Malaysia', temp: '24-32°C', highlight: 'East coast' },
        { code: 'SGP', name: 'Singapore', temp: '24-31°C', highlight: 'City escape' },
      ],
      'Dec': [
        { code: 'IND', name: 'India', temp: '14-26°C', highlight: 'Rajasthan' },
        { code: 'NPL', name: 'Nepal', temp: '8-18°C', highlight: 'Clear Himalayas' },
        { code: 'LKA', name: 'Sri Lanka', temp: '24-30°C', highlight: 'Dry season' },
        { code: 'MYS', name: 'Malaysia', temp: '24-32°C', highlight: 'Langkawi' },
      ],
    }
  },
  rainy: {
    icon: CloudRain,
    label: 'Monsoon Adventures',
    description: 'Off-peak travel with lush landscapes and fewer crowds',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    destinations: {
      'Jan': [
        { code: 'CRI', name: 'Costa Rica', temp: '24-30°C', highlight: 'Green season value' },
        { code: 'BRA', name: 'Brazil (Amazon)', temp: '26-32°C', highlight: 'Rainforest peaks' },
        { code: 'IDN', name: 'Indonesia', temp: '26-32°C', highlight: 'Quiet Bali' },
        { code: 'MYS', name: 'Malaysia (West)', temp: '26-32°C', highlight: 'Fewer tourists' },
      ],
      'Feb': [
        { code: 'PHL', name: 'Philippines', temp: '26-32°C', highlight: 'Off-peak deals' },
        { code: 'IDN', name: 'Indonesia', temp: '26-32°C', highlight: 'Budget travel' },
        { code: 'BRA', name: 'Brazil', temp: '26-32°C', highlight: 'Amazon high water' },
        { code: 'GTM', name: 'Guatemala', temp: '20-28°C', highlight: 'Quiet season' },
      ],
      'Mar': [
        { code: 'NIC', name: 'Nicaragua', temp: '28-34°C', highlight: 'Transition time' },
        { code: 'HND', name: 'Honduras', temp: '26-32°C', highlight: 'Green landscapes' },
        { code: 'COL', name: 'Colombia', temp: '20-28°C', highlight: 'Amazon season' },
        { code: 'ECU', name: 'Ecuador', temp: '22-28°C', highlight: 'Coastal rains' },
      ],
      'Apr': [
        { code: 'KEN', name: 'Kenya', temp: '20-28°C', highlight: 'Long rains (budget)' },
        { code: 'TZA', name: 'Tanzania', temp: '22-28°C', highlight: 'Green Serengeti' },
        { code: 'UGA', name: 'Uganda', temp: '20-26°C', highlight: 'Gorilla tracking' },
        { code: 'RWA', name: 'Rwanda', temp: '18-24°C', highlight: 'Misty mountains' },
      ],
      'May': [
        { code: 'KEN', name: 'Kenya', temp: '18-26°C', highlight: 'Budget safaris' },
        { code: 'THA', name: 'Thailand', temp: '28-34°C', highlight: 'Off-season deals' },
        { code: 'VNM', name: 'Vietnam', temp: '28-34°C', highlight: 'Central highlands' },
        { code: 'MMR', name: 'Myanmar', temp: '28-36°C', highlight: 'Quiet temples' },
      ],
      'Jun': [
        { code: 'IND', name: 'India', temp: '28-38°C', highlight: 'Monsoon magic' },
        { code: 'NPL', name: 'Nepal', temp: '22-30°C', highlight: 'Lush valleys' },
        { code: 'THA', name: 'Thailand', temp: '28-34°C', highlight: 'Green island' },
        { code: 'KHM', name: 'Cambodia', temp: '28-34°C', highlight: 'Quiet Angkor' },
      ],
      'Jul': [
        { code: 'IND', name: 'India (Kerala)', temp: '26-30°C', highlight: 'Ayurveda season' },
        { code: 'LKA', name: 'Sri Lanka', temp: '26-30°C', highlight: 'East coast dry' },
        { code: 'IDN', name: 'Indonesia', temp: '26-32°C', highlight: 'Dry season starts' },
        { code: 'MYS', name: 'Malaysia', temp: '26-32°C', highlight: 'East coast' },
      ],
      'Aug': [
        { code: 'IND', name: 'India', temp: '26-32°C', highlight: 'Monsoon fades' },
        { code: 'NPL', name: 'Nepal', temp: '22-28°C', highlight: 'Green Himalayas' },
        { code: 'BGD', name: 'Bangladesh', temp: '28-32°C', highlight: 'River cruises' },
        { code: 'MMR', name: 'Myanmar', temp: '28-32°C', highlight: 'Temple hopping' },
      ],
      'Sep': [
        { code: 'IND', name: 'India', temp: '26-32°C', highlight: 'Post-monsoon' },
        { code: 'THA', name: 'Thailand', temp: '28-32°C', highlight: 'Late rains' },
        { code: 'VNM', name: 'Vietnam', temp: '26-32°C', highlight: 'Central rains' },
        { code: 'LAO', name: 'Laos', temp: '26-32°C', highlight: 'River season' },
      ],
      'Oct': [
        { code: 'THA', name: 'Thailand', temp: '26-32°C', highlight: 'Transition' },
        { code: 'VNM', name: 'Vietnam (Central)', temp: '24-30°C', highlight: 'Rainy coast' },
        { code: 'PHL', name: 'Philippines', temp: '26-32°C', highlight: 'Typhoon season' },
        { code: 'IDN', name: 'Indonesia', temp: '28-34°C', highlight: 'Transition' },
      ],
      'Nov': [
        { code: 'THA', name: 'Thailand (South)', temp: '26-32°C', highlight: 'Gulf rains' },
        { code: 'MYS', name: 'Malaysia (East)', temp: '26-30°C', highlight: 'Monsoon diving' },
        { code: 'PHL', name: 'Philippines', temp: '26-32°C', highlight: 'Late season' },
        { code: 'SGP', name: 'Singapore', temp: '24-32°C', highlight: 'Shower season' },
      ],
      'Dec': [
        { code: 'MYS', name: 'Malaysia (East)', temp: '26-30°C', highlight: 'Quiet beaches' },
        { code: 'IDN', name: 'Indonesia', temp: '26-32°C', highlight: 'Wet season deals' },
        { code: 'BRA', name: 'Brazil (Amazon)', temp: '26-32°C', highlight: 'Rising waters' },
        { code: 'PAN', name: 'Panama', temp: '26-30°C', highlight: 'Green season' },
      ],
    }
  },
};

const Seasons = () => {
  const [seasonsData, setSeasonsData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [selectedWeatherType, setSelectedWeatherType] = useState(null); // For seasonal guide
  const { addToWishlist, isInWishlist } = useWishlist();
  
  // Date state - default to current month
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const selectedMonthAbbrev = MONTH_ABBREV[selectedMonth];
  const selectedMonthName = MONTH_NAMES[selectedMonth];

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/seasons`);
        setSeasonsData(response.data.data);
      } catch (error) {
        console.error('Error fetching seasons data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  // Process data when seasons data or selected month changes
  useEffect(() => {
    if (seasonsData.length === 0) return;
    
    const processed = seasonsData.map(country => {
      const bestMonths = country.best_months || [];
      const isSelectedMonthBest = bestMonths.includes(selectedMonthAbbrev);
      
      // Determine season status for selected month
      let currentSeasonType;
      if (isSelectedMonthBest) {
        currentSeasonType = 'peak';
      } else {
        const bestMonthIndices = bestMonths.map(m => MONTH_ABBREV.indexOf(m));
        const isNearBest = bestMonthIndices.some(idx => {
          const diff = Math.abs(selectedMonth - idx);
          return diff <= 2 || diff >= 10;
        });
        currentSeasonType = isNearBest ? 'shoulder' : 'off';
      }
      
      return {
        ...country,
        current_season: currentSeasonType,
        is_best_now: isSelectedMonthBest
      };
    });
    
    setProcessedData(processed);
  }, [seasonsData, selectedMonth, selectedMonthAbbrev]);

  // Filter countries based on search and category - only show PEAK season countries for categories
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    let filtered = processedData.filter(c => 
      c.country_name?.toLowerCase().includes(query)
    );
    return filtered.slice(0, 8);
  }, [searchQuery, processedData]);

  // Filter data by category for display - ONLY PEAK SEASON countries for category tabs
  const categoryFilteredData = useMemo(() => {
    // Get only peak season countries first
    const peakOnly = processedData.filter(c => c.current_season === 'peak');
    
    if (selectedCategory === 'all') return peakOnly;
    return peakOnly.filter(c => c.categories?.includes(selectedCategory));
  }, [processedData, selectedCategory]);

  // Count for each category (only peak season)
  const categoryCounts = useMemo(() => {
    const peakOnly = processedData.filter(c => c.current_season === 'peak');
    const counts = {};
    CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = peakOnly.length;
      } else {
        counts[cat.id] = peakOnly.filter(c => c.categories?.includes(cat.id)).length;
      }
    });
    return counts;
  }, [processedData]);

  const handleCountrySelect = (country) => {
    setSearchQuery(country.country_name);
    setShowDropdown(false);
    // Open the country detail modal
    setSelectedCountry(country);
  };

  const handleCountryCardClick = (country) => {
    setSelectedCountry(country);
  };

  const legends = [
    { color: '#E25A53', label: 'Best Time', description: `Ideal to visit in ${selectedMonthName}`, icon: Sun },
    { color: '#4B89AC', label: 'Good Time', description: 'Near peak season', icon: CloudSun },
    { color: '#F2A900', label: 'Off Season', description: `Not ideal in ${selectedMonthName}`, icon: Cloud },
    { color: '#D6D6D6', label: 'No Data', description: 'Information not available', icon: null }
  ];

  // For the all destinations view (without category filter)
  const peakCountries = processedData.filter(c => c.current_season === 'peak');
  const shoulderCountries = processedData.filter(c => c.current_season === 'shoulder');
  const offCountries = processedData.filter(c => c.current_season === 'off');

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-12 h-12 text-accent" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="seasons-page-title">
                Best Seasons to Travel
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find the perfect time to visit your dream destination
            </p>
          </div>

          {/* Search and Date Filter Section */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Travelling To Search */}
              <div className="relative">
                <label className="block text-sm font-semibold text-primary mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Travelling To
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search country..."
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    data-testid="country-search"
                  />
                </div>
                
                {/* Search Dropdown */}
                {showDropdown && filteredCountries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-20 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto"
                  >
                    {filteredCountries.map((country) => (
                      <button
                        key={country.country_code}
                        onClick={() => handleCountrySelect(country)}
                        className="w-full px-4 py-3 text-left hover:bg-accent/20 flex items-center justify-between transition-all"
                      >
                        <span className="font-medium text-foreground">{country.country_name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          country.current_season === 'peak' ? 'bg-red-100 text-red-700' :
                          country.current_season === 'shoulder' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {country.current_season === 'peak' ? 'Best Time' :
                           country.current_season === 'shoulder' ? 'Good' : 'Off Season'}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Travel Date
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="month-selector"
                  >
                    {MONTH_NAMES.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-28 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="year-selector"
                  >
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Current Selection Indicator + Cost Estimator Button */}
          <div className="bg-accent/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-lg font-semibold text-primary">
              📅 Showing travel conditions for: <span className="text-accent">{selectedMonthName} {selectedYear}</span>
              {selectedCategory !== 'all' && (
                <span className="ml-2 text-muted-foreground">
                  • Filtered by: <span className="text-accent capitalize">{selectedCategory}</span>
                </span>
              )}
            </span>
            <button
              onClick={() => setShowCostEstimator(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:opacity-90 transition-all shadow-lg"
              data-testid="open-cost-estimator-btn"
            >
              <Calculator className="w-5 h-5" />
              Trip Cost Estimator
            </button>
          </div>

          {/* Top 5 Destinations This Month */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200" data-testid="top-destinations-section">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-primary">Top 5 Destinations for {selectedMonthName}</h3>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">RECOMMENDED</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topDestinationsData[selectedMonthAbbrev]?.map((dest, idx) => {
                const categoryData = CATEGORIES.find(c => c.id === dest.category);
                return (
                  <motion.div
                    key={dest.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => {
                      const country = processedData.find(c => c.country_code === dest.code);
                      if (country) setSelectedCountry(country);
                    }}
                    className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border border-amber-100 group"
                    data-testid={`top-dest-${dest.code}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-bold text-amber-500">#{idx + 1}</span>
                      <img
                        src={getFlag(dest.code)}
                        alt={dest.name}
                        className="w-8 h-6 object-cover rounded shadow-sm"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <h4 className="font-bold text-primary group-hover:text-amber-600 transition-colors">{dest.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{dest.highlight}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-sm">★</span>
                        <span className="text-sm font-semibold text-amber-700">{dest.rating}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryData?.bgColor || 'bg-gray-100'} ${categoryData?.textColor || 'text-gray-600'}`}>
                        {dest.category}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Seasonal Travel Guide - Weather-based recommendations */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 mb-6 border border-violet-200" data-testid="seasonal-guide-section">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-violet-500" />
              <h3 className="text-xl font-bold text-primary">Seasonal Travel Guide</h3>
              <span className="px-2 py-0.5 bg-violet-200 text-violet-800 text-xs font-bold rounded-full">AI PICKS</span>
            </div>
            <p className="text-muted-foreground mb-4">
              What kind of weather are you looking for in <span className="font-semibold text-primary">{selectedMonthName}</span>?
            </p>
            
            {/* Weather Type Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {Object.entries(weatherGuideData).map(([type, data]) => {
                const Icon = data.icon;
                const isSelected = selectedWeatherType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedWeatherType(isSelected ? null : type)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? `${data.borderColor} ${data.bgColor} shadow-lg ring-2 ring-offset-2 ring-${type === 'sunny' ? 'amber' : type === 'snow' ? 'sky' : type === 'mild' ? 'emerald' : 'blue'}-300`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                    data-testid={`weather-guide-${type}`}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center mb-3 shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-primary text-sm">{data.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.description}</p>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Weather-based Destination Results */}
            {selectedWeatherType && weatherGuideData[selectedWeatherType] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`${weatherGuideData[selectedWeatherType].bgColor} rounded-xl p-5 ${weatherGuideData[selectedWeatherType].borderColor} border-2`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(weatherGuideData[selectedWeatherType].icon, { className: "w-6 h-6 text-gray-700" })}
                  <div>
                    <h4 className="font-bold text-primary">
                      {weatherGuideData[selectedWeatherType].label} Destinations for {selectedMonthName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Perfect picks based on your weather preference
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  {/* Left scroll arrow */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('weather-guide-scroll');
                      if (container) container.scrollBy({ left: -220, behavior: 'smooth' });
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all z-10 border border-gray-200"
                    data-testid="scroll-left-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Scrollable container */}
                  <div 
                    className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-12"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    id="weather-guide-scroll"
                  >
                    {weatherGuideData[selectedWeatherType].destinations[selectedMonthAbbrev]?.map((dest, idx) => (
                      <motion.div
                        key={dest.code}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          const country = processedData.find(c => c.country_code === dest.code);
                          if (country) setSelectedCountry(country);
                        }}
                        className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all border border-gray-100 group flex-shrink-0 w-[200px]"
                        data-testid={`guide-dest-${dest.code}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={getFlag(dest.code)}
                            alt={dest.name}
                            className="w-8 h-5 object-cover rounded shadow-sm"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="font-bold text-primary group-hover:text-violet-600 transition-colors text-sm">{dest.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm mb-1">
                          <ThermometerSun className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">{dest.temp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{dest.highlight}</p>
                        <p className="text-xs text-violet-600 mt-2 group-hover:underline">Explore →</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Right scroll arrow */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('weather-guide-scroll');
                      if (container) container.scrollBy({ left: 220, behavior: 'smooth' });
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all z-10 border border-gray-200"
                    data-testid="scroll-right-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Pro tip based on weather type */}
                <div className="mt-4 p-3 bg-white/70 rounded-lg border border-white">
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">💡 Pro Tip:</span>{' '}
                    {selectedWeatherType === 'sunny' && 'Book accommodations with pools or beach access. Don\'t forget sunscreen and stay hydrated!'}
                    {selectedWeatherType === 'snow' && 'Book ski passes in advance for better rates. Layer up and pack thermal gear!'}
                    {selectedWeatherType === 'mild' && 'Perfect for walking tours and outdoor activities. Pack layers for temperature changes.'}
                    {selectedWeatherType === 'rainy' && 'Enjoy lower prices and fewer crowds. Pack waterproof gear and plan indoor activities as backup!'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Default state when no weather selected */}
            {!selectedWeatherType && (
              <div className="text-center py-6 bg-white/50 rounded-xl border border-dashed border-violet-200">
                <Sparkles className="w-10 h-10 text-violet-300 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Select a weather preference above to get personalized destination recommendations
                </p>
              </div>
            )}
          </div>

          {/* Category Filter Tabs - Shows only PEAK SEASON destinations */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-border">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-red-500" />
              Best Time to Visit in {selectedMonthName} - Filter by Type:
            </h3>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      // Scroll to destinations section after a short delay
                      setTimeout(() => {
                        const destinationsSection = document.getElementById('destinations-section');
                        if (destinationsSection) {
                          destinationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    disabled={count === 0 && cat.id !== 'all'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap border-2 ${
                      isActive 
                        ? cat.activeColor + ' border-transparent shadow-md' 
                        : count === 0 && cat.id !== 'all'
                        ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed'
                        : cat.bgColor + ' ' + cat.textColor + ' border-transparent hover:shadow-sm'
                    }`}
                    data-testid={`category-tab-${cat.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-white/50'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">What the colors mean for {selectedMonthName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {legends.map((legend) => (
                <div key={legend.label} className="legend-item" data-testid={`legend-${legend.label.toLowerCase().replace(/ /g, '-')}`}>
                  <div
                    className="legend-color"
                    style={{ backgroundColor: legend.color }}
                  />
                  <div>
                    <div className="font-medium text-sm text-foreground flex items-center gap-1">
                      {legend.icon && <legend.icon className="w-4 h-4" />}
                      {legend.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{legend.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="map-container" data-testid="seasons-map-container">
            {loading ? (
              <div className="flex items-center justify-center h-96" data-testid="loading-seasons">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading season data...</p>
                </div>
              </div>
            ) : (
              <WorldMap 
                data={processedData.map(c => ({
                  ...c,
                  season_type: c.current_season
                }))} 
                mode="seasons" 
              />
            )}
          </div>

          {/* Country Lists by Season */}
          <div className="mt-12 space-y-8" id="destinations-section">
            {/* Category Filtered Peak Destinations */}
            {selectedCategory !== 'all' && categoryFilteredData.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-red-500" />
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label} Destinations - Best in {selectedMonthName} ({categoryFilteredData.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryFilteredData.map((country, idx) => (
                    <div
                      key={`${country.country_code}-${idx}`}
                      className="bg-red-50 rounded-lg p-4 border border-red-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`category-country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(country);
                              }}
                              className={`p-1 rounded-full transition-all ${
                                isInWishlist(country.country_code) 
                                  ? 'text-red-500' 
                                  : 'text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(country.country_code) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-green-700 font-medium">✓ Best in {selectedMonthAbbrev}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          {country.categories && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {country.categories.slice(0, 3).map(cat => (
                                <span key={cat} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 capitalize">{cat}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Peak Destinations (when no category filter) */}
            {selectedCategory === 'all' && peakCountries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-red-500" />
                  Best Time to Visit in {selectedMonthName} ({peakCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {peakCountries.map((country, idx) => (
                    <div
                      key={`${country.country_code}-${idx}`}
                      className="bg-red-50 rounded-lg p-4 border border-red-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(country);
                              }}
                              className={`p-1 rounded-full transition-all ${
                                isInWishlist(country.country_code) 
                                  ? 'text-red-500' 
                                  : 'text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(country.country_code) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-green-700 font-medium">✓ Ideal in {selectedMonthAbbrev}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Good Time (Shoulder) */}
            {shoulderCountries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <CloudSun className="w-6 h-6 text-blue-500" />
                  Good Time to Visit ({shoulderCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shoulderCountries.map((country, idx) => (
                    <div
                      key={`shoulder-${country.country_code}-${idx}`}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(country);
                              }}
                              className={`p-1 rounded-full transition-all ${
                                isInWishlist(country.country_code) 
                                  ? 'text-red-500' 
                                  : 'text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(country.country_code) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-blue-700 font-medium">○ Near peak season</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Off Season */}
            {offCountries.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-amber-500" />
                  Off Season ({offCountries.length} destinations)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {offCountries.slice(0, 12).map((country, idx) => (
                    <div
                      key={`off-${country.country_code}-${idx}`}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-${country.country_code}`}
                      onClick={() => handleCountryCardClick(country)}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={getFlag(country.country_code)} 
                          alt={country.country_name}
                          className="w-8 h-5 object-cover rounded shadow flex-shrink-0 mt-0.5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{country.country_name}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(country);
                              }}
                              className={`p-1 rounded-full transition-all ${
                                isInWishlist(country.country_code) 
                                  ? 'text-red-500' 
                                  : 'text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(country.country_code) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-amber-700 font-medium">△ Not ideal in {selectedMonthAbbrev}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best months: {country.best_months?.join(', ')}
                          </p>
                          <p className="text-xs text-primary mt-2 group-hover:underline">View details →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {offCountries.length > 12 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        +{offCountries.length - 12} more destinations
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <CountryDetailModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Cost Estimator Modal */}
      <CostEstimator 
        isOpen={showCostEstimator} 
        onClose={() => setShowCostEstimator(false)} 
      />

      <BackToTop />
    </div>
  );
};

export default Seasons;
