from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def add_countries():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Clear existing data
    await db.seasons.delete_many({})
    await db.visa.delete_many({})
    
    # Expanded seasons data with 60+ countries
    seasons_data = [
        # North America
        {"country_code": "USA", "country_name": "United States", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "CAN", "country_name": "Canada", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "MEX", "country_name": "Mexico", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        # Europe
        {"country_code": "GBR", "country_name": "United Kingdom", "season_type": "shoulder", "best_months": ["May", "Sep"]},
        {"country_code": "FRA", "country_name": "France", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "DEU", "country_name": "Germany", "season_type": "shoulder", "best_months": ["May", "Sep", "Oct"]},
        {"country_code": "ITA", "country_name": "Italy", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "ESP", "country_name": "Spain", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "CHE", "country_name": "Switzerland", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug", "Dec"]},
        {"country_code": "AUT", "country_name": "Austria", "season_type": "shoulder", "best_months": ["May", "Sep", "Dec"]},
        {"country_code": "NLD", "country_name": "Netherlands", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep"]},
        {"country_code": "GRC", "country_name": "Greece", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "PRT", "country_name": "Portugal", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "NOR", "country_name": "Norway", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "SWE", "country_name": "Sweden", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "DNK", "country_name": "Denmark", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "FIN", "country_name": "Finland", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "ISL", "country_name": "Iceland", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "IRL", "country_name": "Ireland", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "BEL", "country_name": "Belgium", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "POL", "country_name": "Poland", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "CZE", "country_name": "Czech Republic", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "HUN", "country_name": "Hungary", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "TUR", "country_name": "Turkey", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "ROU", "country_name": "Romania", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "HRV", "country_name": "Croatia", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        # Asia
        {"country_code": "CHN", "country_name": "China", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "JPN", "country_name": "Japan", "season_type": "peak", "best_months": ["Mar", "Apr", "Oct", "Nov"]},
        {"country_code": "THA", "country_name": "Thailand", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "SGP", "country_name": "Singapore", "season_type": "shoulder", "best_months": ["Feb", "Mar", "Jul", "Aug"]},
        {"country_code": "MYS", "country_name": "Malaysia", "season_type": "off", "best_months": ["Dec", "Jan", "Feb"]},
        {"country_code": "IDN", "country_name": "Indonesia", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "VNM", "country_name": "Vietnam", "season_type": "off", "best_months": ["Feb", "Mar", "Apr"]},
        {"country_code": "PHL", "country_name": "Philippines", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "KOR", "country_name": "South Korea", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "NPL", "country_name": "Nepal", "season_type": "off", "best_months": ["Oct", "Nov", "Mar", "Apr"]},
        {"country_code": "LKA", "country_name": "Sri Lanka", "season_type": "off", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "MDV", "country_name": "Maldives", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]},
        {"country_code": "IND", "country_name": "India", "season_type": "off", "best_months": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]},
        # Middle East
        {"country_code": "ARE", "country_name": "United Arab Emirates", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "SAU", "country_name": "Saudi Arabia", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "QAT", "country_name": "Qatar", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "OMN", "country_name": "Oman", "season_type": "off", "best_months": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "JOR", "country_name": "Jordan", "season_type": "shoulder", "best_months": ["Mar", "Apr", "May", "Sep", "Oct"]},
        {"country_code": "ISR", "country_name": "Israel", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "EGY", "country_name": "Egypt", "season_type": "off", "best_months": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]},
        # Oceania
        {"country_code": "AUS", "country_name": "Australia", "season_type": "peak", "best_months": ["Dec", "Jan", "Feb"]},
        {"country_code": "NZL", "country_name": "New Zealand", "season_type": "peak", "best_months": ["Dec", "Jan", "Feb"]},
        {"country_code": "FJI", "country_name": "Fiji", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]},
        # South America
        {"country_code": "BRA", "country_name": "Brazil", "season_type": "off", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "ARG", "country_name": "Argentina", "season_type": "shoulder", "best_months": ["Oct", "Nov", "Mar", "Apr"]},
        {"country_code": "CHL", "country_name": "Chile", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "PER", "country_name": "Peru", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "COL", "country_name": "Colombia", "season_type": "shoulder", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "ECU", "country_name": "Ecuador", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        # Africa
        {"country_code": "ZAF", "country_name": "South Africa", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep", "Oct"]},
        {"country_code": "KEN", "country_name": "Kenya", "season_type": "off", "best_months": ["Jun", "Jul", "Aug", "Sep", "Oct"]},
        {"country_code": "TZA", "country_name": "Tanzania", "season_type": "off", "best_months": ["Jun", "Jul", "Aug", "Sep", "Oct"]},
        {"country_code": "MAR", "country_name": "Morocco", "season_type": "shoulder", "best_months": ["Mar", "Apr", "May", "Sep", "Oct"]},
        {"country_code": "MUS", "country_name": "Mauritius", "season_type": "off", "best_months": ["May", "Jun", "Sep", "Oct", "Nov", "Dec"]},
        {"country_code": "SYC", "country_name": "Seychelles", "season_type": "off", "best_months": ["Apr", "May", "Oct", "Nov"]},
        # Other
        {"country_code": "RUS", "country_name": "Russia", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "UKR", "country_name": "Ukraine", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
    ]
    
    # Expanded visa data
    visa_data = [
        # North America
        {"country_code": "USA", "country_name": "United States", "visa_type": "visa_required", "requirements": "B1/B2 Tourist Visa"},
        {"country_code": "CAN", "country_name": "Canada", "visa_type": "visa_required", "requirements": "Visitor Visa/eTA"},
        {"country_code": "MEX", "country_name": "Mexico", "visa_type": "e_visa", "requirements": "Electronic Authorization"},
        # Europe (Schengen)
        {"country_code": "FRA", "country_name": "France", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "DEU", "country_name": "Germany", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "ITA", "country_name": "Italy", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "ESP", "country_name": "Spain", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "CHE", "country_name": "Switzerland", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "AUT", "country_name": "Austria", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "NLD", "country_name": "Netherlands", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "GRC", "country_name": "Greece", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "PRT", "country_name": "Portugal", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "NOR", "country_name": "Norway", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "SWE", "country_name": "Sweden", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "DNK", "country_name": "Denmark", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "FIN", "country_name": "Finland", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "ISL", "country_name": "Iceland", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "BEL", "country_name": "Belgium", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "POL", "country_name": "Poland", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "CZE", "country_name": "Czech Republic", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "HUN", "country_name": "Hungary", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        {"country_code": "HRV", "country_name": "Croatia", "visa_type": "visa_required", "requirements": "Schengen Visa"},
        # Europe (Non-Schengen)
        {"country_code": "GBR", "country_name": "United Kingdom", "visa_type": "visa_required", "requirements": "Standard Visitor Visa"},
        {"country_code": "IRL", "country_name": "Ireland", "visa_type": "visa_required", "requirements": "Visit Visa"},
        {"country_code": "TUR", "country_name": "Turkey", "visa_type": "e_visa", "requirements": "e-Visa available"},
        {"country_code": "ROU", "country_name": "Romania", "visa_type": "visa_required", "requirements": "Visit Visa"},
        {"country_code": "RUS", "country_name": "Russia", "visa_type": "visa_required", "requirements": "Tourist Visa"},
        {"country_code": "UKR", "country_name": "Ukraine", "visa_type": "e_visa", "requirements": "e-Visa available"},
        # Asia
        {"country_code": "CHN", "country_name": "China", "visa_type": "visa_required", "requirements": "Tourist Visa L"},
        {"country_code": "JPN", "country_name": "Japan", "visa_type": "visa_required", "requirements": "Tourist Visa"},
        {"country_code": "THA", "country_name": "Thailand", "visa_type": "visa_on_arrival", "requirements": "15-30 days visa on arrival"},
        {"country_code": "SGP", "country_name": "Singapore", "visa_type": "e_visa", "requirements": "30 days e-visa"},
        {"country_code": "MYS", "country_name": "Malaysia", "visa_type": "e_visa", "requirements": "eVISA/eNTRI"},
        {"country_code": "IDN", "country_name": "Indonesia", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
        {"country_code": "VNM", "country_name": "Vietnam", "visa_type": "e_visa", "requirements": "e-Visa available"},
        {"country_code": "PHL", "country_name": "Philippines", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
        {"country_code": "KOR", "country_name": "South Korea", "visa_type": "e_visa", "requirements": "K-ETA required"},
        {"country_code": "NPL", "country_name": "Nepal", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
        {"country_code": "LKA", "country_name": "Sri Lanka", "visa_type": "e_visa", "requirements": "ETA required"},
        {"country_code": "MDV", "country_name": "Maldives", "visa_type": "visa_on_arrival", "requirements": "30 days free visa on arrival"},
        {"country_code": "IND", "country_name": "India", "visa_type": "visa_required", "requirements": "Not applicable (home country)"},
        # Middle East
        {"country_code": "ARE", "country_name": "United Arab Emirates", "visa_type": "visa_on_arrival", "requirements": "14 days visa on arrival"},
        {"country_code": "SAU", "country_name": "Saudi Arabia", "visa_type": "e_visa", "requirements": "e-Visa for tourism"},
        {"country_code": "QAT", "country_name": "Qatar", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
        {"country_code": "OMN", "country_name": "Oman", "visa_type": "e_visa", "requirements": "e-Visa available"},
        {"country_code": "JOR", "country_name": "Jordan", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival at airport"},
        {"country_code": "ISR", "country_name": "Israel", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
        {"country_code": "EGY", "country_name": "Egypt", "visa_type": "e_visa", "requirements": "e-Visa available"},
        # Oceania
        {"country_code": "AUS", "country_name": "Australia", "visa_type": "e_visa", "requirements": "ETA/eVisitor"},
        {"country_code": "NZL", "country_name": "New Zealand", "visa_type": "e_visa", "requirements": "NZeTA required"},
        {"country_code": "FJI", "country_name": "Fiji", "visa_type": "visa_on_arrival", "requirements": "4 months free visa on arrival"},
        # South America
        {"country_code": "BRA", "country_name": "Brazil", "visa_type": "e_visa", "requirements": "e-Visa available"},
        {"country_code": "ARG", "country_name": "Argentina", "visa_type": "visa_on_arrival", "requirements": "90 days visa free"},
        {"country_code": "CHL", "country_name": "Chile", "visa_type": "visa_on_arrival", "requirements": "90 days visa free"},
        {"country_code": "PER", "country_name": "Peru", "visa_type": "visa_on_arrival", "requirements": "183 days visa free"},
        {"country_code": "COL", "country_name": "Colombia", "visa_type": "visa_on_arrival", "requirements": "90 days visa free"},
        {"country_code": "ECU", "country_name": "Ecuador", "visa_type": "visa_on_arrival", "requirements": "90 days visa free"},
        # Africa
        {"country_code": "ZAF", "country_name": "South Africa", "visa_type": "e_visa", "requirements": "e-Visa available"},
        {"country_code": "KEN", "country_name": "Kenya", "visa_type": "e_visa", "requirements": "e-Visa required"},
        {"country_code": "TZA", "country_name": "Tanzania", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival"},
        {"country_code": "MAR", "country_name": "Morocco", "visa_type": "visa_on_arrival", "requirements": "90 days visa free"},
        {"country_code": "MUS", "country_name": "Mauritius", "visa_type": "visa_on_arrival", "requirements": "90 days visa free"},
        {"country_code": "SYC", "country_name": "Seychelles", "visa_type": "visa_on_arrival", "requirements": "90 days visa free"},
    ]
    
    print(f"Inserting {len(seasons_data)} countries season data...")
    await db.seasons.insert_many(seasons_data)
    
    print(f"Inserting {len(visa_data)} countries visa data...")
    await db.visa.insert_many(visa_data)
    
    print("✓ Data added successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_countries())
