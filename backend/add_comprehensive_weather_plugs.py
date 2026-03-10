from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime

async def add_comprehensive_weather_plug_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Current month for real-time weather (January = winter in Northern Hemisphere, summer in Southern)
    current_month = datetime.now().month  # January = 1
    
    # Comprehensive weather data (120+ countries) - Real-time for January
    weather_data = [
        # Hot weather countries (currently experiencing summer or tropical heat)
        {"country_code": "AUS", "country_name": "Australia", "weather_type": "hot", "avg_temp": "30°C", "description": "Summer - hot and dry", "current_conditions": "Peak summer heat"},
        {"country_code": "NZL", "country_name": "New Zealand", "weather_type": "hot", "avg_temp": "24°C", "description": "Summer season", "current_conditions": "Warm summer weather"},
        {"country_code": "ARG", "country_name": "Argentina", "weather_type": "hot", "avg_temp": "28°C", "description": "Summer in Southern Hemisphere", "current_conditions": "Hot summer"},
        {"country_code": "BRA", "country_name": "Brazil", "weather_type": "hot", "avg_temp": "32°C", "description": "Peak summer heat", "current_conditions": "Very hot and humid"},
        {"country_code": "CHL", "country_name": "Chile", "weather_type": "hot", "avg_temp": "26°C", "description": "Summer season", "current_conditions": "Warm and dry"},
        {"country_code": "ZAF", "country_name": "South Africa", "weather_type": "hot", "avg_temp": "28°C", "description": "Summer heat", "current_conditions": "Hot and sunny"},
        
        # Tropical hot (year-round)
        {"country_code": "ARE", "country_name": "United Arab Emirates", "weather_type": "hot", "avg_temp": "24°C", "description": "Pleasant winter", "current_conditions": "Mild and comfortable"},
        {"country_code": "SAU", "country_name": "Saudi Arabia", "weather_type": "hot", "avg_temp": "20°C", "description": "Cool winter", "current_conditions": "Comfortable temperatures"},
        {"country_code": "QAT", "country_name": "Qatar", "weather_type": "hot", "avg_temp": "22°C", "description": "Mild winter", "current_conditions": "Pleasant weather"},
        {"country_code": "IND", "country_name": "India", "weather_type": "hot", "avg_temp": "22°C", "description": "Cool winter", "current_conditions": "Pleasant winter"},
        {"country_code": "THA", "country_name": "Thailand", "weather_type": "hot", "avg_temp": "32°C", "description": "Hot and dry", "current_conditions": "Peak tourist season"},
        {"country_code": "SGP", "country_name": "Singapore", "weather_type": "hot", "avg_temp": "31°C", "description": "Hot tropical", "current_conditions": "Hot and humid"},
        {"country_code": "MYS", "country_name": "Malaysia", "weather_type": "hot", "avg_temp": "30°C", "description": "Tropical hot", "current_conditions": "Hot and humid"},
        {"country_code": "IDN", "country_name": "Indonesia", "weather_type": "hot", "avg_temp": "29°C", "description": "Hot tropical", "current_conditions": "Hot with rain"},
        {"country_code": "PHL", "country_name": "Philippines", "weather_type": "hot", "avg_temp": "28°C", "description": "Warm tropical", "current_conditions": "Warm and dry"},
        {"country_code": "VNM", "country_name": "Vietnam", "weather_type": "hot", "avg_temp": "26°C", "description": "Cool in north", "current_conditions": "Mixed temperatures"},
        {"country_code": "MEX", "country_name": "Mexico", "weather_type": "hot", "avg_temp": "25°C", "description": "Warm and dry", "current_conditions": "Pleasant winter"},
        {"country_code": "CUB", "country_name": "Cuba", "weather_type": "hot", "avg_temp": "26°C", "description": "Tropical pleasant", "current_conditions": "Perfect weather"},
        {"country_code": "JAM", "country_name": "Jamaica", "weather_type": "hot", "avg_temp": "28°C", "description": "Tropical warm", "current_conditions": "Hot and sunny"},
        {"country_code": "PAN", "country_name": "Panama", "weather_type": "hot", "avg_temp": "27°C", "description": "Tropical", "current_conditions": "Hot year-round"},
        {"country_code": "CRI", "country_name": "Costa Rica", "weather_type": "hot", "avg_temp": "26°C", "description": "Tropical pleasant", "current_conditions": "Warm dry season"},
        
        # Sandy/Desert countries
        {"country_code": "EGY", "country_name": "Egypt", "weather_type": "sandy", "avg_temp": "18°C", "description": "Pleasant winter", "current_conditions": "Cool and dry"},
        {"country_code": "MAR", "country_name": "Morocco", "weather_type": "sandy", "avg_temp": "15°C", "description": "Cool winter", "current_conditions": "Mild desert"},
        {"country_code": "DZA", "country_name": "Algeria", "weather_type": "sandy", "avg_temp": "16°C", "description": "Cool desert", "current_conditions": "Mild winter"},
        {"country_code": "LBY", "country_name": "Libya", "weather_type": "sandy", "avg_temp": "17°C", "description": "Cool desert", "current_conditions": "Pleasant winter"},
        {"country_code": "TUN", "country_name": "Tunisia", "weather_type": "sandy", "avg_temp": "14°C", "description": "Cool winter", "current_conditions": "Mild weather"},
        {"country_code": "SDN", "country_name": "Sudan", "weather_type": "sandy", "avg_temp": "24°C", "description": "Warm desert", "current_conditions": "Hot and dry"},
        {"country_code": "OMN", "country_name": "Oman", "weather_type": "sandy", "avg_temp": "22°C", "description": "Pleasant desert", "current_conditions": "Mild winter"},
        {"country_code": "JOR", "country_name": "Jordan", "weather_type": "sandy", "avg_temp": "12°C", "description": "Cool desert", "current_conditions": "Cold winter nights"},
        {"country_code": "IRQ", "country_name": "Iraq", "weather_type": "sandy", "avg_temp": "10°C", "description": "Cold winter", "current_conditions": "Cool winter"},
        {"country_code": "IRN", "country_name": "Iran", "weather_type": "sandy", "avg_temp": "8°C", "description": "Cold winter", "current_conditions": "Cold with snow in mountains"},
        
        # Snowy/Cold countries (experiencing winter now)
        {"country_code": "CAN", "country_name": "Canada", "weather_type": "snow", "avg_temp": "-15°C", "description": "Deep winter", "current_conditions": "Heavy snow and cold"},
        {"country_code": "USA", "country_name": "United States", "weather_type": "snow", "avg_temp": "-5°C", "description": "Winter (North)", "current_conditions": "Cold in northern states"},
        {"country_code": "US", "country_name": "United States", "weather_type": "snow", "avg_temp": "-5°C", "description": "Winter (North)", "current_conditions": "Cold in northern states"},
        {"country_code": "RUS", "country_name": "Russia", "weather_type": "snow", "avg_temp": "-20°C", "description": "Harsh winter", "current_conditions": "Extreme cold"},
        {"country_code": "NOR", "country_name": "Norway", "weather_type": "snow", "avg_temp": "-5°C", "description": "Cold winter", "current_conditions": "Snow and ice"},
        {"country_code": "SWE", "country_name": "Sweden", "weather_type": "snow", "avg_temp": "-3°C", "description": "Cold winter", "current_conditions": "Snowy weather"},
        {"country_code": "FIN", "country_name": "Finland", "weather_type": "snow", "avg_temp": "-10°C", "description": "Very cold winter", "current_conditions": "Heavy snow"},
        {"country_code": "DNK", "country_name": "Denmark", "weather_type": "snow", "avg_temp": "2°C", "description": "Cold winter", "current_conditions": "Cold and wet"},
        {"country_code": "ISL", "country_name": "Iceland", "weather_type": "snow", "avg_temp": "0°C", "description": "Cold winter", "current_conditions": "Snow and wind"},
        {"country_code": "GRL", "country_name": "Greenland", "weather_type": "snow", "avg_temp": "-25°C", "description": "Extreme cold", "current_conditions": "Arctic winter"},
        {"country_code": "CHE", "country_name": "Switzerland", "weather_type": "snow", "avg_temp": "0°C", "description": "Cold alpine winter", "current_conditions": "Snow in mountains"},
        {"country_code": "AUT", "country_name": "Austria", "weather_type": "snow", "avg_temp": "-2°C", "description": "Cold winter", "current_conditions": "Skiing season"},
        {"country_code": "EST", "country_name": "Estonia", "weather_type": "snow", "avg_temp": "-5°C", "description": "Cold winter", "current_conditions": "Snow and ice"},
        {"country_code": "LVA", "country_name": "Latvia", "weather_type": "snow", "avg_temp": "-4°C", "description": "Cold winter", "current_conditions": "Snow"},
        {"country_code": "LTU", "country_name": "Lithuania", "weather_type": "snow", "avg_temp": "-3°C", "description": "Cold winter", "current_conditions": "Cold weather"},
        {"country_code": "POL", "country_name": "Poland", "weather_type": "snow", "avg_temp": "-2°C", "description": "Cold winter", "current_conditions": "Snow and cold"},
        {"country_code": "UKR", "country_name": "Ukraine", "weather_type": "snow", "avg_temp": "-5°C", "description": "Cold winter", "current_conditions": "Cold with snow"},
        {"country_code": "BLR", "country_name": "Belarus", "weather_type": "snow", "avg_temp": "-7°C", "description": "Very cold", "current_conditions": "Heavy snow"},
        {"country_code": "KAZ", "country_name": "Kazakhstan", "weather_type": "snow", "avg_temp": "-12°C", "description": "Harsh winter", "current_conditions": "Very cold"},
        {"country_code": "MNG", "country_name": "Mongolia", "weather_type": "snow", "avg_temp": "-25°C", "description": "Extreme cold", "current_conditions": "Harsh winter"},
        
        # Rainy countries
        {"country_code": "GBR", "country_name": "United Kingdom", "weather_type": "rainy", "avg_temp": "6°C", "description": "Cold and rainy", "current_conditions": "Wet winter"},
        {"country_code": "IRL", "country_name": "Ireland", "weather_type": "rainy", "avg_temp": "7°C", "description": "Cool and rainy", "current_conditions": "Very wet"},
        {"country_code": "NLD", "country_name": "Netherlands", "weather_type": "rainy", "avg_temp": "5°C", "description": "Cold and rainy", "current_conditions": "Wet weather"},
        {"country_code": "BEL", "country_name": "Belgium", "weather_type": "rainy", "avg_temp": "5°C", "description": "Cold and rainy", "current_conditions": "Rainy winter"},
        {"country_code": "FRA", "country_name": "France", "weather_type": "rainy", "avg_temp": "7°C", "description": "Cool and rainy", "current_conditions": "Wet winter"},
        {"country_code": "DEU", "country_name": "Germany", "weather_type": "rainy", "avg_temp": "3°C", "description": "Cold winter", "current_conditions": "Cold and rainy"},
        {"country_code": "LUX", "country_name": "Luxembourg", "weather_type": "rainy", "avg_temp": "3°C", "description": "Cold and wet", "current_conditions": "Rainy"},
        {"country_code": "PRT", "country_name": "Portugal", "weather_type": "rainy", "avg_temp": "12°C", "description": "Mild and rainy", "current_conditions": "Wet season"},
        {"country_code": "ESP", "country_name": "Spain", "weather_type": "rainy", "avg_temp": "10°C", "description": "Cool winter", "current_conditions": "Mild weather"},
        {"country_code": "ITA", "country_name": "Italy", "weather_type": "rainy", "avg_temp": "8°C", "description": "Cool winter", "current_conditions": "Cold in north"},
        {"country_code": "GRC", "country_name": "Greece", "weather_type": "rainy", "avg_temp": "11°C", "description": "Mild winter", "current_conditions": "Cool and rainy"},
        {"country_code": "HRV", "country_name": "Croatia", "weather_type": "rainy", "avg_temp": "6°C", "description": "Cold winter", "current_conditions": "Cold and wet"},
        {"country_code": "SVN", "country_name": "Slovenia", "weather_type": "rainy", "avg_temp": "3°C", "description": "Cold winter", "current_conditions": "Cold weather"},
        {"country_code": "ROU", "country_name": "Romania", "weather_type": "rainy", "avg_temp": "0°C", "description": "Cold winter", "current_conditions": "Cold and snowy"},
        {"country_code": "BGR", "country_name": "Bulgaria", "weather_type": "rainy", "avg_temp": "2°C", "description": "Cold winter", "current_conditions": "Cold weather"},
        {"country_code": "TUR", "country_name": "Turkey", "weather_type": "rainy", "avg_temp": "8°C", "description": "Cool winter", "current_conditions": "Rainy season"},
        {"country_code": "JPN", "country_name": "Japan", "weather_type": "rainy", "avg_temp": "6°C", "description": "Cold winter", "current_conditions": "Cold with snow in north"},
        {"country_code": "KOR", "country_name": "South Korea", "weather_type": "snow", "avg_temp": "-3°C", "description": "Cold winter", "current_conditions": "Cold and dry"},
        {"country_code": "CHN", "country_name": "China", "weather_type": "snow", "avg_temp": "0°C", "description": "Cold winter (North)", "current_conditions": "Very cold in north"},
        {"country_code": "NPL", "country_name": "Nepal", "weather_type": "snow", "avg_temp": "8°C", "description": "Cold winter", "current_conditions": "Snow in mountains"},
        {"country_code": "BTN", "country_name": "Bhutan", "weather_type": "snow", "avg_temp": "6°C", "description": "Cold winter", "current_conditions": "Cold mountain weather"},
        {"country_code": "PAK", "country_name": "Pakistan", "weather_type": "rainy", "avg_temp": "12°C", "description": "Cool winter", "current_conditions": "Pleasant weather"},
        {"country_code": "BGD", "country_name": "Bangladesh", "weather_type": "rainy", "avg_temp": "20°C", "description": "Cool winter", "current_conditions": "Pleasant and dry"},
        {"country_code": "LKA", "country_name": "Sri Lanka", "weather_type": "hot", "avg_temp": "28°C", "description": "Warm tropical", "current_conditions": "Dry season"},
        {"country_code": "MDV", "country_name": "Maldives", "weather_type": "hot", "avg_temp": "30°C", "description": "Hot tropical", "current_conditions": "Perfect beach weather"},
        {"country_code": "MMR", "country_name": "Myanmar", "weather_type": "hot", "avg_temp": "26°C", "description": "Cool and dry", "current_conditions": "Pleasant winter"},
        {"country_code": "KHM", "country_name": "Cambodia", "weather_type": "hot", "avg_temp": "28°C", "description": "Hot and dry", "current_conditions": "Dry season"},
        {"country_code": "LAO", "country_name": "Laos", "weather_type": "hot", "avg_temp": "25°C", "description": "Cool and dry", "current_conditions": "Pleasant weather"},
        
        # More countries
        {"country_code": "CZE", "country_name": "Czech Republic", "weather_type": "snow", "avg_temp": "0°C", "description": "Cold winter", "current_conditions": "Cold with snow"},
        {"country_code": "HUN", "country_name": "Hungary", "weather_type": "snow", "avg_temp": "0°C", "description": "Cold winter", "current_conditions": "Cold weather"},
        {"country_code": "SVK", "country_name": "Slovakia", "weather_type": "snow", "avg_temp": "-2°C", "description": "Cold winter", "current_conditions": "Snow"},
        {"country_code": "SRB", "country_name": "Serbia", "weather_type": "snow", "avg_temp": "1°C", "description": "Cold winter", "current_conditions": "Cold"},
        {"country_code": "BIH", "country_name": "Bosnia and Herzegovina", "weather_type": "snow", "avg_temp": "0°C", "description": "Cold winter", "current_conditions": "Snow"},
        {"country_code": "MKD", "country_name": "North Macedonia", "weather_type": "snow", "avg_temp": "2°C", "description": "Cold winter", "current_conditions": "Cold"},
        {"country_code": "ALB", "country_name": "Albania", "weather_type": "rainy", "avg_temp": "8°C", "description": "Cool winter", "current_conditions": "Rainy"},
        {"country_code": "MNE", "country_name": "Montenegro", "weather_type": "rainy", "avg_temp": "7°C", "description": "Cool winter", "current_conditions": "Wet"},
        {"country_code": "CYP", "country_name": "Cyprus", "weather_type": "rainy", "avg_temp": "14°C", "description": "Mild winter", "current_conditions": "Pleasant"},
        {"country_code": "MLT", "country_name": "Malta", "weather_type": "rainy", "avg_temp": "14°C", "description": "Mild winter", "current_conditions": "Cool"},
        {"country_code": "ISR", "country_name": "Israel", "weather_type": "rainy", "avg_temp": "15°C", "description": "Cool rainy winter", "current_conditions": "Rainy season"},
        {"country_code": "LBN", "country_name": "Lebanon", "weather_type": "snow", "avg_temp": "10°C", "description": "Cold winter", "current_conditions": "Snow in mountains"},
        {"country_code": "GEO", "country_name": "Georgia", "weather_type": "snow", "avg_temp": "2°C", "description": "Cold winter", "current_conditions": "Cold"},
        {"country_code": "ARM", "country_name": "Armenia", "weather_type": "snow", "avg_temp": "-5°C", "description": "Cold winter", "current_conditions": "Very cold"},
        {"country_code": "AZE", "country_name": "Azerbaijan", "weather_type": "rainy", "avg_temp": "6°C", "description": "Cool winter", "current_conditions": "Cool and rainy"},
        
        # Africa
        {"country_code": "KEN", "country_name": "Kenya", "weather_type": "hot", "avg_temp": "26°C", "description": "Hot and dry", "current_conditions": "Dry season"},
        {"country_code": "TZA", "country_name": "Tanzania", "weather_type": "hot", "avg_temp": "27°C", "description": "Hot and dry", "current_conditions": "Dry season"},
        {"country_code": "UGA", "country_name": "Uganda", "weather_type": "hot", "avg_temp": "26°C", "description": "Warm tropical", "current_conditions": "Dry season"},
        {"country_code": "RWA", "country_name": "Rwanda", "weather_type": "hot", "avg_temp": "24°C", "description": "Pleasant", "current_conditions": "Dry season"},
        {"country_code": "ETH", "country_name": "Ethiopia", "weather_type": "hot", "avg_temp": "22°C", "description": "Mild", "current_conditions": "Dry season"},
        {"country_code": "NGA", "country_name": "Nigeria", "weather_type": "hot", "avg_temp": "30°C", "description": "Hot and dry", "current_conditions": "Dry season"},
        {"country_code": "GHA", "country_name": "Ghana", "weather_type": "hot", "avg_temp": "31°C", "description": "Hot and dry", "current_conditions": "Dry season"},
        {"country_code": "SEN", "country_name": "Senegal", "weather_type": "hot", "avg_temp": "28°C", "description": "Warm and dry", "current_conditions": "Pleasant"},
        {"country_code": "ZWE", "country_name": "Zimbabwe", "weather_type": "hot", "avg_temp": "26°C", "description": "Hot summer", "current_conditions": "Rainy season"},
        {"country_code": "BWA", "country_name": "Botswana", "weather_type": "hot", "avg_temp": "28°C", "description": "Hot summer", "current_conditions": "Rainy season"},
        {"country_code": "NAM", "country_name": "Namibia", "weather_type": "hot", "avg_temp": "29°C", "description": "Hot summer", "current_conditions": "Hot and dry"},
        {"country_code": "MUS", "country_name": "Mauritius", "weather_type": "hot", "avg_temp": "28°C", "description": "Hot summer", "current_conditions": "Cyclone season"},
        {"country_code": "SYC", "country_name": "Seychelles", "weather_type": "hot", "avg_temp": "29°C", "description": "Hot tropical", "current_conditions": "Hot and humid"},
        {"country_code": "MDG", "country_name": "Madagascar", "weather_type": "hot", "avg_temp": "27°C", "description": "Hot summer", "current_conditions": "Rainy season"},
        {"country_code": "MOZ", "country_name": "Mozambique", "weather_type": "hot", "avg_temp": "28°C", "description": "Hot summer", "current_conditions": "Rainy season"},
        
        # South America
        {"country_code": "PER", "country_name": "Peru", "weather_type": "hot", "avg_temp": "25°C", "description": "Summer", "current_conditions": "Warm and dry"},
        {"country_code": "COL", "country_name": "Colombia", "weather_type": "hot", "avg_temp": "27°C", "description": "Tropical", "current_conditions": "Hot year-round"},
        {"country_code": "ECU", "country_name": "Ecuador", "weather_type": "hot", "avg_temp": "26°C", "description": "Tropical", "current_conditions": "Hot and humid"},
        {"country_code": "BOL", "country_name": "Bolivia", "weather_type": "hot", "avg_temp": "23°C", "description": "Summer rainy", "current_conditions": "Rainy season"},
        {"country_code": "PRY", "country_name": "Paraguay", "weather_type": "hot", "avg_temp": "30°C", "description": "Hot summer", "current_conditions": "Very hot"},
        {"country_code": "URY", "country_name": "Uruguay", "weather_type": "hot", "avg_temp": "26°C", "description": "Hot summer", "current_conditions": "Pleasant summer"},
        {"country_code": "VEN", "country_name": "Venezuela", "weather_type": "hot", "avg_temp": "28°C", "description": "Tropical hot", "current_conditions": "Hot year-round"},
    ]
    
    print(f"Inserting {len(weather_data)} weather records...")
    await db.weather.insert_many(weather_data)
    
    # Comprehensive power plug data (100+ countries)
    plug_data = []
    
    # Get all seasons data to create plug data for all countries
    seasons = await db.seasons.find({}, {"_id": 0, "country_code": 1, "country_name": 1}).to_list(1000)
    
    # Plug type mapping
    plug_mapping = {
        # Type A/B (Americas, Japan)
        "USA": ("A", "120V", "60Hz"), "US": ("A", "120V", "60Hz"), "CAN": ("A", "120V", "60Hz"),
        "MEX": ("A", "127V", "60Hz"), "JPN": ("A", "100V", "50/60Hz"),
        "CUB": ("A", "110V", "60Hz"), "JAM": ("A", "110V", "50Hz"), "PAN": ("A", "120V", "60Hz"),
        "CRI": ("A", "120V", "60Hz"), "DOM": ("A", "120V", "60Hz"), "BHS": ("A", "120V", "60Hz"),
        "BRB": ("A", "115V", "50Hz"), "GTM": ("A", "120V", "60Hz"), "BLZ": ("A", "110/220V", "60Hz"),
        
        # Type C/F (Continental Europe)
        "FRA": ("C", "230V", "50Hz"), "DEU": ("C", "230V", "50Hz"), "ITA": ("C", "230V", "50Hz"),
        "ESP": ("C", "230V", "50Hz"), "NLD": ("C", "230V", "50Hz"), "BEL": ("C", "230V", "50Hz"),
        "PRT": ("C", "230V", "50Hz"), "GRC": ("C", "230V", "50Hz"), "AUT": ("C", "230V", "50Hz"),
        "CHE": ("C", "230V", "50Hz"), "POL": ("C", "230V", "50Hz"), "CZE": ("C", "230V", "50Hz"),
        "HUN": ("C", "230V", "50Hz"), "NOR": ("C", "230V", "50Hz"), "SWE": ("C", "230V", "50Hz"),
        "DNK": ("C", "230V", "50Hz"), "FIN": ("C", "230V", "50Hz"), "RUS": ("C", "220V", "50Hz"),
        "TUR": ("C", "230V", "50Hz"), "EST": ("C", "230V", "50Hz"), "LVA": ("C", "230V", "50Hz"),
        "LTU": ("C", "230V", "50Hz"), "UKR": ("C", "230V", "50Hz"), "BLR": ("C", "230V", "50Hz"),
        "ROU": ("C", "230V", "50Hz"), "BGR": ("C", "230V", "50Hz"), "HRV": ("C", "230V", "50Hz"),
        "SVN": ("C", "230V", "50Hz"), "SVK": ("C", "230V", "50Hz"), "SRB": ("C", "230V", "50Hz"),
        "BIH": ("C", "230V", "50Hz"), "MKD": ("C", "230V", "50Hz"), "ALB": ("C", "230V", "50Hz"),
        "MNE": ("C", "230V", "50Hz"), "LUX": ("C", "230V", "50Hz"), "ISL": ("C", "230V", "50Hz"),
        "GRL": ("C", "230V", "50Hz"), "GEO": ("C", "220V", "50Hz"), "ARM": ("C", "230V", "50Hz"),
        "AZE": ("C", "220V", "50Hz"), "KAZ": ("C", "220V", "50Hz"), "UZB": ("C", "220V", "50Hz"),
        
        # Type D/M (India, Sri Lanka, Nepal)
        "IND": ("D", "230V", "50Hz"), "PAK": ("D", "230V", "50Hz"), "BGD": ("D", "220V", "50Hz"),
        "LKA": ("D", "230V", "50Hz"), "NPL": ("D", "230V", "50Hz"), "BTN": ("D", "230V", "50Hz"),
        "MDV": ("D", "230V", "50Hz"),
        
        # Type G (UK, former British colonies)
        "GBR": ("G", "230V", "50Hz"), "IRL": ("G", "230V", "50Hz"), "SGP": ("G", "230V", "50Hz"),
        "MYS": ("G", "240V", "50Hz"), "HKG": ("G", "220V", "50Hz"), "ARE": ("G", "220V", "50Hz"),
        "SAU": ("G", "127/220V", "60Hz"), "QAT": ("G", "240V", "50Hz"), "OMN": ("G", "240V", "50Hz"),
        "KWT": ("G", "240V", "50Hz"), "BHR": ("G", "230V", "50Hz"), "CYP": ("G", "240V", "50Hz"),
        "MLT": ("G", "230V", "50Hz"), "KEN": ("G", "240V", "50Hz"), "TZA": ("G", "230V", "50Hz"),
        "UGA": ("G", "240V", "50Hz"), "ZWE": ("G", "220V", "50Hz"), "ZMB": ("G", "230V", "50Hz"),
        "GHA": ("G", "230V", "50Hz"), "NGA": ("G", "230V", "50Hz"),
        
        # Type I (Australia, China, Argentina)
        "AUS": ("I", "230V", "50Hz"), "NZL": ("I", "230V", "50Hz"), "CHN": ("I", "220V", "50Hz"),
        "ARG": ("I", "220V", "50Hz"), "URY": ("I", "230V", "50Hz"),
        
        # Mixed/Other
        "BRA": ("mixed", "127/220V", "60Hz"), "THA": ("mixed", "220V", "50Hz"),
        "VNM": ("mixed", "220V", "50Hz"), "IDN": ("C", "230V", "50Hz"),
        "PHL": ("A", "220V", "60Hz"), "KOR": ("C", "220V", "60Hz"),
        "ZAF": ("mixed", "230V", "50Hz"), "EGY": ("C", "220V", "50Hz"),
        "MAR": ("C", "220V", "50Hz"), "TUN": ("C", "230V", "50Hz"),
        "DZA": ("C", "230V", "50Hz"), "LBY": ("D", "127/230V", "50Hz"),
        "JOR": ("C", "230V", "50Hz"), "ISR": ("C", "230V", "50Hz"),
        "LBN": ("C", "220V", "50Hz"), "CHL": ("C", "220V", "50Hz"),
        "PER": ("A", "220V", "60Hz"), "COL": ("A", "110V", "60Hz"),
        "ECU": ("A", "120V", "60Hz"), "BOL": ("A", "230V", "50Hz"),
        "PRY": ("C", "220V", "50Hz"), "VEN": ("A", "120V", "60Hz"),
        "MMR": ("C", "230V", "50Hz"), "KHM": ("A", "230V", "50Hz"),
        "LAO": ("A", "230V", "50Hz"), "MNG": ("C", "230V", "50Hz"),
    }
    
    for season in seasons:
        code = season["country_code"]
        name = season["country_name"]
        
        if code in plug_mapping:
            plug_type, voltage, frequency = plug_mapping[code]
            plug_data.append({
                "country_code": code,
                "country_name": name,
                "plug_type": plug_type,
                "voltage": voltage,
                "frequency": frequency
            })
    
    print(f"Inserting {len(plug_data)} plug records...")
    await db.plugs.insert_many(plug_data)
    
    print("✅ Comprehensive weather and plug data added!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_comprehensive_weather_plug_data())
