# Travito.co.in - Product Requirements Document

## Overview
Comprehensive travel information website for Indian travelers, providing visa intelligence, seasonal travel recommendations, and trip planning tools.

## Core Features

### 1. Homepage (Seasons.js) - Main Hub ✅
- Hero section with search functionality (blue theme)
- Search by country + month with blue outlined search bars
- Auto-opening CountryDetailModal on search
- VISA INTELLIGENCE section (blue heading)
- TRENDING section with horizontal scroll + unique country-specific tourist attraction images
- Trending card click: smooth scroll to Visa Intelligence + opens CountryDetailModal
- SEASONAL TRAVEL GUIDE section (blue heading)
- TRAVEL INFORMATION section (blue heading)
- Mobile-responsive design with hamburger menu
- **Design**: Blue headings, blue buttons with white text, Travito logo in blue

### 2. Country Detail Modal ✅
- Auto-popup on search
- Integrated AI chatbot (Travito Assistant) with formatted responses
- Best Tourist Places section (categorized by Beach, Mountain, Culture, City)
- Expand/collapse functionality
- Visa, weather, safety, dishes, festivals, apps, plugs info

### 3. VISA INTELLIGENCE Section ✅
- Shows placeholder text "Enter destination above to see visa options" when no search
- After searching: Displays **1 Visa Option Card** - Explore Agents
  - "Explore" button → Opens **Agent Finder Wizard**
- **Action Buttons**: Travel Guide (orange), Check Eligibility (grey), Document Checklist (grey)

### 4. Agent Finder Wizard ✅ (Updated Dec 2025)
- **Blue color scheme** with white text on blue backgrounds
- **Header**: Country name centered with tourist attraction photo background (180px height)
- **Services Included** badges in header: Document verification, Form filling, Appointment booking, Interview prep, Submission support, Status tracking
- **Layout**: 20% steps panel (left) + 80% content (right)
- **Steps panel**: 4 vertical steps that highlight as user progresses
- **Step 1 - Agent cards** display: Logo, Agent name, Location, Experience, Google rating, Visa fee, Govt fee, Processing time, Total
- **Step 2 - Travel Details**:
  - Upload Passport (REAL OCR using GPT-4o Vision - auto-fills personal info)
  - Upload Photo (embassy format)
  - Personal Info: First name, Last name, DOB, Gender, Marital status, Passport number, Valid thru, Place of issue, Email, Phone
  - Flight Details: Arrival date/flight number, Departure date/flight number
  - Hotel Reservation: Hotel name, Check-in, Check-out
- 4-step workflow: Select Agent → Travel Details → Connect → Track
- Fullscreen toggle for better viewing
- **Passport OCR**: Uses OpenAI GPT-4o Vision for real passport data extraction (not mocked)

### 5. Document Checklist Generator ✅
- AI-powered using GPT-5.2
- Generates mandatory + supporting documents
- Interactive checkboxes with progress tracking
- Save to user profile functionality
- Print functionality
- Optimized prompt for ~25s response time

### 6. User Profile & Checklists ✅
- Save/update/delete document checklists
- View progress on saved checklists
- Authentication via email/password

### 7. Visa Eligibility Checker ✅
- Extended country list (50+ countries)
- Pre-selected country from search

## API Endpoints

### Core APIs
- `GET /api/seasons` - Season/travel data
- `GET /api/visa` - Visa requirements
- `GET /api/tourist-places/{country_code}` - Tourist attractions
- `POST /api/chatbot` - AI assistant

### Visa Tools
- `POST /api/visa/document-checklist` - AI checklist generator
- `POST /api/visa/eligibility` - Eligibility checker

### User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/{id}/document-checklists` - Get saved checklists
- `POST /api/user/{id}/document-checklists` - Save checklist
- `PUT /api/user/{id}/document-checklists/{id}` - Update checklist
- `DELETE /api/user/{id}/document-checklists/{id}` - Delete checklist

## Tech Stack
- **Frontend**: React, Tailwind CSS, lucide-react icons
- **Backend**: FastAPI, Pydantic
- **Database**: MongoDB
- **AI**: GPT-5.2 via emergentintegrations

## Completed Work (March 2026)
- [x] AI Chatbot integration with GPT-5.2
- [x] Tourist Places section in modal
- [x] Auto-opening country modal on search
- [x] Relocated visa tools to homepage VISA INTELLIGENCE section
- [x] Mobile-responsive design
- [x] Branding update to Travito.co.in
- [x] Document checklist save/load functionality
- [x] Optimized checklist generation (~25s response)
- [x] Fixed wishlist count not updating in profile (now uses WishlistContext)
- [x] Fixed saved checklists display in profile (added always-visible section with empty state)
- [x] Fixed weather data loading in country card (async non-blocking load)
- [x] Verified visa map color coding working correctly

## Completed Work (December 2025)
- [x] Implemented dynamic AI Visa Pricing (`/api/visa/pricing`)
- [x] Single Visa Card: "Explore Agents" with "Explore" button
- [x] Added Visa Type dropdown to search bar
- [x] Simplified search flow (button/Enter required)
- [x] **Agent Finder Wizard** - 4-step agent marketplace
- [x] **Fullscreen Toggle** - Wizard has expand/collapse functionality
- [x] **Clean Color Scheme** - Blue, white, grey (Blue theme throughout)
- [x] **Blue Headings** - All main section headings are blue
- [x] **Centered Search** - Search box centered in hero
- [x] **Clean Hero** - Removed background image, simple gradient
- [x] Google Site Verification HTML added
- [x] **Sign In Button** - Blue fill with white text
- [x] **TRENDING Section** - Horizontal scroll with country-specific images
- [x] **Agent Wizard Services** - Moved to top panel header
- [x] **Deleted orphaned files**: DIYVisaWizard.js, AssistedServiceWizard.js
- [x] **Real Passport OCR** - Using GPT-4o Vision (no longer mocked)
- [x] **Trending Card Scroll** - Smooth scroll to Visa Intelligence + open modal

## Pending Issues
| Priority | Issue | Status |
|----------|-------|--------|
| P2 | Weather page shows contradictory temps for future months | NOT STARTED |
| P2 | Festival dates not visible in collapsed view | NOT STARTED |
| P2 | Somaliland not colored on visa map | NOT STARTED |

## Upcoming Features
| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | Compare Countries | Side-by-side comparison of travel details |
| P2 | Trip Planner | Day-by-day itinerary builder |
| P2 | India-Specific Map | Borders from Indian perspective |

## File Structure
```
/app/
├── backend/
│   ├── server.py          # Main API server (includes /api/visa/pricing)
│   └── .env               # EMERGENT_LLM_KEY, MONGO_URL
└── frontend/
    └── src/
        ├── components/
        │   ├── AgentFinderWizard.js   # Agent marketplace wizard (4 steps)
        │   ├── CountryDetailModal.js
        │   ├── DocumentChecklistGenerator.js
        │   ├── Navigation.js
        │   └── VisaEligibilityChecker.js
        ├── pages/
        │   ├── Seasons.js (Homepage + Visa Intelligence + Trending horizontal scroll)
        │   ├── UserProfile.js
        │   └── Visa.js
        └── context/
            ├── AuthContext.js
            └── WishlistContext.js
```
