import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import WorldMap from '../components/WorldMap';
import BackToTop from '../components/BackToTop';
import VisaEligibilityChecker from '../components/VisaEligibilityChecker';
import DocumentChecklistGenerator from '../components/DocumentChecklistGenerator';
import { FileText, Shield, ClipboardList, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Visa = () => {
  const [visaData, setVisaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEligibilityChecker, setShowEligibilityChecker] = useState(false);
  const [showDocumentChecklist, setShowDocumentChecklist] = useState(false);
  const { requireAuth } = useAuth();

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
                Visa Information for Indians
              </h1>
            </div>
            <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Check visa requirements for Indian passport holders. Explore the map to find visa-free destinations, 
              visa on arrival options, and countries requiring e-visa or embassy applications.
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

          {/* AI-Powered Tools CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Visa Eligibility Checker */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white cursor-pointer shadow-lg"
              onClick={() => requireAuth(() => setShowEligibilityChecker(true))}
              data-testid="visa-eligibility-cta"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">Visa Eligibility Checker</h3>
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">
                    Get AI-powered assessment of your visa approval chances with personalized suggestions.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Check Your Eligibility</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Document Checklist Generator */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white cursor-pointer shadow-lg"
              onClick={() => requireAuth(() => setShowDocumentChecklist(true))}
              data-testid="document-checklist-cta"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">Document Checklist Generator</h3>
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </span>
                  </div>
                  <p className="text-emerald-100 text-sm mb-4">
                    Generate a comprehensive, country-specific document checklist with expert tips.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Generate Checklist</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </motion.div>
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
        </motion.div>
      </div>

      {/* Modals */}
      <VisaEligibilityChecker 
        isOpen={showEligibilityChecker} 
        onClose={() => setShowEligibilityChecker(false)} 
      />
      <DocumentChecklistGenerator 
        isOpen={showDocumentChecklist} 
        onClose={() => setShowDocumentChecklist(false)} 
      />

      <BackToTop />
    </div>
  );
};

export default Visa;