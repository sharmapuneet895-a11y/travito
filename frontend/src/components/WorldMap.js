import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Mapping from numeric IDs to ISO3 codes
const numericToISO3 = {
  "840": "USA", "124": "CAN", "484": "MEX", "192": "CUB", "388": "JAM", 
  "332": "HTI", "214": "DOM", "630": "PRI", "44": "BHS", "52": "BRB",
  "780": "TTO", "308": "GRD", "662": "LCA", "670": "VCT", "28": "ATG",
  "212": "DMA", "500": "MSR", "570": "NIU",
  "84": "BLZ", "320": "GTM", "340": "HND", "222": "SLV", "558": "NIC", "188": "CRI", "591": "PAN",
  "826": "GBR", "250": "FRA", "276": "DEU", "380": "ITA", "724": "ESP",
  "620": "PRT", "528": "NLD", "56": "BEL", "756": "CHE", "40": "AUT",
  "752": "SWE", "578": "NOR", "208": "DNK", "246": "FIN", "372": "IRL",
  "300": "GRC", "616": "POL", "203": "CZE", "348": "HUN", "642": "ROU",
  "100": "BGR", "191": "HRV", "705": "SVN", "703": "SVK", "804": "UKR",
  "112": "BLR", "440": "LTU", "428": "LVA", "233": "EST", "498": "MDA",
  "8": "ALB", "807": "MKD", "688": "SRB", "499": "MNE", "70": "BIH",
  "20": "AND", "438": "LIE", "442": "LUX", "492": "MCO", "674": "SMR", "336": "VAT",
  "643": "RUS", "304": "GRL",
  "392": "JPN", "156": "CHN", "356": "IND", "586": "PAK", "50": "BGD",
  "764": "THA", "704": "VNM", "360": "IDN", "458": "MYS", "608": "PHL",
  "702": "SGP", "104": "MMR", "116": "KHM", "418": "LAO", "524": "NPL",
  "144": "LKA", "410": "KOR", "408": "PRK", "496": "MNG", "398": "KAZ",
  "860": "UZB", "795": "TKM", "762": "TJK", "417": "KGZ", "4": "AFG",
  "64": "BTN", "462": "MDV", "344": "HKG", "446": "MAC", "158": "TWN",
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
  { name: 'ARCTIC', name2: 'OCEAN', coords: [0, 75], size: 11 },
  { name: 'NORTH', name2: 'PACIFIC', name3: 'OCEAN', coords: [-160, 30], size: 10 },
  { name: 'SOUTH', name2: 'PACIFIC', name3: 'OCEAN', coords: [-130, -40], size: 10 },
  { name: 'NORTH', name2: 'ATLANTIC', name3: 'OCEAN', coords: [-45, 35], size: 9 },
  { name: 'SOUTH', name2: 'ATLANTIC', name3: 'OCEAN', coords: [-25, -35], size: 9 },
  { name: 'INDIAN', name2: 'OCEAN', coords: [75, -20], size: 10 },
];

// Sea labels positioned like in the reference map
const SEA_LABELS = [
  { name: 'Caribbean', name2: 'Sea', coords: [-75, 18], size: 6 },
  { name: 'Gulf of', name2: 'Mexico', coords: [-92, 24], size: 6 },
  { name: 'Gulf of', name2: 'Alaska', coords: [-145, 55], size: 5 },
  { name: 'Hudson', name2: 'Bay', coords: [-85, 60], size: 5 },
  { name: 'Baffin', name2: 'Bay', coords: [-65, 72], size: 5 },
  { name: 'Labrador', name2: 'Sea', coords: [-55, 58], size: 5 },
  { name: 'Norwegian', name2: 'Sea', coords: [5, 68], size: 5 },
  { name: 'Barents', name2: 'Sea', coords: [40, 73], size: 5 },
  { name: 'Kara', name2: 'Sea', coords: [70, 75], size: 5 },
  { name: 'Laptev', name2: 'Sea', coords: [120, 76], size: 5 },
  { name: 'Mediterranean', name2: 'Sea', coords: [18, 37], size: 5 },
  { name: 'Black', name2: 'Sea', coords: [35, 43], size: 5 },
  { name: 'Arabian', name2: 'Sea', coords: [63, 15], size: 6 },
  { name: 'Bay of', name2: 'Bengal', coords: [88, 14], size: 6 },
  { name: 'South China', name2: 'Sea', coords: [115, 14], size: 5 },
  { name: 'Sea of', name2: 'Japan', coords: [135, 40], size: 5 },
  { name: 'Sea of', name2: 'Okhotsk', coords: [150, 55], size: 5 },
  { name: 'Coral', name2: 'Sea', coords: [155, -18], size: 6 },
  { name: 'Tasman', name2: 'Sea', coords: [162, -38], size: 6 },
  { name: 'Beaufort', name2: 'Sea', coords: [-140, 72], size: 5 },
];

// Major country labels with coordinates
const COUNTRY_LABELS = [
  { name: 'Russia', coords: [100, 62], size: 12 },
  { name: 'Canada', coords: [-100, 58], size: 11 },
  { name: 'United States', coords: [-100, 42], size: 9 },
  { name: 'Brazil', coords: [-55, -10], size: 10 },
  { name: 'Australia', coords: [135, -25], size: 10 },
  { name: 'China', coords: [100, 35], size: 10 },
  { name: 'India', coords: [80, 22], size: 9 },
  { name: 'Argentina', coords: [-65, -38], size: 8 },
  { name: 'Kazakhstan', coords: [68, 48], size: 7 },
  { name: 'Mongolia', coords: [105, 47], size: 7 },
  { name: 'Greenland', coords: [-42, 72], size: 7 },
  { name: 'Alaska', coords: [-153, 64], size: 6 },
];

const WorldMap = ({ data, mode, onCountryClick }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  // Fixed center - dragging enabled
  const [center, setCenter] = useState([-10, 35]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.4, 6));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.4, 1));
  const handleReset = () => setZoom(1);

  const getColorByMode = (geo) => {
    const numericId = String(geo.id);
    const iso3FromNumeric = numericToISO3[numericId];
    const countryData = data?.find(d => 
      d.country_code === iso3FromNumeric || 
      d.country_code === numericId ||
      d.country_name === geo.properties?.name
    );

    if (!countryData) return '#E2E8F0';

    if (mode === 'seasons') {
      switch (countryData.season_type || countryData.current_season) {
        case 'peak': return '#FF7A00';      // Orange - Best time
        case 'shoulder': return '#0B3C5D';  // Deep Blue - Good time
        case 'off': return '#94A3B8';       // Grey - Off season
        default: return '#E2E8F0';
      }
    } else if (mode === 'visa') {
      switch (countryData.visa_type) {
        case 'visa_free': return '#22C55E';      // Green - matches legend
        case 'visa_on_arrival': return '#E25A53'; // Red - matches legend
        case 'e_visa': return '#4B89AC';          // Light Blue - matches legend
        case 'visa_required': return '#F2A900';   // Yellow/Amber - matches legend
        default: return '#D6D6D6';               // No Data grey
      }
    } else if (mode === 'weather') {
      switch (countryData.weather_type) {
        case 'hot': return '#FF7A00';     // Orange
        case 'warm': return '#F59E0B';    // Amber
        case 'rainy': return '#0B3C5D';   // Deep Blue
        case 'mild': return '#10B981';    // Green
        case 'cold': return '#6366F1';    // Indigo
        case 'snow': return '#A5B4FC';    // Light indigo
        default: return '#E2E8F0';
      }
    } else if (mode === 'plug') {
      // Match colors with PowerPlug.js legend
      const plugColors = {
        'a': '#FF7A00', // Orange - USA, Japan, Canada
        'b': '#F59E0B', // Amber - USA, Mexico
        'c': '#0B3C5D', // Deep Blue - Europe, Asia
        'd': '#8B5CF6', // Purple - India, Nepal
        'e': '#10B981', // Teal - France, Belgium
        'f': '#EF4444', // Red variant - Germany
        'g': '#3B82F6', // Blue - UK, Singapore, UAE
        'i': '#F97316', // Orange - Australia, China
        'mixed': '#94A3B8' // Grey - Multiple types
      };
      return plugColors[countryData.plug_type?.toLowerCase()] || '#E2E8F0';
    } else if (mode === 'festivals') {
      switch (countryData.festival_type) {
        case 'many': return '#FF7A00';    // Orange
        case 'some': return '#0B3C5D';    // Deep Blue
        case 'few': return '#94A3B8';     // Grey
        default: return '#E2E8F0';
      }
    } else if (mode === 'safety') {
      switch (countryData.safety_level) {
        case 'very_safe': return '#10B981';   // Green
        case 'safe': return '#0B3C5D';        // Deep Blue
        case 'moderate': return '#F59E0B';    // Amber
        case 'caution': return '#FF7A00';     // Orange
        case 'high_risk': return '#EF4444';   // Red
        default: return '#E2E8F0';
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
      } else if (mode === 'weather') {
        const weatherLabels = {'hot': 'Hot', 'cold': 'Cold', 'snow': 'Cold/Snowy', 'rainy': 'Rainy', 'mild': 'Mild/Pleasant', 'warm': 'Warm'};
        const label = weatherLabels[countryData.weather_type] || countryData.weather_type || '';
        info += ` - ${label}${countryData.avg_temp ? ` (${countryData.avg_temp})` : ''}`;
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

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ 
          scale: 95,
          center: [-10, 35]
        }}
        width={900}
        height={450}
        style={{ width: '100%', height: 'auto', backgroundColor: '#87CEEB' }}
      >
        <ZoomableGroup 
          zoom={zoom} 
          center={center}
          onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates); setZoom(z); }}
          minZoom={1} 
          maxZoom={6}
        >
          {/* Ocean background inside ZoomableGroup so it moves with map */}
          <rect x="-500" y="-500" width="2000" height="1500" fill="#87CEEB" />
          
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
                    default: { outline: 'none', cursor: 'default' },
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
          
          {/* Ocean Labels */}
          {OCEAN_LABELS.map((ocean, idx) => (
            <Marker key={`ocean-${idx}`} coordinates={ocean.coords}>
              {ocean.name3 ? (
                <>
                  <text textAnchor="middle" y={-10} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#006699', letterSpacing: '3px' }}>{ocean.name}</text>
                  <text textAnchor="middle" y={2} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#006699', letterSpacing: '3px' }}>{ocean.name2}</text>
                  <text textAnchor="middle" y={14} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#006699', letterSpacing: '3px' }}>{ocean.name3}</text>
                </>
              ) : ocean.name2 ? (
                <>
                  <text textAnchor="middle" y={-5} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#006699', letterSpacing: '3px' }}>{ocean.name}</text>
                  <text textAnchor="middle" y={8} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#006699', letterSpacing: '3px' }}>{ocean.name2}</text>
                </>
              ) : (
                <text textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif', fontSize: `${ocean.size}px`, fontWeight: 'bold', fill: '#006699', letterSpacing: '2px' }}>{ocean.name}</text>
              )}
            </Marker>
          ))}
          
          {/* Sea Labels */}
          {SEA_LABELS.map((sea, idx) => (
            <Marker key={`sea-${idx}`} coordinates={sea.coords}>
              {sea.name2 ? (
                <>
                  <text textAnchor="middle" y={-3} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${sea.size}px`, fill: '#006699', fontStyle: 'italic' }}>{sea.name}</text>
                  <text textAnchor="middle" y={6} style={{ fontFamily: 'Arial, sans-serif', fontSize: `${sea.size}px`, fill: '#006699', fontStyle: 'italic' }}>{sea.name2}</text>
                </>
              ) : (
                <text textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif', fontSize: `${sea.size}px`, fill: '#006699', fontStyle: 'italic' }}>{sea.name}</text>
              )}
            </Marker>
          ))}

          {/* Country Labels */}
          {COUNTRY_LABELS.map((country, idx) => (
            <Marker key={`country-label-${idx}`} coordinates={country.coords}>
              <text textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif', fontSize: `${country.size}px`, fontWeight: '600', fill: '#333333' }}>{country.name}</text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Disclaimer - positioned on map's bottom right ocean area */}
      <div 
        style={{ 
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          textAlign: 'right',
          padding: '8px 12px',
          fontSize: '10px', 
          color: '#fff', 
          fontWeight: '600',
          fontStyle: 'italic',
          lineHeight: '1.5',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '6px',
          maxWidth: '280px',
          zIndex: 10
        }}
        data-testid="map-disclaimer"
      >
        * Map boundaries are for illustrative purposes only<br/>
        and may not reflect official international borders.
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
