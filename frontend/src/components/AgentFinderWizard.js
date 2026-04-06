import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Star, MapPin, Clock, Shield, Phone, MessageCircle, Search, Filter, CheckCircle, Users, Award, ThumbsUp, Zap, HelpCircle, Building, Maximize2, Minimize2 } from 'lucide-react';

const AgentFinderWizard = ({ isOpen, onClose, country, visaType = 'tourist', pricing }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filters, setFilters] = useState({
    city: 'All Cities',
    maxFee: 15000,
    experience: [],
    rating: 0,
    services: []
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    travelDate: '',
    purpose: visaType,
    additionalNotes: ''
  });

  const totalSteps = 5;

  const steps = [
    { num: 1, title: 'Compare Agents', icon: Search },
    { num: 2, title: 'Share Details', icon: Users },
    { num: 3, title: 'Agent Connect', icon: MessageCircle },
    { num: 4, title: 'Application Help', icon: CheckCircle },
    { num: 5, title: 'Submission & Tracking', icon: Shield },
  ];

  const cities = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
  
  // Mock agent data - would be dynamic from API
  const agents = [
    {
      id: 1,
      name: 'VisaExperts India',
      logo: '🛂',
      location: 'New Delhi',
      experience: '8+ Years',
      rating: 4.8,
      reviews: 1250,
      tags: ['High Success Rate', 'Fast Response'],
      services: ['Document Review', 'Form Filling', 'Appointment Booking', 'Post-Submission Support'],
      price: 7500,
      popular: true
    },
    {
      id: 2,
      name: 'GoVisa Services',
      logo: '🌐',
      location: 'Mumbai',
      experience: '5+ Years',
      rating: 4.6,
      reviews: 890,
      tags: ['Good Support', 'Value for Money'],
      services: ['Document Review', 'Form Filling', 'Appointment Booking', 'Post-Submission Support'],
      price: 6000,
      popular: false
    },
    {
      id: 3,
      name: 'Global Visa Hub',
      logo: '✈️',
      location: 'Bangalore',
      experience: '10+ Years',
      rating: 4.7,
      reviews: 1100,
      tags: ['High Success Rate', 'Expert Team'],
      services: ['Document Review', 'Form Filling', 'Appointment Booking', 'Post-Submission Support'],
      price: 8500,
      popular: false
    },
    {
      id: 4,
      name: 'Easy Visa Solutions',
      logo: '📋',
      location: 'Chennai',
      experience: '6+ Years',
      rating: 4.4,
      reviews: 820,
      tags: ['Quick Response', 'Friendly Team'],
      services: ['Document Review', 'Form Filling', 'Appointment Booking', 'Post-Submission Support'],
      price: 5500,
      popular: false
    },
    {
      id: 5,
      name: 'VisaPro Assist',
      logo: '🎯',
      location: 'Hyderabad',
      experience: '7+ Years',
      rating: 4.5,
      reviews: 750,
      tags: ['Reliable', 'Good Support'],
      services: ['Document Review', 'Form Filling', 'Appointment Booking', 'Post-Submission Support'],
      price: 6800,
      popular: false
    }
  ];

  const filteredAgents = agents.filter(agent => {
    if (filters.city !== 'All Cities' && agent.location !== filters.city) return false;
    if (agent.price > filters.maxFee) return false;
    if (filters.rating > 0 && agent.rating < filters.rating) return false;
    return true;
  });

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="flex gap-4 h-full">
      {/* Filters Sidebar */}
      <div className="w-48 flex-shrink-0 bg-gray-50 rounded-lg p-4 space-y-4 hidden md:block">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">Filter Agents</h4>
          <button onClick={() => setFilters({ city: 'All Cities', maxFee: 15000, experience: [], rating: 0, services: [] })} className="text-xs text-blue-500 hover:underline">Clear All</button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="w-full p-2 text-sm border rounded-lg"
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Service Fee</label>
          <input
            type="range"
            min="0"
            max="15000"
            step="500"
            value={filters.maxFee}
            onChange={(e) => setFilters({ ...filters, maxFee: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span>₹{filters.maxFee.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Customer Rating</label>
          {[4, 3, 2].map(rating => (
            <label key={rating} className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => setFilters({ ...filters, rating })}
                className="text-blue-500"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs text-gray-600">& above</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Agents List */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">{filteredAgents.length} Verified Agents Found</p>
          <select className="text-sm border rounded-lg px-2 py-1">
            <option>Sort by: Recommended</option>
            <option>Price: Low to High</option>
            <option>Rating: High to Low</option>
          </select>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedAgent?.id === agent.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-xl">
                  {agent.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-gray-800 text-sm">{agent.name}</h5>
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                    {agent.popular && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Most Popular</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{agent.location}</span>
                    <span>•</span>
                    <span>{agent.experience} Experience</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium">{agent.rating}</span>
                      <span className="text-xs text-gray-400">({agent.reviews.toLocaleString()} reviews)</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.tags.map(tag => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{agent.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Service Fee</p>
                  <p className="text-xs text-gray-400">+ Govt. Fees</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Book Sidebar */}
      <div className="w-48 flex-shrink-0 space-y-3 hidden lg:block">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="font-semibold text-blue-800 text-sm mb-2">Why Book an Agent?</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Higher Success Rate</p>
                <p className="text-gray-500">Agents know what works</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Saves Time & Effort</p>
                <p className="text-gray-500">We handle complex steps</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Expert Guidance</p>
                <p className="text-gray-500">Avoid common mistakes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <h4 className="font-semibold text-green-800 text-sm mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4" /> Safety First
          </h4>
          <div className="space-y-1 text-xs text-green-700">
            <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Background Verified</p>
            <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Performance Monitored</p>
            <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Secure Data Handling</p>
            <p className="flex items-center gap-1"><Check className="w-3 h-3" /> 100% Transparent Pricing</p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <p className="font-semibold text-purple-800 text-sm">Need Help Choosing?</p>
          </div>
          <p className="text-xs text-purple-600 mb-2">Our team can recommend the best agent for your case.</p>
          <button className="w-full py-1.5 bg-white border border-purple-300 text-purple-700 rounded text-xs font-medium hover:bg-purple-50">
            Get Free Recommendation
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Share Your Travel Details</h3>
        <p className="text-gray-600 text-sm">Help {selectedAgent?.name || 'the agent'} prepare your application</p>
      </div>

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
            {cities.slice(1).map(city => (
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          placeholder="Any specific requirements or questions..."
          rows={3}
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-3 border">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Shield className="w-4 h-4" />
          All information is secure and confidential. We only share with the selected agent.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Agent Will Connect Shortly</h3>
        <p className="text-gray-600 text-sm">Your details have been shared with {selectedAgent?.name || 'the agent'}</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="font-bold text-green-800 mb-1">Request Submitted Successfully!</h4>
        <p className="text-sm text-green-600">Expected response within 2 hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">What Happens Next?</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Agent Reviews Your Details</p>
                <p className="text-xs text-gray-500">They'll check your eligibility and requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">WhatsApp / Call Consultation</p>
                <p className="text-xs text-gray-500">Discuss your case and get personalized advice</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Document Collection Begins</p>
                <p className="text-xs text-gray-500">Agent guides you on what documents to prepare</p>
              </div>
            </div>
          </div>
        </div>

        {selectedAgent && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Selected Agent</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                {selectedAgent.logo}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{selectedAgent.name}</p>
                <p className="text-xs text-gray-500">{selectedAgent.location}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Connect on WhatsApp
              </button>
              <button className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Call Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Application Help</h3>
        <p className="text-gray-600 text-sm">Your agent will guide you through these steps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Services Included</h4>
          <div className="space-y-2">
            {['Document Review & Verification', 'Application Form Filling', 'Appointment Booking', 'Interview Preparation', 'Post-Submission Support'].map((service, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Processing Timeline</h4>
          <div className="space-y-3">
            {[
              { step: 'Document Collection', time: 'Day 1-3' },
              { step: 'Application Filing', time: 'Day 4-5' },
              { step: 'Appointment Booking', time: 'Day 6-10' },
              { step: 'Embassy Processing', time: 'Day 11-20' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.step}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800 flex items-start gap-2">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Your agent is currently reviewing your documents. You'll receive updates via WhatsApp.</span>
        </p>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Track Your Application</h3>
        <p className="text-gray-600 text-sm">We'll keep you updated every step of the way</p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold mb-1">You're All Set!</h4>
        <p className="text-sm opacity-90 mb-4">Your agent is handling your visa application</p>
        <div className="bg-white/10 rounded-lg p-3 inline-block">
          <p className="text-xs opacity-80">Estimated Processing Time</p>
          <p className="text-lg font-bold">{pricing?.express?.processing_days || '3-4'} Business Days</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center">
        {['Compare\nAgents', 'Share\nDetails', 'Connect', 'Get Help', 'Track &\nReceive'].map((step, idx) => (
          <div key={idx} className="relative">
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
              idx <= 4 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {idx <= 4 ? <Check className="w-5 h-5" /> : idx + 1}
            </div>
            <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{step}</p>
            {idx < 4 && (
              <div className="absolute top-5 left-1/2 w-full h-0.5 bg-green-300" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">Stay Updated</h4>
        <p className="text-sm text-green-600 mb-3">You'll receive real-time updates on WhatsApp and Email</p>
        <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
          Track Application Status
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-4xl w-full max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <div>
                <h2 className="font-bold">{country?.country_name} - Find Agents</h2>
                <p className="text-[10px] text-white/80">Compare Verified Visa Agents</p>
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
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pricing?.express?.processing_days || '3-4'} Days</span>
            <span>₹6,000 - ₹12,000</span>
            <span className="flex items-center gap-1"><Building className="w-3 h-3" /> VFS Global</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= step.num ? 'bg-white text-orange-600' : 'bg-white/30 text-white'
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

        {/* Verified Banner */}
        <div className="bg-green-50 border-b border-green-200 px-3 py-1.5 flex items-center justify-center gap-2">
          <Shield className="w-3 h-3 text-green-600" />
          <span className="text-xs text-green-700">All agents are verified and performance-monitored</span>
        </div>

        {/* Content */}
        <div className={`p-4 overflow-y-auto ${isFullscreen ? 'max-h-[calc(100vh-200px)]' : 'max-h-[calc(90vh-240px)]'}`}>
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
              onClick={() => {
                if (currentStep === 1 && !selectedAgent) {
                  alert('Please select an agent to continue');
                  return;
                }
                setCurrentStep(prev => Math.min(totalSteps, prev + 1));
              }}
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
            >
              {currentStep === 1 ? 'Select' : 'Next'} <ChevronRight className="w-4 h-4" />
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

export default AgentFinderWizard;
