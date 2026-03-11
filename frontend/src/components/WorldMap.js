import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';

// Using Natural Earth map data - standard international boundaries
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Mapping from numeric IDs to ISO3 codes
const numericToISO3 = {
  "840": "USA", "124": "CAN", "484": "MEX", "192": "CUB", "388": "JAM", 
  "332": "HTI", "214": "DOM", "630": "PRI", "44": "BHS", "52": "BRB",
  "780": "TTO", "308": "GRD", "662": "LCA", "670": "VCT", "28": "ATG",
  "826": "GBR", "250": "FRA", "276": "DEU", "380": "ITA", "724": "ESP",
  "620": "PRT", "528": "NLD", "56": "BEL", "756": "CHE", "40": "AUT",
  "752": "SWE", "578": "NOR", "208": "DNK", "246": "FIN", "372": "IRL",
  "300": "GRC", "616": "POL", "203": "CZE", "348": "HUN", "642": "ROU",
  "100": "BGR", "191": "HRV", "705": "SVN", "703": "SVK", "804": "UKR",
  "112": "BLR", "440": "LTU", "428": "LVA", "233": "EST", "498": "MDA",
  "8": "ALB", "807": "MKD", "688": "SRB", "499": "MNE", "70": "BIH",
  "643": "RUS", "304": "GRL",
  "392": "JPN", "156": "CHN", "356": "IND", "586": "PAK", "50": "BGD",
  "764": "THA", "704": "VNM", "360": "IDN", "458": "MYS", "608": "PHL",
  "702": "SGP", "104": "MMR", "116": "KHM", "418": "LAO", "524": "NPL",
  "144": "LKA", "410": "KOR", "408": "PRK", "496": "MNG", "398": "KAZ",
  "860": "UZB", "795": "TKM", "762": "TJK", "417": "KGZ", "4": "AFG",
  "792": "TUR", "364": "IRN", "368": "IRQ", "760": "SYR", "400": "JOR",
  "422": "LBN", "376": "ISR", "275": "PSE", "682": "SAU", "784": "ARE",
  "634": "QAT", "48": "BHR", "512": "OMN", "414": "KWT", "887": "YEM",
  "268": "GEO", "51": "ARM", "31": "AZE",
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
  "76": "BRA", "32": "ARG", "152": "CHL", "604": "PER", "170": "COL",
  "862": "VEN", "218": "ECU", "68": "BOL", "600": "PRY", "858": "URY",
  "328": "GUY", "740": "SUR", "254": "GUF",
  "36": "AUS", "554": "NZL", "598": "PNG", "242": "FJI", "90": "SLB",
  "548": "VUT", "520": "NRU", "583": "FSM", "584": "MHL", "585": "PLW",
  "776": "TON", "882": "WSM", "296": "KIR", "798": "TUV"
};

// Ocean labels - positioned in open ocean areas
const OCEAN_LABELS = [
  { name: 'North Pacific Ocean', coords: [-150, 25], size: 10 },
  { name: 'South Pacific Ocean', coords: [-120, -30], size: 10 },
  { name: 'North Atlantic Ocean', coords: [-40, 28], size: 9 },
  { name: 'South Atlantic Ocean', coords: [-10, -28], size: 9 },
  { name: 'Indian Ocean', coords: [75, -20], size: 10 },
  { name: 'Southern Ocean', coords: [0, -58], size: 8 },
  { name: 'Arctic Ocean', coords: [-60, 72], size: 8 },
];

// Sea labels - positioned clearly in the water
const SEA_LABELS = [
  { name: 'Caribbean Sea', coords: [-74, 16], size: 6 },
  { name: 'Gulf of Mexico', coords: [-93, 26], size: 6 },
  { name: 'Mediterranean', coords: [18, 37], size: 6 },
  { name: 'Arabian Sea', coords: [63, 14], size: 6 },
  { name: 'Bay of Bengal', coords: [90, 14], size: 6 },
  { name: 'South China Sea', coords: [116, 12], size: 6 },
  { name: 'Coral Sea', coords: [155, -18], size: 6 },
  { name: 'Tasman Sea', coords: [162, -38], size: 6 },
];

const WorldMap = ({ data, mode, onCountryClick }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 15]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const handleReset = () => { setZoom(1); setCenter([0, 15]); };

  const getColorByMode = (geo) => {
    const numericId = String(geo.id);
    const iso3FromNumeric = numericToISO3[numericId];
    const countryData = data?.find(d => 
      d.country_code === iso3FromNumeric || 
      d.country_code === numericId ||
      d.country_name === geo.properties?.name
    );

    if (!countryData) return '#D4D4D4';

    if (mode === 'seasons') {
      switch (countryData.season_type || countryData.current_season) {
        case 'peak': return '#DC2626';
        case 'shoulder': return '#2563EB';
        case 'off': return '#F59E0B';
        default: return '#D4D4D4';
      }
    } else if (mode === 'visa') {
      switch (countryData.visa_type) {
        case 'visa_free': return '#16A34A';
        case 'visa_on_arrival': return '#DC2626';
        case 'e_visa': return '#2563EB';
        case 'visa_required': return '#F59E0B';
        default: return '#D4D4D4';
      }
    } else if (mode === 'weather') {
      switch (countryData.weather_type) {
        case 'hot': return '#DC2626';
        case 'warm': return '#F59E0B';
        case 'mild': return '#2563EB';
        case 'cold': return '#67B7D1';
        case 'snow': return '#F3F4F6';
        default: return '#D4D4D4';
      }
    } else if (mode === 'plug') {
      const plugColors = {
        'a': '#DC2626', 'b': '#2563EB', 'c': '#F59E0B', 'd': '#16A34A',
        'e': '#9333EA', 'f': '#EC4899', 'g': '#F97316', 'mixed': '#6B7280'
      };
      return plugColors[countryData.plug_type?.toLowerCase()] || '#D4D4D4';
    } else if (mode === 'festivals') {
      switch (countryData.festival_type) {
        case 'many': return '#DC2626';
        case 'some': return '#F59E0B';
        case 'few': return '#2563EB';
        default: return '#D4D4D4';
      }
    } else if (mode === 'safety') {
      switch (countryData.safety_level) {
        case 'very_safe': return '#16A34A';
        case 'safe': return '#22C55E';
        case 'moderate': return '#EAB308';
        case 'caution': return '#F97316';
        case 'high_risk': return '#DC2626';
        default: return '#D4D4D4';
      }
    }
    return '#D4D4D4';
  };

  const handleMouseEnter = (geo, evt) => {
    const numericId = String(geo.id);
    const iso3FromNumeric = numericToISO3[numericId];
    const countryData = data?.find(d => 
      d.country_code === iso3FromNumeric || 
      d.country_code === numericId ||
      d.country_name === geo.properties?.name
    );

    if (countryData) {
      let info = countryData.country_name || geo.properties?.name;
      if (mode === 'seasons' && countryData.best_months) {
        info += ` - Best: ${countryData.best_months.join(', ')}`;
      } else if (mode === 'visa') {
        info += ` - ${countryData.visa_type?.replace(/_/g, ' ').toUpperCase()}`;
      } else if (mode === 'weather' && countryData.avg_temp) {
        info += ` - ${countryData.avg_temp}`;
      } else if (mode === 'safety') {
        const labels = {'very_safe':'Very Safe','safe':'Safe','moderate':'Caution','caution':'High Caution','high_risk':'High Risk'};
        info += ` - ${labels[countryData.safety_level] || ''}`;
      }
      setTooltipContent(info);
    } else {
      setTooltipContent(geo.properties?.name || 'Unknown');
    }
    setTooltipPosition({ x: evt.clientX, y: evt.clientY });
  };

  const handleMouseLeave = () => setTooltipContent('');

  return (
    <div className="relative w-full" data-testid="world-map-container">
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-white/95 rounded-lg p-1 shadow-lg border border-gray-200">
        <button onClick={handleZoomIn} className="w-7 h-7 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 text-base font-bold" data-testid="zoom-in-btn">+</button>
        <button onClick={handleZoomOut} className="w-7 h-7 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 text-base font-bold" data-testid="zoom-out-btn">-</button>
        <button onClick={handleReset} className="w-7 h-7 bg-gray-500 text-white rounded flex items-center justify-center hover:bg-gray-400 text-xs font-bold" data-testid="zoom-reset-btn">R</button>
      </div>
      
      {/* Mobile Hint */}
      <div className="absolute bottom-3 left-3 z-10 md:hidden bg-white/80 text-xs text-gray-600 px-2 py-1 rounded">
        Pinch to zoom
      </div>

      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ 
          scale: 155,
          center: [0, 5]
        }}
        width={900}
        height={420}
        style={{ width: '100%', height: 'auto' }}
      >
        {/* Ocean background with wave pattern */}
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
          <pattern id="waves" x="0" y="0" width="80" height="15" patternUnits="userSpaceOnUse">
            <path d="M0 8 Q20 4 40 8 T80 8" stroke="#0EA5E9" strokeWidth="0.25" fill="none" opacity="0.35"/>
            <path d="M0 12 Q20 8 40 12 T80 12" stroke="#0EA5E9" strokeWidth="0.25" fill="none" opacity="0.25"/>
          </pattern>
        </defs>
        
        <rect x="-10" y="-10" width="920" height="440" fill="url(#oceanGrad)" />
        <rect x="-10" y="-10" width="920" height="440" fill="url(#waves)" />
        
        <ZoomableGroup 
          zoom={zoom} 
          center={center} 
          onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates); setZoom(z); }} 
          minZoom={1} 
          maxZoom={8}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColorByMode(geo)}
                  stroke="#FFFFFF"
                  strokeWidth={0.35}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#FBBF24', outline: 'none', cursor: 'pointer' },
                    pressed: { outline: 'none' }
                  }}
                  onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                  onMouseMove={(evt) => setTooltipPosition({ x: evt.clientX, y: evt.clientY })}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onCountryClick && onCountryClick(geo)}
                  data-testid={`country-${geo.id}`}
                />
              ))
            }
          </Geographies>
          
          {/* Ocean Labels */}
          {OCEAN_LABELS.map((ocean, idx) => (
            <Marker key={`ocean-${idx}`} coordinates={ocean.coords}>
              <text
                textAnchor="middle"
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: `${ocean.size}px`, 
                  fontWeight: '600', 
                  fill: '#0369A1', 
                  opacity: 0.75,
                  fontStyle: 'italic',
                  letterSpacing: '0.5px'
                }}
              >
                {ocean.name}
              </text>
            </Marker>
          ))}
          
          {/* Sea Labels */}
          {SEA_LABELS.map((sea, idx) => (
            <Marker key={`sea-${idx}`} coordinates={sea.coords}>
              <text
                textAnchor="middle"
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: `${sea.size}px`, 
                  fill: '#0284C7', 
                  opacity: 0.65,
                  fontStyle: 'italic'
                }}
              >
                {sea.name}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {tooltipContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="map-tooltip"
          style={{ position: 'fixed', left: tooltipPosition.x + 10, top: tooltipPosition.y + 10, pointerEvents: 'none' }}
          data-testid="map-tooltip"
        >
          {tooltipContent}
        </motion.div>
      )}
    </div>
  );
};

export default WorldMap;
