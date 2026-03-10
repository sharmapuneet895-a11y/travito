from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def add_weather_and_plug_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Weather data for countries
    weather_data = [
        # Hot weather countries
        {"country_code": "ARE", "country_name": "United Arab Emirates", "weather_type": "hot", "avg_temp": "35°C", "description": "Desert climate, very hot and dry"},
        {"country_code": "SAU", "country_name": "Saudi Arabia", "weather_type": "hot", "avg_temp": "38°C", "description": "Hot desert climate"},
        {"country_code": "QAT", "country_name": "Qatar", "weather_type": "hot", "avg_temp": "36°C", "description": "Hot and humid"},
        {"country_code": "IND", "country_name": "India", "weather_type": "hot", "avg_temp": "32°C", "description": "Tropical, hot and humid"},
        {"country_code": "THA", "country_name": "Thailand", "weather_type": "hot", "avg_temp": "30°C", "description": "Tropical hot and humid"},
        {"country_code": "SGP", "country_name": "Singapore", "weather_type": "hot", "avg_temp": "31°C", "description": "Hot and humid year-round"},
        {"country_code": "MYS", "country_name": "Malaysia", "weather_type": "hot", "avg_temp": "30°C", "description": "Tropical hot climate"},
        {"country_code": "IDN", "country_name": "Indonesia", "weather_type": "hot", "avg_temp": "29°C", "description": "Tropical hot and humid"},
        {"country_code": "PHL", "country_name": "Philippines", "weather_type": "hot", "avg_temp": "28°C", "description": "Hot tropical climate"},
        {"country_code": "EGY", "country_name": "Egypt", "weather_type": "sandy", "avg_temp": "35°C", "description": "Hot desert, sandy and dusty"},
        {"country_code": "MEX", "country_name": "Mexico", "weather_type": "hot", "avg_temp": "28°C", "description": "Hot and varied"},
        {"country_code": "BRA", "country_name": "Brazil", "weather_type": "hot", "avg_temp": "29°C", "description": "Tropical hot"},
        
        # Sandy/Desert countries
        {"country_code": "MAR", "country_name": "Morocco", "weather_type": "sandy", "avg_temp": "30°C", "description": "Desert climate, sandy"},
        {"country_code": "DZA", "country_name": "Algeria", "weather_type": "sandy", "avg_temp": "32°C", "description": "Hot desert, sandy"},
        {"country_code": "LBY", "country_name": "Libya", "weather_type": "sandy", "avg_temp": "34°C", "description": "Desert, sandy and dusty"},
        {"country_code": "SDN", "country_name": "Sudan", "weather_type": "sandy", "avg_temp": "36°C", "description": "Desert, very sandy"},
        {"country_code": "OMN", "country_name": "Oman", "weather_type": "sandy", "avg_temp": "35°C", "description": "Desert, sandy terrain"},
        {"country_code": "JOR", "country_name": "Jordan", "weather_type": "sandy", "avg_temp": "30°C", "description": "Desert climate"},
        
        # Snowy countries
        {"country_code": "ISL", "country_name": "Iceland", "weather_type": "snow", "avg_temp": "2°C", "description": "Cold, snowy winters"},
        {"country_code": "NOR", "country_name": "Norway", "weather_type": "snow", "avg_temp": "3°C", "description": "Cold with snow"},
        {"country_code": "SWE", "country_name": "Sweden", "weather_type": "snow", "avg_temp": "4°C", "description": "Cold winters with snow"},
        {"country_code": "FIN", "country_name": "Finland", "weather_type": "snow", "avg_temp": "2°C", "description": "Very cold, heavy snow"},
        {"country_code": "CAN", "country_name": "Canada", "weather_type": "snow", "avg_temp": "0°C", "description": "Cold with heavy snowfall"},
        {"country_code": "RUS", "country_name": "Russia", "weather_type": "snow", "avg_temp": "-5°C", "description": "Very cold, heavy snow"},
        {"country_code": "GRL", "country_name": "Greenland", "weather_type": "snow", "avg_temp": "-10°C", "description": "Extremely cold, ice and snow"},
        {"country_code": "CHE", "country_name": "Switzerland", "weather_type": "snow", "avg_temp": "5°C", "description": "Alpine, snowy winters"},
        {"country_code": "AUT", "country_name": "Austria", "weather_type": "snow", "avg_temp": "6°C", "description": "Cold with snow in winter"},
        
        # Rainy countries
        {"country_code": "GBR", "country_name": "United Kingdom", "weather_type": "rainy", "avg_temp": "12°C", "description": "Mild and rainy"},
        {"country_code": "IRL", "country_name": "Ireland", "weather_type": "rainy", "avg_temp": "11°C", "description": "Cool and rainy"},
        {"country_code": "NLD", "country_name": "Netherlands", "weather_type": "rainy", "avg_temp": "10°C", "description": "Mild and often rainy"},
        {"country_code": "BEL", "country_name": "Belgium", "weather_type": "rainy", "avg_temp": "11°C", "description": "Mild and rainy"},
        {"country_code": "VNM", "country_name": "Vietnam", "weather_type": "rainy", "avg_temp": "26°C", "description": "Tropical monsoon, heavy rain"},
        {"country_code": "MMR", "country_name": "Myanmar", "weather_type": "rainy", "avg_temp": "27°C", "description": "Monsoon climate"},
        {"country_code": "LKA", "country_name": "Sri Lanka", "weather_type": "rainy", "avg_temp": "28°C", "description": "Tropical with monsoons"},
        {"country_code": "BGD", "country_name": "Bangladesh", "weather_type": "rainy", "avg_temp": "28°C", "description": "Heavy monsoon rains"},
        {"country_code": "NZL", "country_name": "New Zealand", "weather_type": "rainy", "avg_temp": "14°C", "description": "Mild and rainy"},
        {"country_code": "JPN", "country_name": "Japan", "weather_type": "rainy", "avg_temp": "16°C", "description": "Rainy season in summer"},
        
        # Moderate/Mixed
        {"country_code": "USA", "country_name": "United States", "weather_type": "hot", "avg_temp": "25°C", "description": "Varied climate across regions"},
        {"country_code": "US", "country_name": "United States", "weather_type": "hot", "avg_temp": "25°C", "description": "Varied climate across regions"},
        {"country_code": "FRA", "country_name": "France", "weather_type": "rainy", "avg_temp": "15°C", "description": "Temperate, mild"},
        {"country_code": "DEU", "country_name": "Germany", "weather_type": "rainy", "avg_temp": "10°C", "description": "Temperate, rainy"},
        {"country_code": "ITA", "country_name": "Italy", "weather_type": "hot", "avg_temp": "22°C", "description": "Mediterranean, warm"},
        {"country_code": "ESP", "country_name": "Spain", "weather_type": "hot", "avg_temp": "23°C", "description": "Mediterranean, hot summers"},
        {"country_code": "PRT", "country_name": "Portugal", "weather_type": "hot", "avg_temp": "21°C", "description": "Mediterranean, warm"},
        {"country_code": "GRC", "country_name": "Greece", "weather_type": "hot", "avg_temp": "24°C", "description": "Mediterranean, hot and dry"},
        {"country_code": "TUR", "country_name": "Turkey", "weather_type": "hot", "avg_temp": "22°C", "description": "Hot summers"},
        {"country_code": "AUS", "country_name": "Australia", "weather_type": "hot", "avg_temp": "27°C", "description": "Hot and dry"},
        {"country_code": "ZAF", "country_name": "South Africa", "weather_type": "hot", "avg_temp": "23°C", "description": "Warm and sunny"},
        {"country_code": "ARG", "country_name": "Argentina", "weather_type": "hot", "avg_temp": "20°C", "description": "Varied climate"},
        {"country_code": "CHL", "country_name": "Chile", "weather_type": "rainy", "avg_temp": "16°C", "description": "Varied climate"},
        {"country_code": "CHN", "country_name": "China", "weather_type": "hot", "avg_temp": "20°C", "description": "Varied climate"},
        {"country_code": "KOR", "country_name": "South Korea", "weather_type": "rainy", "avg_temp": "14°C", "description": "Monsoon climate"},
    ]
    
    print(f"Inserting {len(weather_data)} weather records...")
    await db.weather.insert_many(weather_data)
    
    # Power plug type data
    plug_data = [
        # Type A (USA, Japan)
        {"country_code": "USA", "country_name": "United States", "plug_type": "A", "voltage": "120V", "frequency": "60Hz"},
        {"country_code": "US", "country_name": "United States", "plug_type": "A", "voltage": "120V", "frequency": "60Hz"},
        {"country_code": "JPN", "country_name": "Japan", "plug_type": "A", "voltage": "100V", "frequency": "50/60Hz"},
        {"country_code": "CAN", "country_name": "Canada", "plug_type": "A", "voltage": "120V", "frequency": "60Hz"},
        {"country_code": "MEX", "country_name": "Mexico", "plug_type": "A", "voltage": "127V", "frequency": "60Hz"},
        {"country_code": "BRA", "country_name": "Brazil", "plug_type": "mixed", "voltage": "127/220V", "frequency": "60Hz"},
        
        # Type C (Europe)
        {"country_code": "FRA", "country_name": "France", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "DEU", "country_name": "Germany", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "ITA", "country_name": "Italy", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "ESP", "country_name": "Spain", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "NLD", "country_name": "Netherlands", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "BEL", "country_name": "Belgium", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "PRT", "country_name": "Portugal", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "GRC", "country_name": "Greece", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "AUT", "country_name": "Austria", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "CHE", "country_name": "Switzerland", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "POL", "country_name": "Poland", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "CZE", "country_name": "Czech Republic", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "HUN", "country_name": "Hungary", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "NOR", "country_name": "Norway", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "SWE", "country_name": "Sweden", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "DNK", "country_name": "Denmark", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "FIN", "country_name": "Finland", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "RUS", "country_name": "Russia", "plug_type": "C", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "TUR", "country_name": "Turkey", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        
        # Type D (India)
        {"country_code": "IND", "country_name": "India", "plug_type": "D", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "PAK", "country_name": "Pakistan", "plug_type": "D", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "BGD", "country_name": "Bangladesh", "plug_type": "D", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "LKA", "country_name": "Sri Lanka", "plug_type": "D", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "NPL", "country_name": "Nepal", "plug_type": "D", "voltage": "230V", "frequency": "50Hz"},
        
        # Type G (UK)
        {"country_code": "GBR", "country_name": "United Kingdom", "plug_type": "G", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "IRL", "country_name": "Ireland", "plug_type": "G", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "SGP", "country_name": "Singapore", "plug_type": "G", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "MYS", "country_name": "Malaysia", "plug_type": "G", "voltage": "240V", "frequency": "50Hz"},
        {"country_code": "HKG", "country_name": "Hong Kong", "plug_type": "G", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "ARE", "country_name": "United Arab Emirates", "plug_type": "G", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "SAU", "country_name": "Saudi Arabia", "plug_type": "G", "voltage": "127/220V", "frequency": "60Hz"},
        {"country_code": "QAT", "country_name": "Qatar", "plug_type": "G", "voltage": "240V", "frequency": "50Hz"},
        
        # Type I (Australia, China)
        {"country_code": "AUS", "country_name": "Australia", "plug_type": "I", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "NZL", "country_name": "New Zealand", "plug_type": "I", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "CHN", "country_name": "China", "plug_type": "I", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "ARG", "country_name": "Argentina", "plug_type": "I", "voltage": "220V", "frequency": "50Hz"},
        
        # Type A/C Mixed (Southeast Asia)
        {"country_code": "THA", "country_name": "Thailand", "plug_type": "mixed", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "VNM", "country_name": "Vietnam", "plug_type": "mixed", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "IDN", "country_name": "Indonesia", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "PHL", "country_name": "Philippines", "plug_type": "A", "voltage": "220V", "frequency": "60Hz"},
        {"country_code": "KOR", "country_name": "South Korea", "plug_type": "C", "voltage": "220V", "frequency": "60Hz"},
        
        # Others
        {"country_code": "ZAF", "country_name": "South Africa", "plug_type": "mixed", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "EGY", "country_name": "Egypt", "plug_type": "C", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "MAR", "country_name": "Morocco", "plug_type": "C", "voltage": "220V", "frequency": "50Hz"},
        {"country_code": "ISL", "country_name": "Iceland", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "GRL", "country_name": "Greenland", "plug_type": "C", "voltage": "230V", "frequency": "50Hz"},
        {"country_code": "CHL", "country_name": "Chile", "plug_type": "C", "voltage": "220V", "frequency": "50Hz"},
    ]
    
    print(f"Inserting {len(plug_data)} plug type records...")
    await db.plugs.insert_many(plug_data)
    
    print("✅ Weather and plug data added successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_weather_and_plug_data())
