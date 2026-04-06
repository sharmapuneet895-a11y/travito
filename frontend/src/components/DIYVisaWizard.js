import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, FileText, Calendar, MapPin, Clock, AlertCircle, CheckCircle, ExternalLink, Building, Phone, Mail, User, Globe, HelpCircle, Loader2, Maximize2, Minimize2, Copy, Bell } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// VFS Global center data by city
const VFS_CENTERS = {
  'Mumbai': [
    { id: 1, name: 'VFS Global - Malad', address: 'Supreme Business Park, Hiranandani Gardens, Powai', phone: '022-67866000' },
    { id: 2, name: 'VFS Global - Fort', address: 'Ador House, 6 K Dubash Marg, Fort', phone: '022-67866001' },
  ],
  'Delhi': [
    { id: 1, name: 'VFS Global - Nehru Place', address: 'Block A, Nehru Place', phone: '011-47699000' },
    { id: 2, name: 'VFS Global - Connaught Place', address: 'A Block, Connaught Circus', phone: '011-47699001' },
    { id: 3, name: 'VFS Global - Gurgaon', address: 'DLF Cyber City, Phase 2', phone: '0124-4789000' },
  ],
  'Bangalore': [
    { id: 1, name: 'VFS Global - Indiranagar', address: '100 Feet Road, Indiranagar', phone: '080-67260000' },
    { id: 2, name: 'VFS Global - Whitefield', address: 'ITPL Main Road, Whitefield', phone: '080-67260001' },
  ],
  'Chennai': [
    { id: 1, name: 'VFS Global - Nungambakkam', address: 'Cathedral Road, Nungambakkam', phone: '044-45600000' },
  ],
  'Kolkata': [
    { id: 1, name: 'VFS Global - Park Street', address: '22 Camac Street, Park Street Area', phone: '033-40040000' },
  ],
  'Hyderabad': [
    { id: 1, name: 'VFS Global - Banjara Hills', address: 'Road No. 2, Banjara Hills', phone: '040-67936000' },
    { id: 2, name: 'VFS Global - Hitech City', address: 'Cyber Towers, Hitech City', phone: '040-67936001' },
    { id: 3, name: 'VFS Global - Secunderabad', address: 'SD Road, Secunderabad', phone: '040-67936002' },
  ],
  'Pune': [
    { id: 1, name: 'VFS Global - Kalyani Nagar', address: 'EON IT Park, Kalyani Nagar', phone: '020-67210000' },
  ],
  'Ahmedabad': [
    { id: 1, name: 'VFS Global - SG Highway', address: 'Iscon Mega Mall, SG Highway', phone: '079-40500000' },
  ],
};

// Country visa portal URLs
const VISA_PORTALS = {
  'Japan': 'https://www.vfsglobal.com/japan/india/',
  'USA': 'https://www.ustraveldocs.com/in/',
  'UK': 'https://www.vfsglobal.co.uk/in/en',
  'Canada': 'https://www.vfsglobal.ca/canada/india/',
  'Australia': 'https://www.vfsglobal.com/australia/india/',
  'Germany': 'https://www.vfsglobal.com/germany/india/',
  'France': 'https://www.vfsglobal.com/france/india/',
  'Italy': 'https://www.vfsglobal.com/italy/india/',
  'Spain': 'https://www.vfsglobal.com/spain/india/',
  'Singapore': 'https://www.vfsglobal.com/singapore/india/',
  'Thailand': 'https://www.thaievisa.go.th/',
  'UAE': 'https://www.vfsglobal.com/uae/india/',
  'South Korea': 'https://www.visa.go.kr/openPage.do?MENU_ID=10101',
  'New Zealand': 'https://www.vfsglobal.com/newzealand/india/',
  'Switzerland': 'https://www.vfsglobal.com/switzerland/india/',
  'Netherlands': 'https://www.vfsglobal.com/netherlands/india/',
  'default': 'https://www.vfsglobal.com/'
};

const DIYVisaWizard = ({ isOpen, onClose, country, visaType = 'tourist' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formData, setFormData] = useState({
    citizenship: 'India',
    purposeOfTravel: visaType,
    entryDate: '',
    destination: '',
  });
  const [checkedDocs, setCheckedDocs] = useState({});
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showMoreDates, setShowMoreDates] = useState(false);
  const [dynamicDocuments, setDynamicDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [trackingEmail, setTrackingEmail] = useState('');
  const [trackingPhone, setTrackingPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Update destination when country changes
  useEffect(() => {
    if (country?.country_name) {
      setFormData(prev => ({ ...prev, destination: country.country_name }));
    }
  }, [country]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setCheckedDocs({});
      setDynamicDocuments([]);
      if (country?.country_name) {
        setFormData(prev => ({ ...prev, destination: country.country_name }));
      }
    }
  }, [isOpen, country]);

  const totalSteps = 5;

  const steps = [
    { num: 1, title: 'Requirements', icon: CheckCircle },
    { num: 2, title: 'Documents', icon: FileText },
    { num: 3, title: 'Form Guide', icon: User },
    { num: 4, title: 'Appointment', icon: Calendar },
    { num: 5, title: 'Track & Apply', icon: Globe },
  ];

  const defaultDocuments = [
    { id: 'passport', name: 'Passport', desc: 'Valid 6+ months, 2 blank pages', required: true },
    { id: 'photos', name: 'Photos (2)', desc: '35x45mm, white background', required: true },
    { id: 'flight', name: 'Flight Booking', desc: 'Round-trip reservation', required: true },
    { id: 'hotel', name: 'Hotel Booking', desc: 'Confirmed reservations', required: true },
    { id: 'insurance', name: 'Travel Insurance', desc: 'Min $50,000 coverage', required: true },
    { id: 'bank', name: 'Bank Statements', desc: 'Last 6 months', required: true },
    { id: 'employment', name: 'Employment Letter', desc: 'From employer', required: true },
    { id: 'itinerary', name: 'Itinerary', desc: 'Day-by-day plan', required: false },
  ];

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
      
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      if (data.checklist) {
        const parsedDocs = parseChecklistToDocuments(data.checklist);
        setDynamicDocuments(parsedDocs.length > 0 ? parsedDocs : defaultDocuments);
      } else {
        setDynamicDocuments(defaultDocuments);
      }
    } catch (error) {
      setDocsError('Using standard checklist');
      setDynamicDocuments(defaultDocuments);
    } finally {
      setLoadingDocs(false);
    }
  };

  const parseChecklistToDocuments = (checklist) => {
    const docs = [];
    const lines = checklist.split('\n').filter(line => line.trim());
    let idCounter = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
        const cleanLine = trimmed.replace(/^[-•\d.]+\s*/, '').trim();
        if (cleanLine.length > 5) {
          const [name, ...descParts] = cleanLine.split(':');
          docs.push({
            id: `doc_${idCounter++}`,
            name: name.trim().substring(0, 40),
            desc: (descParts.join(':').trim() || cleanLine).substring(0, 100),
            required: !cleanLine.toLowerCase().includes('optional')
          });
        }
      }
    });
    return docs.slice(0, 10);
  };

  const documents = dynamicDocuments.length > 0 ? dynamicDocuments : defaultDocuments;
  const cities = Object.keys(VFS_CENTERS);
  const currentCenters = VFS_CENTERS[selectedCity] || [];
  
  // Generate dynamic dates
  const generateDates = (count) => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3); // Start from 3 days ahead
    
    while (dates.length < count) {
      if (currentDate.getDay() !== 0) { // Skip Sundays
        dates.push({
          date: `${currentDate.getDate()} ${months[currentDate.getMonth()]}`,
          day: days[currentDate.getDay()],
          full: currentDate.toISOString().split('T')[0]
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const availableDates = generateDates(showMoreDates ? 14 : 5);
  const completedDocs = Object.values(checkedDocs).filter(Boolean).length;
  const visaPortalUrl = VISA_PORTALS[country?.country_name] || VISA_PORTALS['default'];
  const vfsBookingUrl = `https://www.vfsglobal.com/${country?.country_name?.toLowerCase() || 'india'}/india/book-an-appointment.html`;

  const toggleDoc = (docId) => setCheckedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm text-center">Confirm your details to get a personalized checklist</p>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Citizenship</label>
          <select 
            value={formData.citizenship}
            onChange={(e) => setFormData({...formData, citizenship: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="India">India</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Nepal">Nepal</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Purpose</label>
          <select 
            value={formData.purposeOfTravel}
            onChange={(e) => setFormData({...formData, purposeOfTravel: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="tourist">Tourism</option>
            <option value="business">Business</option>
            <option value="student">Education</option>
            <option value="medical">Medical</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Travel Date</label>
          <input 
            type="date"
            value={formData.entryDate}
            onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Destination</label>
          <input 
            type="text"
            value={formData.destination}
            readOnly
            className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-medium text-green-800">100% Free DIY Guide</p>
            <p className="text-xs text-green-600">No payment required - we just show you the steps</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-3">
      {loadingDocs ? (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-2" />
          <p className="text-sm text-gray-600">Loading {country?.country_name} requirements...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Check off as you prepare</p>
            <span className="text-sm font-bold text-green-600">{completedDocs}/{documents.length} done</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${(completedDocs / documents.length) * 100}%` }} />
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  checkedDocs[doc.id] ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:border-green-300'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  checkedDocs[doc.id] ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {checkedDocs[doc.id] && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                    {doc.required && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Required</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <p className="text-xs font-semibold text-green-800 mb-1">✓ Tips</p>
              <p className="text-[10px] text-green-700">Keep min ₹1.5L balance</p>
              <p className="text-[10px] text-green-700">All docs must be consistent</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-200">
              <p className="text-xs font-semibold text-red-800 mb-1">✗ Avoid</p>
              <p className="text-[10px] text-red-700">Insufficient funds</p>
              <p className="text-[10px] text-red-700">Incomplete documents</p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-3">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
        <p className="text-xs text-yellow-700">We guide you - you fill the official form yourself</p>
      </div>

      <div className="bg-white border rounded-lg p-3">
        <p className="text-sm font-semibold text-gray-800 mb-2">Key form sections:</p>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span className="bg-green-100 text-green-700 px-1.5 rounded">1</span>
            <span><strong>Personal Info</strong> - Name exactly as in passport</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-green-100 text-green-700 px-1.5 rounded">2</span>
            <span><strong>Travel Details</strong> - Dates, purpose, accommodation</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-green-100 text-green-700 px-1.5 rounded">3</span>
            <span><strong>Employment</strong> - Current job or business details</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-green-100 text-green-700 px-1.5 rounded">4</span>
            <span><strong>Financial</strong> - Bank details showing sufficient funds</span>
          </div>
        </div>
      </div>

      <a
        href={visaPortalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold text-center transition-all"
      >
        <span className="flex items-center justify-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Open {country?.country_name} Visa Portal
        </span>
      </a>
      <p className="text-[10px] text-center text-gray-500">Opens official website in new tab</p>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 border border-blue-200">
        <Building className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-blue-800">VFS Global - Official Visa Application Center</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Select City</label>
          <select 
            value={selectedCity}
            onChange={(e) => { setSelectedCity(e.target.value); setSelectedCenter(null); }}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">VFS Center ({currentCenters.length} available)</label>
          <select 
            value={selectedCenter?.id || ''}
            onChange={(e) => setSelectedCenter(currentCenters.find(c => c.id === parseInt(e.target.value)))}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select center</option>
            {currentCenters.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCenter && (
        <div className="bg-gray-50 rounded-lg p-2 border text-xs">
          <p className="font-medium text-gray-800">{selectedCenter.name}</p>
          <p className="text-gray-600">{selectedCenter.address}</p>
          <p className="text-blue-600">{selectedCenter.phone}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Select Date</label>
        <div className="flex flex-wrap gap-1.5">
          {availableDates.map((d) => (
            <button
              key={d.full}
              onClick={() => setSelectedDate(d.full)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-all ${
                selectedDate === d.full
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <div>{d.date}</div>
              <div className="text-[10px] opacity-80">{d.day}</div>
            </button>
          ))}
          <button 
            onClick={() => setShowMoreDates(!showMoreDates)}
            className="px-2.5 py-1.5 text-blue-500 text-xs font-medium hover:bg-blue-50 rounded"
          >
            {showMoreDates ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      <a
        href={vfsBookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold text-center transition-all"
      >
        <span className="flex items-center justify-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Book on VFS Global
        </span>
      </a>
      <p className="text-[10px] text-center text-gray-500">You'll pay the appointment fee on their website</p>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-3">
      {/* Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">You're Ready!</h3>
            <p className="text-sm opacity-90">All steps completed for {country?.country_name} visa</p>
          </div>
        </div>
      </div>

      {/* Your Details Summary */}
      <div className="bg-gray-50 rounded-lg p-3 border">
        <p className="text-xs font-semibold text-gray-700 mb-2">Your Application Summary</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-gray-500">Destination:</span> <span className="font-medium">{formData.destination}</span></div>
          <div><span className="text-gray-500">Purpose:</span> <span className="font-medium capitalize">{formData.purposeOfTravel}</span></div>
          <div><span className="text-gray-500">Documents:</span> <span className="font-medium text-green-600">{completedDocs}/{documents.length} ready</span></div>
          {selectedDate && <div><span className="text-gray-500">Appointment:</span> <span className="font-medium">{selectedDate}</span></div>}
          {selectedCenter && <div className="col-span-2"><span className="text-gray-500">Center:</span> <span className="font-medium">{selectedCenter.name}</span></div>}
        </div>
      </div>

      {/* Notification Setup */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-blue-500" />
          <p className="text-sm font-medium text-blue-800">Get Status Updates</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="email"
            placeholder="Email"
            value={trackingEmail}
            onChange={(e) => setTrackingEmail(e.target.value)}
            className="p-2 border rounded text-xs"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={trackingPhone}
            onChange={(e) => setTrackingPhone(e.target.value)}
            className="p-2 border rounded text-xs"
          />
        </div>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="rounded text-blue-500"
          />
          <span className="text-xs text-gray-600">Email me application tips & updates</span>
        </label>
      </div>

      {/* Final CTA */}
      <a
        href={visaPortalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-center transition-all"
      >
        <span className="flex items-center justify-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Start Official Application
        </span>
      </a>
      <p className="text-[10px] text-center text-gray-500">Opens {country?.country_name} visa portal</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-lg w-full max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <div>
                <h2 className="font-bold">{country?.country_name || 'Visa'} - Self Apply</h2>
                <p className="text-[10px] text-white/80">DIY Application Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="p-1.5 hover:bg-white/20 rounded-full transition-all"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= step.num ? 'bg-white text-green-600' : 'bg-white/30 text-white'
                }`}>
                  {currentStep > step.num ? <Check className="w-3 h-3" /> : step.num}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-4 md:w-8 h-0.5 mx-0.5 rounded ${currentStep > step.num ? 'bg-white' : 'bg-white/30'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {steps.map((step) => (
              <p key={step.num} className="text-[9px] text-white/80 text-center flex-1">{step.title}</p>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 overflow-y-auto ${isFullscreen ? 'max-h-[calc(100vh-180px)]' : 'max-h-[calc(90vh-180px)]'}`}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-all ${
              currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <span className="text-xs text-gray-500">{currentStep}/{totalSteps}</span>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onClose} className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DIYVisaWizard;
