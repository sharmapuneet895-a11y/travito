import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import BackToTop from '../components/BackToTop';
import { FileText, Info, Clock, User, ChevronRight, FileCheck, ClipboardList, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Visa = () => {
  const [visaData, setVisaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisa = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/visa`);
        setVisaData(response.data.data);
      } catch (error) {
        console.error('Error fetching visa data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisa();
  }, []);

  // Scroll to section if hash is present
  useEffect(() => {
    if (window.location.hash === '#visa-options') {
      setTimeout(() => {
        const element = document.getElementById('visa-options');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [loading]);

  const legends = [
    { color: '#22C55E', label: 'Visa Free', description: 'No visa required for Indian passport holders' },
    { color: '#E25A53', label: 'Visa on Arrival', description: 'Get visa at airport on arrival' },
    { color: '#4B89AC', label: 'E-Visa', description: 'Apply online before travel' },
    { color: '#F2A900', label: 'Visa Required', description: 'Embassy/Consulate application needed' },
    { color: '#D6D6D6', label: 'No Data', description: 'Information not available' }
  ];

  // Count countries by visa type
  const visaCounts = {
    visa_free: visaData.filter(v => v.visa_type === 'visa_free').length,
    visa_on_arrival: visaData.filter(v => v.visa_type === 'visa_on_arrival').length,
    e_visa: visaData.filter(v => v.visa_type === 'e_visa').length,
    visa_required: visaData.filter(v => v.visa_type === 'visa_required').length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Hero Section with Background Image */}
      <div 
        className="relative bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(11, 60, 93, 0.9), rgba(11, 60, 93, 0.7)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')`,
          minHeight: '280px'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-10 h-10 text-white" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }} data-testid="visa-page-title">
                Compare Visa Options & Plan Your Trip in Minutes
              </h1>
            </div>
            <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Get visa requirements, cost, processing time & trusted agents - all in one place
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-green-300">{visaCounts.visa_free}</span>
                <span className="text-white/80 ml-2 text-sm">Visa Free</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-red-300">{visaCounts.visa_on_arrival}</span>
                <span className="text-white/80 ml-2 text-sm">Visa on Arrival</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-blue-300">{visaCounts.e_visa}</span>
                <span className="text-white/80 ml-2 text-sm">E-Visa</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-yellow-300">{visaCounts.visa_required}</span>
                <span className="text-white/80 ml-2 text-sm">Visa Required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Legend */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5" style={{ color: '#FF7A00' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#0B3C5D' }}>Map Legend - Visa Types</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {legends.map((legend) => (
                <div key={legend.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50" data-testid={`legend-${legend.label.toLowerCase().replace(' ', '-')}`}>
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: legend.color }}
                  />
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#0B3C5D' }}>{legend.label}</div>
                    <div className="text-xs text-gray-500">{legend.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl p-4 shadow-sm border mb-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="map-container" data-testid="visa-map-container">
              {loading ? (
                <div className="flex items-center justify-center h-96" data-testid="loading-visa">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#0B3C5D' }}></div>
                    <p className="text-gray-500">Loading visa data...</p>
                  </div>
                </div>
              ) : (
                <WorldMap data={visaData} mode="visa" />
              )}
            </div>
          </div>

          {/* Helpful Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">How to use this map</h4>
                <p className="text-sm text-amber-700">
                  Click on any country on the map to view detailed visa information, required documents, 
                  processing time, and estimated costs. The color coding shows the visa type at a glance. 
                  Green countries are visa-free, while yellow countries require embassy applications.
                </p>
              </div>
            </div>
          </div>

          {/* ========== COMPARE VISA OPTIONS SECTION ========== */}
          <div 
            id="visa-options" 
            className="mb-8 rounded-2xl overflow-hidden shadow-xl"
            style={{ 
              backgroundImage: `linear-gradient(135deg, rgba(11, 60, 93, 0.95), rgba(75, 137, 172, 0.9)), url('https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1920&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="p-8">
              {/* Section Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400 text-amber-900 rounded-full text-sm font-bold mb-4">
                  <Sparkles className="w-4 h-4" />
                  COMING SOON
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Compare Visa Options
                </h2>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                  We're onboarding verified visa agents to help you with hassle-free visa processing
                </p>
              </div>

              {/* Visa Agents Table */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
                {/* Desktop Table Header - hidden on mobile */}
                <div className="hidden md:grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <div className="font-bold text-sm">Agent</div>
                  <div className="font-bold text-sm">Processing Time</div>
                  <div className="font-bold text-sm">Service Fee</div>
                  <div className="font-bold text-sm">Success Rate</div>
                  <div className="font-bold text-sm">Services</div>
                </div>

                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-bold">
                  Visa Agent Details
                </div>

                {/* Sample Agent Row (Placeholder) - Desktop */}
                <div className="hidden md:grid grid-cols-5 gap-4 p-4 items-center border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="w-16 h-2 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700 font-medium">2-5 Days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700 font-bold">₹3,000</span>
                    <span className="text-gray-400 text-sm">onwards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-green-600 font-bold text-sm">95%</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-blue-500" />
                      <span>Documentation Check</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClipboardList className="w-3 h-3 text-blue-500" />
                      <span>Application Form Filling</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Agent Card 1 */}
                <div className="md:hidden p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="w-16 h-2 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">2-5 Days</span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-bold">₹3,000</span>
                      <span className="text-gray-400 text-xs"> onwards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">95%</span>
                      <span className="text-gray-500 text-xs">success</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <FileCheck className="w-3 h-3 text-blue-500" />
                      <span className="text-xs">Full Service</span>
                    </div>
                  </div>
                </div>

                {/* Second Sample Row - Desktop */}
                <div className="hidden md:grid grid-cols-5 gap-4 p-4 items-center bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="w-20 h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="w-14 h-2 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 font-medium">3-7 Days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700 font-bold">₹2,500</span>
                    <span className="text-gray-400 text-sm">onwards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="w-11/12 h-full bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-green-600 font-bold text-sm">92%</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-green-500" />
                      <span>Documentation Check</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClipboardList className="w-3 h-3 text-green-500" />
                      <span>Application Form Filling</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Agent Card 2 */}
                <div className="md:hidden p-4 bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="w-20 h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="w-14 h-2 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">3-7 Days</span>
                    </div>
                    <div>
                      <span className="text-gray-700 font-bold">₹2,500</span>
                      <span className="text-gray-400 text-xs"> onwards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">92%</span>
                      <span className="text-gray-500 text-xs">success</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <FileCheck className="w-3 h-3 text-green-500" />
                      <span className="text-xs">Full Service</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-4 rounded-xl font-bold text-white text-lg inline-flex items-center gap-3 shadow-xl transition-all"
                  style={{ backgroundColor: '#FF7A00' }}
                  disabled
                  data-testid="get-quotes-btn"
                >
                  Get Quotes from Agents
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
                <p className="text-blue-200 text-sm mt-3">Be the first to know when we launch!</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <BackToTop />
    </div>
  );
};

export default Visa;