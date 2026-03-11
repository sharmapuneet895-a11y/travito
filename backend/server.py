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

# OpenWeatherMap API configuration for real-time weather
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

# Open-Meteo API (free, no key required) - used as primary for weather
OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"

# FOREX API configuration
FOREX_API_KEY = "4c80c30afeadb2fb5bd13e82"
FOREX_BASE_URL = "https://v6.exchangerate-api.com/v6"

# Frankfurter API (free, no key required) - used as fallback for FOREX
FRANKFURTER_BASE_URL = "https://api.frankfurter.app"

# Country capital coordinates for weather lookup
COUNTRY_CAPITALS = {
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
    """Get live FOREX exchange rates for INR using multiple API sources"""
    major_currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "AED", "THB", "NZD"]
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Try ExchangeRate-API first
        try:
            url = f"{FOREX_BASE_URL}/{FOREX_API_KEY}/latest/INR"
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get("result") == "success":
                filtered_rates = {k: v for k, v in data["conversion_rates"].items() if k in major_currencies}
                return {
                    "base_currency": "INR",
                    "rates": filtered_rates,
                    "last_updated": data.get("time_last_update_utc", ""),
                    "source": "exchangerate-api",
                    "realtime": True
                }
        except Exception as e:
            logging.warning(f"ExchangeRate-API error: {e}, trying Frankfurter API")
        
        # Try Frankfurter API as fallback (free, no key required)
        try:
            # Frankfurter API uses EUR as base, so we need to convert
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