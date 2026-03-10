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
          {/* Wavy water pattern */}
          <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M0 10 Q 25 5, 50 10 T 100 10"
              fill="none"
              stroke="#B8D4E8"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <path
              d="M0 15 Q 25 10, 50 15 T 100 15"
              fill="none"
              stroke="#B8D4E8"
              strokeWidth="0.5"
              opacity="0.2"
            />
          </pattern>
        </defs>
        
        {/* Ocean background with wavy pattern */}
        <rect x="-1000" y="-500" width="3000" height="1500" fill="#C6DFF5" />
        <rect x="-1000" y="-500" width="3000" height="1500" fill="url(#waves)" opacity="0.6" />
        
        {/* Ocean Labels */}
        <text x="350" y="50" fill="#2C5F8D" fontSize="14" fontWeight="600" opacity="0.7" fontStyle="italic">
          Arctic Ocean
        </text>
        <text x="-100" y="200" fill="#2C5F8D" fontSize="16" fontWeight="600" opacity="0.7" fontStyle="italic">
          Atlantic Ocean
        </text>
        <text x="450" y="200" fill="#2C5F8D" fontSize="16" fontWeight="600" opacity="0.7" fontStyle="italic">
          Pacific Ocean
        </text>
        <text x="650" y="220" fill="#2C5F8D" fontSize="16" fontWeight="600" opacity="0.7" fontStyle="italic">
          Indian Ocean
        </text>
        <text x="400" y="400" fill="#2C5F8D" fontSize="14" fontWeight="600" opacity="0.7" fontStyle="italic">
          Southern Ocean
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