import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, FileText, Calendar, MapPin, Clock, AlertCircle, CheckCircle, ExternalLink, Building, Phone, Mail, Plane, Hotel, Shield, Camera, CreditCard, User, Globe, HelpCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DIYVisaWizard = ({ isOpen, onClose, country, visaType = 'tourist' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    citizenship: 'India',
    purposeOfTravel: visaType,
    entryDate: '',
    destination: country?.country_name || '',
  });
  const [checkedDocs, setCheckedDocs] = useState({});
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [selectedDate, setSelectedDate] = useState('');
  const [dynamicDocuments, setDynamicDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState(null);

  const totalSteps = 5;

  const steps = [
    { num: 1, title: 'Check Requirements', icon: CheckCircle },
    { num: 2, title: 'Document Checklist', icon: FileText },
    { num: 3, title: 'Form Guidance', icon: User },
    { num: 4, title: 'Book Appointment', icon: Calendar },
    { num: 5, title: 'Track Application', icon: Globe },
  ];

  // Default fallback documents
  const defaultDocuments = [
    { id: 'passport', name: 'Passport', desc: 'Valid for at least 6 months from travel date, with 2 blank pages', required: true },
    { id: 'photos', name: 'Photographs', desc: '2 recent photos, 35mm x 45mm, white background', required: true },
    { id: 'flight', name: 'Flight Bookings', desc: 'Confirmed round-trip flight reservation', required: true },
    { id: 'hotel', name: 'Hotel Bookings', desc: 'Confirmed hotel reservations for your stay', required: true },
    { id: 'insurance', name: 'Travel Insurance', desc: 'Minimum coverage of $50,000 for the entire stay', required: true },
    { id: 'bank', name: 'Bank Statements', desc: 'Last 6 months bank statements showing sufficient funds', required: true },
    { id: 'employment', name: 'Employment Proof', desc: 'Letter from employer or business registration', required: true },
    { id: 'itinerary', name: 'Travel Itinerary', desc: 'Day-by-day plan of your trip', required: false },
    { id: 'cover', name: 'Cover Letter', desc: 'Explaining purpose of visit', required: false },
  ];

  // Fetch dynamic documents when entering step 2
  useEffect(() => {
    if (currentStep === 2 && country?.country_name && dynamicDocuments.length === 0 && !loadingDocs) {
      fetchDynamicDocuments();
    }
  }, [currentStep, country]);

  const fetchDynamicDocuments = async () => {
    if (!country?.country_name) return;
    
    setLoadingDocs(true);
    setDocsError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/visa/document-checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: country.country_name,
          visa_type: formData.purposeOfTravel,
          purpose: formData.purposeOfTravel,
          citizenship: formData.citizenship
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      
      // Parse the AI response into document objects
      if (data.checklist) {
        const parsedDocs = parseChecklistToDocuments(data.checklist);
        if (parsedDocs.length > 0) {
          setDynamicDocuments(parsedDocs);
        } else {
          setDynamicDocuments(defaultDocuments);
        }
      } else {
        setDynamicDocuments(defaultDocuments);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocsError('Could not load dynamic checklist. Using standard documents.');
      setDynamicDocuments(defaultDocuments);
    } finally {
      setLoadingDocs(false);
    }
  };

  const parseChecklistToDocuments = (checklist) => {
    // Parse the AI-generated checklist text into document objects
    const docs = [];
    const lines = checklist.split('\n').filter(line => line.trim());
    
    let idCounter = 0;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
        const cleanLine = trimmed.replace(/^[-•\d.]+\s*/, '').trim();
        if (cleanLine.length > 5) {
          const [name, ...descParts] = cleanLine.split(':');
          const desc = descParts.join(':').trim() || cleanLine;
          const isRequired = cleanLine.toLowerCase().includes('required') || 
                           cleanLine.toLowerCase().includes('mandatory') ||
                           !cleanLine.toLowerCase().includes('optional');
          
          docs.push({
            id: `doc_${idCounter++}`,
            name: name.trim().substring(0, 50),
            desc: desc.substring(0, 150),
            required: isRequired
          });
        }
      }
    });
    
    return docs.slice(0, 12); // Limit to 12 documents
  };

  const documents = dynamicDocuments.length > 0 ? dynamicDocuments : defaultDocuments;

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
  
  const availableDates = [
    { date: '15 Apr', day: 'Mon' },
    { date: '16 Apr', day: 'Tue' },
    { date: '18 Apr', day: 'Thu' },
    { date: '19 Apr', day: 'Fri' },
    { date: '22 Apr', day: 'Mon' },
  ];

  const timeline = [
    { stage: 'Apply', duration: 'Day 1-2', desc: 'Fill form and prepare documents', icon: FileText },
    { stage: 'Appointment', duration: 'Day 3-7', desc: 'Wait for VFS appointment', icon: Calendar },
    { stage: 'Biometrics', duration: 'Day 8', desc: 'Visit center and submit documents', icon: User },
    { stage: 'Processing', duration: 'Day 9-15', desc: 'Application is reviewed', icon: Clock },
    { stage: 'Decision', duration: 'Day 15-20', desc: 'Get the final result', icon: CheckCircle },
  ];

  const toggleDoc = (docId) => {
    setCheckedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const completedDocs = Object.values(checkedDocs).filter(Boolean).length;

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Let's check if you're eligible</h3>
        <p className="text-gray-600 text-sm mt-1">Answer a few questions to get a personalized checklist</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship *</label>
          <select 
            value={formData.citizenship}
            onChange={(e) => setFormData({...formData, citizenship: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="India">India</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Nepal">Nepal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Travel *</label>
          <select 
            value={formData.purposeOfTravel}
            onChange={(e) => setFormData({...formData, purposeOfTravel: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="tourist">Tourism</option>
            <option value="business">Business</option>
            <option value="student">Education</option>
            <option value="medical">Medical</option>
            <option value="transit">Transit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Planned Entry Date *</label>
          <input 
            type="date"
            value={formData.entryDate}
            onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
          <input 
            type="text"
            value={formData.destination}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Why we ask</p>
            <p className="text-sm text-blue-600">This helps us show you the exact documents and steps you need.</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">100% Free</span>
          <span className="text-xs text-gray-600">No payment required for DIY</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">Takes 2 minutes</p>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Your Document Checklist</h3>
          <p className="text-gray-600 text-sm">
            {loadingDocs ? 'Loading personalized checklist...' : `Based on your answers, here's what you need for ${country?.country_name || 'your destination'}`}
          </p>
        </div>
        {!loadingDocs && (
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{completedDocs}/{documents.length}</span>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loadingDocs && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-gray-600">Generating personalized checklist for {country?.country_name}...</p>
          <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* Error Message */}
      {docsError && !loadingDocs && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {docsError}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {!loadingDocs && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedDocs / documents.length) * 100}%` }}
          />
        </div>
      )}

      {/* Documents List */}
      {!loadingDocs && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => toggleDoc(doc.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              checkedDocs[doc.id] 
                ? 'bg-green-50 border-green-300' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              checkedDocs[doc.id] ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {checkedDocs[doc.id] && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                {doc.required && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Required</span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{doc.desc}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Tips Section */}
      {!loadingDocs && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="font-semibold text-green-800 text-sm mb-2">Tips to Get Approved</p>
          <ul className="text-xs text-green-700 space-y-1">
            <li className="flex items-start gap-1"><Check className="w-3 h-3 mt-0.5" /> Show strong ties to home country</li>
            <li className="flex items-start gap-1"><Check className="w-3 h-3 mt-0.5" /> Maintain minimum balance of ₹1-1.5L</li>
            <li className="flex items-start gap-1"><Check className="w-3 h-3 mt-0.5" /> Keep all documents consistent</li>
          </ul>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="font-semibold text-red-800 text-sm mb-2">Common Rejection Reasons</p>
          <ul className="text-xs text-red-700 space-y-1">
            <li className="flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5" /> Insufficient funds</li>
            <li className="flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5" /> Incomplete documents</li>
            <li className="flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5" /> Weak travel history</li>
          </ul>
        </div>
      </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">Application Form Guidance</h3>
        <p className="text-gray-600 text-sm">We'll help you fill the form correctly on the official site</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <p className="text-sm text-yellow-700">We're not filling the form for you. Just showing you what to do.</p>
      </div>

      {/* Form Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Personal Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full name (as in passport) *</label>
                <input type="text" placeholder="Enter your full name" className="w-full p-2 border rounded text-sm" />
                <p className="text-xs text-blue-500 mt-1">*Must match your passport exactly</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date of Birth *</label>
                  <input type="date" className="w-full p-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Place of Birth *</label>
                  <input type="text" placeholder="City, Country" className="w-full p-2 border rounded text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nationality *</label>
                <select className="w-full p-2 border rounded text-sm">
                  <option>India</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="font-semibold text-blue-800 text-sm mb-2">Tips</p>
            <ul className="text-xs text-blue-700 space-y-2">
              <li className="flex items-start gap-1"><Check className="w-3 h-3 mt-0.5" /> Use passport as reference</li>
              <li className="flex items-start gap-1"><Check className="w-3 h-3 mt-0.5" /> Don't leave any field blank</li>
              <li className="flex items-start gap-1"><Check className="w-3 h-3 mt-0.5" /> Answer truthfully</li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Official Site</p>
            <p className="text-xs text-gray-500 mb-3">You'll fill this on the official {country?.country_name} visa portal</p>
            <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Go to Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">Book Your Appointment</h3>
        <p className="text-gray-600 text-sm">Schedule your visit to the VFS Global center</p>
      </div>

      {/* VFS Info */}
      <div className="flex flex-wrap gap-4 justify-center bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <Building className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">VFS Global</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">15 Centers in India</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">Flexible Slots</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">SMS Updates</span>
        </div>
      </div>

      {/* City Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
        <select 
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Next Available Dates</label>
        <div className="flex flex-wrap gap-2">
          {availableDates.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                selectedDate === d.date
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <div>{d.date}</div>
              <div className="text-xs opacity-80">{d.day}</div>
            </button>
          ))}
          <button className="px-4 py-2 text-blue-500 text-sm font-medium">More dates</button>
        </div>
      </div>

      {/* Book Button */}
      <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2">
        <ExternalLink className="w-5 h-5" />
        Book on VFS Global
      </button>
      <p className="text-xs text-center text-gray-500">You'll pay the fee on their website</p>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-4 border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">Can't find a slot?</span>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
          Get Help
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">What Happens Next?</h3>
        <p className="text-gray-600 text-sm">Track your application journey</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="flex justify-between items-start">
          {timeline.map((item, idx) => (
            <div key={item.stage} className="flex flex-col items-center text-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                idx === 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-xs mt-2 text-gray-800">{item.stage}</p>
              <p className="text-xs text-blue-500">{item.duration}</p>
              <p className="text-xs text-gray-500 mt-1 hidden md:block">{item.desc}</p>
              {idx < timeline.length - 1 && (
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" style={{ left: '10%', right: '10%' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stay Updated */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800 text-sm">Stay Updated</p>
            <p className="text-xs text-green-600">You'll receive SMS and email updates from VFS Global</p>
          </div>
        </div>
        <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          Track Application <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-1">You're All Set!</h3>
        <p className="text-sm opacity-90 mb-4">You have everything you need to apply</p>
        <ul className="text-sm space-y-1 mb-4">
          <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> You know the steps</li>
          <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> You have your checklist</li>
          <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> You're ready to apply</li>
        </ul>
        <button className="w-full py-3 bg-white text-green-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
          <ExternalLink className="w-5 h-5" />
          Go to Official Application
        </button>
        <p className="text-xs mt-2 opacity-80">You'll be redirected to the official visa portal</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="font-bold text-lg">{country?.country_name} {visaType.charAt(0).toUpperCase() + visaType.slice(1)} Visa</h2>
                <p className="text-xs text-white/80">DIY Application Guide</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep >= step.num 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/30 text-white'
                }`}>
                  {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-1 mx-1 rounded ${
                    currentStep > step.num ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {steps.map((step) => (
              <p key={step.num} className="text-xs text-white/80 text-center flex-1 hidden md:block">{step.title}</p>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DIYVisaWizard;
