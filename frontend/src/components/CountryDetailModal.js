import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, FileText, Cloud, Zap, PartyPopper, Utensils, Smartphone, Loader2, Shield, Phone, DollarSign, ArrowRightLeft, Users, TrendingUp, TrendingDown, CheckCircle, ClipboardList, MapPinOff, AlertTriangle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import VisaEligibilityChecker from './VisaEligibilityChecker';
import DocumentChecklistGenerator from './DocumentChecklistGenerator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Month abbreviations
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Comprehensive currency data with estimated rates (when live API unavailable)
const currencyData = {
  // Asia
  THB: { rate: 0.345, name: 'Thai Baht', symbol: '฿', countryCode: 'THA' },
  JPY: { rate: 1.72, name: 'Japanese Yen', symbol: '¥', countryCode: 'JPN' },
  SGD: { rate: 0.0138, name: 'Singapore Dollar', symbol: 'S$', countryCode: 'SGP' },
  MYR: { rate: 0.0475, name: 'Malaysian Ringgit', symbol: 'RM', countryCode: 'MYS' },
  IDR: { rate: 172.5, name: 'Indonesian Rupiah', symbol: 'Rp', countryCode: 'IDN' },
  VND: { rate: 265.8, name: 'Vietnamese Dong', symbol: '₫', countryCode: 'VNM' },
  PHP: { rate: 0.62, name: 'Philippine Peso', symbol: '₱', countryCode: 'PHL' },
  KRW: { rate: 14.2, name: 'South Korean Won', symbol: '₩', countryCode: 'KOR' },
  CNY: { rate: 0.0746, name: 'Chinese Yuan', symbol: '¥', countryCode: 'CHN' },
  HKD: { rate: 0.085, name: 'Hong Kong Dollar', symbol: 'HK$', countryCode: 'HKG' },
  TWD: { rate: 0.35, name: 'Taiwan Dollar', symbol: 'NT$', countryCode: 'TWN' },
  NPR: { rate: 1.44, name: 'Nepalese Rupee', symbol: 'रू', countryCode: 'NPL' },
  LKR: { rate: 3.42, name: 'Sri Lankan Rupee', symbol: 'Rs', countryCode: 'LKA' },
  MVR: { rate: 0.167, name: 'Maldivian Rufiyaa', symbol: 'Rf', countryCode: 'MDV' },
  PKR: { rate: 3.05, name: 'Pakistani Rupee', symbol: 'Rs', countryCode: 'PAK' },
  BDT: { rate: 1.19, name: 'Bangladeshi Taka', symbol: '৳', countryCode: 'BGD' },
  MMK: { rate: 22.8, name: 'Myanmar Kyat', symbol: 'K', countryCode: 'MMR' },
  KHR: { rate: 44.2, name: 'Cambodian Riel', symbol: '៛', countryCode: 'KHM' },
  LAK: { rate: 232, name: 'Lao Kip', symbol: '₭', countryCode: 'LAO' },
  BTN: { rate: 1.0, name: 'Bhutanese Ngultrum', symbol: 'Nu.', countryCode: 'BTN' },
  MNT: { rate: 36.8, name: 'Mongolian Tugrik', symbol: '₮', countryCode: 'MNG' },
  // Middle East
  AED: { rate: 0.04, name: 'UAE Dirham', symbol: 'د.إ', countryCode: 'ARE' },
  SAR: { rate: 0.041, name: 'Saudi Riyal', symbol: 'ر.س', countryCode: 'SAU' },
  QAR: { rate: 0.04, name: 'Qatari Riyal', symbol: 'ر.ق', countryCode: 'QAT' },
  KWD: { rate: 0.0033, name: 'Kuwaiti Dinar', symbol: 'د.ك', countryCode: 'KWT' },
  BHD: { rate: 0.0041, name: 'Bahraini Dinar', symbol: '.د.ب', countryCode: 'BHR' },
  OMR: { rate: 0.0042, name: 'Omani Rial', symbol: 'ر.ع.', countryCode: 'OMN' },
  JOD: { rate: 0.0077, name: 'Jordanian Dinar', symbol: 'د.أ', countryCode: 'JOR' },
  ILS: { rate: 0.04, name: 'Israeli Shekel', symbol: '₪', countryCode: 'ISR' },
  TRY: { rate: 0.352, name: 'Turkish Lira', symbol: '₺', countryCode: 'TUR' },
  IRR: { rate: 458, name: 'Iranian Rial', symbol: '﷼', countryCode: 'IRN' },
  IQD: { rate: 14.2, name: 'Iraqi Dinar', symbol: 'ع.د', countryCode: 'IRQ' },
  LBP: { rate: 163, name: 'Lebanese Pound', symbol: 'ل.ل', countryCode: 'LBN' },
  // Europe
  EUR: { rate: 0.0094, name: 'Euro', symbol: '€', countryCode: 'FRA' },
  GBP: { rate: 0.0081, name: 'British Pound', symbol: '£', countryCode: 'GBR' },
  CHF: { rate: 0.0085, name: 'Swiss Franc', symbol: 'CHF', countryCode: 'CHE' },
  RUB: { rate: 0.97, name: 'Russian Ruble', symbol: '₽', countryCode: 'RUS' },
  SEK: { rate: 0.112, name: 'Swedish Krona', symbol: 'kr', countryCode: 'SWE' },
  NOK: { rate: 0.115, name: 'Norwegian Krone', symbol: 'kr', countryCode: 'NOR' },
  DKK: { rate: 0.073, name: 'Danish Krone', symbol: 'kr', countryCode: 'DNK' },
  PLN: { rate: 0.043, name: 'Polish Zloty', symbol: 'zł', countryCode: 'POL' },
  CZK: { rate: 0.248, name: 'Czech Koruna', symbol: 'Kč', countryCode: 'CZE' },
  HUF: { rate: 3.92, name: 'Hungarian Forint', symbol: 'Ft', countryCode: 'HUN' },
  RON: { rate: 0.05, name: 'Romanian Leu', symbol: 'lei', countryCode: 'ROU' },
  BGN: { rate: 0.019, name: 'Bulgarian Lev', symbol: 'лв', countryCode: 'BGR' },
  HRK: { rate: 0.073, name: 'Croatian Kuna', symbol: 'kn', countryCode: 'HRV' },
  ISK: { rate: 1.49, name: 'Icelandic Króna', symbol: 'kr', countryCode: 'ISL' },
  UAH: { rate: 0.40, name: 'Ukrainian Hryvnia', symbol: '₴', countryCode: 'UKR' },
  RSD: { rate: 1.14, name: 'Serbian Dinar', symbol: 'дин.', countryCode: 'SRB' },
  GEL: { rate: 0.029, name: 'Georgian Lari', symbol: '₾', countryCode: 'GEO' },
  AMD: { rate: 4.22, name: 'Armenian Dram', symbol: '֏', countryCode: 'ARM' },
  AZN: { rate: 0.0185, name: 'Azerbaijan Manat', symbol: '₼', countryCode: 'AZE' },
  // Africa
  EGP: { rate: 0.336, name: 'Egyptian Pound', symbol: 'E£', countryCode: 'EGY' },
  ZAR: { rate: 0.197, name: 'South African Rand', symbol: 'R', countryCode: 'ZAF' },
  MAD: { rate: 0.108, name: 'Moroccan Dirham', symbol: 'د.م.', countryCode: 'MAR' },
  KES: { rate: 1.76, name: 'Kenyan Shilling', symbol: 'KSh', countryCode: 'KEN' },
  NGN: { rate: 8.42, name: 'Nigerian Naira', symbol: '₦', countryCode: 'NGA' },
  GHS: { rate: 0.132, name: 'Ghanaian Cedi', symbol: '₵', countryCode: 'GHA' },
  TZS: { rate: 27.5, name: 'Tanzanian Shilling', symbol: 'TSh', countryCode: 'TZA' },
  UGX: { rate: 40.2, name: 'Ugandan Shilling', symbol: 'USh', countryCode: 'UGA' },
  ETB: { rate: 0.61, name: 'Ethiopian Birr', symbol: 'Br', countryCode: 'ETH' },
  MUR: { rate: 0.49, name: 'Mauritian Rupee', symbol: '₨', countryCode: 'MUS' },
  MGA: { rate: 48.5, name: 'Malagasy Ariary', symbol: 'Ar', countryCode: 'MDG' },
  ZMW: { rate: 0.23, name: 'Zambian Kwacha', symbol: 'ZK', countryCode: 'ZMB' },
  RWF: { rate: 13.8, name: 'Rwandan Franc', symbol: 'FRw', countryCode: 'RWA' },
  TND: { rate: 0.034, name: 'Tunisian Dinar', symbol: 'د.ت', countryCode: 'TUN' },
  // Americas
  USD: { rate: 0.0109, name: 'US Dollar', symbol: '$', countryCode: 'USA' },
  CAD: { rate: 0.0148, name: 'Canadian Dollar', symbol: 'C$', countryCode: 'CAN' },
  MXN: { rate: 0.185, name: 'Mexican Peso', symbol: 'MX$', countryCode: 'MEX' },
  BRL: { rate: 0.054, name: 'Brazilian Real', symbol: 'R$', countryCode: 'BRA' },
  ARS: { rate: 9.12, name: 'Argentine Peso', symbol: 'AR$', countryCode: 'ARG' },
  CLP: { rate: 10.1, name: 'Chilean Peso', symbol: 'CLP$', countryCode: 'CHL' },
  COP: { rate: 42.8, name: 'Colombian Peso', symbol: 'COL$', countryCode: 'COL' },
  PEN: { rate: 0.0408, name: 'Peruvian Sol', symbol: 'S/', countryCode: 'PER' },
  CRC: { rate: 5.56, name: 'Costa Rican Colón', symbol: '₡', countryCode: 'CRI' },
  DOP: { rate: 0.64, name: 'Dominican Peso', symbol: 'RD$', countryCode: 'DOM' },
  JMD: { rate: 1.68, name: 'Jamaican Dollar', symbol: 'J$', countryCode: 'JAM' },
  TTD: { rate: 0.073, name: 'Trinidad Dollar', symbol: 'TT$', countryCode: 'TTO' },
  CUP: { rate: 0.26, name: 'Cuban Peso', symbol: '₱', countryCode: 'CUB' },
  GTQ: { rate: 0.084, name: 'Guatemalan Quetzal', symbol: 'Q', countryCode: 'GTM' },
  HNL: { rate: 0.27, name: 'Honduran Lempira', symbol: 'L', countryCode: 'HND' },
  NIO: { rate: 0.40, name: 'Nicaraguan Córdoba', symbol: 'C$', countryCode: 'NIC' },
  PAB: { rate: 0.0109, name: 'Panamanian Balboa', symbol: 'B/.', countryCode: 'PAN' },
  BZD: { rate: 0.022, name: 'Belize Dollar', symbol: 'BZ$', countryCode: 'BLZ' },
  HTG: { rate: 1.44, name: 'Haitian Gourde', symbol: 'G', countryCode: 'HTI' },
  VES: { rate: 0.40, name: 'Venezuelan Bolívar', symbol: 'Bs.', countryCode: 'VEN' },
  UYU: { rate: 0.43, name: 'Uruguayan Peso', symbol: '$U', countryCode: 'URY' },
  PYG: { rate: 80.5, name: 'Paraguayan Guarani', symbol: '₲', countryCode: 'PRY' },
  BOB: { rate: 0.075, name: 'Bolivian Boliviano', symbol: 'Bs.', countryCode: 'BOL' },
  // Oceania
  AUD: { rate: 0.0152, name: 'Australian Dollar', symbol: 'A$', countryCode: 'AUS' },
  NZD: { rate: 0.0184, name: 'New Zealand Dollar', symbol: 'NZ$', countryCode: 'NZL' },
  FJD: { rate: 0.024, name: 'Fijian Dollar', symbol: 'FJ$', countryCode: 'FJI' },
  PGK: { rate: 0.039, name: 'Papua New Guinea Kina', symbol: 'K', countryCode: 'PNG' },
};

// Travel timing data - busiest/least busy months and expensive/cheap months
const travelTimingData = {
  'USA': { busiest: ['Jun', 'Jul', 'Dec'], leastBusy: ['Feb', 'Sep', 'Nov'], expensive: ['Jun', 'Jul', 'Dec'], cheap: ['Jan', 'Feb', 'Nov'] },
  'GBR': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug', 'Dec'], cheap: ['Jan', 'Feb', 'Mar'] },
  'FRA': { busiest: ['Jul', 'Aug', 'Dec'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug', 'Dec'], cheap: ['Jan', 'Feb', 'Mar'] },
  'DEU': { busiest: ['Jun', 'Jul', 'Dec'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jun', 'Jul', 'Dec'], cheap: ['Jan', 'Feb', 'Mar'] },
  'ITA': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jun', 'Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'ESP': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'JPN': { busiest: ['Mar', 'Apr', 'Oct'], leastBusy: ['Jan', 'Feb', 'Jun'], expensive: ['Mar', 'Apr', 'Oct', 'Nov'], cheap: ['Jan', 'Feb', 'Jun'] },
  'CHN': { busiest: ['Jan', 'Feb', 'Oct'], leastBusy: ['Mar', 'Nov', 'Dec'], expensive: ['Jan', 'Feb', 'Oct'], cheap: ['Mar', 'Apr', 'Nov'] },
  'THA': { busiest: ['Nov', 'Dec', 'Jan', 'Feb'], leastBusy: ['May', 'Jun', 'Sep'], expensive: ['Dec', 'Jan', 'Feb'], cheap: ['May', 'Jun', 'Sep', 'Oct'] },
  'AUS': { busiest: ['Dec', 'Jan', 'Jul'], leastBusy: ['Feb', 'Mar', 'May'], expensive: ['Dec', 'Jan', 'Jul'], cheap: ['Feb', 'May', 'Jun'] },
  'NZL': { busiest: ['Dec', 'Jan', 'Feb'], leastBusy: ['May', 'Jun', 'Aug'], expensive: ['Dec', 'Jan', 'Feb'], cheap: ['May', 'Jun', 'Aug'] },
  'IND': { busiest: ['Oct', 'Nov', 'Dec'], leastBusy: ['Apr', 'May', 'Jun'], expensive: ['Oct', 'Nov', 'Dec'], cheap: ['Apr', 'May', 'Sep'] },
  'UAE': { busiest: ['Nov', 'Dec', 'Jan'], leastBusy: ['Jun', 'Jul', 'Aug'], expensive: ['Nov', 'Dec', 'Jan'], cheap: ['Jun', 'Jul', 'Aug'] },
  'SGP': { busiest: ['Dec', 'Jan', 'Jun'], leastBusy: ['Feb', 'Mar', 'Sep'], expensive: ['Dec', 'Jan'], cheap: ['Feb', 'Mar', 'Sep'] },
  'MYS': { busiest: ['Dec', 'Jan', 'Jul'], leastBusy: ['Feb', 'Mar', 'Sep'], expensive: ['Dec', 'Jul'], cheap: ['Feb', 'Mar', 'Sep'] },
  'IDN': { busiest: ['Jun', 'Jul', 'Dec'], leastBusy: ['Feb', 'Mar', 'Oct'], expensive: ['Jun', 'Jul', 'Dec'], cheap: ['Feb', 'Mar', 'Oct'] },
  'VNM': { busiest: ['Dec', 'Jan', 'Feb'], leastBusy: ['May', 'Jun', 'Sep'], expensive: ['Dec', 'Jan', 'Feb'], cheap: ['May', 'Jun', 'Sep'] },
  'PHL': { busiest: ['Dec', 'Jan', 'Apr'], leastBusy: ['Jun', 'Jul', 'Sep'], expensive: ['Dec', 'Apr'], cheap: ['Jun', 'Jul', 'Sep'] },
  'KOR': { busiest: ['Apr', 'May', 'Oct'], leastBusy: ['Jan', 'Feb', 'Aug'], expensive: ['Apr', 'Oct'], cheap: ['Jan', 'Feb', 'Jun'] },
  'TWN': { busiest: ['Oct', 'Nov', 'Feb'], leastBusy: ['May', 'Jun', 'Sep'], expensive: ['Feb', 'Oct'], cheap: ['May', 'Jun', 'Sep'] },
  'HKG': { busiest: ['Oct', 'Nov', 'Dec'], leastBusy: ['May', 'Jun', 'Sep'], expensive: ['Oct', 'Dec'], cheap: ['May', 'Jun', 'Sep'] },
  'TUR': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jun', 'Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'EGY': { busiest: ['Oct', 'Nov', 'Dec'], leastBusy: ['Jun', 'Jul', 'Aug'], expensive: ['Oct', 'Nov', 'Dec'], cheap: ['Jun', 'Jul', 'Aug'] },
  'ZAF': { busiest: ['Dec', 'Jan', 'Jul'], leastBusy: ['Feb', 'May', 'Sep'], expensive: ['Dec', 'Jan'], cheap: ['Feb', 'May', 'Sep'] },
  'BRA': { busiest: ['Dec', 'Jan', 'Feb'], leastBusy: ['Apr', 'May', 'Sep'], expensive: ['Dec', 'Jan', 'Feb'], cheap: ['Apr', 'May', 'Sep'] },
  'ARG': { busiest: ['Dec', 'Jan', 'Jul'], leastBusy: ['Apr', 'May', 'Sep'], expensive: ['Dec', 'Jan'], cheap: ['Apr', 'May', 'Sep'] },
  'MEX': { busiest: ['Dec', 'Jan', 'Mar'], leastBusy: ['May', 'Sep', 'Oct'], expensive: ['Dec', 'Mar'], cheap: ['May', 'Sep', 'Oct'] },
  'CAN': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'GRC': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'PRT': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'NLD': { busiest: ['Apr', 'May', 'Jul'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Apr', 'Jul'], cheap: ['Jan', 'Feb', 'Nov'] },
  'CHE': { busiest: ['Jul', 'Aug', 'Dec'], leastBusy: ['Jan', 'Apr', 'Nov'], expensive: ['Jul', 'Aug', 'Dec'], cheap: ['Apr', 'May', 'Nov'] },
  'AUT': { busiest: ['Jul', 'Aug', 'Dec'], leastBusy: ['Jan', 'Apr', 'Nov'], expensive: ['Jul', 'Aug', 'Dec'], cheap: ['Apr', 'May', 'Nov'] },
  'NPL': { busiest: ['Oct', 'Nov', 'Mar'], leastBusy: ['Jun', 'Jul', 'Aug'], expensive: ['Oct', 'Nov'], cheap: ['Jun', 'Jul', 'Aug'] },
  'LKA': { busiest: ['Dec', 'Jan', 'Feb'], leastBusy: ['May', 'Jun', 'Sep'], expensive: ['Dec', 'Jan', 'Feb'], cheap: ['May', 'Jun', 'Sep'] },
  'MDV': { busiest: ['Dec', 'Jan', 'Feb'], leastBusy: ['May', 'Jun', 'Sep'], expensive: ['Dec', 'Jan', 'Feb', 'Mar'], cheap: ['May', 'Jun', 'Sep'] },
  'RUS': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jun', 'Jul'], cheap: ['Jan', 'Nov', 'Mar'] },
  'NOR': { busiest: ['Jun', 'Jul', 'Dec'], leastBusy: ['Feb', 'Mar', 'Oct'], expensive: ['Jun', 'Jul'], cheap: ['Feb', 'Mar', 'Oct'] },
  'SWE': { busiest: ['Jun', 'Jul', 'Dec'], leastBusy: ['Feb', 'Mar', 'Oct'], expensive: ['Jun', 'Jul'], cheap: ['Feb', 'Mar', 'Oct'] },
  'DNK': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jun', 'Jul'], cheap: ['Jan', 'Feb', 'Nov'] },
  'FIN': { busiest: ['Jun', 'Jul', 'Dec'], leastBusy: ['Feb', 'Mar', 'Oct'], expensive: ['Jun', 'Jul', 'Dec'], cheap: ['Feb', 'Mar', 'Oct'] },
  'ISL': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jun', 'Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'IRL': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jun', 'Jul'], cheap: ['Jan', 'Feb', 'Nov'] },
  'POL': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'CZE': { busiest: ['Jun', 'Jul', 'Dec'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Dec'], cheap: ['Jan', 'Feb', 'Nov'] },
  'HUN': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'HRV': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Jan', 'Feb', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Jan', 'Feb', 'Nov'] },
  'MAR': { busiest: ['Mar', 'Apr', 'Oct'], leastBusy: ['Jun', 'Jul', 'Aug'], expensive: ['Mar', 'Apr', 'Oct'], cheap: ['Jun', 'Jul', 'Aug'] },
  'KEN': { busiest: ['Jul', 'Aug', 'Sep'], leastBusy: ['Apr', 'May', 'Nov'], expensive: ['Jul', 'Aug', 'Sep'], cheap: ['Apr', 'May', 'Nov'] },
  'TZA': { busiest: ['Jun', 'Jul', 'Oct'], leastBusy: ['Mar', 'Apr', 'Nov'], expensive: ['Jul', 'Aug'], cheap: ['Mar', 'Apr', 'Nov'] },
  'JOR': { busiest: ['Mar', 'Apr', 'Oct'], leastBusy: ['Jun', 'Jul', 'Aug'], expensive: ['Mar', 'Apr', 'Oct'], cheap: ['Jun', 'Jul', 'Aug'] },
  'ISR': { busiest: ['Mar', 'Apr', 'Sep'], leastBusy: ['Jan', 'Feb', 'Jul'], expensive: ['Mar', 'Apr', 'Sep'], cheap: ['Jan', 'Feb', 'Jul'] },
  'OMN': { busiest: ['Oct', 'Nov', 'Feb'], leastBusy: ['May', 'Jun', 'Aug'], expensive: ['Oct', 'Nov', 'Feb'], cheap: ['May', 'Jun', 'Aug'] },
  'QAT': { busiest: ['Nov', 'Dec', 'Jan'], leastBusy: ['Jun', 'Jul', 'Aug'], expensive: ['Nov', 'Dec'], cheap: ['Jun', 'Jul', 'Aug'] },
  'SAU': { busiest: ['Oct', 'Nov', 'Jan'], leastBusy: ['Jun', 'Jul', 'Aug'], expensive: ['Oct', 'Nov'], cheap: ['Jun', 'Jul', 'Aug'] },
  'PER': { busiest: ['Jun', 'Jul', 'Aug'], leastBusy: ['Feb', 'Mar', 'Nov'], expensive: ['Jun', 'Jul', 'Aug'], cheap: ['Feb', 'Mar', 'Nov'] },
  'CHL': { busiest: ['Dec', 'Jan', 'Feb'], leastBusy: ['May', 'Jun', 'Sep'], expensive: ['Dec', 'Jan', 'Feb'], cheap: ['May', 'Jun', 'Sep'] },
  'COL': { busiest: ['Dec', 'Jan', 'Jun'], leastBusy: ['Feb', 'Sep', 'Oct'], expensive: ['Dec', 'Jan'], cheap: ['Sep', 'Oct', 'Nov'] },
  'CRI': { busiest: ['Dec', 'Jan', 'Mar'], leastBusy: ['May', 'Sep', 'Oct'], expensive: ['Dec', 'Jan', 'Mar'], cheap: ['May', 'Sep', 'Oct'] },
  'CUB': { busiest: ['Dec', 'Jan', 'Feb'], leastBusy: ['May', 'Sep', 'Oct'], expensive: ['Dec', 'Jan', 'Feb'], cheap: ['May', 'Sep', 'Oct'] },
  'FJI': { busiest: ['Jul', 'Aug', 'Sep'], leastBusy: ['Jan', 'Feb', 'Mar'], expensive: ['Jul', 'Aug', 'Sep'], cheap: ['Jan', 'Feb', 'Mar'] },
  'MUS': { busiest: ['Dec', 'Jan', 'Jul'], leastBusy: ['Feb', 'May', 'Sep'], expensive: ['Dec', 'Jan'], cheap: ['May', 'Sep', 'Oct'] },
};

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
  const [showEligibilityChecker, setShowEligibilityChecker] = useState(false);
  const [showDocumentChecklist, setShowDocumentChecklist] = useState(false);
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
  const { requireAuth, user } = useAuth();

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
        
        // First try to find from live API rates
        let countryForex = null;
        
        // Find currency for this country from our comprehensive data
        for (const [currency, info] of Object.entries(currencyData)) {
          if (info.countryCode === code) {
            // Check if we have a live rate from the API
            const liveRate = forexRates[currency];
            const rate = liveRate || info.rate;
            const isLive = !!liveRate;
            
            countryForex = { 
              currency, 
              rate, 
              country_name: name,
              symbol: info.symbol,
              currencyName: info.name,
              isLive
            };
            break;
          }
        }
        
        // Special handling for UAE (ARE code vs UAE)
        if (!countryForex && code === 'ARE') {
          const aedInfo = currencyData['AED'];
          const liveRate = forexRates['AED'];
          countryForex = {
            currency: 'AED',
            rate: liveRate || aedInfo.rate,
            country_name: name,
            symbol: aedInfo.symbol,
            currencyName: aedInfo.name,
            isLive: !!liveRate
          };
        }

        // Deduplicate apps by app_name (case-insensitive)
        const rawApps = appsRes.data.data?.filter(d => d.country_code === code || d.country_name === name) || [];
        const uniqueApps = rawApps.filter((app, index, self) => 
          index === self.findIndex(a => a.app_name.toLowerCase() === app.app_name.toLowerCase())
        );

        setCountryData({
          seasons: seasonsRes.data.data?.find(d => d.country_code === code || d.country_name === name),
          visa: visaRes.data.data?.find(d => d.country_code === code || d.country_name === name),
          weather: null,
          plugs: plugsRes.data.data?.find(d => d.country_code === code || d.country_name === name),
          festivals: festivalsRes.data.data?.filter(d => d.country_code === code || d.country_name === name) || [],
          dishes: allDishes,
          apps: uniqueApps,
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
      removeFromWishlist(country.country_code, user?.user_id);
    } else {
      requireAuth(() => {
        addToWishlist(country, user?.user_id);
      });
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

              {/* Travel Timing Info */}
              {travelTimingData[country.country_code] && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-violet-500" />
                    <h3 className="font-semibold text-primary">Crowd & Cost Insights</h3>
                  </div>
                  <div className="space-y-3">
                    {/* Busiest/Least Busy */}
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-red-600">Busiest:</span>
                        <span className="text-xs text-muted-foreground ml-1">{travelTimingData[country.country_code].busiest.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-green-600">Least Busy:</span>
                        <span className="text-xs text-muted-foreground ml-1">{travelTimingData[country.country_code].leastBusy.join(', ')}</span>
                      </div>
                    </div>
                    {/* Most/Least Expensive */}
                    <div className="pt-2 border-t border-violet-100">
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-red-600">Expensive:</span>
                          <span className="text-xs text-muted-foreground ml-1">{travelTimingData[country.country_code].expensive.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 mt-2">
                        <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-green-600">Budget-Friendly:</span>
                          <span className="text-xs text-muted-foreground ml-1">{travelTimingData[country.country_code].cheap.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                    {/* Visa Tool Links */}
                    <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowEligibilityChecker(true); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-all"
                        data-testid="visa-eligibility-link"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Check Eligibility
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowDocumentChecklist(true); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-200 transition-all"
                        data-testid="document-checklist-link"
                      >
                        <ClipboardList className="w-3 h-3" />
                        Document Checklist
                      </button>
                    </div>
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
                  <h3 className="font-semibold text-primary">Exchange Rate</h3>
                </div>
                {countryData.forex ? (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-700">1 {countryData.forex.currency}</p>
                        <p className="text-xs text-muted-foreground">{countryData.forex.currencyName || countryData.forex.country_name}</p>
                      </div>
                      <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-700">₹{(1 / countryData.forex.rate).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Indian Rupee</p>
                      </div>
                    </div>
                    <div className="text-xs">
                      {countryData.forex.isLive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Live rate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          Estimated
                        </span>
                      )}
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
                  
                  {/* Emergency Numbers */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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

                  {/* Safety Tips */}
                  {countryData.safety.safety_tips && countryData.safety.safety_tips.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-primary flex items-center gap-2 mb-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Safety Tips
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {countryData.safety.safety_tips.slice(0, 6).map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 bg-white/50 rounded px-2 py-1">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas to Avoid */}
                  {countryData.safety.areas_to_avoid && countryData.safety.areas_to_avoid.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2 text-sm">
                        <MapPinOff className="w-4 h-4" />
                        Areas to Avoid
                      </h4>
                      <div className="bg-red-100/50 border border-red-200 rounded-lg p-3">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {countryData.safety.areas_to_avoid.slice(0, 6).map((area, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-red-800">
                              <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
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
      
      {/* Visa Tools Modals */}
      <VisaEligibilityChecker 
        isOpen={showEligibilityChecker} 
        onClose={() => setShowEligibilityChecker(false)} 
      />
      <DocumentChecklistGenerator 
        isOpen={showDocumentChecklist} 
        onClose={() => setShowDocumentChecklist(false)} 
      />
    </AnimatePresence>
  );
};

export default CountryDetailModal;
