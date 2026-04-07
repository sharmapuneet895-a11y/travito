import React, { useState } from 'react';
import axios from 'axios';
import { X, ChevronRight, ChevronLeft, Check, Star, Clock, Phone, MessageCircle, CheckCircle, Users, Shield, Maximize2, Minimize2, Building, Mail, MapPin, Upload, Camera, Plane, Hotel, FileText, Loader2, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Country tourist images
const COUNTRY_IMAGES = {
  'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80',
  'USA': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1920&q=80',
  'UK': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80',
  'Canada': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920&q=80',
  'Australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1920&q=80',
  'Germany': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=80',
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
  'Italy': 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=1920&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
  'Thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&q=80',
  'UAE': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80'
};

const AgentFinderWizard = ({ isOpen, onClose, country, visaType = 'tourist', pricing }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [passportUploaded, setPassportUploaded] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [extractingData, setExtractingData] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  
  const [formData, setFormData] = useState({
    // Personal Info (auto-filled from passport)
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    passportNumber: '',
    passportValidThru: '',
    placeOfIssue: '',
    email: '',
    phone: '',
    // Flight Details
    arrivalDate: '',
    arrivalFlightNumber: '',
    departureDate: '',
    departureFlightNumber: '',
    // Hotel Details
    hotelName: '',
    hotelCheckIn: '',
    hotelCheckOut: '',
  });

  const totalSteps = 4;

  const steps = [
    { num: 1, title: 'Select Agent', desc: 'Choose from verified agents' },
    { num: 2, title: 'Travel Details', desc: 'Upload documents & info' },
    { num: 3, title: 'Connect', desc: 'Agent will contact you' },
    { num: 4, title: 'Track', desc: 'Monitor your application' },
  ];

  // Agent data with detailed info
  const agents = [
    {
      id: 1,
      name: 'VisaExperts India',
      logo: 'https://ui-avatars.com/api/?name=VE&background=1e40af&color=fff&size=80',
      experience: '8 Years',
      googleRating: 4.8,
      reviews: 1250,
      visaFee: 4500,
      govtFee: 2500,
      processingTime: '3-5 days',
      location: 'Delhi',
    },
    {
      id: 2,
      name: 'GoVisa Services',
      logo: 'https://ui-avatars.com/api/?name=GV&background=1e40af&color=fff&size=80',
      experience: '5 Years',
      googleRating: 4.6,
      reviews: 890,
      visaFee: 3500,
      govtFee: 2500,
      processingTime: '4-6 days',
      location: 'Mumbai',
    },
    {
      id: 3,
      name: 'Global Visa Hub',
      logo: 'https://ui-avatars.com/api/?name=GH&background=1e40af&color=fff&size=80',
      experience: '10 Years',
      googleRating: 4.7,
      reviews: 1100,
      visaFee: 5000,
      govtFee: 2500,
      processingTime: '2-4 days',
      location: 'Bangalore',
    },
    {
      id: 4,
      name: 'Easy Visa Solutions',
      logo: 'https://ui-avatars.com/api/?name=EV&background=1e40af&color=fff&size=80',
      experience: '6 Years',
      googleRating: 4.4,
      reviews: 820,
      visaFee: 3000,
      govtFee: 2500,
      processingTime: '5-7 days',
      location: 'Chennai',
    },
    {
      id: 5,
      name: 'VisaPro Assist',
      logo: 'https://ui-avatars.com/api/?name=VP&background=1e40af&color=fff&size=80',
      experience: '7 Years',
      googleRating: 4.5,
      reviews: 750,
      visaFee: 4000,
      govtFee: 2500,
      processingTime: '4-5 days',
      location: 'Hyderabad',
    },
  ];

  const countryImage = COUNTRY_IMAGES[country?.country_name] || COUNTRY_IMAGES['default'];

  // Real passport data extraction using GPT-4o Vision OCR
  const handlePassportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setOcrError('Please upload a JPEG, PNG, or WEBP image');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setOcrError('Image must be less than 10MB');
      return;
    }
    
    setExtractingData(true);
    setOcrError(null);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        
        try {
          const response = await axios.post(`${BACKEND_URL}/api/visa/passport-ocr`, {
            image_base64: base64String
          });
          
          if (response.data.success && response.data.data) {
            const extractedData = response.data.data;
            setFormData(prev => ({
              ...prev,
              firstName: extractedData.firstName || '',
              lastName: extractedData.lastName || '',
              dob: extractedData.dob || '',
              gender: extractedData.gender || '',
              passportNumber: extractedData.passportNumber || '',
              passportValidThru: extractedData.passportValidThru || '',
              placeOfIssue: extractedData.placeOfIssue || '',
            }));
            setPassportUploaded(true);
            setOcrError(null);
          } else {
            setOcrError(response.data.error || 'Could not extract passport data. Please try again or fill manually.');
          }
        } catch (apiError) {
          console.error('Passport OCR API error:', apiError);
          setOcrError('Failed to process passport. Please ensure the image is clear and try again.');
        } finally {
          setExtractingData(false);
        }
      };
      
      reader.onerror = () => {
        setOcrError('Failed to read file. Please try again.');
        setExtractingData(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Passport upload error:', error);
      setOcrError('An error occurred. Please try again.');
      setExtractingData(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoUploaded(true);
    }
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => (
    <div className="w-full md:w-1/5 bg-gray-50 p-4 border-r border-gray-200">
      <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Steps</h3>
      <div className="space-y-1">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              currentStep === step.num
                ? 'bg-blue-600 text-white'
                : currentStep > step.num
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === step.num
                ? 'bg-white text-blue-600'
                : currentStep > step.num
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{step.title}</p>
              <p className={`text-xs truncate ${currentStep === step.num ? 'text-blue-100' : 'text-gray-400'}`}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAgentCard = (agent) => (
    <div
      key={agent.id}
      onClick={() => setSelectedAgent(agent)}
      className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${
        selectedAgent?.id === agent.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <img src={agent.logo} alt={agent.name} className="w-14 h-14 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-gray-800">{agent.name}</h4>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {agent.location}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-sm text-gray-800">{agent.googleRating}</span>
              <span className="text-xs text-gray-500">({agent.reviews})</span>
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mt-1">{agent.experience} Experience</p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Visa Fee</p>
              <p className="font-bold text-gray-800">₹{agent.visaFee.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Govt Fee</p>
              <p className="font-bold text-gray-800">₹{agent.govtFee.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Processing</p>
              <p className="font-bold text-gray-800">{agent.processingTime}</p>
            </div>
            <div className="ml-auto">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-blue-600">₹{(agent.visaFee + agent.govtFee).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-gray-600">Select a verified agent to help with your {country?.country_name} visa application</p>
      <div className="space-y-3">
        {agents.map(renderAgentCard)}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      {/* Document Upload Section */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Required Documents
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Passport Upload */}
          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            passportUploaded ? 'border-green-400 bg-green-50' : ocrError ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="file"
              id="passport-upload"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePassportUpload}
              className="hidden"
            />
            <label htmlFor="passport-upload" className="cursor-pointer block">
              {extractingData ? (
                <div className="py-4">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-medium">AI extracting passport data...</p>
                  <p className="text-xs text-blue-500">Powered by GPT-4o Vision</p>
                </div>
              ) : passportUploaded ? (
                <div className="py-4">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">Passport Uploaded</p>
                  <p className="text-xs text-green-600">Data auto-filled below</p>
                </div>
              ) : ocrError ? (
                <div className="py-4">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 font-medium">Upload Failed</p>
                  <p className="text-xs text-red-500">{ocrError}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to try again</p>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Upload Passport</p>
                  <p className="text-xs text-gray-500">JPEG, PNG, or WEBP • AI-powered OCR</p>
                </div>
              )}
            </label>
          </div>

          {/* Photo Upload */}
          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            photoUploaded ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <label htmlFor="photo-upload" className="cursor-pointer block">
              {photoUploaded ? (
                <div className="py-4">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">Photo Uploaded</p>
                  <p className="text-xs text-green-600">Embassy format</p>
                </div>
              ) : (
                <div className="py-4">
                  <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Upload Photo</p>
                  <p className="text-xs text-gray-500">As required by embassy</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Personal Information (Auto-filled from Passport) */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Personal Information
          </h4>
          {passportUploaded && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Auto-filled from passport</span>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First name"
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last name"
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Marital Status *</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Passport Number *</label>
            <input
              type="text"
              value={formData.passportNumber}
              onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
              placeholder="P1234567"
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valid Thru *</label>
            <input
              type="date"
              value={formData.passportValidThru}
              onChange={(e) => setFormData({ ...formData, passportValidThru: e.target.value })}
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Place of Issue *</label>
            <input
              type="text"
              value={formData.placeOfIssue}
              onChange={(e) => setFormData({ ...formData, placeOfIssue: e.target.value })}
              placeholder="City"
              className={`w-full p-2.5 border rounded-lg text-sm ${passportUploaded ? 'bg-green-50 border-green-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-600" />
          Flight Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Arrival */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Arrival (Inbound)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Arrival Date *</label>
                <input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Flight Number *</label>
                <input
                  type="text"
                  value={formData.arrivalFlightNumber}
                  onChange={(e) => setFormData({ ...formData, arrivalFlightNumber: e.target.value })}
                  placeholder="e.g., AI302"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Departure */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Departure (Outbound)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Departure Date *</label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Flight Number *</label>
                <input
                  type="text"
                  value={formData.departureFlightNumber}
                  onChange={(e) => setFormData({ ...formData, departureFlightNumber: e.target.value })}
                  placeholder="e.g., AI303"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Reservation */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Hotel className="w-5 h-5 text-blue-600" />
          Hotel Reservation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hotel Name *</label>
            <input
              type="text"
              value={formData.hotelName}
              onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
              placeholder="e.g., Hilton Tokyo"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Check-in Date *</label>
            <input
              type="date"
              value={formData.hotelCheckIn}
              onChange={(e) => setFormData({ ...formData, hotelCheckIn: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Check-out Date *</label>
            <input
              type="date"
              value={formData.hotelCheckOut}
              onChange={(e) => setFormData({ ...formData, hotelCheckOut: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Selected Agent Summary */}
      {selectedAgent && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Selected Agent:</strong> {selectedAgent.name} • ₹{(selectedAgent.visaFee + selectedAgent.govtFee).toLocaleString()} total
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Request Submitted!</h3>
        <p className="text-green-700">{selectedAgent?.name} will contact you within 2 hours</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Contact Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all">
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all">
            <Phone className="w-5 h-5" />
            Call Now
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">What happens next?</h4>
        <div className="space-y-3">
          {[
            'Agent reviews your travel requirements',
            'You\'ll receive a call or WhatsApp message',
            'Discuss documents and timeline',
            'Make payment and begin process'
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
              </div>
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="bg-blue-600 rounded-xl p-6 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
        <p className="text-blue-100">Track your {country?.country_name} visa progress</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Application Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Destination</span>
            <span className="font-medium">{country?.country_name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Applicant</span>
            <span className="font-medium">{formData.firstName} {formData.lastName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Agent</span>
            <span className="font-medium">{selectedAgent?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Travel Dates</span>
            <span className="font-medium">{formData.arrivalDate} to {formData.departureDate}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Total Fee</span>
            <span className="font-bold text-blue-600">₹{selectedAgent ? (selectedAgent.visaFee + selectedAgent.govtFee).toLocaleString() : '---'}</span>
          </div>
        </div>
      </div>

      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all">
        Track Application Status
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
        isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-4xl w-full max-h-[90vh]'
      }`}>
        
        {/* Header with Country Name - Increased Size */}
        <div 
          className="relative bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(30, 64, 175, 0.85), rgba(30, 64, 175, 0.95)), url('${countryImage}')`,
            minHeight: '180px'
          }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 hover:bg-white/20 rounded-full transition-all text-white">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full py-8 px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              {country?.country_name || 'Visa Application'}
            </h1>
            {/* Services Included - Moved to top panel */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {['Document verification', 'Form filling', 'Appointment booking', 'Interview prep', 'Submission support', 'Status tracking'].map((service, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                  <span className="text-xs text-white font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {renderStepIndicator()}
          <div className="flex-1 flex flex-col">
            <div className={`flex-1 p-5 overflow-y-auto bg-gray-50 ${isFullscreen ? 'max-h-[calc(100vh-280px)]' : 'max-h-[calc(90vh-280px)]'}`}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep5()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
              {currentStep < totalSteps ? (
                <button
                  onClick={() => {
                    if (currentStep === 1 && !selectedAgent) {
                      alert('Please select an agent');
                      return;
                    }
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentFinderWizard;
