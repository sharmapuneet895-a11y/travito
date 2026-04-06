import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, FileText, Calendar, Clock, Shield, Phone, CheckCircle, User, HelpCircle, MessageCircle, Building, Loader2, Star, Users, ClipboardCheck, Headphones, Maximize2, Minimize2 } from 'lucide-react';

const AssistedServiceWizard = ({ isOpen, onClose, country, visaType = 'tourist', pricing }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    travelDate: '',
    purpose: visaType,
  });
  const [selectedAddons, setSelectedAddons] = useState([]);

  const totalSteps = 5;

  const steps = [
    { num: 1, title: 'Share Details', icon: User },
    { num: 2, title: 'Document Review', icon: FileText },
    { num: 3, title: 'Application Help', icon: ClipboardCheck },
    { num: 4, title: 'Book Appointment', icon: Calendar },
    { num: 5, title: 'Submission & Tracking', icon: Shield },
  ];

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

  const includedServices = [
    'Personalized document checklist',
    'Document review and verification',
    'Application form guidance',
    'Appointment booking support',
    'Submission support & tracking',
    'WhatsApp support throughout'
  ];

  const addons = [
    { id: 'premium', name: 'Premium Support', price: 1500, desc: 'Priority queue + dedicated agent' },
    { id: 'insurance', name: 'Travel Insurance', price: 800, desc: 'Basic coverage for your trip' },
    { id: 'itinerary', name: 'Itinerary Planning', price: 500, desc: 'Day-by-day travel plan' },
  ];

  const basePrice = pricing?.assisted?.price || 4999;
  const addonTotal = selectedAddons.reduce((sum, id) => {
    const addon = addons.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = basePrice + addonTotal;

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="flex gap-6">
      {/* Main Form */}
      <div className="flex-1">
        <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
          <h3 className="font-bold text-gray-800 mb-2">We make your visa application simple</h3>
          <p className="text-sm text-gray-600 mb-4">Share your details once, our experts will review, guide, and help you apply with confidence.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Users, title: 'Expert Guidance', desc: 'Get help from visa experts' },
              { icon: FileText, title: 'Document Check', desc: 'We review before submission' },
              { icon: Headphones, title: 'Priority Support', desc: 'Quick responses on WhatsApp' },
              { icon: CheckCircle, title: 'Higher Success', desc: 'Better approval chances' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 text-center border">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 bg-white rounded-lg p-2 border">
            <div className="flex -space-x-2">
              {['👨', '👩', '👨‍💼'].map((emoji, idx) => (
                <div key={idx} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">2,450+ travelers</span> got their {country?.country_name} visa with our assistance
            </p>
            <div className="ml-auto flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.8/5</span>
              <span className="text-xs text-gray-400">from 1,200+ reviews</span>
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mb-1">Let's start with your basic details</h3>
        <p className="text-sm text-gray-500 mb-4">All information is secure and confidential</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as in Passport) *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <div className="flex gap-2">
              <select className="w-20 p-2.5 border border-gray-300 rounded-lg text-sm">
                <option>+91</option>
              </select>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter mobile number"
                className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current City *</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select your city</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date *</label>
            <input
              type="date"
              value={formData.travelDate}
              onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Travel *</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="tourist">Tourism</option>
              <option value="business">Business</option>
              <option value="student">Education</option>
              <option value="medical">Medical</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">Takes 2 minutes</p>
      </div>

      {/* Sidebar */}
      <div className="w-64 space-y-4 hidden lg:block">
        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">What's Included in Assisted Service</h4>
          <div className="space-y-2">
            {includedServices.map((service, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{service}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-xs text-blue-600 font-medium">"We don't just help, we make it easy."</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Pricing Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium">₹{basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Add-ons (Optional)</span>
              <span className="font-medium">₹{addonTotal.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 bg-green-50 rounded-lg p-2">
            <p className="text-xs text-green-700 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              No hidden charges. Transparent pricing.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-500" />
            <p className="font-semibold text-gray-800 text-sm">Need Full Service Instead?</p>
          </div>
          <p className="text-xs text-gray-600 mb-2">Our visa agents can handle everything for you.</p>
          <button className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            View Agent Options →
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Document Review</h3>
        <p className="text-gray-600 text-sm">Our team will verify your documents before submission</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Required Documents
          </h4>
          <div className="space-y-2">
            {[
              { name: 'Passport', status: 'pending' },
              { name: 'Photographs (2)', status: 'pending' },
              { name: 'Bank Statements', status: 'pending' },
              { name: 'Flight Booking', status: 'pending' },
              { name: 'Hotel Reservation', status: 'pending' },
              { name: 'Travel Insurance', status: 'pending' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{doc.name}</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pending Upload</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
            Upload Documents
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              How Document Review Works
            </h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. Upload your documents via WhatsApp or our portal</p>
              <p>2. Our experts review for completeness & accuracy</p>
              <p>3. Get feedback and corrections if needed</p>
              <p>4. Final verification before submission</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-semibold text-green-800 mb-2">Why Document Review Matters</h4>
            <div className="space-y-1 text-sm text-green-700">
              <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Catches errors before submission</p>
              <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Reduces rejection risk by 60%</p>
              <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Saves time on reapplication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Application Help</h3>
        <p className="text-gray-600 text-sm">We guide you step-by-step through the application process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Application Form Assistance</h4>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">Form Filling Support</p>
              <p className="text-xs text-gray-500">We'll guide you through every field of the official visa form</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">Common Mistakes Prevention</p>
              <p className="text-xs text-gray-500">Our experts help you avoid errors that cause rejections</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">Cover Letter Drafting</p>
              <p className="text-xs text-gray-500">Get help writing a compelling cover letter</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Support Channels</h4>
          <div className="space-y-3">
            <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </button>
            <button className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Schedule a Call
            </button>
            <p className="text-xs text-gray-500 text-center">Available Mon-Sat, 9 AM - 8 PM</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          <span>Stuck somewhere? Our team typically responds within 30 minutes during business hours.</span>
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Book Appointment</h3>
        <p className="text-gray-600 text-sm">We help you find and book the best available slot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-500" />
            VFS Global Appointment
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred City</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm">
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="p-2.5 border border-gray-300 rounded-lg text-sm" />
                <input type="date" className="p-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
              Find Available Slots
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Our Appointment Service</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p className="flex items-center gap-2"><Check className="w-4 h-4" /> We monitor slot availability</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4" /> Alert you when slots open</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4" /> Help with slot booking</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4" /> Reschedule if needed</p>
            </div>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">What to Bring</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• All original documents</p>
              <p>• Printed application form</p>
              <p>• Appointment confirmation</p>
              <p>• Payment (if applicable)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Submission & Tracking</h3>
        <p className="text-gray-600 text-sm">We monitor your application until you get your visa</p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold mb-1">You're in Good Hands!</h4>
        <p className="text-sm opacity-90 mb-4">Our team will guide you through the entire process</p>
        <div className="inline-flex items-center gap-3">
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <p className="text-xs opacity-80">Processing Time</p>
            <p className="font-bold">{pricing?.assisted?.processing_days || '5-7'} Days</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <p className="text-xs opacity-80">Success Rate</p>
            <p className="font-bold">96%</p>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-800 mb-4 text-center">How Our Assisted Process Works</h4>
        <div className="flex justify-between items-start">
          {[
            { icon: User, title: 'Share Your\nDetails', desc: 'Tell us about your travel plans', color: 'bg-blue-100 text-blue-600' },
            { icon: FileText, title: 'Document\nReview', desc: 'We check your documents', color: 'bg-green-100 text-green-600' },
            { icon: ClipboardCheck, title: 'Application\nHelp', desc: 'We guide you step-by-step', color: 'bg-yellow-100 text-yellow-600' },
            { icon: Calendar, title: 'Book\nAppointment', desc: 'We help you find slots', color: 'bg-purple-100 text-purple-600' },
            { icon: Shield, title: 'Track &\nSupport', desc: 'We track and keep you updated', color: 'bg-indigo-100 text-indigo-600' },
          ].map((step, idx) => (
            <div key={idx} className="flex-1 text-center relative">
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {idx + 1}
              </div>
              <p className="text-xs font-semibold text-gray-800 whitespace-pre-line">{step.title}</p>
              <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
              {idx < 4 && (
                <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200" style={{ width: '100%', left: '50%' }}>
                  <span className="absolute right-0 -top-1 text-gray-400">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">After Submission</h4>
        <div className="grid grid-cols-2 gap-3 text-sm text-green-700">
          <p className="flex items-center gap-2"><Check className="w-4 h-4" /> Real-time status updates</p>
          <p className="flex items-center gap-2"><Check className="w-4 h-4" /> WhatsApp notifications</p>
          <p className="flex items-center gap-2"><Check className="w-4 h-4" /> Email confirmations</p>
          <p className="flex items-center gap-2"><Check className="w-4 h-4" /> Passport collection help</p>
        </div>
      </div>

      <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
        Continue to Document Checklist →
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-4xl w-full max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <div>
                <h2 className="font-bold">{country?.country_name} - Assisted Service</h2>
                <p className="text-[10px] text-white/80">Expert Help for Your Visa</p>
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

          {/* Quick Info */}
          <div className="flex flex-wrap gap-3 text-xs mb-2">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pricing?.assisted?.processing_days || '5-7'} Days</span>
            <span>₹{(pricing?.assisted?.price || 4999).toLocaleString()}</span>
            <span>90 Days Max</span>
            <span className="flex items-center gap-1"><Building className="w-3 h-3" /> VFS Global</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= step.num ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
                }`}>
                  {currentStep > step.num ? <Check className="w-3 h-3" /> : step.num}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-4 md:w-10 h-0.5 mx-0.5 rounded ${currentStep > step.num ? 'bg-white' : 'bg-white/30'}`} />
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
        <div className={`p-4 overflow-y-auto ${isFullscreen ? 'max-h-[calc(100vh-180px)]' : 'max-h-[calc(90vh-200px)]'}`}>
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
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
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

export default AssistedServiceWizard;
