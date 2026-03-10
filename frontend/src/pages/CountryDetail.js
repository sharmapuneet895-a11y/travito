import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, FileText, Smartphone, ArrowLeft, MapPin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CountryDetail = () => {
  const { countryCode } = useParams();
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/country/${countryCode}`);
        setCountryData(response.data);
      } catch (error) {
        console.error('Error fetching country data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (countryCode) {
      fetchCountryData();
    }
  }, [countryCode]);

  const getSeasonColor = (type) => {
    switch (type) {
      case 'peak': return '#E25A53';
      case 'shoulder': return '#4B89AC';
      case 'off': return '#F2A900';
      default: return '#D6D6D6';
    }
  };

  const getVisaColor = (type) => {
    switch (type) {
      case 'visa_on_arrival': return '#E25A53';
      case 'e_visa': return '#4B89AC';
      case 'visa_required': return '#F2A900';
      default: return '#D6D6D6';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      transport: '#E25A53',
      convenience: '#4B89AC',
      food: '#F2A900',
      sightseeing: '#2A9D8F'
    };
    return colors[category] || '#2C3E50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-country">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading country information...</p>
        </div>
      </div>
    );
  }

  if (!countryData || (!countryData.season && !countryData.visa)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-primary mb-2">Country Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find information for this country.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { season, visa, apps } = countryData;
  const countryName = season?.country_name || visa?.country_name || 'Country';

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
            data-testid="back-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold text-primary mb-4 section-title" data-testid="country-title">
              {countryName}
            </h1>
            <p className="text-lg text-muted-foreground">Complete travel information for Indian travelers</p>
          </div>

          {/* Season Information */}
          {season && (
            <div className="bg-white rounded-2xl p-8 shadow-md mb-8" data-testid="season-section">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${getSeasonColor(season.season_type)}20` }}
                >
                  <Calendar className="w-6 h-6" style={{ color: getSeasonColor(season.season_type) }} />
                </div>
                <h2 className="text-2xl font-semibold text-primary">Best Time to Visit</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getSeasonColor(season.season_type) }}
                    ></div>
                    <span className="text-lg font-medium text-foreground capitalize">
                      {season.season_type} Season
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {season.season_type === 'peak' && 'High tourist activity, best weather but higher prices'}
                    {season.season_type === 'shoulder' && 'Moderate crowds, good weather, better deals'}
                    {season.season_type === 'off' && 'Low crowds, excellent prices, weather may vary'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">BEST MONTHS TO VISIT</h3>
                  <div className="flex flex-wrap gap-2">
                    {season.best_months.map((month) => (
                      <span
                        key={month}
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${getSeasonColor(season.season_type)}20`,
                          color: getSeasonColor(season.season_type)
                        }}
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visa Information */}
          {visa && (
            <div className="bg-white rounded-2xl p-8 shadow-md mb-8" data-testid="visa-section">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${getVisaColor(visa.visa_type)}20` }}
                >
                  <FileText className="w-6 h-6" style={{ color: getVisaColor(visa.visa_type) }} />
                </div>
                <h2 className="text-2xl font-semibold text-primary">Visa Requirements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getVisaColor(visa.visa_type) }}
                    ></div>
                    <span className="text-lg font-medium text-foreground capitalize">
                      {visa.visa_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {visa.visa_type === 'visa_on_arrival' && 'Get your visa upon arrival at the airport'}
                    {visa.visa_type === 'e_visa' && 'Apply online before your trip'}
                    {visa.visa_type === 'visa_required' && 'Apply at embassy or consulate'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">REQUIREMENTS</h3>
                  <p className="text-foreground">{visa.requirements}</p>
                </div>
              </div>
            </div>
          )}

          {/* Apps Section */}
          {apps && apps.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-md" data-testid="apps-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-primary">Essential Travel Apps</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apps.map((app, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-xl p-4 hover:shadow-md transition-all"
                    data-testid={`app-item-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${getCategoryColor(app.category)}20` }}
                      >
                        <Smartphone className="w-5 h-5" style={{ color: getCategoryColor(app.category) }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-foreground">{app.app_name}</h4>
                          <span
                            className="text-xs px-2 py-1 rounded-full capitalize"
                            style={{
                              backgroundColor: `${getCategoryColor(app.category)}20`,
                              color: getCategoryColor(app.category)
                            }}
                          >
                            {app.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{app.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CountryDetail;