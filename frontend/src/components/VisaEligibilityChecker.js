import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, CheckCircle, AlertCircle, Loader2, TrendingUp, FileText, Lightbulb, Shield } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const VisaEligibilityChecker = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    country: '',
    age: '',
    education: 'bachelors',
    monthly_income: '',
    travel_history: 'domestic',
    bank_balance: '',
    purpose: 'tourism',
    visa_type: 'tourist',
    employment_status: 'employed'
  });

  const countries = [
    // Popular Destinations
    'United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand',
    // Europe
    'Germany', 'France', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium',
    'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
    'Greece', 'Czech Republic', 'Poland', 'Hungary', 'Croatia', 'Schengen',
    // Asia
    'Japan', 'Singapore', 'Thailand', 'Malaysia', 'Indonesia', 'Vietnam', 'Philippines',
    'South Korea', 'China', 'Hong Kong', 'Taiwan', 'Sri Lanka', 'Nepal', 'Maldives',
    'Cambodia', 'Myanmar', 'Laos',
    // Middle East
    'UAE', 'Saudi Arabia', 'Qatar', 'Oman', 'Bahrain', 'Kuwait', 'Jordan', 'Israel', 'Turkey',
    // Africa
    'South Africa', 'Egypt', 'Morocco', 'Kenya', 'Tanzania', 'Mauritius', 'Seychelles',
    // Americas
    'Mexico', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Costa Rica',
    // Russia & Central Asia
    'Russia', 'Kazakhstan', 'Uzbekistan'
  ].sort();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/visa/eligibility-check`, {
        ...formData,
        age: parseInt(formData.age),
        monthly_income: parseFloat(formData.monthly_income),
        bank_balance: parseFloat(formData.bank_balance)
      });
      setResult(response.data);
      setStep(3);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      alert('Failed to check eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getChanceColor = (chance) => {
    if (chance >= 75) return 'text-green-600';
    if (chance >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getChanceBg = (chance) => {
    if (chance >= 75) return 'bg-green-100';
    if (chance >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
    setFormData({
      country: '',
      age: '',
      education: 'bachelors',
      monthly_income: '',
      travel_history: 'domestic',
      bank_balance: '',
      purpose: 'tourism',
      visa_type: 'tourist',
      employment_status: 'employed'
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
          data-testid="visa-eligibility-modal"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Visa Eligibility Checker</h2>
                  <p className="text-blue-100 text-sm">AI-powered assessment for Indian passport holders</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-white' : 'bg-white/30'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary">Step 1: Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="country-select"
                    >
                      <option value="">Select country</option>
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g., 28"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="high_school">High School</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD / Doctorate</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                    <select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="employed">Employed (Salaried)</option>
                      <option value="self_employed">Self-Employed / Business</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                      <option value="unemployed">Not Currently Employed</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.country || !formData.age}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Continue to Step 2
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary">Step 2: Financial & Travel Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹) *</label>
                    <input
                      type="number"
                      name="monthly_income"
                      value={formData.monthly_income}
                      onChange={handleInputChange}
                      placeholder="e.g., 75000"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Balance (₹) *</label>
                    <input
                      type="number"
                      name="bank_balance"
                      value={formData.bank_balance}
                      onChange={handleInputChange}
                      placeholder="e.g., 500000"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel History</label>
                    <select
                      name="travel_history"
                      value={formData.travel_history}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="none">No prior travel</option>
                      <option value="domestic">Domestic travel only</option>
                      <option value="few_international">1-3 international trips</option>
                      <option value="many_international">4+ international trips</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="tourism">Tourism / Holiday</option>
                      <option value="business">Business / Conference</option>
                      <option value="study">Study / Education</option>
                      <option value="work">Work / Employment</option>
                      <option value="medical">Medical Treatment</option>
                      <option value="family_visit">Family Visit</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                    <select
                      name="visa_type"
                      value={formData.visa_type}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="tourist">Tourist Visa</option>
                      <option value="business">Business Visa</option>
                      <option value="student">Student Visa</option>
                      <option value="work">Work Visa</option>
                      <option value="medical">Medical Visa</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.monthly_income || !formData.bank_balance || loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Check Eligibility'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && result && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary">Your Visa Assessment</h3>
                
                {/* Approval Chance */}
                <div className={`rounded-xl p-6 ${getChanceBg(result.approval_chance)} text-center`}>
                  <div className={`text-5xl font-bold ${getChanceColor(result.approval_chance)}`}>
                    {result.approval_chance}%
                  </div>
                  <div className="text-gray-700 mt-2">Estimated Approval Chance</div>
                  <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    result.risk_level === 'low' ? 'bg-green-200 text-green-800' :
                    result.risk_level === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {result.risk_level?.toUpperCase()} RISK
                  </div>
                </div>
                
                {/* Strengths */}
                {result.strengths?.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5" />
                      Your Strengths
                    </h4>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx} className="text-green-700 text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5" />
                      Suggestions to Improve
                    </h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-amber-700 text-sm flex items-start gap-2">
                          <span className="text-amber-500 mt-1">→</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Documents Needed */}
                {result.documents_needed?.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5" />
                      Key Documents to Prepare
                    </h4>
                    <ul className="space-y-2">
                      {result.documents_needed.map((doc, idx) => (
                        <li key={idx} className="text-blue-700 text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    Check Another
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
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

export default VisaEligibilityChecker;
