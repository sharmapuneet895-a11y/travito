import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { motion } from 'framer-motion';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Mapping from numeric IDs to ISO3 codes (world-atlas uses numeric IDs)
const numericToISO3 = {
  "840": "USA", "124": "CAN", "826": "GBR", "250": "FRA", "276": "DEU",
  "380": "ITA", "724": "ESP", "36": "AUS", "392": "JPN", "156": "CHN",
  "356": "IND", "76": "BRA", "643": "RUS", "484": "MEX", "764": "THA",
  "702": "SGP", "784": "ARE", "818": "EGY", "710": "ZAF", "32": "ARG",
  "554": "NZL", "410": "KOR", "528": "NLD", "752": "SWE", "578": "NOR",
  "756": "CHE", "792": "TUR", "300": "GRC", "620": "PRT", "360": "IDN",
  "458": "MYS", "608": "PHL", "704": "VNM", "616": "POL", "40": "AUT",
  "246": "FIN", "208": "DNK", "372": "IRL", "203": "CZE", "376": "ISR",
  "682": "SAU", "348": "HUN", "152": "CHL", "170": "COL", "604": "PER",
  "586": "PAK", "50": "BGD", "404": "KEN", "566": "NGA", "504": "MAR",
  "458": "MYS", "524": "NPL", "144": "LKA", "104": "MMR", "116": "KHM",
  "418": "LAO", "100": "BGR", "642": "ROU", "804": "UKR", "112": "BLR",
  "268": "GEO", "51": "ARM", "31": "AZE", "398": "KAZ", "860": "UZB",
  "12": "DZA", "788": "TUN", "434": "LBY", "818": "EGY", "736": "SDN",
  "288": "GHA", "384": "CIV", "686": "SEN", "180": "COD", "800": "UGA",
  "834": "TZA", "508": "MOZ", "24": "AGO", "894": "ZMB", "716": "ZWE",
  "72": "BWA", "516": "NAM", "480": "MUS", "450": "MDG"
};

const WorldMap = ({ data, mode, onCountryClick }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getColorByMode = (geo) => {
    // Get all possible identifiers
    const numericId = String(geo.id);
    const iso3FromNumeric = numericToISO3[numericId];
    const isoCode = geo.properties?.ISO_A3 || geo.properties?.ADM0_A3;
    const countryName = geo.properties?.name || geo.properties?.NAME;
    
    // Find country data by various matching strategies
    const countryData = data.find(d => {
      // Match by ISO3 code from numeric mapping
      if (iso3FromNumeric && d.country_code === iso3FromNumeric) return true;
      // Match by direct ISO code
      if (d.country_code === isoCode) return true;
      // Match by property codes
      if (d.country_code === geo.properties?.ISO_A3) return true;
      if (d.country_code === geo.properties?.ADM0_A3) return true;
      // Match by country name
      if (d.country_name === countryName) return true;
      // Fuzzy name match
      if (countryName && d.country_name && 
          (d.country_name.toLowerCase().includes(countryName.toLowerCase()) ||
           countryName.toLowerCase().includes(d.country_name.toLowerCase()))) return true;
      return false;
    });

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
    // Get all possible identifiers
    const numericId = String(geo.id);
    const iso3FromNumeric = numericToISO3[numericId];
    const isoCode = geo.properties?.ISO_A3 || geo.properties?.ADM0_A3;
    const countryName = geo.properties?.name || geo.properties?.NAME;
    
    // Find country data by various matching strategies
    const countryData = data.find(d => {
      if (iso3FromNumeric && d.country_code === iso3FromNumeric) return true;
      if (d.country_code === isoCode) return true;
      if (d.country_code === geo.properties?.ISO_A3) return true;
      if (d.country_code === geo.properties?.ADM0_A3) return true;
      if (d.country_name === countryName) return true;
      if (countryName && d.country_name && 
          (d.country_name.toLowerCase().includes(countryName.toLowerCase()) ||
           countryName.toLowerCase().includes(d.country_name.toLowerCase()))) return true;
      return false;
    });

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
      setTooltipContent(countryName || geo.properties?.name || 'Unknown');
    }

    setTooltipPosition({ x: evt.clientX, y: evt.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent('');
  };

  return (
    <div className="relative w-full" data-testid="world-map-container">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 210,
          center: [10, 0]
        }}
        style={{ width: '100%', height: 'auto' }}
        width={1100}
        height={650}
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
        <rect x="-50" y="-50" width="1200" height="750" fill="#A8D8F0" />
        <rect x="-50" y="-50" width="1200" height="750" fill="url(#waves)" opacity="0.9" />
        
        {/* ===== OCEAN LABELS - Positioned in clear water areas ===== */}
        
        {/* Arctic Ocean - top center */}
        <text x="550" y="35" fill="#0D47A1" fontSize="13" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="3" textAnchor="middle">
          ARCTIC OCEAN
        </text>
        
        {/* North Atlantic Ocean - between Americas and Europe */}
        <text x="380" y="175" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          NORTH ATLANTIC
        </text>
        <text x="380" y="190" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          OCEAN
        </text>
        
        {/* South Atlantic Ocean - between S.America and Africa */}
        <text x="400" y="400" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          SOUTH ATLANTIC
        </text>
        <text x="400" y="415" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          OCEAN
        </text>
        
        {/* North Pacific Ocean - left of Americas */}
        <text x="100" y="195" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          NORTH PACIFIC
        </text>
        <text x="100" y="210" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          OCEAN
        </text>
        
        {/* South Pacific Ocean - bottom left */}
        <text x="110" y="440" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          SOUTH PACIFIC
        </text>
        <text x="110" y="455" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          OCEAN
        </text>
        
        {/* Indian Ocean - between Africa and Australia */}
        <text x="740" y="370" fill="#0D47A1" fontSize="13" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="3" textAnchor="middle">
          INDIAN OCEAN
        </text>
        
        {/* West Pacific Ocean - near Asia/Australia */}
        <text x="970" y="280" fill="#0D47A1" fontSize="10" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          WEST PACIFIC
        </text>
        <text x="970" y="293" fill="#0D47A1" fontSize="10" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          OCEAN
        </text>
        
        {/* Southern Ocean - bottom */}
        <text x="550" y="580" fill="#0D47A1" fontSize="12" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="3" textAnchor="middle">
          SOUTHERN OCEAN
        </text>
        
        {/* ===== SEA LABELS ===== */}
        
        {/* Mediterranean Sea */}
        <text x="560" y="188" fill="#1565C0" fontSize="9" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          Mediterranean Sea
        </text>
        
        {/* Caribbean Sea */}
        <text x="280" y="255" fill="#1565C0" fontSize="9" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          Caribbean Sea
        </text>
        
        {/* Gulf of Mexico */}
        <text x="245" y="220" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Gulf of Mexico
        </text>
        
        {/* Arabian Sea */}
        <text x="690" y="255" fill="#1565C0" fontSize="9" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          Arabian Sea
        </text>
        
        {/* Bay of Bengal */}
        <text x="765" y="250" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Bay of Bengal
        </text>
        
        {/* South China Sea */}
        <text x="850" y="255" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          South China Sea
        </text>
        
        {/* Coral Sea */}
        <text x="985" y="380" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Coral Sea
        </text>
        
        {/* Red Sea */}
        <text x="625" y="245" fill="#1565C0" fontSize="7" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.3" textAnchor="middle">
          Red Sea
        </text>
        
        {/* Sea of Japan */}
        <text x="900" y="170" fill="#1565C0" fontSize="7" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.3" textAnchor="middle">
          Sea of Japan
        </text>
        
        {/* Bering Sea */}
        <text x="55" y="95" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Bering Sea
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