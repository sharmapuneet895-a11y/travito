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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# FOREX API configuration
FOREX_API_KEY = "4c80c30afeadb2fb5bd13e82"
FOREX_BASE_URL = "https://v6.exchangerate-api.com/v6"

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

# Initialize sample data on startup
@app.on_event("startup")
async def initialize_data():
    """Initialize sample data for countries, visa info, and apps"""
    
    # Check if data already exists
    season_count = await db.seasons.count_documents({})
    if season_count == 0:
        # Sample season data
        seasons_data = [
            {"country_code": "USA", "country_name": "United States", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
            {"country_code": "GBR", "country_name": "United Kingdom", "season_type": "shoulder", "best_months": ["May", "Sep"]},
            {"country_code": "FRA", "country_name": "France", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
            {"country_code": "DEU", "country_name": "Germany", "season_type": "shoulder", "best_months": ["May", "Sep", "Oct"]},
            {"country_code": "ITA", "country_name": "Italy", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
            {"country_code": "ESP", "country_name": "Spain", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
            {"country_code": "CHN", "country_name": "China", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
            {"country_code": "JPN", "country_name": "Japan", "season_type": "peak", "best_months": ["Mar", "Apr", "Oct", "Nov"]},
            {"country_code": "THA", "country_name": "Thailand", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
            {"country_code": "SGP", "country_name": "Singapore", "season_type": "shoulder", "best_months": ["Feb", "Mar", "Jul", "Aug"]},
            {"country_code": "ARE", "country_name": "United Arab Emirates", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
            {"country_code": "AUS", "country_name": "Australia", "season_type": "peak", "best_months": ["Dec", "Jan", "Feb"]},
            {"country_code": "CAN", "country_name": "Canada", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
            {"country_code": "BRA", "country_name": "Brazil", "season_type": "off", "best_months": ["Apr", "May", "Sep", "Oct"]},
            {"country_code": "ZAF", "country_name": "South Africa", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep", "Oct"]},
            {"country_code": "NZL", "country_name": "New Zealand", "season_type": "peak", "best_months": ["Dec", "Jan", "Feb"]},
            {"country_code": "CHE", "country_name": "Switzerland", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug", "Dec"]},
            {"country_code": "AUT", "country_name": "Austria", "season_type": "shoulder", "best_months": ["May", "Sep", "Dec"]},
            {"country_code": "NLD", "country_name": "Netherlands", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep"]},
            {"country_code": "GRC", "country_name": "Greece", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]}
        ]
        await db.seasons.insert_many(seasons_data)
        
        # Sample visa data
        visa_data = [
            {"country_code": "USA", "country_name": "United States", "visa_type": "visa_required", "requirements": "B1/B2 Tourist Visa"},
            {"country_code": "GBR", "country_name": "United Kingdom", "visa_type": "visa_required", "requirements": "Standard Visitor Visa"},
            {"country_code": "FRA", "country_name": "France", "visa_type": "visa_required", "requirements": "Schengen Visa"},
            {"country_code": "DEU", "country_name": "Germany", "visa_type": "visa_required", "requirements": "Schengen Visa"},
            {"country_code": "ITA", "country_name": "Italy", "visa_type": "visa_required", "requirements": "Schengen Visa"},
            {"country_code": "ESP", "country_name": "Spain", "visa_type": "visa_required", "requirements": "Schengen Visa"},
            {"country_code": "CHN", "country_name": "China", "visa_type": "visa_required", "requirements": "Tourist Visa L"},
            {"country_code": "JPN", "country_name": "Japan", "visa_type": "visa_required", "requirements": "Tourist Visa"},
            {"country_code": "THA", "country_name": "Thailand", "visa_type": "visa_on_arrival", "requirements": "15 days visa on arrival"},
            {"country_code": "SGP", "country_name": "Singapore", "visa_type": "e_visa", "requirements": "30 days e-visa"},
            {"country_code": "ARE", "country_name": "United Arab Emirates", "visa_type": "visa_on_arrival", "requirements": "14 days visa on arrival"},
            {"country_code": "AUS", "country_name": "Australia", "visa_type": "e_visa", "requirements": "ETA Electronic Visa"},
            {"country_code": "CAN", "country_name": "Canada", "visa_type": "visa_required", "requirements": "Visitor Visa"},
            {"country_code": "BRA", "country_name": "Brazil", "visa_type": "e_visa", "requirements": "e-Visa available"},
            {"country_code": "ZAF", "country_name": "South Africa", "visa_type": "e_visa", "requirements": "e-Visa available"},
            {"country_code": "NZL", "country_name": "New Zealand", "visa_type": "e_visa", "requirements": "NZeTA required"},
            {"country_code": "CHE", "country_name": "Switzerland", "visa_type": "visa_required", "requirements": "Schengen Visa"},
            {"country_code": "AUT", "country_name": "Austria", "visa_type": "visa_required", "requirements": "Schengen Visa"},
            {"country_code": "NLD", "country_name": "Netherlands", "visa_type": "visa_required", "requirements": "Schengen Visa"},
            {"country_code": "GRC", "country_name": "Greece", "visa_type": "visa_required", "requirements": "Schengen Visa"}
        ]
        await db.visa.insert_many(visa_data)
        
        # Sample app recommendations
        apps_data = [
            # USA
            {"country_code": "USA", "country_name": "United States", "category": "transport", "app_name": "Uber", "description": "Ride-sharing service", "icon_url": None},
            {"country_code": "USA", "country_name": "United States", "category": "convenience", "app_name": "Amazon", "description": "Shopping & delivery", "icon_url": None},
            {"country_code": "USA", "country_name": "United States", "category": "food", "app_name": "DoorDash", "description": "Food delivery", "icon_url": None},
            {"country_code": "USA", "country_name": "United States", "category": "sightseeing", "app_name": "TripAdvisor", "description": "Travel guide", "icon_url": None},
            # UK
            {"country_code": "GBR", "country_name": "United Kingdom", "category": "transport", "app_name": "Citymapper", "description": "Public transport navigation", "icon_url": None},
            {"country_code": "GBR", "country_name": "United Kingdom", "category": "convenience", "app_name": "Revolut", "description": "Digital banking", "icon_url": None},
            {"country_code": "GBR", "country_name": "United Kingdom", "category": "food", "app_name": "Deliveroo", "description": "Food delivery", "icon_url": None},
            {"country_code": "GBR", "country_name": "United Kingdom", "category": "sightseeing", "app_name": "Visit Britain", "description": "Tourism guide", "icon_url": None},
            # Japan
            {"country_code": "JPN", "country_name": "Japan", "category": "transport", "app_name": "Hyperdia", "description": "Train schedules", "icon_url": None},
            {"country_code": "JPN", "country_name": "Japan", "category": "convenience", "app_name": "PayPay", "description": "Mobile payment", "icon_url": None},
            {"country_code": "JPN", "country_name": "Japan", "category": "food", "app_name": "Tabelog", "description": "Restaurant reviews", "icon_url": None},
            {"country_code": "JPN", "country_name": "Japan", "category": "sightseeing", "app_name": "JNTO Guide", "description": "Official travel guide", "icon_url": None},
            # Thailand
            {"country_code": "THA", "country_name": "Thailand", "category": "transport", "app_name": "Grab", "description": "Ride-hailing", "icon_url": None},
            {"country_code": "THA", "country_name": "Thailand", "category": "convenience", "app_name": "Line", "description": "Messaging & payments", "icon_url": None},
            {"country_code": "THA", "country_name": "Thailand", "category": "food", "app_name": "Foodpanda", "description": "Food delivery", "icon_url": None},
            {"country_code": "THA", "country_name": "Thailand", "category": "sightseeing", "app_name": "Amazing Thailand", "description": "Tourism guide", "icon_url": None},
            # Singapore
            {"country_code": "SGP", "country_name": "Singapore", "category": "transport", "app_name": "MyTransport.SG", "description": "Public transport", "icon_url": None},
            {"country_code": "SGP", "country_name": "Singapore", "category": "convenience", "app_name": "GrabPay", "description": "Digital wallet", "icon_url": None},
            {"country_code": "SGP", "country_name": "Singapore", "category": "food", "app_name": "GrabFood", "description": "Food delivery", "icon_url": None},
            {"country_code": "SGP", "country_name": "Singapore", "category": "sightseeing", "app_name": "Visit Singapore", "description": "Official guide", "icon_url": None},
            # UAE
            {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "transport", "app_name": "Careem", "description": "Ride-hailing", "icon_url": None},
            {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "convenience", "app_name": "Noon", "description": "E-commerce", "icon_url": None},
            {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "food", "app_name": "Talabat", "description": "Food delivery", "icon_url": None},
            {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "sightseeing", "app_name": "Visit Dubai", "description": "Tourism guide", "icon_url": None}
        ]
        await db.apps.insert_many(apps_data)
        
        logging.info("Sample data initialized successfully")

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
    """Get live FOREX exchange rates for INR"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = f"{FOREX_BASE_URL}/{FOREX_API_KEY}/latest/INR"
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get("result") != "success":
                raise HTTPException(status_code=503, detail="FOREX API error")
            
            # Filter to major currencies
            major_currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "AED", "THB", "NZD"]
            filtered_rates = {k: v for k, v in data["conversion_rates"].items() if k in major_currencies}
            
            return {
                "base_currency": "INR",
                "rates": filtered_rates,
                "last_updated": data.get("time_last_update_utc", "")
            }
    except Exception as e:
        logging.warning(f"FOREX API error: {e}, returning sample data")
        # Fallback to sample data when API is unavailable
        sample_rates = {
            "USD": 0.012024,
            "EUR": 0.011083,
            "GBP": 0.009523,
            "JPY": 1.803412,
            "AUD": 0.018335,
            "CAD": 0.016322,
            "CHF": 0.010654,
            "CNY": 0.086523,
            "SGD": 0.016123,
            "AED": 0.044152,
            "THB": 0.415234,
            "NZD": 0.019876
        }
        return {
            "base_currency": "INR",
            "rates": sample_rates,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "note": "Sample data - Live API unavailable"
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