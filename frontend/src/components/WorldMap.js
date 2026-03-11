import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'framer-motion';

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

const WorldMap = ({ data, mode, onCountryClick }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 20]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const handleReset = () => { setZoom(1); setCenter([0, 20]); };

  const getColorByMode = (geo) => {
    const numericId = String(geo.id);
    const iso3FromNumeric = numericToISO3[numericId];
    const countryData = data?.find(d => 
      d.country_code === iso3FromNumeric || 
      d.country_code === numericId ||
      d.country_name === geo.properties?.name
    );

    if (!countryData) return '#E8E8E6';

    if (mode === 'seasons') {
      switch (countryData.season_type || countryData.current_season) {
        case 'peak': return '#E25A53';
        case 'shoulder': return '#4B89AC';
        case 'off': return '#F2A900';
        default: return '#E8E8E6';
      }
    } else if (mode === 'visa') {
      switch (countryData.visa_type) {
        case 'visa_free': return '#22C55E';
        case 'visa_on_arrival': return '#E25A53';
        case 'e_visa': return '#4B89AC';
        case 'visa_required': return '#F2A900';
        default: return '#E8E8E6';
      }
    } else if (mode === 'weather') {
      switch (countryData.weather_type) {
        case 'hot': return '#E25A53';
        case 'warm': return '#F2A900';
        case 'mild': return '#4B89AC';
        case 'cold': return '#67B7D1';
        case 'snow': return '#FFFFFF';
        default: return '#E8E8E6';
      }
    } else if (mode === 'plug') {
      const plugColors = {
        'a': '#E25A53', 'b': '#4B89AC', 'c': '#F2A900', 'd': '#22C55E',
        'e': '#9333EA', 'f': '#EC4899', 'g': '#F97316', 'mixed': '#6B7280'
      };
      return plugColors[countryData.plug_type?.toLowerCase()] || '#E8E8E6';
    } else if (mode === 'festivals') {
      switch (countryData.festival_type) {
        case 'many': return '#E25A53';
        case 'some': return '#F2A900';
        case 'few': return '#4B89AC';
        default: return '#E8E8E6';
      }
    } else if (mode === 'safety') {
      switch (countryData.safety_level) {
        case 'very_safe': return '#22C55E';
        case 'safe': return '#34D399';
        case 'moderate': return '#EAB308';
        case 'caution': return '#F97316';
        case 'high_risk': return '#EF4444';
        default: return '#E8E8E6';
      }
    }
    return '#E8E8E6';
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
    <div className="relative w-full h-full" data-testid="world-map-container">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-white/95 rounded-lg p-1.5 shadow-lg border border-gray-200">
        <button onClick={handleZoomIn} className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 text-lg font-bold" data-testid="zoom-in-btn">+</button>
        <button onClick={handleZoomOut} className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 text-lg font-bold" data-testid="zoom-out-btn">−</button>
        <button onClick={handleReset} className="w-8 h-8 bg-gray-500 text-white rounded flex items-center justify-center hover:bg-gray-400 text-xs font-bold" data-testid="zoom-reset-btn">↺</button>
      </div>
      
      {/* Mobile Hint */}
      <div className="absolute bottom-4 left-4 z-10 md:hidden bg-white/80 text-xs text-gray-600 px-2 py-1 rounded">
        Pinch to zoom
      </div>

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 180, center: [10, 10] }}
        width={800}
        height={400}
        style={{ width: '100%', height: '100%', backgroundColor: '#B8D4E8' }}
      >
        <ZoomableGroup zoom={zoom} center={center} onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates); setZoom(z); }} minZoom={1} maxZoom={8}>
          {/* Ocean background gradient */}
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A8D0E6" />
              <stop offset="100%" stopColor="#7FB3D3" />
            </linearGradient>
          </defs>
          <rect x="-100" y="-100" width="1000" height="600" fill="url(#oceanGradient)" />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColorByMode(geo)}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#D4AF37', outline: 'none', cursor: 'pointer' },
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
          
          {/* Ocean Labels - positioned for geoNaturalEarth1 projection */}
          <text x="120" y="180" fill="#1565C0" fontSize="12" fontWeight="bold" opacity="0.7" fontStyle="italic" textAnchor="middle">PACIFIC OCEAN</text>
          <text x="330" y="170" fill="#1565C0" fontSize="11" fontWeight="bold" opacity="0.7" fontStyle="italic" textAnchor="middle">ATLANTIC</text>
          <text x="560" y="260" fill="#1565C0" fontSize="11" fontWeight="bold" opacity="0.7" fontStyle="italic" textAnchor="middle">INDIAN OCEAN</text>
          <text x="730" y="180" fill="#1565C0" fontSize="11" fontWeight="bold" opacity="0.7" fontStyle="italic" textAnchor="middle">PACIFIC</text>
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
