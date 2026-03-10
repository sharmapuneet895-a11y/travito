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
    } else if (mode === 'festivals') {
      // Color based on number of festivals
      switch (countryData.festival_type) {
        case 'many':
          return '#E25A53'; // Red - 3+ festivals
        case 'some':
          return '#F2A900'; // Orange - 2 festivals
        case 'few':
          return '#4B89AC'; // Blue - 1 festival
        default:
          return '#E8E8E6';
      }
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
      } else if (mode === 'festivals') {
        info = `${countryData.country_name} - ${countryData.festival_count} festival${countryData.festival_count !== 1 ? 's' : ''}`;
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
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 160,
          center: [0, 0]
        }}
        style={{ width: '100%', height: 'auto' }}
        width={980}
        height={520}
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
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#FFFFFF" floodOpacity="0.9"/>
          </filter>
          
          {/* Background glow for better text visibility */}
          <filter id="textGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feFlood floodColor="#A8D8F0" result="flood"/>
            <feComposite in="flood" in2="SourceGraphic" operator="in" result="mask"/>
            <feGaussianBlur in="mask" stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ocean background with enhanced blue color */}
        <rect x="-50" y="-50" width="1100" height="650" fill="#A8D8F0" />
        <rect x="-50" y="-50" width="1100" height="650" fill="url(#waves)" opacity="0.9" />
        
        {/* Ocean Labels - Positioned in clear ocean areas */}
        {/* North Atlantic - between North America and Europe */}
        <text 
          x="340" 
          y="145" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="2"
          textAnchor="middle"
        >
          NORTH
        </text>
        <text 
          x="340" 
          y="160" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="2"
          textAnchor="middle"
        >
          ATLANTIC
        </text>
        
        {/* South Atlantic - between South America and Africa */}
        <text 
          x="400" 
          y="345" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="2"
          textAnchor="middle"
        >
          SOUTH
        </text>
        <text 
          x="400" 
          y="360" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="2"
          textAnchor="middle"
        >
          ATLANTIC
        </text>
        
        {/* North Pacific - left of North America */}
        <text 
          x="100" 
          y="175" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="2"
          textAnchor="middle"
        >
          NORTH
        </text>
        <text 
          x="100" 
          y="190" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="2"
          textAnchor="middle"
        >
          PACIFIC
        </text>
        
        {/* South Pacific - bottom left */}
        <text 
          x="100" 
          y="380" 
          fill="#1565A0" 
          fontSize="14" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="3"
          textAnchor="middle"
        >
          SOUTH PACIFIC
        </text>
        
        {/* Indian Ocean - between Africa and Australia */}
        <text 
          x="680" 
          y="310" 
          fill="#1565A0" 
          fontSize="14" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="3"
          textAnchor="middle"
        >
          INDIAN OCEAN
        </text>
        
        {/* Southern Ocean - at the bottom */}
        <text 
          x="490" 
          y="485" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.9" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="3"
          textAnchor="middle"
        >
          SOUTHERN OCEAN
        </text>
        
        {/* West Pacific - between Asia and Australia */}
        <text 
          x="860" 
          y="240" 
          fill="#1565A0" 
          fontSize="12" 
          fontWeight="bold" 
          opacity="0.95" 
          fontStyle="italic"
          filter="url(#textGlow)"
          letterSpacing="2"
          textAnchor="middle"
        >
          WEST PACIFIC
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