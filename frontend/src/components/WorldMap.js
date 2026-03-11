import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { motion } from 'framer-motion';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Mapping from numeric IDs to ISO3 codes (world-atlas uses numeric IDs)
// Comprehensive mapping for better country matching
const numericToISO3 = {
  // North America
  "840": "USA", "124": "CAN", "484": "MEX", "192": "CUB", "388": "JAM", 
  "332": "HTI", "214": "DOM", "630": "PRI", "44": "BHS", "52": "BRB",
  "780": "TTO", "308": "GRD", "662": "LCA", "670": "VCT", "28": "ATG",
  // Europe
  "826": "GBR", "250": "FRA", "276": "DEU", "380": "ITA", "724": "ESP",
  "620": "PRT", "528": "NLD", "56": "BEL", "756": "CHE", "40": "AUT",
  "752": "SWE", "578": "NOR", "208": "DNK", "246": "FIN", "372": "IRL",
  "300": "GRC", "616": "POL", "203": "CZE", "348": "HUN", "642": "ROU",
  "100": "BGR", "191": "HRV", "705": "SVN", "703": "SVK", "804": "UKR",
  "112": "BLR", "440": "LTU", "428": "LVA", "233": "EST", "498": "MDA",
  "8": "ALB", "807": "MKD", "688": "SRB", "499": "MNE", "70": "BIH",
  "643": "RUS", // Russia - important!
  // Asia
  "392": "JPN", "156": "CHN", "356": "IND", "586": "PAK", "50": "BGD",
  "764": "THA", "704": "VNM", "360": "IDN", "458": "MYS", "608": "PHL",
  "702": "SGP", "104": "MMR", "116": "KHM", "418": "LAO", "524": "NPL",
  "144": "LKA", "410": "KOR", "408": "PRK", "496": "MNG", "398": "KAZ",
  "860": "UZB", "795": "TKM", "762": "TJK", "417": "KGZ", "4": "AFG",
  "792": "TUR", "364": "IRN", "368": "IRQ", "760": "SYR", "400": "JOR",
  "422": "LBN", "376": "ISR", "275": "PSE", "682": "SAU", "784": "ARE",
  "634": "QAT", "48": "BHR", "512": "OMN", "414": "KWT", "887": "YEM",
  "268": "GEO", "51": "ARM", "31": "AZE",
  // Africa
  "818": "EGY", "434": "LBY", "788": "TUN", "12": "DZA", "504": "MAR",
  "732": "ESH", "478": "MRT", "466": "MLI", "562": "NER", "148": "TCD",
  "736": "SDN", "728": "SSD", "232": "ERI", "262": "DJI", "706": "SOM",
  "231": "ETH", "404": "KEN", "800": "UGA", "834": "TZA", "646": "RWA",
  "108": "BDI", "180": "COD", "178": "COG", "140": "CAF", "120": "CMR",
  "566": "NGA", "288": "GHA", "384": "CIV", "854": "BFA", "686": "SEN",
  "270": "GMB", "324": "GIN", "624": "GNB", "694": "SLE", "430": "LBR",
  "768": "TGO", "204": "BEN", "710": "ZAF", "516": "NAM", "72": "BWA",
  "716": "ZWE", "894": "ZMB", "454": "MWI", "508": "MOZ", "24": "AGO",
  "266": "GAB", "226": "GNQ", "678": "STP", "174": "COM", "480": "MUS",
  "450": "MDG", "748": "SWZ", "426": "LSO",
  // South America
  "76": "BRA", "32": "ARG", "152": "CHL", "604": "PER", "170": "COL",
  "862": "VEN", "218": "ECU", "68": "BOL", "600": "PRY", "858": "URY",
  "328": "GUY", "740": "SUR", "254": "GUF",
  // Oceania
  "36": "AUS", "554": "NZL", "598": "PNG", "242": "FJI", "90": "SLB",
  "548": "VUT", "520": "NRU", "583": "FSM", "584": "MHL", "585": "PLW",
  "776": "TON", "882": "WSM", "296": "KIR", "798": "TUV"
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
        case 'visa_free':
          return '#22C55E'; // Green - Visa Free
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
        
        {/* Render countries first */}
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
        
        {/* ===== OCEAN LABELS - Rendered AFTER countries so they appear on top ===== */}
        
        {/* Arctic Ocean - top center */}
        <text x="550" y="32" fill="#0D47A1" fontSize="14" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="4" textAnchor="middle">
          ARCTIC OCEAN
        </text>
        
        {/* North Atlantic Ocean - clearly in the ocean between Americas and Europe */}
        <text x="360" y="185" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          NORTH ATLANTIC
        </text>
        <text x="360" y="200" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          OCEAN
        </text>
        
        {/* South Atlantic Ocean - between S.America and Africa */}
        <text x="390" y="395" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          SOUTH ATLANTIC
        </text>
        <text x="390" y="410" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          OCEAN
        </text>
        
        {/* North Pacific Ocean - west of Americas */}
        <text x="95" y="200" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          NORTH PACIFIC
        </text>
        <text x="95" y="215" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          OCEAN
        </text>
        
        {/* South Pacific Ocean - bottom left */}
        <text x="140" y="430" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          SOUTH PACIFIC
        </text>
        <text x="140" y="445" fill="#0D47A1" fontSize="11" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          OCEAN
        </text>
        
        {/* Indian Ocean - between Africa and Australia */}
        <text x="720" y="365" fill="#0D47A1" fontSize="13" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="2" textAnchor="middle">
          INDIAN OCEAN
        </text>
        
        {/* West Pacific Ocean - east of Asia */}
        <text x="960" y="295" fill="#0D47A1" fontSize="10" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          WEST PACIFIC
        </text>
        <text x="960" y="308" fill="#0D47A1" fontSize="10" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          OCEAN
        </text>
        
        {/* Southern Ocean - at bottom */}
        <text x="550" y="575" fill="#0D47A1" fontSize="13" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="3" textAnchor="middle">
          SOUTHERN OCEAN
        </text>
        
        {/* ===== SEA LABELS - Also on top of countries ===== */}
        
        {/* Bering Sea */}
        <text x="50" y="92" fill="#1565C0" fontSize="9" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          Bering Sea
        </text>
        
        {/* Gulf of Mexico */}
        <text x="238" y="228" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Gulf of Mexico
        </text>
        
        {/* Caribbean Sea */}
        <text x="275" y="265" fill="#1565C0" fontSize="9" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="1" textAnchor="middle">
          Caribbean Sea
        </text>
        
        {/* Mediterranean Sea */}
        <text x="535" y="178" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Mediterranean Sea
        </text>
        
        {/* Black Sea */}
        <text x="595" y="158" fill="#1565C0" fontSize="7" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.3" textAnchor="middle">
          Black Sea
        </text>
        
        {/* Red Sea */}
        <text x="605" y="245" fill="#1565C0" fontSize="7" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.3" textAnchor="middle">
          Red Sea
        </text>
        
        {/* Arabian Sea */}
        <text x="665" y="255" fill="#1565C0" fontSize="9" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Arabian Sea
        </text>
        
        {/* Bay of Bengal */}
        <text x="745" y="255" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Bay of Bengal
        </text>
        
        {/* South China Sea */}
        <text x="830" y="265" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          South China Sea
        </text>
        
        {/* Sea of Japan */}
        <text x="885" y="165" fill="#1565C0" fontSize="7" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.3" textAnchor="middle">
          Sea of Japan
        </text>
        
        {/* Coral Sea */}
        <text x="965" y="385" fill="#1565C0" fontSize="8" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.5" textAnchor="middle">
          Coral Sea
        </text>
        
        {/* Tasman Sea */}
        <text x="1010" y="435" fill="#1565C0" fontSize="7" fontWeight="bold" opacity="1" fontStyle="italic" filter="url(#textGlow)" letterSpacing="0.3" textAnchor="middle">
          Tasman Sea
        </text>
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