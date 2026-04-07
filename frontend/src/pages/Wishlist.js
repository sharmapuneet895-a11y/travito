import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, MapPin, Calendar, Cloud, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import CountryDetailModal from '../components/CountryDetailModal';
import BackToTop from '../components/BackToTop';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: 'linear-gradient(to bottom, #bae6fd 0%, #e0f7fa 10%, #f0f9ff 25%, #f8fafc 40%, #ffffff 60%)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-12 h-12 text-red-500" />
              <h1 className="text-4xl md:text-5xl font-semibold text-primary section-title" data-testid="wishlist-page-title">
                My Travel Wishlist
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your dream destinations saved in one place. Click on any country to view detailed information.
            </p>
          </div>

          {/* Stats & Actions */}
          {wishlist.length > 0 && (
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-border flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{wishlist.length}</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>Your travel bucket list</span>
                </div>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                data-testid="clear-wishlist-btn"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}

          {/* Wishlist Grid */}
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {wishlist.map((country, index) => (
                  <motion.div
                    key={country.country_code}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => setSelectedCountry(country)}
                    data-testid={`wishlist-card-${country.country_code}`}
                  >
                    {/* Flag Header */}
                    <div className="relative h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <img
                        src={`https://flagcdn.com/w160/${country.country_code?.toLowerCase().slice(0, 2) || 'un'}.png`}
                        alt={country.country_name}
                        className="w-24 h-16 object-cover rounded shadow-lg group-hover:scale-110 transition-transform"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(country.country_code);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-red-500 hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                        data-testid={`remove-${country.country_code}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-primary mb-2">{country.country_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>Added {formatDate(country.addedAt)}</span>
                      </div>
                      
                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-2">
                        {country.season_type && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            country.season_type === 'peak' ? 'bg-red-100 text-red-700' :
                            country.season_type === 'shoulder' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {country.season_type} season
                          </span>
                        )}
                        {country.weather_type && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                            {country.weather_type}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <span className="text-sm text-primary font-medium group-hover:underline">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-red-300" />
              </div>
              <h3 className="text-2xl font-semibold text-primary mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start exploring countries and click the heart icon to add them to your travel wishlist!
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Explore Countries
              </a>
            </div>
          )}
        </motion.div>
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <CountryDetailModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-primary mb-2">Clear Wishlist?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to remove all {wishlist.length} countries from your wishlist? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearWishlist();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BackToTop />
    </div>
  );
};

export default Wishlist;
