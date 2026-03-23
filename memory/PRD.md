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
- "Check Eligibility" button (pre-filled with searched country)
- "Document Checklist" button (pre-filled with searched country)
- "Explore Visa Options" button

### 4. Document Checklist Generator ✅
- AI-powered using GPT-5.2
- Generates mandatory + supporting documents
- Interactive checkboxes with progress tracking
- Save to user profile functionality
- Print functionality
- Optimized prompt for ~25s response time

### 5. User Profile & Checklists ✅
- Save/update/delete document checklists
- View progress on saved checklists
- Authentication via email/password

### 6. Visa Eligibility Checker ✅
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
│   ├── server.py          # Main API server
│   └── .env               # EMERGENT_LLM_KEY, MONGO_URL
└── frontend/
    └── src/
        ├── components/
        │   ├── CountryDetailModal.js
        │   ├── DocumentChecklistGenerator.js
        │   ├── Navigation.js
        │   └── VisaEligibilityChecker.js
        ├── pages/
        │   ├── Seasons.js (Homepage)
        │   ├── UserProfile.js
        │   └── Visa.js
        └── context/
            └── AuthContext.js
```
