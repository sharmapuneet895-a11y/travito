# Pass-e-port - Travel Information Website PRD

## Original Problem Statement
Build a comprehensive travel information website called "Pass-e-port" with color-coded world maps showing:
- Best seasons to travel (peak/shoulder/off-season)
- Visa information for Indian travelers (visa on arrival/e-visa/visa required)
- Weather conditions (hot/cold/rainy/snowy/sandy)
- Power plug types by country
- Famous festivals worldwide
- FOREX exchange rates (INR base)
- Top apps by country (Transport, Convenience, Food, Sightseeing)
- Travel blog/tips section

## Core Requirements
1. Interactive color-coded world maps with animated wavy blue oceans
2. Prominent ocean name labels visible in clear ocean areas
3. Professional UI with hamburger menu and centered "Pass-e-port" logo
4. Homepage search bar for countries
5. Country detail pages with comprehensive travel info
6. Full world view maps without clipping (using Natural Earth projection)

## User Personas
- **Primary**: Indian travelers planning international trips
- **Secondary**: Global travelers seeking quick travel information

---

## What's Been Implemented

### Completed Features (March 2026)

#### Core Pages
- **Homepage** - Search bar with country autocomplete, hero section
- **Seasons Page** - Color-coded map (Peak: Red, Shoulder: Blue, Off: Orange)
- **Visa Page** - Color-coded map for Indian travelers (VOA: Red, E-visa: Blue, Required: Orange)
- **Weather Page** - 110 countries with weather types (Hot, Snow, Sandy, Rainy)
- **Power Plugs Page** - 109 countries with plug types (A, B, C, D, E, F, G, I, mixed)
- **Festivals Page** - NEW - 57 festivals with map + list view, month filter
- **FOREX Page** - Exchange rates (INR base) - Falls back to mock data if API fails
- **Top Apps Page** - App recommendations by country and category
- **Blog Page** - Travel tips and articles
- **Country Detail Page** - Comprehensive info for individual countries

#### Map Features
- Natural Earth 1 projection showing full world without clipping
- Animated wavy blue oceans
- Ocean labels positioned in clear water areas:
  - NORTH PACIFIC, SOUTH PACIFIC
  - NORTH ATLANTIC, SOUTH ATLANTIC
  - INDIAN OCEAN, WEST PACIFIC
  - SOUTHERN OCEAN
- Interactive tooltips on hover
- Click to navigate to country details

#### Navigation
- Hamburger menu (slide-out from left)
- Centered "Pass-e-port" logo with compass icon
- All pages accessible from menu

#### Data Coverage
- Seasons: 182 countries
- Visa: 182 countries
- Weather: 145 countries
- Power Plugs: 144 countries
- Festivals: 57 festivals across 30+ countries
- Apps: 20+ app recommendations

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/seasons | GET | Season data for all countries |
| /api/visa | GET | Visa requirements for all countries |
| /api/weather | GET | Weather data (110 countries) |
| /api/weather/realtime | GET | Real-time weather (requires API key) |
| /api/plugs | GET | Power plug types (109 countries) |
| /api/festivals | GET | All festivals (57 total) |
| /api/festivals?month=X | GET | Filter festivals by month |
| /api/forex/rates | GET | FOREX rates (INR base) |
| /api/apps | GET | App recommendations |
| /api/countries | GET | List of all countries |
| /api/country/:code | GET | Detailed country info |
| /api/blogs | GET | Blog articles |

---

## Tech Stack
- **Frontend**: React, React Router, Framer Motion, Tailwind CSS
- **Maps**: react-simple-maps, topojson-client, d3
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)
- **Icons**: Lucide React

---

## Mocked/Fallback APIs
1. **FOREX** (`/api/forex/rates`) - Falls back to sample data when API unavailable
2. **Real-time Weather** (`/api/weather/realtime`) - Falls back to database when OPENWEATHER_API_KEY not configured

---

## P0 - Completed
- [x] Full world map view without clipping
- [x] Ocean labels clearly visible
- [x] Weather data for 110+ countries
- [x] Power plug data for 109+ countries
- [x] Festivals page with map + list view

## P1 - Backlog
- [ ] Real-time weather integration (OpenWeatherMap free tier - requires API key)
- [ ] Add more country data to seasons/visa collections
- [ ] User authentication for saving favorites

## P2 - Future Enhancements
- [ ] Live FOREX API with user-provided key
- [ ] Currency converter calculator
- [ ] Travel itinerary planner
- [ ] User reviews and ratings
- [ ] Offline mode / PWA support

---

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
OPENWEATHER_API_KEY=  # Optional - for real-time weather
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://visa-forex-explorer.preview.emergentagent.com
```

---

## Test Coverage
- Backend: 100% (15/15 API tests passed)
- Frontend: All features visually verified
- Test report: `/app/test_reports/iteration_2.json`
