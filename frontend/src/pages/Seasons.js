import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import CountryDetailModal from '../components/CountryDetailModal';
import BackToTop from '../components/BackToTop';
import { Calendar, Sun, CloudSun, Cloud, Search, MapPin, Heart, Palmtree, Mountain, Building2, Compass, Landmark, Trees, Snowflake, Sparkles, CloudRain, Wind, ThermometerSun, FileText, Clock, DollarSign, Plane, X, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

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

// Seasonal Travel Guide Categories with horizontal scroll
const TRAVEL_GUIDE_CATEGORIES = [
  { id: 'beach', label: 'Beach Destinations', icon: Palmtree, color: 'from-cyan-400 to-blue-500', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', description: 'Sun, sand & sea', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
  { id: 'mountain', label: 'Mountain Destinations', icon: Mountain, color: 'from-green-400 to-emerald-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', description: 'Peaks & valleys', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80' },
  { id: 'snow', label: 'Snowy Experience', icon: Snowflake, color: 'from-sky-400 to-blue-500', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', description: 'Winter wonderland', image: 'https://images.unsplash.com/photo-1610479201125-a5c7f17370a8?w=400&q=80' },
  { id: 'city', label: 'City Destinations', icon: Building2, color: 'from-slate-400 to-gray-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', description: 'Urban exploration', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80' },
  { id: 'culture', label: 'Cultural Destinations', icon: Landmark, color: 'from-purple-400 to-violet-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', description: 'Heritage & history', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80' },
  { id: 'adventure', label: 'Adventure Destinations', icon: Compass, color: 'from-orange-400 to-red-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', description: 'Thrills & action', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80' },
  { id: 'nature', label: 'Explore Nature', icon: Trees, color: 'from-lime-400 to-green-500', bgColor: 'bg-lime-50', borderColor: 'border-lime-200', description: 'Wildlife & forests', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80' },
  { id: 'fitness', label: 'Fitness Destination', icon: Dumbbell, color: 'from-rose-400 to-pink-500', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', description: 'Wellness retreats', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80' },
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
        { code: 'AUS', name: 'Australia', temp: '20-30°C', highlight: 'Sydney beaches' },
        { code: 'BRA', name: 'Brazil', temp: '22-30°C', highlight: 'Rio summer' },
        { code: 'URY', name: 'Uruguay', temp: '18-28°C', highlight: 'Beach season' },
        { code: 'NAM', name: 'Namibia', temp: '20-30°C', highlight: 'Desert exploring' },
      ],
      'Feb': [
        { code: 'ZAF', name: 'South Africa', temp: '18-27°C', highlight: 'Wine country' },
        { code: 'ARG', name: 'Argentina', temp: '17-27°C', highlight: 'Tango season' },
        { code: 'NZL', name: 'New Zealand', temp: '16-24°C', highlight: 'Outdoor paradise' },
        { code: 'AUS', name: 'Australia', temp: '18-26°C', highlight: 'Melbourne' },
        { code: 'CHL', name: 'Chile', temp: '14-24°C', highlight: 'Lake District' },
        { code: 'BWA', name: 'Botswana', temp: '20-30°C', highlight: 'Green season' },
        { code: 'MOZ', name: 'Mozambique', temp: '24-30°C', highlight: 'Beach paradise' },
        { code: 'FJI', name: 'Fiji', temp: '24-30°C', highlight: 'Island hopping' },
      ],
      'Mar': [
        { code: 'JPN', name: 'Japan', temp: '10-18°C', highlight: 'Cherry blossoms' },
        { code: 'ESP', name: 'Spain', temp: '12-20°C', highlight: 'Spring time' },
        { code: 'PRT', name: 'Portugal', temp: '12-18°C', highlight: 'Lisbon charm' },
        { code: 'ITA', name: 'Italy', temp: '12-18°C', highlight: 'Rome & Florence' },
        { code: 'GRC', name: 'Greece', temp: '12-18°C', highlight: 'Spring islands' },
        { code: 'HRV', name: 'Croatia', temp: '10-16°C', highlight: 'Dubrovnik' },
        { code: 'TUR', name: 'Turkey', temp: '10-18°C', highlight: 'Istanbul spring' },
        { code: 'MAR', name: 'Morocco', temp: '14-22°C', highlight: 'Desert adventures' },
      ],
      'Apr': [
        { code: 'JPN', name: 'Japan', temp: '12-20°C', highlight: 'Peak sakura' },
        { code: 'NLD', name: 'Netherlands', temp: '10-16°C', highlight: 'Tulip fields' },
        { code: 'FRA', name: 'France', temp: '12-18°C', highlight: 'Paris spring' },
        { code: 'USA', name: 'Washington DC', temp: '12-20°C', highlight: 'Cherry blossoms' },
        { code: 'BEL', name: 'Belgium', temp: '10-16°C', highlight: 'Brussels bloom' },
        { code: 'CHE', name: 'Switzerland', temp: '10-18°C', highlight: 'Alps awakening' },
        { code: 'AUT', name: 'Austria', temp: '10-18°C', highlight: 'Vienna spring' },
        { code: 'KOR', name: 'South Korea', temp: '12-20°C', highlight: 'Cherry blossoms' },
      ],
      'May': [
        { code: 'GBR', name: 'United Kingdom', temp: '12-18°C', highlight: 'English gardens' },
        { code: 'IRL', name: 'Ireland', temp: '10-16°C', highlight: 'Green landscapes' },
        { code: 'FRA', name: 'France', temp: '15-22°C', highlight: 'Loire Valley' },
        { code: 'DEU', name: 'Germany', temp: '14-20°C', highlight: 'Castle country' },
        { code: 'NOR', name: 'Norway', temp: '8-16°C', highlight: 'Fjord season' },
        { code: 'SWE', name: 'Sweden', temp: '10-18°C', highlight: 'Stockholm spring' },
        { code: 'EST', name: 'Estonia', temp: '10-18°C', highlight: 'Tallinn old town' },
        { code: 'LVA', name: 'Latvia', temp: '10-18°C', highlight: 'Baltic spring' },
      ],
      'Jun': [
        { code: 'ISL', name: 'Iceland', temp: '8-14°C', highlight: 'Midnight sun' },
        { code: 'NOR', name: 'Norway', temp: '12-18°C', highlight: 'Fjord season' },
        { code: 'CAN', name: 'Canada', temp: '15-22°C', highlight: 'National parks' },
        { code: 'USA', name: 'Pacific NW', temp: '15-22°C', highlight: 'Seattle summer' },
        { code: 'FIN', name: 'Finland', temp: '14-20°C', highlight: 'White nights' },
        { code: 'RUS', name: 'Russia', temp: '15-22°C', highlight: 'St. Petersburg' },
        { code: 'GRL', name: 'Greenland', temp: '5-12°C', highlight: 'Arctic summer' },
        { code: 'SCT', name: 'Scotland', temp: '12-18°C', highlight: 'Highland summer' },
      ],
      'Jul': [
        { code: 'CAN', name: 'Canada', temp: '18-26°C', highlight: 'Banff & Jasper' },
        { code: 'USA', name: 'Alaska', temp: '12-18°C', highlight: 'Midnight sun' },
        { code: 'GBR', name: 'Scotland', temp: '12-18°C', highlight: 'Highlands' },
        { code: 'IRL', name: 'Ireland', temp: '14-18°C', highlight: 'Green summer' },
        { code: 'ISL', name: 'Iceland', temp: '10-15°C', highlight: 'Ring road' },
        { code: 'NOR', name: 'Norway', temp: '14-20°C', highlight: 'Bergen & fjords' },
        { code: 'FRO', name: 'Faroe Islands', temp: '10-14°C', highlight: 'Dramatic cliffs' },
        { code: 'EST', name: 'Estonia', temp: '16-22°C', highlight: 'Island hopping' },
      ],
      'Aug': [
        { code: 'SWE', name: 'Sweden', temp: '16-22°C', highlight: 'Stockholm' },
        { code: 'DNK', name: 'Denmark', temp: '16-22°C', highlight: 'Copenhagen' },
        { code: 'POL', name: 'Poland', temp: '18-25°C', highlight: 'Krakow' },
        { code: 'CZE', name: 'Czech Republic', temp: '18-26°C', highlight: 'Prague' },
        { code: 'HUN', name: 'Hungary', temp: '20-28°C', highlight: 'Budapest' },
        { code: 'SVN', name: 'Slovenia', temp: '18-26°C', highlight: 'Lake Bled' },
        { code: 'SVK', name: 'Slovakia', temp: '18-26°C', highlight: 'Tatras' },
        { code: 'ROU', name: 'Romania', temp: '18-28°C', highlight: 'Transylvania' },
      ],
      'Sep': [
        { code: 'DEU', name: 'Germany', temp: '14-22°C', highlight: 'Munich beauty' },
        { code: 'FRA', name: 'France', temp: '15-24°C', highlight: 'Provence' },
        { code: 'ITA', name: 'Italy', temp: '18-26°C', highlight: 'Tuscany' },
        { code: 'USA', name: 'New England', temp: '14-22°C', highlight: 'Fall colors begin' },
        { code: 'ESP', name: 'Spain', temp: '18-26°C', highlight: 'Barcelona' },
        { code: 'PRT', name: 'Portugal', temp: '18-26°C', highlight: 'Porto wine' },
        { code: 'GRC', name: 'Greece', temp: '20-28°C', highlight: 'Island hopping' },
        { code: 'HRV', name: 'Croatia', temp: '18-26°C', highlight: 'Coast paradise' },
      ],
      'Oct': [
        { code: 'JPN', name: 'Japan', temp: '14-22°C', highlight: 'Autumn leaves' },
        { code: 'USA', name: 'New England', temp: '10-18°C', highlight: 'Peak foliage' },
        { code: 'CAN', name: 'Canada', temp: '8-16°C', highlight: 'Fall colors' },
        { code: 'KOR', name: 'South Korea', temp: '12-20°C', highlight: 'Autumn beauty' },
        { code: 'CHN', name: 'China', temp: '12-22°C', highlight: 'Golden autumn' },
        { code: 'DEU', name: 'Germany', temp: '10-16°C', highlight: 'Oktoberfest' },
        { code: 'AUT', name: 'Austria', temp: '8-16°C', highlight: 'Alpine autumn' },
        { code: 'CHE', name: 'Switzerland', temp: '8-16°C', highlight: 'Mountain colors' },
      ],
      'Nov': [
        { code: 'IND', name: 'India', temp: '18-28°C', highlight: 'Perfect touring' },
        { code: 'NPL', name: 'Nepal', temp: '12-22°C', highlight: 'Trekking season' },
        { code: 'MYS', name: 'Malaysia', temp: '24-32°C', highlight: 'East coast' },
        { code: 'SGP', name: 'Singapore', temp: '24-31°C', highlight: 'City escape' },
        { code: 'THA', name: 'Thailand', temp: '24-32°C', highlight: 'Cool season' },
        { code: 'VNM', name: 'Vietnam', temp: '22-28°C', highlight: 'North pleasant' },
        { code: 'LAO', name: 'Laos', temp: '20-28°C', highlight: 'Perfect weather' },
        { code: 'KHM', name: 'Cambodia', temp: '24-32°C', highlight: 'Temple weather' },
      ],
      'Dec': [
        { code: 'IND', name: 'India', temp: '14-26°C', highlight: 'Rajasthan' },
        { code: 'NPL', name: 'Nepal', temp: '8-18°C', highlight: 'Clear Himalayas' },
        { code: 'LKA', name: 'Sri Lanka', temp: '24-30°C', highlight: 'Dry season' },
        { code: 'MYS', name: 'Malaysia', temp: '24-32°C', highlight: 'Langkawi' },
        { code: 'THA', name: 'Thailand', temp: '24-30°C', highlight: 'Peak season' },
        { code: 'VNM', name: 'Vietnam', temp: '18-26°C', highlight: 'North cool' },
        { code: 'MMR', name: 'Myanmar', temp: '20-28°C', highlight: 'Temple season' },
        { code: 'BTN', name: 'Bhutan', temp: '10-18°C', highlight: 'Clear mountains' },
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
        { code: 'PAN', name: 'Panama', temp: '26-30°C', highlight: 'Quiet beaches' },
        { code: 'COL', name: 'Colombia', temp: '22-28°C', highlight: 'Amazon season' },
        { code: 'PER', name: 'Peru (Amazon)', temp: '24-30°C', highlight: 'Jungle peak' },
        { code: 'ECU', name: 'Ecuador', temp: '24-28°C', highlight: 'Coastal rains' },
      ],
      'Feb': [
        { code: 'PHL', name: 'Philippines', temp: '26-32°C', highlight: 'Off-peak deals' },
        { code: 'IDN', name: 'Indonesia', temp: '26-32°C', highlight: 'Budget travel' },
        { code: 'BRA', name: 'Brazil', temp: '26-32°C', highlight: 'Amazon high water' },
        { code: 'GTM', name: 'Guatemala', temp: '20-28°C', highlight: 'Quiet season' },
        { code: 'HND', name: 'Honduras', temp: '24-30°C', highlight: 'Green jungle' },
        { code: 'NIC', name: 'Nicaragua', temp: '26-32°C', highlight: 'Budget paradise' },
        { code: 'SLV', name: 'El Salvador', temp: '26-32°C', highlight: 'Surf season' },
        { code: 'BLZ', name: 'Belize', temp: '26-30°C', highlight: 'Quiet reefs' },
      ],
      'Mar': [
        { code: 'NIC', name: 'Nicaragua', temp: '28-34°C', highlight: 'Transition time' },
        { code: 'HND', name: 'Honduras', temp: '26-32°C', highlight: 'Green landscapes' },
        { code: 'COL', name: 'Colombia', temp: '20-28°C', highlight: 'Amazon season' },
        { code: 'ECU', name: 'Ecuador', temp: '22-28°C', highlight: 'Coastal rains' },
        { code: 'PER', name: 'Peru', temp: '22-28°C', highlight: 'Machu Picchu quiet' },
        { code: 'BOL', name: 'Bolivia', temp: '18-24°C', highlight: 'Salt flats mirror' },
        { code: 'VEN', name: 'Venezuela', temp: '26-32°C', highlight: 'Angel Falls peak' },
        { code: 'GUY', name: 'Guyana', temp: '26-30°C', highlight: 'Wildlife season' },
      ],
      'Apr': [
        { code: 'KEN', name: 'Kenya', temp: '20-28°C', highlight: 'Long rains (budget)' },
        { code: 'TZA', name: 'Tanzania', temp: '22-28°C', highlight: 'Green Serengeti' },
        { code: 'UGA', name: 'Uganda', temp: '20-26°C', highlight: 'Gorilla tracking' },
        { code: 'RWA', name: 'Rwanda', temp: '18-24°C', highlight: 'Misty mountains' },
        { code: 'ETH', name: 'Ethiopia', temp: '18-26°C', highlight: 'Green highlands' },
        { code: 'MDG', name: 'Madagascar', temp: '20-28°C', highlight: 'Budget season' },
        { code: 'ZMB', name: 'Zambia', temp: '18-26°C', highlight: 'Victoria Falls peak' },
        { code: 'ZWE', name: 'Zimbabwe', temp: '18-26°C', highlight: 'Waterfall season' },
      ],
      'May': [
        { code: 'KEN', name: 'Kenya', temp: '18-26°C', highlight: 'Budget safaris' },
        { code: 'THA', name: 'Thailand', temp: '28-34°C', highlight: 'Off-season deals' },
        { code: 'VNM', name: 'Vietnam', temp: '28-34°C', highlight: 'Central highlands' },
        { code: 'MMR', name: 'Myanmar', temp: '28-36°C', highlight: 'Quiet temples' },
        { code: 'LAO', name: 'Laos', temp: '28-34°C', highlight: 'River rising' },
        { code: 'KHM', name: 'Cambodia', temp: '30-36°C', highlight: 'Angkor empty' },
        { code: 'IDN', name: 'Indonesia', temp: '28-32°C', highlight: 'Shoulder season' },
        { code: 'PHL', name: 'Philippines', temp: '28-34°C', highlight: 'Pre-monsoon' },
      ],
      'Jun': [
        { code: 'IND', name: 'India', temp: '28-38°C', highlight: 'Monsoon magic' },
        { code: 'NPL', name: 'Nepal', temp: '22-30°C', highlight: 'Lush valleys' },
        { code: 'THA', name: 'Thailand', temp: '28-34°C', highlight: 'Green island' },
        { code: 'KHM', name: 'Cambodia', temp: '28-34°C', highlight: 'Quiet Angkor' },
        { code: 'LKA', name: 'Sri Lanka', temp: '26-30°C', highlight: 'West coast rains' },
        { code: 'BGD', name: 'Bangladesh', temp: '28-34°C', highlight: 'Delta floods' },
        { code: 'MMR', name: 'Myanmar', temp: '28-32°C', highlight: 'Temple season' },
        { code: 'BTN', name: 'Bhutan', temp: '18-26°C', highlight: 'Green valleys' },
      ],
      'Jul': [
        { code: 'IND', name: 'India (Kerala)', temp: '26-30°C', highlight: 'Ayurveda season' },
        { code: 'LKA', name: 'Sri Lanka', temp: '26-30°C', highlight: 'East coast dry' },
        { code: 'IDN', name: 'Indonesia', temp: '26-32°C', highlight: 'Dry season starts' },
        { code: 'MYS', name: 'Malaysia', temp: '26-32°C', highlight: 'East coast' },
        { code: 'PHL', name: 'Philippines', temp: '28-32°C', highlight: 'Palawan dry' },
        { code: 'THA', name: 'Thailand (South)', temp: '28-32°C', highlight: 'West coast' },
        { code: 'VNM', name: 'Vietnam (Central)', temp: '28-34°C', highlight: 'Coastal beauty' },
        { code: 'CRI', name: 'Costa Rica', temp: '24-28°C', highlight: 'Green paradise' },
      ],
      'Aug': [
        { code: 'IND', name: 'India', temp: '26-32°C', highlight: 'Monsoon fades' },
        { code: 'NPL', name: 'Nepal', temp: '22-28°C', highlight: 'Green Himalayas' },
        { code: 'BGD', name: 'Bangladesh', temp: '28-32°C', highlight: 'River cruises' },
        { code: 'MMR', name: 'Myanmar', temp: '28-32°C', highlight: 'Temple hopping' },
        { code: 'KHM', name: 'Cambodia', temp: '28-32°C', highlight: 'Floating villages' },
        { code: 'LAO', name: 'Laos', temp: '26-32°C', highlight: 'Mekong high' },
        { code: 'THA', name: 'Thailand', temp: '28-32°C', highlight: 'Quiet islands' },
        { code: 'VNM', name: 'Vietnam', temp: '28-34°C', highlight: 'Central rains' },
      ],
      'Sep': [
        { code: 'IND', name: 'India', temp: '26-32°C', highlight: 'Post-monsoon' },
        { code: 'THA', name: 'Thailand', temp: '28-32°C', highlight: 'Late rains' },
        { code: 'VNM', name: 'Vietnam', temp: '26-32°C', highlight: 'Central rains' },
        { code: 'LAO', name: 'Laos', temp: '26-32°C', highlight: 'River season' },
        { code: 'NPL', name: 'Nepal', temp: '20-28°C', highlight: 'Post-monsoon trek' },
        { code: 'KHM', name: 'Cambodia', temp: '26-32°C', highlight: 'Lake Tonle Sap' },
        { code: 'IDN', name: 'Indonesia', temp: '28-32°C', highlight: 'Transition' },
        { code: 'MYS', name: 'Malaysia', temp: '26-32°C', highlight: 'West coast' },
      ],
      'Oct': [
        { code: 'THA', name: 'Thailand', temp: '26-32°C', highlight: 'Transition' },
        { code: 'VNM', name: 'Vietnam (Central)', temp: '24-30°C', highlight: 'Rainy coast' },
        { code: 'PHL', name: 'Philippines', temp: '26-32°C', highlight: 'Typhoon season' },
        { code: 'IDN', name: 'Indonesia', temp: '28-34°C', highlight: 'Transition' },
        { code: 'KHM', name: 'Cambodia', temp: '26-30°C', highlight: 'Water Festival' },
        { code: 'LAO', name: 'Laos', temp: '24-30°C', highlight: 'Boat racing' },
        { code: 'MMR', name: 'Myanmar', temp: '26-32°C', highlight: 'Festival season' },
        { code: 'BGD', name: 'Bangladesh', temp: '26-32°C', highlight: 'Durga Puja' },
      ],
      'Nov': [
        { code: 'THA', name: 'Thailand (South)', temp: '26-32°C', highlight: 'Gulf rains' },
        { code: 'MYS', name: 'Malaysia (East)', temp: '26-30°C', highlight: 'Monsoon diving' },
        { code: 'PHL', name: 'Philippines', temp: '26-32°C', highlight: 'Late season' },
        { code: 'SGP', name: 'Singapore', temp: '24-32°C', highlight: 'Shower season' },
        { code: 'IDN', name: 'Indonesia', temp: '28-32°C', highlight: 'Wet starting' },
        { code: 'VNM', name: 'Vietnam (South)', temp: '26-32°C', highlight: 'Delta rains' },
        { code: 'KHM', name: 'Cambodia', temp: '26-32°C', highlight: 'Water receding' },
        { code: 'LAO', name: 'Laos', temp: '22-30°C', highlight: 'Cool season start' },
      ],
      'Dec': [
        { code: 'MYS', name: 'Malaysia (East)', temp: '26-30°C', highlight: 'Quiet beaches' },
        { code: 'IDN', name: 'Indonesia', temp: '26-32°C', highlight: 'Wet season deals' },
        { code: 'BRA', name: 'Brazil (Amazon)', temp: '26-32°C', highlight: 'Rising waters' },
        { code: 'PAN', name: 'Panama', temp: '26-30°C', highlight: 'Green season' },
        { code: 'CRI', name: 'Costa Rica', temp: '24-28°C', highlight: 'Caribbean rains' },
        { code: 'COL', name: 'Colombia', temp: '24-28°C', highlight: 'Amazon floods' },
        { code: 'PER', name: 'Peru (Amazon)', temp: '26-30°C', highlight: 'Jungle season' },
        { code: 'ECU', name: 'Ecuador', temp: '26-30°C', highlight: 'Galapagos wet' },
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
  const [selectedGuideCategory, setSelectedGuideCategory] = useState(null); // For new seasonal guide
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { requireAuth, user } = useAuth();
  
  // Refs for horizontal scrolling
  const alternatesScrollRef = useRef(null);
  const guideCategoriesScrollRef = useRef(null);
  
  // NEW: Search result state for visa info and alternate destinations
  const [searchResult, setSearchResult] = useState(null);
  const [visaData, setVisaData] = useState([]);
  
  // Date state - default to current month
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const selectedMonthAbbrev = MONTH_ABBREV[selectedMonth];
  const selectedMonthName = MONTH_NAMES[selectedMonth];

  // Handle wishlist toggle with auth
  const handleWishlistToggle = (e, countryCode, countryName) => {
    e.stopPropagation(); // Prevent card click
    const country = { country_code: countryCode, country_name: countryName };
    if (isInWishlist(countryCode)) {
      removeFromWishlist(countryCode, user?.user_id);
    } else {
      requireAuth(() => {
        addToWishlist(country, user?.user_id);
      });
    }
  };

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

    const fetchVisaData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/visa`);
        setVisaData(response.data.data);
      } catch (error) {
        console.error('Error fetching visa data:', error);
      }
    };

    fetchSeasons();
    fetchVisaData();
  }, []);

  // Process data when seasons data or selected month changes
  useEffect(() => {
    if (seasonsData.length === 0) return;
    
    // Deduplicate by country_code - keep only the first occurrence
    const uniqueCountries = [];
    const seenCodes = new Set();
    for (const country of seasonsData) {
      if (!seenCodes.has(country.country_code)) {
        seenCodes.add(country.country_code);
        uniqueCountries.push(country);
      }
    }
    
    const processed = uniqueCountries.map(country => {
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
    
    // Get visa info for the selected country
    const countryVisa = visaData.find(v => v.country_code === country.country_code);
    
    // Find alternate destinations for the same month with similar or better conditions
    const alternates = processedData
      .filter(c => 
        c.country_code !== country.country_code && 
        (c.current_season === 'peak' || c.current_season === 'shoulder')
      )
      .sort((a, b) => {
        // Prioritize peak season countries
        if (a.current_season === 'peak' && b.current_season !== 'peak') return -1;
        if (b.current_season === 'peak' && a.current_season !== 'peak') return 1;
        return 0;
      })
      .slice(0, 5)
      .map(c => ({
        ...c,
        visa: visaData.find(v => v.country_code === c.country_code)
      }));
    
    // Set search result with country info, visa data, and alternates
    setSearchResult({
      country: country,
      visa: countryVisa || {
        visa_type: 'visa_required',
        requirements: 'Visa requirements may apply'
      },
      alternates: alternates
    });
  };

  // Clear search results
  const clearSearchResult = () => {
    setSearchResult(null);
    setSearchQuery('');
  };

  // Helper function to format visa type for display
  const formatVisaType = (visaType) => {
    switch (visaType) {
      case 'visa_free': return 'Visa Free';
      case 'visa_on_arrival': return 'Visa on Arrival';
      case 'e_visa': return 'E-Visa';
      case 'visa_required': return 'Visa Required';
      default: return 'Visa Required';
    }
  };

  // Helper function to get visa type color
  const getVisaTypeColor = (visaType) => {
    switch (visaType) {
      case 'visa_free': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'visa_on_arrival': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'e_visa': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
      case 'visa_required': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  // Default visa info based on visa type
  const getDefaultVisaInfo = (visaType) => {
    switch (visaType) {
      case 'visa_free':
        return {
          documents: ['Valid passport', 'Return ticket', 'Hotel booking'],
          processing: 'No processing required',
          cost: 'Free'
        };
      case 'visa_on_arrival':
        return {
          documents: ['Valid passport', 'Passport photos', 'Hotel booking', 'Return ticket'],
          processing: 'At airport (15-30 mins)',
          cost: '$20 - $50'
        };
      case 'e_visa':
        return {
          documents: ['Valid passport', 'Passport photos', 'Travel itinerary', 'Bank statement'],
          processing: '3-5 business days',
          cost: '$30 - $80'
        };
      case 'visa_required':
      default:
        return {
          documents: ['Valid passport', 'Visa application form', 'Passport photos', 'Bank statements', 'Travel insurance', 'Flight bookings'],
          processing: '5-15 business days',
          cost: '$50 - $200'
        };
    }
  };

  const handleCountryCardClick = (country) => {
    setSelectedCountry(country);
  };

  const legends = [
    { color: '#FF7A00', label: 'Best Time', description: `Ideal to visit in ${selectedMonthName}`, icon: Sun },
    { color: '#0B3C5D', label: 'Good Time', description: 'Near peak season', icon: CloudSun },
    { color: '#94A3B8', label: 'Off Season', description: `Not ideal in ${selectedMonthName}`, icon: Cloud },
    { color: '#E2E8F0', label: 'No Data', description: 'Information not available', icon: null }
  ];

  // For the all destinations view (without category filter)
  const peakCountries = processedData.filter(c => c.current_season === 'peak');
  const shoulderCountries = processedData.filter(c => c.current_season === 'shoulder');
  const offCountries = processedData.filter(c => c.current_season === 'off');

  // Handle search button click
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      const country = processedData.find(c => 
        c.country_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (country) {
        handleCountrySelect(country);
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Hero Section with Background Image */}
      <div 
        className="relative bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(11, 60, 93, 0.85), rgba(11, 60, 93, 0.6)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
          minHeight: '320px'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }} data-testid="seasons-page-title">
              Plan Your Trip + Visa in One Place
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-xl">
              Check Best Seasons, Visa requirements and compare options - all in minutes
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-xl p-4 md:p-5 shadow-xl max-w-4xl">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                {/* Destination Input */}
                <div className="flex-1 relative">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0B3C5D' }}>
                    Select Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                        setSearchResult(null);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Where do you want to go?"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      style={{ border: '1px solid #E2E8F0', color: '#0B3C5D' }}
                      data-testid="country-search"
                    />
                  </div>
                  
                  {/* Search Dropdown */}
                  {showDropdown && filteredCountries.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto"
                    >
                      {filteredCountries.map((country) => (
                        <button
                          key={country.country_code}
                          onClick={() => handleCountrySelect(country)}
                          className="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center justify-between transition-all border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={getFlag(country.country_code)}
                              alt=""
                              className="w-6 h-4 object-cover rounded"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="font-medium text-sm" style={{ color: '#0B3C5D' }}>{country.country_name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            country.current_season === 'peak' ? 'bg-green-100 text-green-700' :
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

                {/* Month Selector */}
                <div className="w-full md:w-36">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0B3C5D' }}>
                    Travel Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    style={{ borderColor: '#E2E8F0', color: '#0B3C5D' }}
                    data-testid="month-selector"
                  >
                    {MONTH_NAMES.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                </div>

                {/* Year Selector */}
                <div className="w-full md:w-28">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#0B3C5D' }}>
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    style={{ borderColor: '#E2E8F0', color: '#0B3C5D' }}
                    data-testid="year-selector"
                  >
                    {[2025, 2026, 2027, 2028].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearchClick}
                  className="w-full md:w-auto px-6 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#FF7A00' }}
                  data-testid="search-btn"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Results Section - Shows when a country is searched */}
      {searchResult && (
        <div className="bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#FF7A00' }}></div>
                <h2 className="text-lg md:text-xl font-bold" style={{ color: '#0B3C5D', fontFamily: 'Poppins, sans-serif' }}>
                  Your Destination & Alternatives for {selectedMonthName}
                </h2>
              </div>
              <button
                onClick={clearSearchResult}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                data-testid="clear-search-btn"
              >
                <X className="w-5 h-5" style={{ color: '#64748B' }} />
              </button>
            </div>

            {/* Country Cards Row - Searched + 5 Alternates with horizontal scroll */}
            <div className="relative mb-6" data-testid="search-results-section">
              {/* Left scroll arrow */}
              <button
                onClick={() => alternatesScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border"
                style={{ borderColor: '#E2E8F0' }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: '#0B3C5D' }} />
              </button>

              {/* Scrollable container */}
              <div 
                ref={alternatesScrollRef}
                className="flex gap-3 overflow-x-auto px-10 pb-2 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Main Searched Country - Highlighted */}
                <div 
                  className="relative rounded-xl overflow-hidden cursor-pointer group border-2 flex-shrink-0 w-36"
                  style={{ borderColor: '#FF7A00' }}
                  onClick={() => setSelectedCountry(searchResult.country)}
                  data-testid={`search-result-country-${searchResult.country.country_code}`}
                >
                  <div className="absolute top-0 left-0 right-0 px-2 py-1 text-xs font-bold text-white text-center" style={{ backgroundColor: '#FF7A00' }}>
                    Your Choice
                  </div>
                  <div className="pt-7 pb-3 px-3 bg-gradient-to-br from-orange-50 to-white">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={getFlag(searchResult.country.country_code)}
                        alt={searchResult.country.country_name}
                        className="w-12 h-8 object-cover rounded shadow-sm mb-2"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <h3 className="font-bold text-sm mb-1" style={{ color: '#0B3C5D' }}>
                        {searchResult.country.country_name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        searchResult.country.current_season === 'peak' ? 'bg-green-100 text-green-700' :
                        searchResult.country.current_season === 'shoulder' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {searchResult.country.current_season === 'peak' ? 'Best Time' :
                         searchResult.country.current_season === 'shoulder' ? 'Good' : 'Off Season'}
                      </span>
                    </div>
                  </div>
                  {/* Wishlist */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, searchResult.country.country_code, searchResult.country.country_name)}
                    className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all ${
                      isInWishlist(searchResult.country.country_code) 
                        ? 'bg-red-100 text-red-500' 
                        : 'bg-white/80 text-gray-400 hover:text-red-400'
                    }`}
                    data-testid={`wishlist-search-${searchResult.country.country_code}`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(searchResult.country.country_code) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* 5 Alternate Destinations */}
                {searchResult.alternates.map((alt, idx) => (
                  <div 
                    key={alt.country_code}
                    className="relative rounded-xl overflow-hidden cursor-pointer group bg-white border hover:shadow-md transition-all flex-shrink-0 w-36"
                    style={{ borderColor: '#E2E8F0' }}
                    onClick={() => setSelectedCountry(alt)}
                    data-testid={`alt-dest-${alt.country_code}`}
                  >
                    <div className="absolute top-0 left-0 right-0 px-2 py-1 text-xs font-medium text-white text-center" style={{ backgroundColor: '#0B3C5D' }}>
                      Alternative #{idx + 1}
                    </div>
                    <div className="pt-7 pb-3 px-3">
                      <div className="flex flex-col items-center text-center">
                        <img
                          src={getFlag(alt.country_code)}
                          alt={alt.country_name}
                          className="w-10 h-7 object-cover rounded shadow-sm mb-2"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <h3 className="font-semibold text-sm mb-1" style={{ color: '#0B3C5D' }}>
                          {alt.country_name}
                        </h3>
                        <div className="flex flex-wrap gap-1 justify-center">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            alt.current_season === 'peak' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {alt.current_season === 'peak' ? 'Peak' : 'Good'}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getVisaTypeColor(alt.visa?.visa_type).bg} ${getVisaTypeColor(alt.visa?.visa_type).text}`}>
                            {formatVisaType(alt.visa?.visa_type).split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Wishlist */}
                    <button
                      onClick={(e) => handleWishlistToggle(e, alt.country_code, alt.country_name)}
                      className={`absolute bottom-2 right-2 p-1 rounded-full transition-all ${
                        isInWishlist(alt.country_code) 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-white text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(alt.country_code) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Right scroll arrow */}
              <button
                onClick={() => alternatesScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border"
                style={{ borderColor: '#E2E8F0' }}
              >
                <ChevronRight className="w-5 h-5" style={{ color: '#0B3C5D' }} />
              </button>
            </div>

            {/* Visa Information - Horizontal 4-Column Layout */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border" style={{ borderColor: '#E2E8F0' }} data-testid="visa-info-card">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#0B3C5D', fontFamily: 'Poppins, sans-serif' }}>
                  Confused About Visa? We Simplify It.
                </h3>
                <p className="text-sm text-gray-600">Everything you need to know before you travel to {searchResult.country.country_name}</p>
              </div>

              {/* 4-Column Visa Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Visa Type */}
                <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                  <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                  <p className="text-xs text-gray-500 mb-1">Visa Type</p>
                  <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                    {formatVisaType(searchResult.visa?.visa_type)}
                  </p>
                </div>

                {/* Documents Needed */}
                <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                  <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                  <p className="text-xs text-gray-500 mb-1">Documents Needed</p>
                  <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                    {getDefaultVisaInfo(searchResult.visa?.visa_type).documents.slice(0, 2).join(', ')}
                  </p>
                </div>

                {/* Processing Time */}
                <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                  <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                  <p className="text-xs text-gray-500 mb-1">Processing Time</p>
                  <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                    {getDefaultVisaInfo(searchResult.visa?.visa_type).processing}
                  </p>
                </div>

                {/* Cost Estimate */}
                <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                  <DollarSign className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                  <p className="text-xs text-gray-500 mb-1">Cost Estimate</p>
                  <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                    {getDefaultVisaInfo(searchResult.visa?.visa_type).cost}
                  </p>
                </div>
              </div>

              {/* CTA Button - Link to Visa Page */}
              <div className="text-center">
                <Link
                  to="/visa"
                  className="px-8 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 inline-flex items-center gap-2"
                  style={{ backgroundColor: '#0B3C5D' }}
                  data-testid="view-full-details-btn"
                >
                  Explore Visa Details
                  <Plane className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* Top 5 Destinations This Month */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200" data-testid="top-destinations-section">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-primary">Top 5 Destinations for {selectedMonthName}</h3>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">RECOMMENDED</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topDestinationsData[selectedMonthAbbrev]?.map((dest, idx) => {
                const categoryData = CATEGORIES.find(c => c.id === dest.category);
                const inWishlist = isInWishlist(dest.code);
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
                    className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border border-amber-100 group relative"
                    data-testid={`top-dest-${dest.code}`}
                  >
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleWishlistToggle(e, dest.code, dest.name)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-all z-10 ${
                        inWishlist 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                      }`}
                      data-testid={`wishlist-top-dest-${dest.code}`}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>
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

          {/* ========== SEPARATOR - VISA INTELLIGENCE ========== */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <h2 className="text-lg font-bold tracking-widest" style={{ color: '#0B3C5D', fontFamily: 'Poppins, sans-serif' }}>
              VISA INTELLIGENCE
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Always Visible Visa Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border mb-8" style={{ borderColor: '#E2E8F0' }} data-testid="visa-section-always">
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold" style={{ color: '#0B3C5D', fontFamily: 'Poppins, sans-serif' }}>
                Confused About Visa? We Simplify It.
              </h3>
              <p className="text-sm text-gray-600">
                {searchResult 
                  ? `Everything you need to know before you travel to ${searchResult.country.country_name}` 
                  : 'Enter destination and travel details for details'}
              </p>
            </div>

            {/* 4-Column Visa Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {/* Visa Type */}
              <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                <p className="text-xs text-gray-500 mb-1">Visa Type</p>
                <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                  {searchResult ? formatVisaType(searchResult.visa?.visa_type) : 'Visa on Arr / E-Visa / Visa Required'}
                </p>
              </div>

              {/* Documents Needed */}
              <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                <p className="text-xs text-gray-500 mb-1">Documents Needed</p>
                <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                  {searchResult ? getDefaultVisaInfo(searchResult.visa?.visa_type).documents.slice(0, 2).join(', ') : 'xxx'}
                </p>
              </div>

              {/* Processing Time */}
              <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                <p className="text-xs text-gray-500 mb-1">Processing Time</p>
                <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                  {searchResult ? getDefaultVisaInfo(searchResult.visa?.visa_type).processing : 'xxx'}
                </p>
              </div>

              {/* Cost Estimate */}
              <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#E2E8F0' }}>
                <DollarSign className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF7A00' }} />
                <p className="text-xs text-gray-500 mb-1">Cost Estimate</p>
                <p className="font-bold text-sm" style={{ color: '#0B3C5D' }}>
                  {searchResult ? getDefaultVisaInfo(searchResult.visa?.visa_type).cost : 'xxx'}
                </p>
              </div>
            </div>

            {/* CTA Button - Link to Visa Page */}
            <div className="text-center">
              <Link
                to="/visa"
                className="px-8 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 inline-flex items-center gap-2"
                style={{ backgroundColor: '#0B3C5D' }}
                data-testid="explore-visa-btn"
              >
                Explore Visa Details
                <Plane className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ========== SEPARATOR - SEASONAL TRAVEL GUIDE ========== */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <h2 className="text-lg font-bold tracking-widest" style={{ color: '#0B3C5D', fontFamily: 'Poppins, sans-serif' }}>
              SEASONAL TRAVEL GUIDE
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* NEW Seasonal Travel Guide - Category-based horizontal scroll */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 mb-6 border border-violet-200" data-testid="seasonal-guide-section">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-violet-500" />
              <h3 className="text-xl font-bold text-primary">Explore by Category</h3>
              <span className="px-2 py-0.5 bg-violet-200 text-violet-800 text-xs font-bold rounded-full">CURATED</span>
            </div>
            
            {/* Category Cards - Horizontal Scroll with Images */}
            <div className="relative">
              {/* Left scroll arrow */}
              <button
                onClick={() => guideCategoriesScrollRef.current?.scrollBy({ left: -250, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Scrollable container */}
              <div 
                ref={guideCategoriesScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 px-12 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {TRAVEL_GUIDE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedGuideCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedGuideCategory(isSelected ? null : cat.id)}
                      className={`relative rounded-xl overflow-hidden transition-all flex-shrink-0 w-44 h-48 group ${
                        isSelected 
                          ? 'ring-4 ring-violet-400 ring-offset-2 shadow-xl'
                          : 'hover:shadow-xl hover:scale-105'
                      }`}
                      data-testid={`guide-cat-${cat.id}`}
                    >
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${cat.image}')` }}
                      />
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent ${isSelected ? 'from-violet-900/90' : ''}`} />
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-3 text-white">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2 shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-sm leading-tight">{cat.label}</h4>
                        <p className="text-xs text-white/80 mt-0.5">{cat.description}</p>
                      </div>
                      
                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <span className="flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Right scroll arrow */}
              <button
                onClick={() => guideCategoriesScrollRef.current?.scrollBy({ left: 250, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all border border-gray-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Category-based Destination Results */}
            {selectedGuideCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`${TRAVEL_GUIDE_CATEGORIES.find(c => c.id === selectedGuideCategory)?.bgColor} rounded-xl p-5 ${TRAVEL_GUIDE_CATEGORIES.find(c => c.id === selectedGuideCategory)?.borderColor} border-2 mt-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(TRAVEL_GUIDE_CATEGORIES.find(c => c.id === selectedGuideCategory)?.icon || Compass, { className: "w-6 h-6 text-gray-700" })}
                  <div>
                    <h4 className="font-bold text-primary">
                      {TRAVEL_GUIDE_CATEGORIES.find(c => c.id === selectedGuideCategory)?.label} for {selectedMonthName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Top picks based on your preference
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {processedData
                    .filter(c => c.categories?.includes(selectedGuideCategory) && (c.current_season === 'peak' || c.current_season === 'shoulder'))
                    .slice(0, 8)
                    .map((dest, idx) => {
                      const inWishlist = isInWishlist(dest.country_code);
                      return (
                        <motion.div
                          key={dest.country_code}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedCountry(dest)}
                          className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all border border-gray-100 group relative"
                          data-testid={`guide-dest-${dest.country_code}`}
                        >
                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => handleWishlistToggle(e, dest.country_code, dest.country_name)}
                            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all z-10 ${
                              inWishlist 
                                ? 'bg-red-100 text-red-500' 
                                : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                          </button>
                          <div className="flex items-center gap-2 mb-2 pr-8">
                            <img
                              src={getFlag(dest.country_code)}
                              alt={dest.country_name}
                              className="w-8 h-5 object-cover rounded shadow-sm"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="font-bold text-primary text-sm">{dest.country_name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            dest.current_season === 'peak' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {dest.current_season === 'peak' ? 'Best Time' : 'Good Time'}
                          </span>
                          <p className="text-xs text-violet-600 mt-2 group-hover:underline">Explore →</p>
                        </motion.div>
                      );
                    })}
                </div>

                {/* Show message if no results */}
                {processedData
                  .filter(c => c.categories?.includes(selectedGuideCategory) && (c.current_season === 'peak' || c.current_season === 'shoulder'))
                  .length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No destinations found for this category in {selectedMonthName}. Try a different month!</p>
                  </div>
                )}
              </motion.div>
            )}
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
                  {categoryFilteredData.map((country) => (
                    <div
                      key={`cat-${country.country_code}`}
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
                  {peakCountries.map((country) => (
                    <div
                      key={country.country_code}
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
                  {shoulderCountries.map((country) => (
                    <div
                      key={`shoulder-${country.country_code}`}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-shoulder-${country.country_code}`}
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
                  {offCountries.slice(0, 12).map((country) => (
                    <div
                      key={`off-${country.country_code}`}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`country-card-off-${country.country_code}`}
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

      <BackToTop />
    </div>
  );
};

export default Seasons;
