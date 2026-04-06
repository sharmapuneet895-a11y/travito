# Travito.co.in - Product Requirements Document

## Overview
Comprehensive travel information website for Indian travelers, providing visa intelligence, seasonal travel recommendations, and trip planning tools.

## Core Features

### 1. Homepage (Seasons.js) - Main Hub ✅
- Hero section with search functionality
- Search by country + month
- Auto-opening CountryDetailModal on search
- VISA INTELLIGENCE section (above Top Destinations)
- Explore by Category destinations
- Mobile-responsive design with hamburger menu

### 2. Country Detail Modal ✅
- Auto-popup on search
- Integrated AI chatbot (Travito Assistant) with formatted responses
- Best Tourist Places section (categorized by Beach, Mountain, Culture, City)
- Expand/collapse functionality
- Visa, weather, safety, dishes, festivals, apps, plugs info

### 3. VISA INTELLIGENCE Section ✅
- Displays after searching for a country
- Shows: Visa Type, Documents Needed, Processing Time, Cost Estimate
- "Explore Visa Options" link to /visa page
- **2 Visa Option Cards** (with dynamic AI pricing):
  - Explore Agents (Most Popular) → Opens **Agent Finder Wizard**
  - Assisted (Recommended) → Opens **Assisted Service Wizard**
- **Action Buttons Row**: Travel Guide, Check Eligibility, Document Checklist

### 4. Agent Finder Wizard ✅ (Dec 2025)
- 5-step workflow to find and compare visa agents:
  1. **Compare Agents** - Filterable agent marketplace (city, fee, rating)
  2. **Share Details** - Traveler information form
  3. **Agent Connect** - Request confirmation & WhatsApp connect
  4. **Application Help** - Services included & timeline
  5. **Submission & Tracking** - Completion and tracking
- Triggered from "Explore Agents" card's "Find Agents" button
- **Fullscreen toggle** for better viewing

### 5. Assisted Service Wizard ✅ (Dec 2025)
- 5-step guided workflow with expert assistance:
  1. **Share Details** - Form with pricing breakdown sidebar
  2. **Document Review** - Upload & verification process
  3. **Application Help** - Form filling support & WhatsApp
  4. **Book Appointment** - VFS Global slot booking
  5. **Submission & Tracking** - Process overview & completion
- Triggered from "Assisted" card's "Get Assistance" button
- **Fullscreen toggle** for better viewing

### 6. Document Checklist Generator ✅
- AI-powered using GPT-5.2
- Generates mandatory + supporting documents
- Interactive checkboxes with progress tracking
- Save to user profile functionality
- Print functionality
- Optimized prompt for ~25s response time

### 7. User Profile & Checklists ✅
- Save/update/delete document checklists
- View progress on saved checklists
- Authentication via email/password

### 8. Visa Eligibility Checker ✅
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
- [x] Added "How Travito Works" 3-step visual cards below hero (REMOVED - Dec 2025)
- [x] Implemented dynamic AI Visa Pricing (`/api/visa/pricing`)
- [x] Added 2 Visa Option cards: Explore Agents, Assisted (removed Self Apply)
- [x] Added Visa Type dropdown to search bar
- [x] Simplified search flow (button/Enter required, removed alternatives)
- [x] **Agent Finder Wizard** - 5-step agent marketplace
- [x] **Assisted Service Wizard** - 5-step guided assistance flow
- [x] **Fullscreen Toggle** - Both wizards have expand/collapse functionality
- [x] **VFS Center Data** - Real branch info for 8 cities
- [x] **Official Visa Portal Links** - Direct links to country-specific visa websites
- [x] **Relocated Action Buttons** - Travel Guide, Eligibility, Checklist together
- [x] **Removed "Confused About Visa" heading** - Cleaner UI
- [x] Made Compare Visa Options table mobile-responsive
- [x] Google Site Verification HTML added

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
        │   ├── AgentFinderWizard.js   # NEW - Agent marketplace wizard
        │   ├── AssistedServiceWizard.js # NEW - Assisted service wizard
        │   ├── CountryDetailModal.js
        │   ├── DIYVisaWizard.js       # UPDATED - Dynamic document fetching
        │   ├── DocumentChecklistGenerator.js
        │   ├── Navigation.js
        │   └── VisaEligibilityChecker.js
        ├── pages/
        │   ├── Seasons.js (Homepage + Visa Intelligence + Visa Options)
        │   ├── UserProfile.js
        │   └── Visa.js
        └── context/
            ├── AuthContext.js
            └── WishlistContext.js
```
