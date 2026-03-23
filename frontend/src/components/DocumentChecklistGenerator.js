import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, FileText, CheckSquare, Loader2, AlertCircle, Lightbulb, Download, Printer, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DocumentChecklistGenerator = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const { user, requireAuth } = useAuth();
  const [formData, setFormData] = useState({
    country: '',
    visa_type: 'tourist',
    purpose: 'tourism'
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
      const response = await axios.post(`${BACKEND_URL}/api/visa/document-checklist`, formData);
      setResult(response.data);
      setCheckedItems({});
    } catch (error) {
      console.error('Error generating checklist:', error);
      alert('Failed to generate checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (category, index) => {
    const key = `${category}-${index}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getProgress = () => {
    if (!result) return 0;
    const totalItems = (result.mandatory_documents?.length || 0) + (result.supporting_documents?.length || 0);
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!user) {
      requireAuth(() => handleSave());
      return;
    }
    
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/api/user/${user.user_id}/document-checklists`, {
        country: result.country,
        visa_type: result.visa_type,
        checklist: {
          mandatory_documents: result.mandatory_documents,
          supporting_documents: result.supporting_documents,
          tips: result.tips
        },
        checked_items: checkedItems,
        progress: getProgress()
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving checklist:', error);
      alert('Failed to save checklist. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setCheckedItems({});
    setSaved(false);
    setFormData({
      country: '',
      visa_type: 'tourist',
      purpose: 'tourism'
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
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="document-checklist-modal"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Document Checklist Generator</h2>
                  <p className="text-emerald-100 text-sm">Get a personalized checklist for your visa application</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {result && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress: {getProgress()}%</span>
                  <span>{Object.values(checkedItems).filter(Boolean).length} of {(result.mandatory_documents?.length || 0) + (result.supporting_documents?.length || 0)} items</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {!result ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary">Generate Your Checklist</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="checklist-country-select"
                    >
                      <option value="">Select country</option>
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                    <select
                      name="visa_type"
                      value={formData.visa_type}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="tourist">Tourist Visa</option>
                      <option value="business">Business Visa</option>
                      <option value="student">Student Visa</option>
                      <option value="work">Work Visa</option>
                      <option value="medical">Medical Visa</option>
                      <option value="transit">Transit Visa</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="tourism">Tourism / Sightseeing</option>
                      <option value="business">Business Meeting</option>
                      <option value="conference">Conference / Event</option>
                      <option value="study">Education / Study</option>
                      <option value="work">Employment</option>
                      <option value="medical">Medical Treatment</option>
                      <option value="family">Family Visit</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={!formData.country || loading}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Checklist...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Checklist
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">
                      {result.visa_type?.charAt(0).toUpperCase() + result.visa_type?.slice(1)} Visa - {result.country}
                    </h3>
                    <p className="text-sm text-muted-foreground">For Indian Passport Holders</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        saved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      data-testid="save-checklist-btn"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saved ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>
                
                {/* Mandatory Documents */}
                {result.mandatory_documents?.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                    <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5" />
                      Mandatory Documents ({result.mandatory_documents.length})
                    </h4>
                    <div className="space-y-3">
                      {result.mandatory_documents.map((doc, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            checkedItems[`mandatory-${idx}`] ? 'bg-green-100 border border-green-300' : 'bg-white border border-red-100 hover:border-red-300'
                          }`}
                          onClick={() => toggleCheck('mandatory', idx)}
                        >
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            checkedItems[`mandatory-${idx}`] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                          }`}>
                            {checkedItems[`mandatory-${idx}`] && <CheckSquare className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${checkedItems[`mandatory-${idx}`] ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                              {doc.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{doc.description}</div>
                            {doc.tip && (
                              <div className="text-xs text-amber-700 mt-1 flex items-start gap-1">
                                <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {doc.tip}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Supporting Documents */}
                {result.supporting_documents?.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5" />
                      Supporting Documents ({result.supporting_documents.length})
                    </h4>
                    <div className="space-y-3">
                      {result.supporting_documents.map((doc, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            checkedItems[`supporting-${idx}`] ? 'bg-green-100 border border-green-300' : 'bg-white border border-blue-100 hover:border-blue-300'
                          }`}
                          onClick={() => toggleCheck('supporting', idx)}
                        >
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            checkedItems[`supporting-${idx}`] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                          }`}>
                            {checkedItems[`supporting-${idx}`] && <CheckSquare className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${checkedItems[`supporting-${idx}`] ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                              {doc.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{doc.description}</div>
                            {doc.tip && (
                              <div className="text-xs text-amber-700 mt-1 flex items-start gap-1">
                                <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {doc.tip}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-2">
                      {result.tips.map((tip, idx) => (
                        <li key={idx} className="text-amber-700 text-sm flex items-start gap-2">
                          <span className="text-amber-500 mt-1">💡</span>
                          {tip}
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
                    Generate Another
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
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

export default DocumentChecklistGenerator;
