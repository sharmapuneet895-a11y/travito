import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText, DollarSign, Smartphone, ArrowRight } from 'lucide-react';

const Home = () => {
  const features = [
    {
      title: 'Best Seasons to Travel',
      description: 'Discover the perfect time to visit your dream destination with our color-coded world map.',
      icon: Calendar,
      link: '/seasons',
      color: '#E25A53'
    },
    {
      title: 'Visa Information',
      description: 'Get instant visa requirements for Indian travelers - E-visa, Visa on Arrival, or Standard Visa.',
      icon: FileText,
      link: '/visa',
      color: '#4B89AC'
    },
    {
      title: 'Live Forex Rates',
      description: 'Real-time currency exchange rates for INR to help you plan your travel budget.',
      icon: DollarSign,
      link: '/forex',
      color: '#F2A900'
    },
    {
      title: 'Top Travel Apps',
      description: 'Essential apps for transport, food, convenience, and sightseeing in every country.',
      icon: Smartphone,
      link: '/apps',
      color: '#2A9D8F'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-section flex items-center justify-center px-6 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-none" data-testid="hero-title">
              Your Digital Compass for
              <br />
              <span className="text-accent">Global Travel</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed" data-testid="hero-description">
              Everything Indian travelers need to know - from the best seasons to visit, visa requirements,
              live exchange rates, to the most useful apps in every destination.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/seasons"
                className="bg-primary text-white px-8 py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
                data-testid="explore-button"
              >
                Explore Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/visa"
                className="border-2 border-primary text-primary px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/10 transition-all duration-300 active:scale-95"
                data-testid="visa-info-button"
              >
                Check Visa Info
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-primary mb-4" data-testid="features-title">
            Plan Smarter, Travel Better
          </h2>
          <p className="text-lg text-muted-foreground">All your travel essentials in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={feature.link}
                  className="block bg-white rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                  data-testid={`feature-card-${index}`}
                >
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-medium text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;