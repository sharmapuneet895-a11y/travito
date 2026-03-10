import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { motion } from 'framer-motion';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const WorldMap = ({ data, mode, onCountryClick }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getColorByMode = (geo) => {
    // Try multiple ways to match country code
    const isoCode = geo.id || geo.properties?.ISO_A3 || geo.properties?.ADM0_A3;
    const countryName = geo.properties?.name || geo.properties?.NAME;
    
    // Find country data by code or name
    const countryData = data.find(d => 
      d.country_code === isoCode || 
      d.country_code === geo.properties?.ISO_A3 ||
      d.country_code === geo.properties?.ADM0_A3 ||
      d.country_name === countryName ||
      (isoCode === '840' && (d.country_code === 'USA' || d.country_code === 'US')) || // USA numeric code
      (isoCode === '-99' && d.country_name === 'United States')
    );

    if (!countryData) return '#E8E8E6'; // Light grey for no data

    if (mode === 'seasons') {
      switch (countryData.season_type) {
        case 'peak':
          return '#E25A53'; // Terra Cotta
        case 'shoulder':
          return '#4B89AC'; // Aegean Blue
        case 'off':
          return '#F2A900'; // Marigold
        default:
          return '#E8E8E6';
      }
    } else if (mode === 'visa') {
      switch (countryData.visa_type) {
        case 'visa_on_arrival':
          return '#E25A53'; // Terra Cotta (Red)
        case 'e_visa':
          return '#4B89AC'; // Aegean Blue
        case 'visa_required':
          return '#F2A900'; // Marigold (Orange)
        default:
          return '#E8E8E6';
      }
    } else if (mode === 'weather') {
      switch (countryData.weather_type) {
        case 'hot':
          return '#E25A53'; // Red
        case 'snow':
          return '#FFFFFF'; // White
        case 'sandy':
          return '#F2A900'; // Orange
        case 'rainy':
          return '#4B89AC'; // Blue
        default:
          return '#E8E8E6';
      }
    } else if (mode === 'plug') {
      // Different shades for different plug types
      const plugColors = {
        'A': '#E25A53',
        'B': '#F2A900',
        'C': '#4B89AC',
        'D': '#9B59B6',
        'E': '#2A9D8F',
        'F': '#E74C3C',
        'G': '#3498DB',
        'I': '#F39C12',
        'mixed': '#95A5A6'
      };
      return plugColors[countryData.plug_type] || '#E8E8E6';
    }

    return '#E8E8E6';
  };

  const handleMouseEnter = (geo, evt) => {
    // Try multiple ways to match country code
    const isoCode = geo.id || geo.properties?.ISO_A3 || geo.properties?.ADM0_A3;
    const countryName = geo.properties?.name || geo.properties?.NAME;
    
    const countryData = data.find(d => 
      d.country_code === isoCode || 
      d.country_code === geo.properties?.ISO_A3 ||
      d.country_code === geo.properties?.ADM0_A3 ||
      d.country_name === countryName ||
      (isoCode === '840' && (d.country_code === 'USA' || d.country_code === 'US'))
    );

    if (countryData) {
      let info = '';
      if (mode === 'seasons') {
        info = `${countryData.country_name} - ${countryData.season_type.toUpperCase()} (${countryData.best_months.join(', ')})`;
      } else if (mode === 'visa') {
        info = `${countryData.country_name} - ${countryData.visa_type.replace('_', ' ').toUpperCase()}`;
      } else if (mode === 'weather') {
        info = `${countryData.country_name} - ${countryData.weather_type.toUpperCase()} (${countryData.avg_temp})`;
      } else if (mode === 'plug') {
        info = `${countryData.country_name} - Type ${countryData.plug_type.toUpperCase()} (${countryData.voltage})`;
      }
      setTooltipContent(info);
    } else {
      setTooltipContent(countryName || geo.properties.name);
    }

    setTooltipPosition({ x: evt.clientX, y: evt.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent('');
  };

  return (
    <div className="relative" data-testid="world-map-container">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 147,
          center: [0, 20]
        }}
        style={{ width: '100%', height: 'auto' }}
      >
        <defs>
          {/* Enhanced wavy water pattern with animation */}
          <pattern id="waves" x="0" y="0" width="120" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M0 15 Q 30 8, 60 15 T 120 15"
              fill="none"
              stroke="#5BA3D0"
              strokeWidth="1.5"
              opacity="0.4"
            >
              <animate
                attributeName="d"
                values="M0 15 Q 30 8, 60 15 T 120 15;M0 15 Q 30 22, 60 15 T 120 15;M0 15 Q 30 8, 60 15 T 120 15"
                dur="8s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M0 20 Q 30 13, 60 20 T 120 20"
              fill="none"
              stroke="#7BB8DD"
              strokeWidth="1.2"
              opacity="0.3"
            >
              <animate
                attributeName="d"
                values="M0 20 Q 30 13, 60 20 T 120 20;M0 20 Q 30 27, 60 20 T 120 20;M0 20 Q 30 13, 60 20 T 120 20"
                dur="6s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M0 10 Q 30 5, 60 10 T 120 10"
              fill="none"
              stroke="#9DCCE8"
              strokeWidth="1"
              opacity="0.25"
            >
              <animate
                attributeName="d"
                values="M0 10 Q 30 5, 60 10 T 120 10;M0 10 Q 30 15, 60 10 T 120 10;M0 10 Q 30 5, 60 10 T 120 10"
                dur="10s"
                repeatCount="indefinite"
              />
            </path>
          </pattern>
          
          {/* Text shadow filter for ocean labels */}
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#FFFFFF" floodOpacity="0.8"/>
          </filter>
        </defs>
        
        {/* Ocean background with enhanced blue color */}
        <rect x="-1000" y="-500" width="3000" height="1500" fill="#A8D8F0" />
        <rect x="-1000" y="-500" width="3000" height="1500" fill="url(#waves)" opacity="0.9" />
        
        {/* Enhanced Ocean Labels - Much Larger and More Prominent */}
        <text 
          x="350" 
          y="40" 
          fill="#1A5276" 
          fontSize="22" 
          fontWeight="bold" 
          opacity="0.85" 
          fontStyle="italic"
          filter="url(#textShadow)"
          letterSpacing="1"
        >
          ARCTIC OCEAN
        </text>
        
        <text 
          x="-100" 
          y="200" 
          fill="#1A5276" 
          fontSize="26" 
          fontWeight="bold" 
          opacity="0.85" 
          fontStyle="italic"
          filter="url(#textShadow)"
          letterSpacing="1.5"
        >
          ATLANTIC OCEAN
        </text>
        
        <text 
          x="500" 
          y="200" 
          fill="#1A5276" 
          fontSize="26" 
          fontWeight="bold" 
          opacity="0.85" 
          fontStyle="italic"
          filter="url(#textShadow)"
          letterSpacing="1.5"
        >
          PACIFIC OCEAN
        </text>
        
        <text 
          x="700" 
          y="220" 
          fill="#1A5276" 
          fontSize="24" 
          fontWeight="bold" 
          opacity="0.85" 
          fontStyle="italic"
          filter="url(#textShadow)"
          letterSpacing="1.2"
        >
          INDIAN OCEAN
        </text>
        
        <text 
          x="400" 
          y="410" 
          fill="#1A5276" 
          fontSize="20" 
          fontWeight="bold" 
          opacity="0.85" 
          fontStyle="italic"
          filter="url(#textShadow)"
          letterSpacing="1"
        >
          SOUTHERN OCEAN
        </text>
        
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fillColor = getColorByMode(geo);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: fillColor === '#E8E8E6' ? '#D0D0CE' : `${fillColor}DD`,
                      outline: 'none',
                      cursor: 'pointer'
                    },
                    pressed: { outline: 'none' }
                  }}
                  onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                  onMouseMove={(evt) => setTooltipPosition({ x: evt.clientX, y: evt.clientY })}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onCountryClick && onCountryClick(geo)}
                  data-testid={`country-${geo.id}`}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltipContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="map-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            pointerEvents: 'none'
          }}
          data-testid="map-tooltip"
        >
          {tooltipContent}
        </motion.div>
      )}
    </div>
  );
};

export default WorldMap;