import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Annotation } from 'react-simple-maps';
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

// Ocean labels positioned like in the reference map
const OCEAN_LABELS = [
  { name: 'ARCTIC', name2: 'OCEAN', coords: [0, 82], size: 11 },
  { name: 'NORTH', name2: 'PACIFIC', name3: 'OCEAN', coords: [-160, 35], size: 10 },
  { name: 'SOUTH', name2: 'PACIFIC', name3: 'OCEAN', coords: [-130, -35], size: 10 },
  { name: 'NORTH', name2: 'ATLANTIC', name3: 'OCEAN', coords: [-45, 35], size: 9 },
  { name: 'SOUTH', name2: 'ATLANTIC', name3: 'OCEAN', coords: [-25, -30], size: 9 },
  { name: 'INDIAN', name2: 'OCEAN', coords: [75, -25], size: 10 },
  { name: 'SOUTHERN OCEAN', coords: [0, -65], size: 9 },
];

// Sea labels positioned like in the reference map
const SEA_LABELS = [
  { name: 'Caribbean Sea', coords: [-75, 17], size: 6 },
  { name: 'Gulf of', name2: 'Mexico', coords: [-92, 24], size: 6 },
  { name: 'Gulf of', name2: 'Alaska', coords: [-145, 55], size: 5 },
  { name: 'Hudson', name2: 'Bay', coords: [-85, 60], size: 5 },
  { name: 'Baffin', name2: 'Bay', coords: [-65, 72], size: 5 },
  { name: 'Labrador', name2: 'Sea', coords: [-55, 58], size: 5 },
  { name: 'Norwegian', name2: 'Sea', coords: [5, 68], size: 5 },
  { name: 'Barents', name2: 'Sea', coords: [40, 73], size: 5 },
  { name: 'Kara', name2: 'Sea', coords: [70, 75], size: 5 },
  { name: 'Laptev', name2: 'Sea', coords: [120, 76], size: 5 },
  { name: 'Mediterranean Sea', coords: [18, 37], size: 6 },
  { name: 'Black Sea', coords: [35, 43], size: 5 },
  { name: 'Caspian', name2: 'Sea', coords: [51, 42], size: 5 },
  { name: 'Arabian', name2: 'Sea', coords: [63, 15], size: 6 },
  { name: 'Bay of', name2: 'Bengal', coords: [88, 14], size: 6 },
  { name: 'South China', name2: 'Sea', coords: [115, 14], size: 6 },
  { name: 'Sea of', name2: 'Japan', coords: [135, 40], size: 5 },
  { name: 'Sea of', name2: 'Okhotsk', coords: [150, 55], size: 5 },
  { name: 'Coral', name2: 'Sea', coords: [155, -18], size: 6 },
  { name: 'Tasman', name2: 'Sea', coords: [162, -38], size: 6 },
  { name: 'Beaufort', name2: 'Sea', coords: [-140, 72], size: 5 },
];

// Major country labels with coordinates
const COUNTRY_LABELS = [
  { name: 'Russia', coords: [100, 62], size: 12 },
  { name: 'Canada', coords: [-100, 60], size: 11 },
  { name: 'United States', name2: 'of America', coords: [-100, 40], size: 9 },
  { name: 'Brazil', coords: [-55, -12], size: 10 },
  { name: 'Australia', coords: [135, -25], size: 10 },
  { name: 'China', coords: [100, 35], size: 10 },
  { name: 'India', coords: [80, 22], size: 9 },
  { name: 'Argentina', coords: [-65, -35], size: 8 },
  { name: 'Kazakhstan', coords: [68, 48], size: 7 },
  { name: 'Mongolia', coords: [105, 47], size: 7 },
  { name: 'Greenland', name2: '(Denmark)', coords: [-42, 72], size: 7 },
  { name: 'Alaska', name2: '(USA)', coords: [-153, 64], size: 6 },
];

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

    if (!countryData) return '#E5E5E5';

    if (mode === 'seasons') {
      switch (countryData.season_type || countryData.current_season) {
        case 'peak': return '#DC2626';
        case 'shoulder': return '#2563EB';
        case 'off': return '#F59E0B';
        default: return '#E5E5E5';
      }
    } else if (mode === 'visa') {
      switch (countryData.visa_type) {
        case 'visa_free': return '#16A34A';
        case 'visa_on_arrival': return '#DC2626';
        case 'e_visa': return '#2563EB';
        case 'visa_required': return '#F59E0B';
        default: return '#E5E5E5';
      }
    } else if (mode === 'weather') {
      switch (countryData.weather_type) {
        case 'hot': return '#DC2626';
        case 'warm': return '#F59E0B';
        case 'mild': return '#2563EB';
        case 'cold': return '#67B7D1';
        case 'snow': return '#F3F4F6';
        default: return '#E5E5E5';
      }
    } else if (mode === 'plug') {
      const plugColors = {
        'a': '#DC2626', 'b': '#2563EB', 'c': '#F59E0B', 'd': '#16A34A',
        'e': '#9333EA', 'f': '#EC4899', 'g': '#F97316', 'mixed': '#6B7280'
      };
      return plugColors[countryData.plug_type?.toLowerCase()] || '#E5E5E5';
    } else if (mode === 'festivals') {
      switch (countryData.festival_type) {
        case 'many': return '#DC2626';
        case 'some': return '#F59E0B';
        case 'few': return '#2563EB';
        default: return '#E5E5E5';
      }
    } else if (mode === 'safety') {
      switch (countryData.safety_level) {
        case 'very_safe': return '#16A34A';
        case 'safe': return '#22C55E';
        case 'moderate': return '#EAB308';
        case 'caution': return '#F97316';
        case 'high_risk': return '#DC2626';
        default: return '#E5E5E5';
      }
    }
    return '#E5E5E5';
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
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 bg-white/90 rounded-md p-1 shadow-md border border-gray-300">
        <button onClick={handleZoomIn} className="w-6 h-6 bg-slate-700 text-white rounded flex items-center justify-center hover:bg-slate-600 text-sm font-bold" data-testid="zoom-in-btn">+</button>
        <button onClick={handleZoomOut} className="w-6 h-6 bg-slate-700 text-white rounded flex items-center justify-center hover:bg-slate-600 text-sm font-bold" data-testid="zoom-out-btn">-</button>
        <button onClick={handleReset} className="w-6 h-6 bg-slate-500 text-white rounded flex items-center justify-center hover:bg-slate-400 text-xs" data-testid="zoom-reset-btn">R</button>
      </div>
      
      {/* Mobile Hint */}
      <div className="absolute bottom-10 left-2 z-10 md:hidden bg-white/80 text-xs text-gray-600 px-2 py-1 rounded">
        Pinch to zoom
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ 
          scale: 120,
          center: [0, 30]
        }}
        width={900}
        height={480}
        style={{ width: '100%', height: 'auto', maxHeight: '55vh' }}
      >
        {/* Ocean background - light blue like reference */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B3E0FF" />
            <stop offset="100%" stopColor="#87CEEB" />
          </linearGradient>
        </defs>
        
        {/* Ocean background */}
        <rect x="-10" y="-10" width="920" height="500" fill="url(#oceanGradient)" />
        
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
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#FCD34D', outline: 'none', cursor: 'pointer' },
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
          
          {/* Ocean Labels - Large text like reference */}
          {OCEAN_LABELS.map((ocean, idx) => (
            <Marker key={`ocean-${idx}`} coordinates={ocean.coords}>
              {ocean.name3 ? (
                <>
                  <text textAnchor="middle" y={-10} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#0066CC', letterSpacing: '3px' }}>{ocean.name}</text>
                  <text textAnchor="middle" y={2} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#0066CC', letterSpacing: '3px' }}>{ocean.name2}</text>
                  <text textAnchor="middle" y={14} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#0066CC', letterSpacing: '3px' }}>{ocean.name3}</text>
                </>
              ) : ocean.name2 ? (
                <>
                  <text textAnchor="middle" y={-5} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#0066CC', letterSpacing: '3px' }}>{ocean.name}</text>
                  <text textAnchor="middle" y={8} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#0066CC', letterSpacing: '3px' }}>{ocean.name2}</text>
                </>
              ) : (
                <text textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#0066CC', letterSpacing: '2px' }}>{ocean.name}</text>
              )}
            </Marker>
          ))}
          
          {/* Sea Labels - Smaller italic text like reference */}
          {SEA_LABELS.map((sea, idx) => (
            <Marker key={`sea-${idx}`} coordinates={sea.coords}>
              {sea.name2 ? (
                <>
                  <text textAnchor="middle" y={-3} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${sea.size}px`, fill: '#0077AA', fontStyle: 'italic' }}>{sea.name}</text>
                  <text textAnchor="middle" y={6} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${sea.size}px`, fill: '#0077AA', fontStyle: 'italic' }}>{sea.name2}</text>
                </>
              ) : (
                <text textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif', fontSize: `${sea.size}px`, fill: '#0077AA', fontStyle: 'italic' }}>{sea.name}</text>
              )}
            </Marker>
          ))}

          {/* Country Labels - Like reference map */}
          {COUNTRY_LABELS.map((country, idx) => (
            <Marker key={`country-label-${idx}`} coordinates={country.coords}>
              {country.name2 ? (
                <>
                  <text textAnchor="middle" y={-3} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${country.size}px`, fontWeight: '600', fill: '#333333' }}>{country.name}</text>
                  <text textAnchor="middle" y={country.size} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${country.size - 2}px`, fill: '#555555' }}>{country.name2}</text>
                </>
              ) : (
                <text textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif', fontSize: `${country.size}px`, fontWeight: '600', fill: '#333333' }}>{country.name}</text>
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Disclaimer */}
      <div className="text-center mt-1 text-xs text-gray-500 italic">
        * Map boundaries are for illustrative purposes only and may not reflect the official position on international borders.
      </div>

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
