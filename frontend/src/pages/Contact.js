import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to a backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquare className="w-12 h-12" style={{ color: '#FF7A00' }} />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: '#0B3C5D' }}>
                Contact Us
              </h1>
            </div>
            <p className="text-lg" style={{ color: '#64748B' }}>
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid rgba(11, 60, 93, 0.1)' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#0B3C5D' }}>Get in Touch</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                      <Mail className="w-6 h-6" style={{ color: '#FF7A00' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#64748B' }}>Email</p>
                      <p className="font-medium" style={{ color: '#0B3C5D' }}>hello@travito.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                      <Phone className="w-6 h-6" style={{ color: '#FF7A00' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#64748B' }}>Phone</p>
                      <p className="font-medium" style={{ color: '#0B3C5D' }}>+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                      <MapPin className="w-6 h-6" style={{ color: '#FF7A00' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#64748B' }}>Location</p>
                      <p className="font-medium" style={{ color: '#0B3C5D' }}>Mumbai, India</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Need Help Planning?</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Our travel experts are here to help you plan the perfect trip.
                </p>
                <button className="bg-white text-orange-500 px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all">
                  Schedule a Call
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid rgba(11, 60, 93, 0.1)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#0B3C5D' }}>Send us a Message</h3>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-green-600 mb-2">Message Sent!</h4>
                  <p className="text-gray-500">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#0B3C5D' }}>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                      style={{ border: '1px solid rgba(11, 60, 93, 0.2)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#0B3C5D' }}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                      style={{ border: '1px solid rgba(11, 60, 93, 0.2)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#0B3C5D' }}>Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                      style={{ border: '1px solid rgba(11, 60, 93, 0.2)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#0B3C5D' }}>Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 resize-none"
                      style={{ border: '1px solid rgba(11, 60, 93, 0.2)' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#FF7A00' }}
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
