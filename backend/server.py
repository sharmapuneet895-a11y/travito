from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage
from production_data import SEASONS_DATA, VISA_DATA, SAFETY_DATA, APPS_DATA, FESTIVALS_DATA, DISHES_DATA, PLUGS_DATA, BLOGS_DATA

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Emergent LLM Key for AI features
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# OpenWeatherMap API configuration for real-time weather
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

# Open-Meteo API (free, no key required) - used as primary for weather
OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"

# Frankfurter API (free, no key required) - primary FOREX source
FRANKFURTER_BASE_URL = "https://api.frankfurter.app"

# Country capital coordinates for weather lookup
COUNTRY_CAPITALS = {
    # Major countries
    "USA": {"lat": 38.89, "lon": -77.03, "name": "United States"},
    "CAN": {"lat": 45.42, "lon": -75.69, "name": "Canada"},
    "GBR": {"lat": 51.51, "lon": -0.13, "name": "United Kingdom"},
    "FRA": {"lat": 48.86, "lon": 2.35, "name": "France"},
    "DEU": {"lat": 52.52, "lon": 13.40, "name": "Germany"},
    "ITA": {"lat": 41.90, "lon": 12.50, "name": "Italy"},
    "ESP": {"lat": 40.42, "lon": -3.70, "name": "Spain"},
    "AUS": {"lat": -35.28, "lon": 149.13, "name": "Australia"},
    "JPN": {"lat": 35.68, "lon": 139.69, "name": "Japan"},
    "CHN": {"lat": 39.90, "lon": 116.40, "name": "China"},
    "IND": {"lat": 28.61, "lon": 77.21, "name": "India"},
    "BRA": {"lat": -15.79, "lon": -47.88, "name": "Brazil"},
    "RUS": {"lat": 55.76, "lon": 37.62, "name": "Russia"},
    "MEX": {"lat": 19.43, "lon": -99.13, "name": "Mexico"},
    "THA": {"lat": 13.76, "lon": 100.50, "name": "Thailand"},
    "SGP": {"lat": 1.29, "lon": 103.85, "name": "Singapore"},
    "ARE": {"lat": 24.47, "lon": 54.37, "name": "United Arab Emirates"},
    "EGY": {"lat": 30.04, "lon": 31.24, "name": "Egypt"},
    "ZAF": {"lat": -25.75, "lon": 28.19, "name": "South Africa"},
    "ARG": {"lat": -34.60, "lon": -58.38, "name": "Argentina"},
    "NZL": {"lat": -41.29, "lon": 174.78, "name": "New Zealand"},
    "KOR": {"lat": 37.57, "lon": 126.98, "name": "South Korea"},
    "NLD": {"lat": 52.37, "lon": 4.89, "name": "Netherlands"},
    "SWE": {"lat": 59.33, "lon": 18.07, "name": "Sweden"},
    "NOR": {"lat": 59.91, "lon": 10.75, "name": "Norway"},
    "CHE": {"lat": 46.95, "lon": 7.45, "name": "Switzerland"},
    "TUR": {"lat": 39.93, "lon": 32.85, "name": "Turkey"},
    "GRC": {"lat": 37.98, "lon": 23.73, "name": "Greece"},
    "PRT": {"lat": 38.72, "lon": -9.14, "name": "Portugal"},
    "IDN": {"lat": -6.21, "lon": 106.85, "name": "Indonesia"},
    "MYS": {"lat": 3.14, "lon": 101.69, "name": "Malaysia"},
    "PHL": {"lat": 14.60, "lon": 120.98, "name": "Philippines"},
    "VNM": {"lat": 21.03, "lon": 105.85, "name": "Vietnam"},
    "POL": {"lat": 52.23, "lon": 21.01, "name": "Poland"},
    "AUT": {"lat": 48.21, "lon": 16.37, "name": "Austria"},
    "FIN": {"lat": 60.17, "lon": 24.94, "name": "Finland"},
    "DNK": {"lat": 55.68, "lon": 12.57, "name": "Denmark"},
    "IRL": {"lat": 53.35, "lon": -6.26, "name": "Ireland"},
    "CZE": {"lat": 50.08, "lon": 14.44, "name": "Czech Republic"},
    "ISR": {"lat": 31.77, "lon": 35.22, "name": "Israel"},
    "SAU": {"lat": 24.69, "lon": 46.72, "name": "Saudi Arabia"},
    "HUN": {"lat": 47.50, "lon": 19.04, "name": "Hungary"},
    "CHL": {"lat": -33.45, "lon": -70.67, "name": "Chile"},
    "COL": {"lat": 4.71, "lon": -74.07, "name": "Colombia"},
    "PER": {"lat": -12.05, "lon": -77.04, "name": "Peru"},
    "PAK": {"lat": 33.69, "lon": 73.06, "name": "Pakistan"},
    "BGD": {"lat": 23.81, "lon": 90.41, "name": "Bangladesh"},
    "KEN": {"lat": -1.29, "lon": 36.82, "name": "Kenya"},
    "NGA": {"lat": 9.08, "lon": 7.40, "name": "Nigeria"},
    "MAR": {"lat": 34.02, "lon": -6.83, "name": "Morocco"},
    # Additional African countries
    "GHA": {"lat": 5.56, "lon": -0.20, "name": "Ghana"},
    "CIV": {"lat": 6.85, "lon": -5.30, "name": "Ivory Coast"},
    "SEN": {"lat": 14.69, "lon": -17.44, "name": "Senegal"},
    "TZA": {"lat": -6.16, "lon": 35.75, "name": "Tanzania"},
    "UGA": {"lat": 0.31, "lon": 32.58, "name": "Uganda"},
    "ETH": {"lat": 9.02, "lon": 38.75, "name": "Ethiopia"},
    "DZA": {"lat": 36.75, "lon": 3.04, "name": "Algeria"},
    "TUN": {"lat": 36.80, "lon": 10.18, "name": "Tunisia"},
    "LBY": {"lat": 32.90, "lon": 13.19, "name": "Libya"},
    "SDN": {"lat": 15.50, "lon": 32.56, "name": "Sudan"},
    "AGO": {"lat": -8.84, "lon": 13.29, "name": "Angola"},
    "ZMB": {"lat": -15.39, "lon": 28.32, "name": "Zambia"},
    "ZWE": {"lat": -17.83, "lon": 31.05, "name": "Zimbabwe"},
    "MOZ": {"lat": -25.97, "lon": 32.59, "name": "Mozambique"},
    "BWA": {"lat": -24.66, "lon": 25.91, "name": "Botswana"},
    "NAM": {"lat": -22.56, "lon": 17.08, "name": "Namibia"},
    "MDG": {"lat": -18.88, "lon": 47.51, "name": "Madagascar"},
    "COD": {"lat": -4.32, "lon": 15.31, "name": "DR Congo"},
    "CMR": {"lat": 3.85, "lon": 11.50, "name": "Cameroon"},
    "MLI": {"lat": 12.65, "lon": -8.00, "name": "Mali"},
    "NER": {"lat": 13.51, "lon": 2.13, "name": "Niger"},
    "TCD": {"lat": 12.13, "lon": 15.05, "name": "Chad"},
    "MRT": {"lat": 18.09, "lon": -15.98, "name": "Mauritania"},
    "BFA": {"lat": 12.37, "lon": -1.52, "name": "Burkina Faso"},
    # Additional Asian countries
    "NPL": {"lat": 27.70, "lon": 85.32, "name": "Nepal"},
    "LKA": {"lat": 6.93, "lon": 79.85, "name": "Sri Lanka"},
    "MMR": {"lat": 19.75, "lon": 96.13, "name": "Myanmar"},
    "KHM": {"lat": 11.56, "lon": 104.92, "name": "Cambodia"},
    "LAO": {"lat": 17.97, "lon": 102.60, "name": "Laos"},
    "MNG": {"lat": 47.92, "lon": 106.92, "name": "Mongolia"},
    "KAZ": {"lat": 51.17, "lon": 71.45, "name": "Kazakhstan"},
    "UZB": {"lat": 41.31, "lon": 69.28, "name": "Uzbekistan"},
    "IRN": {"lat": 35.70, "lon": 51.42, "name": "Iran"},
    "IRQ": {"lat": 33.34, "lon": 44.40, "name": "Iraq"},
    "JOR": {"lat": 31.95, "lon": 35.93, "name": "Jordan"},
    "QAT": {"lat": 25.29, "lon": 51.53, "name": "Qatar"},
    "KWT": {"lat": 29.38, "lon": 47.98, "name": "Kuwait"},
    "OMN": {"lat": 23.59, "lon": 58.38, "name": "Oman"},
    "AFG": {"lat": 34.53, "lon": 69.17, "name": "Afghanistan"},
    # Additional European countries
    "BEL": {"lat": 50.85, "lon": 4.35, "name": "Belgium"},
    "UKR": {"lat": 50.45, "lon": 30.52, "name": "Ukraine"},
    "ROU": {"lat": 44.43, "lon": 26.10, "name": "Romania"},
    "BGR": {"lat": 42.70, "lon": 23.32, "name": "Bulgaria"},
    "HRV": {"lat": 45.81, "lon": 15.98, "name": "Croatia"},
    "SRB": {"lat": 44.79, "lon": 20.50, "name": "Serbia"},
    "BLR": {"lat": 53.90, "lon": 27.57, "name": "Belarus"},
    "LTU": {"lat": 54.69, "lon": 25.28, "name": "Lithuania"},
    "LVA": {"lat": 56.95, "lon": 24.11, "name": "Latvia"},
    "EST": {"lat": 59.44, "lon": 24.75, "name": "Estonia"},
    # Additional Americas
    "VEN": {"lat": 10.49, "lon": -66.88, "name": "Venezuela"},
    "ECU": {"lat": -0.23, "lon": -78.52, "name": "Ecuador"},
    "BOL": {"lat": -16.50, "lon": -68.15, "name": "Bolivia"},
    "PRY": {"lat": -25.27, "lon": -57.64, "name": "Paraguay"},
    "URY": {"lat": -34.90, "lon": -56.19, "name": "Uruguay"},
    "CUB": {"lat": 23.05, "lon": -82.38, "name": "Cuba"},
    "DOM": {"lat": 18.47, "lon": -69.89, "name": "Dominican Republic"},
    "JAM": {"lat": 18.00, "lon": -76.80, "name": "Jamaica"},
    "CRI": {"lat": 9.93, "lon": -84.08, "name": "Costa Rica"},
    "PAN": {"lat": 9.00, "lon": -79.50, "name": "Panama"},
    "GTM": {"lat": 14.63, "lon": -90.51, "name": "Guatemala"},
    "HND": {"lat": 14.08, "lon": -87.22, "name": "Honduras"},
    "NIC": {"lat": 12.13, "lon": -86.25, "name": "Nicaragua"},
    "SLV": {"lat": 13.69, "lon": -89.19, "name": "El Salvador"},
    # Arctic/Nordic territories
    "GRL": {"lat": 64.18, "lon": -51.72, "name": "Greenland"},
    "ISL": {"lat": 64.15, "lon": -21.95, "name": "Iceland"},
    # Additional Pacific
    "FJI": {"lat": -18.14, "lon": 178.44, "name": "Fiji"},
    "PNG": {"lat": -6.21, "lon": 143.95, "name": "Papua New Guinea"},
    # Additional small countries
    "MDV": {"lat": 4.17, "lon": 73.51, "name": "Maldives"},
    "BHR": {"lat": 26.23, "lon": 50.58, "name": "Bahrain"},
    "LUX": {"lat": 49.61, "lon": 6.13, "name": "Luxembourg"},
    "MLT": {"lat": 35.90, "lon": 14.51, "name": "Malta"},
    "CYP": {"lat": 35.17, "lon": 33.36, "name": "Cyprus"},
    "MNE": {"lat": 42.44, "lon": 19.26, "name": "Montenegro"},
    "ALB": {"lat": 41.33, "lon": 19.82, "name": "Albania"},
    "MKD": {"lat": 42.00, "lon": 21.43, "name": "North Macedonia"},
    "BIH": {"lat": 43.86, "lon": 18.41, "name": "Bosnia and Herzegovina"},
    "SVN": {"lat": 46.05, "lon": 14.51, "name": "Slovenia"},
    "SVK": {"lat": 48.15, "lon": 17.11, "name": "Slovakia"},
}

# Models
class CountrySeasonData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    country_code: str
    country_name: str
    season_type: str  # peak, shoulder, off
    best_months: List[str]

class CountryVisaData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    country_code: str
    country_name: str
    visa_type: str  # visa_on_arrival, e_visa, visa_required
    requirements: Optional[str] = None

class AppRecommendation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    country_code: str
    country_name: str
    category: str  # transport, convenience, food, sightseeing
    app_name: str
    description: str
    icon_url: Optional[str] = None

class ForexRate(BaseModel):
    base_currency: str
    rates: Dict[str, float]
    last_updated: str

# Visa Eligibility Checker Models
class VisaEligibilityRequest(BaseModel):
    country: str
    age: int
    education: str  # high_school, bachelors, masters, phd
    monthly_income: float  # in INR
    travel_history: str  # none, domestic, few_international, many_international
    bank_balance: float  # in INR
    purpose: str  # tourism, business, study, work, medical, family_visit
    visa_type: str  # tourist, business, student, work, medical
    employment_status: str  # employed, self_employed, student, retired, unemployed

class VisaEligibilityResponse(BaseModel):
    approval_chance: int
    risk_level: str  # low, medium, high
    suggestions: List[str]
    strengths: List[str]
    documents_needed: List[str]

class DocumentChecklistRequest(BaseModel):
    country: str
    visa_type: str  # tourist, business, student, work, medical
    purpose: str

class DocumentChecklistResponse(BaseModel):
    country: str
    visa_type: str
    mandatory_documents: List[Dict[str, str]]
    supporting_documents: List[Dict[str, str]]
    tips: List[str]

class SaveDocumentChecklistRequest(BaseModel):
    country: str
    visa_type: str
    checklist: Dict  # Contains mandatory_documents, supporting_documents, tips
    checked_items: Dict  # Items user has checked off
    progress: int  # Progress percentage

# ===== USER AUTHENTICATION MODELS =====
class UserRegisterRequest(BaseModel):
    name: str
    email: str
    phone: str

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str
    created_at: str

class WishlistItem(BaseModel):
    country_code: str
    country_name: str
    added_at: Optional[str] = None

class VisaCheckResult(BaseModel):
    country: str
    visa_type: str
    approval_chance: int
    checked_at: str

class DocumentChecklistResult(BaseModel):
    country: str
    visa_type: str
    generated_at: str

# Initialize sample data on startup
@app.on_event("startup")
async def initialize_data():
    """Initialize production data for all collections - checks for completeness and reseeds if needed"""
    
    # Define expected minimum counts for complete data
    EXPECTED_COUNTS = {
        'seasons': 190,  # Should have ~199 countries with categories
        'visa': 190,     # Should have ~200 countries
        'safety': 60,    # Should have ~63 countries with safety tips
        'apps': 200,     # Should have ~238 apps
        'festivals': 100, # Should have ~117 festivals
        'dishes': 80,    # Should have ~90 dishes
        'plugs': 140     # Should have ~144 plugs
    }
    
    # Check and reseed seasons (with categories)
    season_count = await db.seasons.count_documents({})
    seasons_with_categories = await db.seasons.count_documents({"categories": {"$exists": True}})
    if season_count < EXPECTED_COUNTS['seasons'] or seasons_with_categories < 50:
        logging.info(f"Reseeding seasons: current={season_count}, with_categories={seasons_with_categories}")
        await db.seasons.drop()
        await db.seasons.insert_many(SEASONS_DATA)
        logging.info(f"Initialized {len(SEASONS_DATA)} seasons documents with categories")
    
    # Check and reseed visa
    visa_count = await db.visa.count_documents({})
    if visa_count < EXPECTED_COUNTS['visa']:
        logging.info(f"Reseeding visa: current={visa_count}")
        await db.visa.drop()
        await db.visa.insert_many(VISA_DATA)
        logging.info(f"Initialized {len(VISA_DATA)} visa documents")
    
    # Check and reseed safety (with safety_tips and areas_to_avoid)
    safety_count = await db.safety.count_documents({})
    safety_with_tips = await db.safety.count_documents({"safety_tips": {"$exists": True}})
    safety_with_areas = await db.safety.count_documents({"areas_to_avoid": {"$exists": True}})
    if safety_count < EXPECTED_COUNTS['safety'] or safety_with_tips < 30 or safety_with_areas < 30:
        logging.info(f"Reseeding safety: current={safety_count}, with_tips={safety_with_tips}, with_areas={safety_with_areas}")
        await db.safety.drop()
        await db.safety.insert_many(SAFETY_DATA)
        logging.info(f"Initialized {len(SAFETY_DATA)} safety documents")
    
    # Check and reseed apps
    apps_count = await db.apps.count_documents({})
    if apps_count < EXPECTED_COUNTS['apps']:
        logging.info(f"Reseeding apps: current={apps_count}")
        await db.apps.drop()
        await db.apps.insert_many(APPS_DATA)
        logging.info(f"Initialized {len(APPS_DATA)} apps documents")
    
    # Check and reseed festivals
    festivals_count = await db.festivals.count_documents({})
    if festivals_count < EXPECTED_COUNTS['festivals']:
        logging.info(f"Reseeding festivals: current={festivals_count}")
        await db.festivals.drop()
        await db.festivals.insert_many(FESTIVALS_DATA)
        logging.info(f"Initialized {len(FESTIVALS_DATA)} festivals documents")
    
    # Check and reseed dishes
    dishes_count = await db.dishes.count_documents({})
    if dishes_count < EXPECTED_COUNTS['dishes']:
        logging.info(f"Reseeding dishes: current={dishes_count}")
        await db.dishes.drop()
        await db.dishes.insert_many(DISHES_DATA)
        logging.info(f"Initialized {len(DISHES_DATA)} dishes documents")
    
    # Check and reseed plugs
    plugs_count = await db.plugs.count_documents({})
    if plugs_count < EXPECTED_COUNTS['plugs']:
        logging.info(f"Reseeding plugs: current={plugs_count}")
        await db.plugs.drop()
        await db.plugs.insert_many(PLUGS_DATA)
        logging.info(f"Initialized {len(PLUGS_DATA)} plugs documents")
    
    # Check and reseed blogs
    blogs_count = await db.blogs.count_documents({})
    if blogs_count < 5:
        logging.info(f"Reseeding blogs: current={blogs_count}")
        await db.blogs.drop()
        await db.blogs.insert_many(BLOGS_DATA)
        logging.info(f"Initialized {len(BLOGS_DATA)} blogs documents")
    
    logging.info("Data initialization check complete")

# Force reseed endpoint for production data refresh
@api_router.post("/admin/reseed")
async def force_reseed_data():
    """Force reseed all data - use this if production data is incomplete"""
    try:
        await db.seasons.drop()
        await db.seasons.insert_many(SEASONS_DATA)
        
        await db.visa.drop()
        await db.visa.insert_many(VISA_DATA)
        
        await db.safety.drop()
        await db.safety.insert_many(SAFETY_DATA)
        
        await db.apps.drop()
        await db.apps.insert_many(APPS_DATA)
        
        await db.festivals.drop()
        await db.festivals.insert_many(FESTIVALS_DATA)
        
        await db.dishes.drop()
        await db.dishes.insert_many(DISHES_DATA)
        
        await db.plugs.drop()
        await db.plugs.insert_many(PLUGS_DATA)
        
        await db.blogs.drop()
        await db.blogs.insert_many(BLOGS_DATA)
        
        return {
            "status": "success",
            "message": "All collections reseeded",
            "counts": {
                "seasons": len(SEASONS_DATA),
                "visa": len(VISA_DATA),
                "safety": len(SAFETY_DATA),
                "apps": len(APPS_DATA),
                "festivals": len(FESTIVALS_DATA),
                "dishes": len(DISHES_DATA),
                "plugs": len(PLUGS_DATA),
                "blogs": len(BLOGS_DATA)
            }
        }
    except Exception as e:
        logging.error(f"Reseed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Data status check endpoint
@api_router.get("/admin/status")
async def get_data_status():
    """Check current data status in database"""
    seasons_count = await db.seasons.count_documents({})
    seasons_with_categories = await db.seasons.count_documents({"categories": {"$exists": True}})
    visa_count = await db.visa.count_documents({})
    safety_count = await db.safety.count_documents({})
    safety_with_tips = await db.safety.count_documents({"safety_tips": {"$exists": True}})
    apps_count = await db.apps.count_documents({})
    festivals_count = await db.festivals.count_documents({})
    dishes_count = await db.dishes.count_documents({})
    plugs_count = await db.plugs.count_documents({})
    
    return {
        "seasons": {"count": seasons_count, "with_categories": seasons_with_categories, "expected": 199},
        "visa": {"count": visa_count, "expected": 200},
        "safety": {"count": safety_count, "with_tips": safety_with_tips, "expected": 63},
        "apps": {"count": apps_count, "expected": 238},
        "festivals": {"count": festivals_count, "expected": 117},
        "dishes": {"count": dishes_count, "expected": 90},
        "plugs": {"count": plugs_count, "expected": 144}
    }

# API Routes
@api_router.get("/seasons")
async def get_seasons():
    """Get all countries with season information"""
    seasons = await db.seasons.find({}, {"_id": 0}).to_list(1000)
    return {"data": seasons}

@api_router.get("/visa")
async def get_visa_info():
    """Get all countries with visa information"""
    visa_info = await db.visa.find({}, {"_id": 0}).to_list(1000)
    return {"data": visa_info}

@api_router.get("/forex/rates")
async def get_forex_rates():
    """Get live FOREX exchange rates for INR using Frankfurter API (free, no key required)"""
    major_currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "AED", "THB", "NZD"]
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Use Frankfurter API (free, no key required, reliable)
        try:
            url = f"{FRANKFURTER_BASE_URL}/latest?from=INR"
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            if "rates" in data:
                # Frankfurter returns rates as "how many X per 1 INR"
                filtered_rates = {k: v for k, v in data["rates"].items() if k in major_currencies}
                return {
                    "base_currency": "INR",
                    "rates": filtered_rates,
                    "last_updated": data.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
                    "source": "frankfurter",
                    "realtime": True
                }
        except Exception as e:
            logging.warning(f"Frankfurter API error: {e}, returning fallback data")
    
    # Fallback sample data - Updated rates (March 2026)
    logging.warning("All FOREX APIs failed, returning sample data")
    sample_rates = {
        "USD": 0.01089,   # 1 INR = 0.01089 USD (1 USD = ₹91.85)
        "EUR": 0.01005,   # 1 INR = 0.01005 EUR (1 EUR = ₹99.50)
        "GBP": 0.00861,   # 1 INR = 0.00861 GBP (1 GBP = ₹116.20)
        "JPY": 1.6234,    # 1 INR = 1.6234 JPY (1 JPY = ₹0.62)
        "AUD": 0.01678,   # 1 INR = 0.01678 AUD (1 AUD = ₹59.60)
        "CAD": 0.01520,   # 1 INR = 0.01520 CAD (1 CAD = ₹65.80)
        "CHF": 0.00958,   # 1 INR = 0.00958 CHF (1 CHF = ₹104.40)
        "CNY": 0.07910,   # 1 INR = 0.07910 CNY (1 CNY = ₹12.64)
        "SGD": 0.01468,   # 1 INR = 0.01468 SGD (1 SGD = ₹68.13)
        "AED": 0.04000,   # 1 INR = 0.04000 AED (1 AED = ₹25.00)
        "THB": 0.37415,   # 1 INR = 0.37415 THB (1 THB = ₹2.67)
        "NZD": 0.01852    # 1 INR = 0.01852 NZD (1 NZD = ₹54.00)
    }
    return {
        "base_currency": "INR",
        "rates": sample_rates,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "source": "fallback",
        "note": "Live APIs unavailable - using fallback data"
    }

@api_router.get("/apps")
async def get_apps(country_code: Optional[str] = None, category: Optional[str] = None):
    """Get app recommendations with optional filters"""
    query = {}
    if country_code:
        query["country_code"] = country_code.upper()
    if category:
        query["category"] = category.lower()
    
    apps = await db.apps.find(query, {"_id": 0}).to_list(1000)
    return {"data": apps}

@api_router.get("/countries")
async def get_all_countries():
    """Get list of all available countries"""
    seasons = await db.seasons.find({}, {"_id": 0, "country_code": 1, "country_name": 1}).to_list(1000)
    # Remove duplicates
    unique_countries = {}
    for country in seasons:
        code = country["country_code"]
        if code not in unique_countries:
            unique_countries[code] = country
    return {"data": list(unique_countries.values())}

@api_router.get("/country/{country_code}")
async def get_country_detail(country_code: str):
    """Get complete information for a specific country"""
    country_code = country_code.upper()
    
    # Get season data
    season = await db.seasons.find_one({"country_code": country_code}, {"_id": 0})
    
    # Get visa data
    visa = await db.visa.find_one({"country_code": country_code}, {"_id": 0})
    
    # Get apps for this country
    apps = await db.apps.find({"country_code": country_code}, {"_id": 0}).to_list(100)
    
    if not season and not visa:
        raise HTTPException(status_code=404, detail="Country not found")
    
    return {
        "season": season,
        "visa": visa,
        "apps": apps
    }

@api_router.get("/blogs")
async def get_blogs(category: Optional[str] = None):
    """Get all blog articles"""
    query = {}
    if category:
        query["category"] = category
    
    blogs = await db.blogs.find(query, {"_id": 0}).to_list(100)
    return {"data": blogs}

@api_router.get("/weather")
async def get_weather():
    """Get all countries with weather information from database"""
    weather_info = await db.weather.find({}, {"_id": 0}).to_list(1000)
    return {"data": weather_info}

@api_router.get("/weather/realtime")
async def get_realtime_weather(country_code: Optional[str] = None):
    """Get real-time weather for countries using Open-Meteo API (free, no key required)"""
    results = []
    
    # Define which countries to fetch
    countries_to_fetch = COUNTRY_CAPITALS
    if country_code:
        country_code = country_code.upper()
        if country_code in COUNTRY_CAPITALS:
            countries_to_fetch = {country_code: COUNTRY_CAPITALS[country_code]}
        else:
            raise HTTPException(status_code=404, detail=f"Country {country_code} not found")
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        for code, info in countries_to_fetch.items():
            try:
                # Use Open-Meteo API (free, no key required)
                url = f"{OPEN_METEO_BASE_URL}?latitude={info['lat']}&longitude={info['lon']}&current=temperature_2m,relative_humidity_2m,weather_code,precipitation&timezone=auto"
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    current = data.get("current", {})
                    temp = current.get("temperature_2m", 20)
                    humidity = current.get("relative_humidity_2m", 50)
                    weather_code = current.get("weather_code", 0)
                    precipitation = current.get("precipitation", 0)
                    
                    # WMO Weather interpretation codes
                    # 0: Clear, 1-3: Partly cloudy, 45-48: Fog, 51-67: Drizzle/Rain, 71-77: Snow, 80-82: Rain showers, 95-99: Thunderstorm
                    if weather_code >= 71 and weather_code <= 77:
                        weather_type = "snow"
                        description = "Snowy conditions"
                    elif weather_code >= 95:
                        weather_type = "rainy"
                        description = "Thunderstorm"
                    elif weather_code >= 51 or precipitation > 0.5:
                        weather_type = "rainy"
                        description = "Rainy conditions"
                    elif weather_code >= 45 and weather_code <= 48:
                        weather_type = "rainy"
                        description = "Foggy conditions"
                    elif temp > 35:
                        weather_type = "hot"
                        description = "Very hot weather"
                    elif temp > 28 and humidity < 40:
                        weather_type = "sandy"
                        description = "Hot and dry"
                    elif temp > 25:
                        weather_type = "hot"
                        description = "Warm weather"
                    elif temp < 5:
                        weather_type = "snow"
                        description = "Cold conditions"
                    else:
                        weather_type = "rainy"
                        description = "Mild conditions"
                    
                    # More descriptive weather based on code
                    if weather_code == 0:
                        description = "Clear sky"
                    elif weather_code <= 3:
                        description = "Partly cloudy"
                    
                    results.append({
                        "country_code": code,
                        "country_name": info["name"],
                        "weather_type": weather_type,
                        "avg_temp": f"{temp:.0f}°C",
                        "description": description,
                        "humidity": f"{humidity}%",
                        "realtime": True
                    })
            except Exception as e:
                logging.warning(f"Failed to fetch weather for {code}: {e}")
                continue
    
    if not results:
        # Fall back to database if API fails
        weather_info = await db.weather.find({}, {"_id": 0}).to_list(1000)
        return {"data": weather_info, "source": "database", "note": "Real-time API unavailable"}
    
    return {"data": results, "source": "open-meteo", "realtime": True}

@api_router.get("/plugs")
async def get_plugs():
    """Get all countries with power plug information"""
    plug_info = await db.plugs.find({}, {"_id": 0}).to_list(1000)
    return {"data": plug_info}

@api_router.get("/festivals")
async def get_festivals(month: Optional[int] = None, country_code: Optional[str] = None):
    """Get festival information with optional filters"""
    query = {}
    if month:
        query["month"] = month
    if country_code:
        query["country_code"] = country_code.upper()
    
    festivals = await db.festivals.find(query, {"_id": 0}).to_list(1000)
    return {"data": festivals}

@api_router.get("/dishes")
async def get_dishes(country_code: Optional[str] = None):
    """Get must-try local dishes by country"""
    query = {}
    if country_code:
        query["country_code"] = country_code.upper()
    
    dishes = await db.dishes.find(query, {"_id": 0}).to_list(1000)
    return {"data": dishes}

@api_router.get("/safety")
async def get_safety(country_code: Optional[str] = None):
    """Get safety ratings and emergency contacts by country"""
    query = {}
    if country_code:
        query["country_code"] = country_code.upper()
    
    safety_data = await db.safety.find(query, {"_id": 0}).to_list(1000)
    return {"data": safety_data}

# ===== VISA AI FEATURES =====

@api_router.post("/visa/eligibility-check")
async def check_visa_eligibility(request: VisaEligibilityRequest):
    """AI-powered visa eligibility checker"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
        # Create the AI chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"visa-check-{uuid.uuid4()}",
            system_message="""You are an expert visa consultant who helps Indian passport holders assess their visa approval chances. 
            Analyze the applicant's profile and provide:
            1. An approval chance percentage (0-100)
            2. Risk level (low/medium/high)
            3. Specific suggestions to improve their application
            4. Strengths in their profile
            5. Key documents they should prepare
            
            Be realistic but encouraging. Consider factors like:
            - Financial stability (bank balance should be 3-6 months of expenses + trip costs)
            - Travel history (previous visas increase chances)
            - Strong ties to home country (employment, property)
            - Clear purpose of visit
            - Appropriate visa type for stated purpose
            
            Respond ONLY in valid JSON format with this structure:
            {
                "approval_chance": <number 0-100>,
                "risk_level": "<low|medium|high>",
                "suggestions": ["suggestion1", "suggestion2", ...],
                "strengths": ["strength1", "strength2", ...],
                "documents_needed": ["document1", "document2", ...]
            }"""
        ).with_model("openai", "gpt-5.2")
        
        # Format the request data
        profile_text = f"""
        Visa Application Profile for Indian Passport Holder:
        - Destination Country: {request.country}
        - Age: {request.age} years
        - Education: {request.education}
        - Monthly Income: ₹{request.monthly_income:,.0f}
        - Bank Balance: ₹{request.bank_balance:,.0f}
        - Travel History: {request.travel_history}
        - Purpose of Visit: {request.purpose}
        - Visa Type: {request.visa_type}
        - Employment Status: {request.employment_status}
        
        Please analyze this profile and provide visa approval assessment.
        """
        
        user_message = UserMessage(text=profile_text)
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        import json
        # Clean the response - remove markdown code blocks if present
        response_text = response.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        
        return {
            "success": True,
            "country": request.country,
            "visa_type": request.visa_type,
            "approval_chance": result.get("approval_chance", 50),
            "risk_level": result.get("risk_level", "medium"),
            "suggestions": result.get("suggestions", []),
            "strengths": result.get("strengths", []),
            "documents_needed": result.get("documents_needed", [])
        }
        
    except json.JSONDecodeError as e:
        logging.error(f"JSON parse error: {e}, response: {response}")
        # Return a default response if JSON parsing fails
        return {
            "success": True,
            "country": request.country,
            "visa_type": request.visa_type,
            "approval_chance": 60,
            "risk_level": "medium",
            "suggestions": [
                "Maintain bank balance for at least 3 months before applying",
                "Provide strong proof of ties to India (employment letter, property documents)",
                "Show clear travel itinerary with hotel bookings",
                "Get travel insurance covering the entire trip duration"
            ],
            "strengths": ["Application received for analysis"],
            "documents_needed": [
                "Valid passport with 6+ months validity",
                "Bank statements (last 6 months)",
                "Employment/Income proof",
                "Travel insurance",
                "Flight and hotel bookings"
            ]
        }
    except Exception as e:
        logging.error(f"Visa eligibility check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/visa/document-checklist")
async def generate_document_checklist(request: DocumentChecklistRequest):
    """AI-powered document checklist generator"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
        # Create the AI chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"docs-check-{uuid.uuid4()}",
            system_message="""You are an expert visa documentation consultant for Indian passport holders.
            Generate a comprehensive document checklist for visa applications.
            
            Categorize documents as:
            1. Mandatory Documents - Absolutely required, application will be rejected without these
            2. Supporting Documents - Strengthen the application, highly recommended
            
            For each document, provide:
            - name: Document name
            - description: Brief description of what's needed
            - tip: Specific tip for Indian applicants
            
            Also provide general tips for the specific country and visa type.
            
            Respond ONLY in valid JSON format with this structure:
            {
                "mandatory_documents": [
                    {"name": "...", "description": "...", "tip": "..."},
                    ...
                ],
                "supporting_documents": [
                    {"name": "...", "description": "...", "tip": "..."},
                    ...
                ],
                "tips": ["tip1", "tip2", ...]
            }"""
        ).with_model("openai", "gpt-5.2")
        
        # Format the request
        request_text = f"""
        Generate a document checklist for:
        - Destination Country: {request.country}
        - Visa Type: {request.visa_type}
        - Purpose of Visit: {request.purpose}
        - Applicant Nationality: Indian
        
        Provide a comprehensive checklist tailored to Indian passport holders applying for this visa.
        """
        
        user_message = UserMessage(text=request_text)
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        import json
        response_text = response.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        
        return {
            "success": True,
            "country": request.country,
            "visa_type": request.visa_type,
            "mandatory_documents": result.get("mandatory_documents", []),
            "supporting_documents": result.get("supporting_documents", []),
            "tips": result.get("tips", [])
        }
        
    except json.JSONDecodeError as e:
        logging.error(f"JSON parse error: {e}")
        # Return default checklist based on visa type
        default_mandatory = [
            {"name": "Valid Passport", "description": "Original passport with 6+ months validity and 2 blank pages", "tip": "Check passport validity before starting application"},
            {"name": "Visa Application Form", "description": "Completed and signed application form", "tip": "Fill in BLOCK LETTERS, use black ink"},
            {"name": "Passport Photos", "description": "Recent passport-size photographs as per specifications", "tip": "White background, no glasses, 35x45mm for most countries"},
            {"name": "Bank Statements", "description": "Last 6 months bank statements", "tip": "Get statements stamped by bank, maintain healthy balance"},
            {"name": "Cover Letter", "description": "Letter explaining purpose of visit", "tip": "Be clear and concise about your travel plans"}
        ]
        
        default_supporting = [
            {"name": "Travel Insurance", "description": "Coverage for medical emergencies and trip cancellation", "tip": "Minimum coverage of $50,000 recommended"},
            {"name": "Flight Itinerary", "description": "Confirmed or tentative flight bookings", "tip": "Some embassies accept tentative bookings"},
            {"name": "Hotel Reservations", "description": "Accommodation bookings for entire stay", "tip": "Use bookings with free cancellation"},
            {"name": "Income Tax Returns", "description": "ITR for last 2-3 years", "tip": "Shows financial stability and tax compliance"},
            {"name": "Employment Letter", "description": "Letter from employer confirming job and leave approval", "tip": "Include salary, designation, and leave dates"}
        ]
        
        return {
            "success": True,
            "country": request.country,
            "visa_type": request.visa_type,
            "mandatory_documents": default_mandatory,
            "supporting_documents": default_supporting,
            "tips": [
                "Apply at least 3-4 weeks before travel date",
                "Keep all documents organized in a folder",
                "Make photocopies of all documents",
                "Be honest in your application - discrepancies can lead to rejection"
            ]
        }
    except Exception as e:
        logging.error(f"Document checklist error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===== USER AUTHENTICATION ENDPOINTS =====

@api_router.post("/auth/register")
async def register_user(request: UserRegisterRequest):
    """Register a new user or return existing user if email exists"""
    email = request.email.lower().strip()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    if existing_user:
        return existing_user
    
    # Create new user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "name": request.name.strip(),
        "email": email,
        "phone": request.phone.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "wishlist": [],
        "visa_checks": [],
        "document_checklists": []
    }
    
    await db.users.insert_one(user_doc)
    
    # Return without _id
    return {
        "user_id": user_id,
        "name": user_doc["name"],
        "email": user_doc["email"],
        "phone": user_doc["phone"],
        "created_at": user_doc["created_at"]
    }


@api_router.get("/auth/user/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@api_router.put("/auth/user/{user_id}")
async def update_user(user_id: str, request: UserUpdateRequest):
    """Update user details"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    if request.name:
        update_data["name"] = request.name.strip()
    if request.email:
        update_data["email"] = request.email.lower().strip()
    if request.phone:
        update_data["phone"] = request.phone.strip()
    
    if update_data:
        await db.users.update_one({"user_id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return updated_user


@api_router.delete("/auth/user/{user_id}")
async def delete_user(user_id: str):
    """Delete user and all their data"""
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


# ===== USER WISHLIST ENDPOINTS =====

@api_router.get("/user/{user_id}/wishlist")
async def get_user_wishlist(user_id: str):
    """Get user's wishlist"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "wishlist": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"data": user.get("wishlist", [])}


@api_router.post("/user/{user_id}/wishlist")
async def add_to_wishlist(user_id: str, item: WishlistItem):
    """Add country to user's wishlist"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    wishlist = user.get("wishlist", [])
    
    # Check if already in wishlist
    if any(w["country_code"] == item.country_code for w in wishlist):
        return {"message": "Already in wishlist", "wishlist": wishlist}
    
    new_item = {
        "country_code": item.country_code,
        "country_name": item.country_name,
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$push": {"wishlist": new_item}}
    )
    
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "wishlist": 1})
    return {"message": "Added to wishlist", "wishlist": updated_user.get("wishlist", [])}


@api_router.delete("/user/{user_id}/wishlist/{country_code}")
async def remove_from_wishlist(user_id: str, country_code: str):
    """Remove country from user's wishlist"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$pull": {"wishlist": {"country_code": country_code.upper()}}}
    )
    
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "wishlist": 1})
    return {"message": "Removed from wishlist", "wishlist": updated_user.get("wishlist", [])}


# ===== USER VISA CHECKS HISTORY =====

@api_router.get("/user/{user_id}/visa-checks")
async def get_user_visa_checks(user_id: str):
    """Get user's visa eligibility check history"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "visa_checks": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"data": user.get("visa_checks", [])}


@api_router.post("/user/{user_id}/visa-checks")
async def save_visa_check(user_id: str, result: VisaCheckResult):
    """Save a visa eligibility check result"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    check_entry = {
        "country": result.country,
        "visa_type": result.visa_type,
        "approval_chance": result.approval_chance,
        "checked_at": result.checked_at or datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$push": {"visa_checks": check_entry}}
    )
    
    return {"message": "Visa check saved"}


@api_router.delete("/user/{user_id}/visa-checks")
async def clear_visa_checks(user_id: str):
    """Clear user's visa check history"""
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"visa_checks": []}}
    )
    return {"message": "Visa check history cleared"}


# ===== USER DOCUMENT CHECKLISTS HISTORY =====

@api_router.get("/user/{user_id}/document-checklists")
async def get_user_document_checklists(user_id: str):
    """Get user's document checklist history"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "document_checklists": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"data": user.get("document_checklists", [])}


@api_router.post("/user/{user_id}/document-checklists")
async def save_document_checklist(user_id: str, request: SaveDocumentChecklistRequest):
    """Save a document checklist with progress"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    checklist_entry = {
        "id": str(uuid.uuid4()),
        "country": request.country,
        "visa_type": request.visa_type,
        "checklist": request.checklist,
        "checked_items": request.checked_items,
        "progress": request.progress,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$push": {"document_checklists": checklist_entry}}
    )
    
    return {"message": "Document checklist saved", "id": checklist_entry["id"]}


@api_router.delete("/user/{user_id}/document-checklists")
async def clear_document_checklists(user_id: str):
    """Clear user's document checklist history"""
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"document_checklists": []}}
    )
    return {"message": "Document checklist history cleared"}


@api_router.put("/user/{user_id}/document-checklists/{checklist_id}")
async def update_document_checklist(user_id: str, checklist_id: str, request: SaveDocumentChecklistRequest):
    """Update a specific document checklist"""
    result = await db.users.update_one(
        {"user_id": user_id, "document_checklists.id": checklist_id},
        {"$set": {
            "document_checklists.$.checked_items": request.checked_items,
            "document_checklists.$.progress": request.progress,
            "document_checklists.$.updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    return {"message": "Checklist updated"}


@api_router.delete("/user/{user_id}/document-checklists/{checklist_id}")
async def delete_document_checklist(user_id: str, checklist_id: str):
    """Delete a specific document checklist"""
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$pull": {"document_checklists": {"id": checklist_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    return {"message": "Checklist deleted"}


# ========== TRAVEL CHATBOT ENDPOINT ==========
class ChatMessage(BaseModel):
    message: str
    country: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Tourist places data for countries
TOURIST_PLACES = {
    "JPN": {
        "beach": ["Okinawa Islands", "Miyako Island", "Ishigaki Island"],
        "mountain": ["Mount Fuji", "Japanese Alps", "Mount Takao"],
        "culture": ["Kyoto Temples", "Nara Deer Park", "Hiroshima Peace Memorial"],
        "city": ["Tokyo", "Osaka", "Yokohama"]
    },
    "THA": {
        "beach": ["Phuket", "Krabi", "Koh Samui"],
        "mountain": ["Doi Inthanon", "Chiang Mai Mountains", "Khao Sok"],
        "culture": ["Grand Palace Bangkok", "Ayutthaya", "Chiang Rai Temples"],
        "city": ["Bangkok", "Chiang Mai", "Pattaya"]
    },
    "ITA": {
        "beach": ["Amalfi Coast", "Sardinia", "Cinque Terre"],
        "mountain": ["Dolomites", "Italian Alps", "Mount Etna"],
        "culture": ["Rome Colosseum", "Florence", "Venice"],
        "city": ["Rome", "Milan", "Naples"]
    },
    "FRA": {
        "beach": ["French Riviera", "Corsica", "Biarritz"],
        "mountain": ["French Alps", "Mont Blanc", "Pyrenees"],
        "culture": ["Louvre Paris", "Versailles", "Mont Saint-Michel"],
        "city": ["Paris", "Nice", "Lyon"]
    },
    "ESP": {
        "beach": ["Costa Brava", "Ibiza", "Canary Islands"],
        "mountain": ["Sierra Nevada", "Pyrenees", "Picos de Europa"],
        "culture": ["Alhambra Granada", "Sagrada Familia", "Toledo"],
        "city": ["Barcelona", "Madrid", "Seville"]
    },
    "USA": {
        "beach": ["Miami Beach", "Hawaii", "California Coast"],
        "mountain": ["Rocky Mountains", "Grand Canyon", "Yosemite"],
        "culture": ["Smithsonian DC", "New Orleans", "Santa Fe"],
        "city": ["New York", "Los Angeles", "San Francisco"]
    },
    "IND": {
        "beach": ["Goa", "Kerala Backwaters", "Andaman Islands"],
        "mountain": ["Himalayas", "Ladakh", "Manali"],
        "culture": ["Taj Mahal", "Varanasi", "Jaipur"],
        "city": ["Mumbai", "Delhi", "Bangalore"]
    },
    "AUS": {
        "beach": ["Gold Coast", "Bondi Beach", "Great Barrier Reef"],
        "mountain": ["Blue Mountains", "Cradle Mountain", "Uluru"],
        "culture": ["Sydney Opera House", "Aboriginal Heritage", "Melbourne Arts"],
        "city": ["Sydney", "Melbourne", "Brisbane"]
    },
    "GRC": {
        "beach": ["Santorini", "Mykonos", "Crete"],
        "mountain": ["Mount Olympus", "Meteora", "Samaria Gorge"],
        "culture": ["Acropolis Athens", "Delphi", "Ancient Olympia"],
        "city": ["Athens", "Thessaloniki", "Rhodes"]
    },
    "MEX": {
        "beach": ["Cancun", "Playa del Carmen", "Los Cabos"],
        "mountain": ["Copper Canyon", "Sierra Madre", "Nevado de Toluca"],
        "culture": ["Chichen Itza", "Teotihuacan", "Oaxaca"],
        "city": ["Mexico City", "Guadalajara", "Monterrey"]
    },
    "BRA": {
        "beach": ["Copacabana", "Fernando de Noronha", "Florianopolis"],
        "mountain": ["Serra dos Órgãos", "Chapada Diamantina", "Itatiaia"],
        "culture": ["Christ the Redeemer", "Salvador Pelourinho", "Ouro Preto"],
        "city": ["Rio de Janeiro", "São Paulo", "Brasília"]
    },
    "IDN": {
        "beach": ["Bali Beaches", "Gili Islands", "Raja Ampat"],
        "mountain": ["Mount Bromo", "Mount Rinjani", "Kawah Ijen"],
        "culture": ["Borobudur Temple", "Ubud", "Yogyakarta"],
        "city": ["Jakarta", "Bali", "Bandung"]
    },
    "VNM": {
        "beach": ["Ha Long Bay", "Phu Quoc", "Nha Trang"],
        "mountain": ["Sapa", "Dalat", "Fansipan"],
        "culture": ["Hoi An", "Hue Imperial City", "Cu Chi Tunnels"],
        "city": ["Ho Chi Minh City", "Hanoi", "Da Nang"]
    },
    "TUR": {
        "beach": ["Antalya", "Bodrum", "Fethiye"],
        "mountain": ["Cappadocia", "Mount Ararat", "Pamukkale"],
        "culture": ["Hagia Sophia", "Ephesus", "Troy"],
        "city": ["Istanbul", "Ankara", "Izmir"]
    },
    "EGY": {
        "beach": ["Sharm El Sheikh", "Hurghada", "Red Sea"],
        "mountain": ["Mount Sinai", "Western Desert", "White Desert"],
        "culture": ["Pyramids of Giza", "Luxor Temple", "Valley of Kings"],
        "city": ["Cairo", "Alexandria", "Aswan"]
    },
    "UAE": {
        "beach": ["Jumeirah Beach", "Abu Dhabi Corniche", "Fujairah"],
        "mountain": ["Jebel Jais", "Hatta Mountains", "Al Hajar"],
        "culture": ["Sheikh Zayed Mosque", "Dubai Old Town", "Sharjah Heritage"],
        "city": ["Dubai", "Abu Dhabi", "Sharjah"]
    },
    "NZL": {
        "beach": ["Bay of Islands", "Abel Tasman", "Coromandel"],
        "mountain": ["Milford Sound", "Mount Cook", "Tongariro"],
        "culture": ["Maori Heritage", "Hobbiton", "Wellington Museums"],
        "city": ["Auckland", "Wellington", "Queenstown"]
    },
    "ZAF": {
        "beach": ["Cape Town Beaches", "Durban", "Garden Route"],
        "mountain": ["Table Mountain", "Drakensberg", "Blyde River Canyon"],
        "culture": ["Robben Island", "Apartheid Museum", "Cape Malay Quarter"],
        "city": ["Cape Town", "Johannesburg", "Durban"]
    },
    "CHE": {
        "beach": ["Lake Geneva", "Lake Zurich", "Lake Lucerne"],
        "mountain": ["Matterhorn", "Jungfrau", "Swiss Alps"],
        "culture": ["Old Town Bern", "Lucerne", "Zurich Museums"],
        "city": ["Zurich", "Geneva", "Bern"]
    },
    "PRT": {
        "beach": ["Algarve", "Nazaré", "Madeira"],
        "mountain": ["Serra da Estrela", "Peneda-Gerês", "Sintra Hills"],
        "culture": ["Lisbon Belém", "Porto Ribeira", "Évora"],
        "city": ["Lisbon", "Porto", "Faro"]
    }
}

# Default tourist places for countries not in the list
DEFAULT_TOURIST_PLACES = {
    "beach": ["Coastal Areas", "Beach Resorts", "Island Getaways"],
    "mountain": ["Mountain Ranges", "Hill Stations", "Nature Parks"],
    "culture": ["Historic Sites", "Museums", "Traditional Villages"],
    "city": ["Capital City", "Major Urban Centers", "Cultural Hubs"]
}


@api_router.get("/tourist-places/{country_code}")
async def get_tourist_places(country_code: str):
    """Get tourist places for a country categorized by type"""
    places = TOURIST_PLACES.get(country_code, DEFAULT_TOURIST_PLACES)
    return {"country_code": country_code, "places": places}


@api_router.post("/chat", response_model=ChatResponse)
async def travel_chat(chat_msg: ChatMessage):
    """AI-powered travel chatbot for country-specific questions"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    session_id = chat_msg.session_id or str(uuid.uuid4())
    
    try:
        # Create AI chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=f"""You are Travito, a friendly and knowledgeable travel assistant specializing in {chat_msg.country}. 
            
Your role is to help Indian travelers plan their trip to {chat_msg.country}. You should:
- Provide accurate, helpful information about tourist attractions, local customs, food, transportation, and travel tips
- Give practical advice considering the traveler is from India (visa requirements, currency exchange, time zones)
- Be concise but informative - keep responses under 150 words unless detailed information is needed
- Use a friendly, enthusiastic tone
- If asked about something unrelated to travel, politely redirect to travel topics
- Include specific recommendations when possible (restaurant names, specific attractions, etc.)

Focus on being helpful and making the traveler feel confident about their trip to {chat_msg.country}."""
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=chat_msg.message)
        response = await chat.send_message(user_message)
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get response: {str(e)}")


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()