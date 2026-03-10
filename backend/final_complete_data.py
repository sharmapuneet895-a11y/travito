from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def populate_final_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Note: react-simple-maps uses ISO 3166-1 alpha-3 codes
    # We need to match both the ID and properties for better matching
    
    seasons_data = [
        # North America (with multiple code attempts for USA)
        {"country_code": "USA", "country_name": "United States", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "US", "country_name": "United States", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "GRL", "country_name": "Greenland", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "CAN", "country_name": "Canada", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "MEX", "country_name": "Mexico", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "CUB", "country_name": "Cuba", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "DOM", "country_name": "Dominican Republic", "season_type": "off", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "JAM", "country_name": "Jamaica", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "BHS", "country_name": "Bahamas", "season_type": "off", "best_months": ["Dec", "Jan", "Feb", "Mar", "Apr"]},
        {"country_code": "BRB", "country_name": "Barbados", "season_type": "off", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "CRI", "country_name": "Costa Rica", "season_type": "off", "best_months": ["Dec", "Jan", "Feb", "Mar", "Apr"]},
        {"country_code": "PAN", "country_name": "Panama", "season_type": "shoulder", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "GTM", "country_name": "Guatemala", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "BLZ", "country_name": "Belize", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        
        # South America
        {"country_code": "BRA", "country_name": "Brazil", "season_type": "off", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "ARG", "country_name": "Argentina", "season_type": "shoulder", "best_months": ["Oct", "Nov", "Mar", "Apr"]},
        {"country_code": "CHL", "country_name": "Chile", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "PER", "country_name": "Peru", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "COL", "country_name": "Colombia", "season_type": "shoulder", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "ECU", "country_name": "Ecuador", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "BOL", "country_name": "Bolivia", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug"]},
        {"country_code": "PRY", "country_name": "Paraguay", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug"]},
        {"country_code": "URY", "country_name": "Uruguay", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "VEN", "country_name": "Venezuela", "season_type": "shoulder", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "GUY", "country_name": "Guyana", "season_type": "shoulder", "best_months": ["Feb", "Mar", "Aug", "Sep"]},
        {"country_code": "SUR", "country_name": "Suriname", "season_type": "shoulder", "best_months": ["Feb", "Mar", "Aug", "Sep"]},
        
        # Western Europe
        {"country_code": "GBR", "country_name": "United Kingdom", "season_type": "shoulder", "best_months": ["May", "Sep"]},
        {"country_code": "FRA", "country_name": "France", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "DEU", "country_name": "Germany", "season_type": "shoulder", "best_months": ["May", "Sep", "Oct"]},
        {"country_code": "ITA", "country_name": "Italy", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "ESP", "country_name": "Spain", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "PRT", "country_name": "Portugal", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "NLD", "country_name": "Netherlands", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep"]},
        {"country_code": "BEL", "country_name": "Belgium", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "CHE", "country_name": "Switzerland", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "AUT", "country_name": "Austria", "season_type": "shoulder", "best_months": ["May", "Sep"]},
        {"country_code": "IRL", "country_name": "Ireland", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "LUX", "country_name": "Luxembourg", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        
        # Northern Europe
        {"country_code": "NOR", "country_name": "Norway", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "SWE", "country_name": "Sweden", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "DNK", "country_name": "Denmark", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "FIN", "country_name": "Finland", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "ISL", "country_name": "Iceland", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        
        # Eastern Europe
        {"country_code": "POL", "country_name": "Poland", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "CZE", "country_name": "Czech Republic", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "HUN", "country_name": "Hungary", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "ROU", "country_name": "Romania", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "BGR", "country_name": "Bulgaria", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "HRV", "country_name": "Croatia", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "SRB", "country_name": "Serbia", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "SVK", "country_name": "Slovakia", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "SVN", "country_name": "Slovenia", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "EST", "country_name": "Estonia", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "LVA", "country_name": "Latvia", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "LTU", "country_name": "Lithuania", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "UKR", "country_name": "Ukraine", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "BLR", "country_name": "Belarus", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug"]},
        {"country_code": "MDA", "country_name": "Moldova", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        
        # Southern Europe & Mediterranean
        {"country_code": "GRC", "country_name": "Greece", "season_type": "peak", "best_months": ["Jun", "Jul", "Aug"]},
        {"country_code": "TUR", "country_name": "Turkey", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "CYP", "country_name": "Cyprus", "season_type": "peak", "best_months": ["May", "Jun", "Sep", "Oct"]},
        {"country_code": "MLT", "country_name": "Malta", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "ALB", "country_name": "Albania", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "MKD", "country_name": "North Macedonia", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "BIH", "country_name": "Bosnia and Herzegovina", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "MNE", "country_name": "Montenegro", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        
        # Russia & Central Asia
        {"country_code": "RUS", "country_name": "Russia", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "KAZ", "country_name": "Kazakhstan", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "UZB", "country_name": "Uzbekistan", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "TKM", "country_name": "Turkmenistan", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "TJK", "country_name": "Tajikistan", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep"]},
        {"country_code": "KGZ", "country_name": "Kyrgyzstan", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "AZE", "country_name": "Azerbaijan", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "GEO", "country_name": "Georgia", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep", "Oct"]},
        {"country_code": "ARM", "country_name": "Armenia", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep", "Oct"]},
        
        # Middle East
        {"country_code": "ARE", "country_name": "United Arab Emirates", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "SAU", "country_name": "Saudi Arabia", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "QAT", "country_name": "Qatar", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "OMN", "country_name": "Oman", "season_type": "off", "best_months": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "KWT", "country_name": "Kuwait", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "BHR", "country_name": "Bahrain", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "JOR", "country_name": "Jordan", "season_type": "shoulder", "best_months": ["Mar", "Apr", "May", "Sep", "Oct"]},
        {"country_code": "ISR", "country_name": "Israel", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "PSE", "country_name": "Palestine", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "LBN", "country_name": "Lebanon", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "IRQ", "country_name": "Iraq", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "IRN", "country_name": "Iran", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "YEM", "country_name": "Yemen", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "SYR", "country_name": "Syria", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        
        # East Asia
        {"country_code": "CHN", "country_name": "China", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "JPN", "country_name": "Japan", "season_type": "peak", "best_months": ["Mar", "Apr", "Oct", "Nov"]},
        {"country_code": "KOR", "country_name": "South Korea", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "PRK", "country_name": "North Korea", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "TWN", "country_name": "Taiwan", "season_type": "shoulder", "best_months": ["Oct", "Nov", "Mar", "Apr"]},
        {"country_code": "HKG", "country_name": "Hong Kong", "season_type": "shoulder", "best_months": ["Oct", "Nov", "Dec", "Mar", "Apr"]},
        {"country_code": "MAC", "country_name": "Macau", "season_type": "shoulder", "best_months": ["Oct", "Nov", "Dec", "Mar"]},
        {"country_code": "MNG", "country_name": "Mongolia", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        
        # Southeast Asia
        {"country_code": "THA", "country_name": "Thailand", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "VNM", "country_name": "Vietnam", "season_type": "off", "best_months": ["Feb", "Mar", "Apr"]},
        {"country_code": "SGP", "country_name": "Singapore", "season_type": "shoulder", "best_months": ["Feb", "Mar", "Jul", "Aug"]},
        {"country_code": "MYS", "country_name": "Malaysia", "season_type": "off", "best_months": ["Dec", "Jan", "Feb"]},
        {"country_code": "IDN", "country_name": "Indonesia", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "PHL", "country_name": "Philippines", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "MMR", "country_name": "Myanmar", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "KHM", "country_name": "Cambodia", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "LAO", "country_name": "Laos", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "BRN", "country_name": "Brunei", "season_type": "shoulder", "best_months": ["Feb", "Mar", "Apr"]},
        {"country_code": "TLS", "country_name": "Timor-Leste", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug"]},
        
        # South Asia
        {"country_code": "IND", "country_name": "India", "season_type": "off", "best_months": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "PAK", "country_name": "Pakistan", "season_type": "shoulder", "best_months": ["Oct", "Nov", "Mar", "Apr"]},
        {"country_code": "BGD", "country_name": "Bangladesh", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "LKA", "country_name": "Sri Lanka", "season_type": "off", "best_months": ["Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "NPL", "country_name": "Nepal", "season_type": "off", "best_months": ["Oct", "Nov", "Mar", "Apr"]},
        {"country_code": "BTN", "country_name": "Bhutan", "season_type": "off", "best_months": ["Oct", "Nov", "Mar", "Apr"]},
        {"country_code": "MDV", "country_name": "Maldives", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "AFG", "country_name": "Afghanistan", "season_type": "shoulder", "best_months": ["Mar", "Apr", "May", "Sep", "Oct"]},
        
        # North Africa
        {"country_code": "EGY", "country_name": "Egypt", "season_type": "off", "best_months": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]},
        {"country_code": "MAR", "country_name": "Morocco", "season_type": "shoulder", "best_months": ["Mar", "Apr", "May", "Sep", "Oct"]},
        {"country_code": "TUN", "country_name": "Tunisia", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct"]},
        {"country_code": "DZA", "country_name": "Algeria", "season_type": "shoulder", "best_months": ["Mar", "Apr", "May", "Sep", "Oct"]},
        {"country_code": "LBY", "country_name": "Libya", "season_type": "shoulder", "best_months": ["Mar", "Apr", "May", "Oct", "Nov"]},
        {"country_code": "SDN", "country_name": "Sudan", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "ESH", "country_name": "Western Sahara", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        
        # Sub-Saharan Africa
        {"country_code": "ZAF", "country_name": "South Africa", "season_type": "shoulder", "best_months": ["May", "Jun", "Sep", "Oct"]},
        {"country_code": "KEN", "country_name": "Kenya", "season_type": "off", "best_months": ["Jun", "Jul", "Aug", "Sep", "Oct"]},
        {"country_code": "TZA", "country_name": "Tanzania", "season_type": "off", "best_months": ["Jun", "Jul", "Aug", "Sep", "Oct"]},
        {"country_code": "UGA", "country_name": "Uganda", "season_type": "off", "best_months": ["Jun", "Jul", "Aug", "Dec", "Jan", "Feb"]},
        {"country_code": "RWA", "country_name": "Rwanda", "season_type": "off", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "ETH", "country_name": "Ethiopia", "season_type": "shoulder", "best_months": ["Oct", "Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "NGA", "country_name": "Nigeria", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "GHA", "country_name": "Ghana", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "SEN", "country_name": "Senegal", "season_type": "off", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "ZWE", "country_name": "Zimbabwe", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "BWA", "country_name": "Botswana", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "NAM", "country_name": "Namibia", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "MUS", "country_name": "Mauritius", "season_type": "off", "best_months": ["May", "Jun", "Sep", "Oct", "Nov"]},
        {"country_code": "SYC", "country_name": "Seychelles", "season_type": "off", "best_months": ["Apr", "May", "Oct", "Nov"]},
        {"country_code": "MDG", "country_name": "Madagascar", "season_type": "shoulder", "best_months": ["Apr", "May", "Sep", "Oct", "Nov"]},
        {"country_code": "MOZ", "country_name": "Mozambique", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "ZMB", "country_name": "Zambia", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "AGO", "country_name": "Angola", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug"]},
        {"country_code": "CMR", "country_name": "Cameroon", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "CIV", "country_name": "Côte d'Ivoire", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "MLI", "country_name": "Mali", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "NER", "country_name": "Niger", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "TCD", "country_name": "Chad", "season_type": "shoulder", "best_months": ["Nov", "Dec", "Jan", "Feb"]},
        {"country_code": "SOM", "country_name": "Somalia", "season_type": "shoulder", "best_months": ["Dec", "Jan", "Feb"]},
        {"country_code": "COD", "country_name": "Democratic Republic of the Congo", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "COG", "country_name": "Republic of the Congo", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug"]},
        
        # Oceania
        {"country_code": "AUS", "country_name": "Australia", "season_type": "peak", "best_months": ["Dec", "Jan", "Feb"]},
        {"country_code": "NZL", "country_name": "New Zealand", "season_type": "peak", "best_months": ["Dec", "Jan", "Feb"]},
        {"country_code": "FJI", "country_name": "Fiji", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]},
        {"country_code": "PNG", "country_name": "Papua New Guinea", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug"]},
        {"country_code": "NCL", "country_name": "New Caledonia", "season_type": "shoulder", "best_months": ["Sep", "Oct", "Nov"]},
        {"country_code": "VUT", "country_name": "Vanuatu", "season_type": "shoulder", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "WSM", "country_name": "Samoa", "season_type": "off", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "TON", "country_name": "Tonga", "season_type": "off", "best_months": ["May", "Jun", "Jul", "Aug", "Sep"]},
        {"country_code": "SLB", "country_name": "Solomon Islands", "season_type": "shoulder", "best_months": ["Jun", "Jul", "Aug", "Sep"]},
    ]
    
    print(f"Inserting {len(seasons_data)} seasons records...")
    await db.seasons.insert_many(seasons_data)
    
    # Create visa data (matching codes)
    visa_data = []
    processed_codes = set()
    
    for country in seasons_data:
        code = country["country_code"]
        if code in processed_codes:
            continue
        processed_codes.add(code)
        
        name = country["country_name"]
        
        # Define visa types
        if code in ["THA", "IDN", "NPL", "JOR", "ARE", "QAT", "OMN", "MDV", "MUS", "SYC", "PHL", "FJI", "JAM", "BRB", "BHS", "MAR", "TZA", "PER", "CHL", "ARG", "COL", "ECU"]:
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"})
        elif code in ["SGP", "MYS", "VNM", "KOR", "LKA", "AUS", "NZL", "TUR", "MEX", "BRA", "ZAF", "KEN", "EGY", "SAU", "UKR", "RUS"]:
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "e_visa", "requirements": "e-Visa available online"})
        elif code == "IND":
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "visa_required", "requirements": "Home country - No visa needed"})
        elif code in ["USA", "US"]:
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "visa_required", "requirements": "B1/B2 Tourist Visa required"})
        elif code == "GRL":
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "visa_required", "requirements": "Denmark Schengen Visa"})
        elif code == "CAN":
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "visa_required", "requirements": "Visitor Visa/eTA required"})
        elif code in ["FRA", "DEU", "ITA", "ESP", "GRC", "NLD", "BEL", "AUT", "CHE", "PRT", "NOR", "SWE", "DNK", "FIN", "ISL", "POL", "CZE", "HUN", "HRV", "SVN", "EST", "LVA", "LTU", "MLT", "CYP", "LUX", "SVK"]:
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "visa_required", "requirements": "Schengen Visa required"})
        else:
            visa_data.append({"country_code": code, "country_name": name, "visa_type": "visa_required", "requirements": "Visa required - apply at embassy"})
    
    print(f"Inserting {len(visa_data)} visa records...")
    await db.visa.insert_many(visa_data)
    
    # Blog/tips data
    blogs_data = [
        {
            "title": "Top 10 Budget Travel Destinations for Indian Travelers in 2026",
            "slug": "budget-travel-destinations-2026",
            "category": "Budget Travel",
            "author": "Travel Team",
            "date": "2026-01-15",
            "excerpt": "Discover affordable international destinations that won't break the bank. From Southeast Asia to Eastern Europe, these countries offer incredible value for Indian travelers.",
            "content": "Are you dreaming of international travel but worried about expenses? We've compiled the ultimate list of budget-friendly destinations...",
            "image_url": "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
            "tags": ["budget", "travel tips", "2026", "backpacking"],
            "read_time": 8
        },
        {
            "title": "Complete Visa Guide: E-Visa vs Visa on Arrival",
            "slug": "visa-guide-evisa-vs-arrival",
            "category": "Visa Tips",
            "author": "Visa Expert",
            "date": "2026-01-10",
            "excerpt": "Understanding the differences between e-visa and visa on arrival can save you time and hassle. Here's everything Indian passport holders need to know.",
            "content": "Navigating visa requirements can be confusing. Let's break down the key differences...",
            "image_url": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
            "tags": ["visa", "travel documents", "tips"],
            "read_time": 6
        },
        {
            "title": "Best Time to Visit Europe: Month-by-Month Guide",
            "slug": "europe-travel-month-guide",
            "category": "Seasonal Travel",
            "author": "Europe Specialist",
            "date": "2026-01-08",
            "excerpt": "Plan your European adventure with our comprehensive month-by-month breakdown. Learn about weather, crowds, and the best deals for each season.",
            "content": "Europe offers something special in every season. Whether you prefer summer festivals or winter markets...",
            "image_url": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b",
            "tags": ["europe", "seasons", "planning"],
            "read_time": 10
        },
        {
            "title": "Essential Travel Apps You Must Download Before Flying",
            "slug": "essential-travel-apps-2026",
            "category": "Tech & Apps",
            "author": "Digital Nomad",
            "date": "2026-01-05",
            "excerpt": "From navigation to language translation, these apps will make your international travel smoother. Our curated list for Indian travelers.",
            "content": "Technology has revolutionized how we travel. Here are the must-have apps for every traveler...",
            "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
            "tags": ["apps", "technology", "travel hacks"],
            "read_time": 5
        },
        {
            "title": "Currency Exchange: How to Get the Best Rates",
            "slug": "currency-exchange-best-rates",
            "category": "Money Tips",
            "author": "Finance Guru",
            "date": "2026-01-03",
            "excerpt": "Stop losing money on poor exchange rates. Learn the insider tricks to get the most value when converting your Indian Rupees.",
            "content": "Currency exchange can significantly impact your travel budget. Here's how to maximize your money...",
            "image_url": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e",
            "tags": ["forex", "money", "travel tips"],
            "read_time": 7
        },
        {
            "title": "Southeast Asia for First-Time Travelers",
            "slug": "southeast-asia-first-timers",
            "category": "Destination Guide",
            "author": "Asia Expert",
            "date": "2025-12-28",
            "excerpt": "Your complete guide to exploring Thailand, Vietnam, and Singapore. Perfect for Indian travelers visiting Southeast Asia for the first time.",
            "content": "Southeast Asia is the perfect introduction to international travel for Indians. Here's why...",
            "image_url": "https://images.unsplash.com/photo-1528181304800-259b08848526",
            "tags": ["southeast asia", "beginner", "guide"],
            "read_time": 12
        }
    ]
    
    print(f"Inserting {len(blogs_data)} blog articles...")
    await db.blogs.insert_many(blogs_data)
    
    # Apps data (comprehensive, no duplicates)
    apps_data = [
        # USA
        {"country_code": "USA", "country_name": "United States", "category": "transport", "app_name": "Uber", "description": "Ride-sharing service", "icon_url": None},
        {"country_code": "USA", "country_name": "United States", "category": "convenience", "app_name": "Amazon", "description": "Shopping & delivery", "icon_url": None},
        {"country_code": "USA", "country_name": "United States", "category": "food", "app_name": "DoorDash", "description": "Food delivery", "icon_url": None},
        {"country_code": "USA", "country_name": "United States", "category": "sightseeing", "app_name": "TripAdvisor", "description": "Travel guide & reviews", "icon_url": None},
        
        # UK
        {"country_code": "GBR", "country_name": "United Kingdom", "category": "transport", "app_name": "Citymapper", "description": "Public transport navigation", "icon_url": None},
        {"country_code": "GBR", "country_name": "United Kingdom", "category": "convenience", "app_name": "Revolut", "description": "Digital banking", "icon_url": None},
        {"country_code": "GBR", "country_name": "United Kingdom", "category": "food", "app_name": "Deliveroo", "description": "Food delivery", "icon_url": None},
        {"country_code": "GBR", "country_name": "United Kingdom", "category": "sightseeing", "app_name": "Visit Britain", "description": "Official tourism guide", "icon_url": None},
        
        # France
        {"country_code": "FRA", "country_name": "France", "category": "transport", "app_name": "BlaBlaCar", "description": "Carpooling & rideshare", "icon_url": None},
        {"country_code": "FRA", "country_name": "France", "category": "convenience", "app_name": "Lydia", "description": "Mobile payment", "icon_url": None},
        {"country_code": "FRA", "country_name": "France", "category": "food", "app_name": "Uber Eats", "description": "Food delivery", "icon_url": None},
        {"country_code": "FRA", "country_name": "France", "category": "sightseeing", "app_name": "Paris City Vision", "description": "Tours & attractions", "icon_url": None},
        
        # Germany
        {"country_code": "DEU", "country_name": "Germany", "category": "transport", "app_name": "DB Navigator", "description": "Train schedules & tickets", "icon_url": None},
        {"country_code": "DEU", "country_name": "Germany", "category": "convenience", "app_name": "N26", "description": "Mobile banking", "icon_url": None},
        {"country_code": "DEU", "country_name": "Germany", "category": "food", "app_name": "Lieferando", "description": "Food delivery", "icon_url": None},
        {"country_code": "DEU", "country_name": "Germany", "category": "sightseeing", "app_name": "Get Your Guide", "description": "Tours & experiences", "icon_url": None},
        
        # Japan
        {"country_code": "JPN", "country_name": "Japan", "category": "transport", "app_name": "Hyperdia", "description": "Train route finder", "icon_url": None},
        {"country_code": "JPN", "country_name": "Japan", "category": "convenience", "app_name": "PayPay", "description": "Mobile payment", "icon_url": None},
        {"country_code": "JPN", "country_name": "Japan", "category": "food", "app_name": "Tabelog", "description": "Restaurant reviews", "icon_url": None},
        {"country_code": "JPN", "country_name": "Japan", "category": "sightseeing", "app_name": "JNTO Guide", "description": "Official travel guide", "icon_url": None},
        
        # Thailand
        {"country_code": "THA", "country_name": "Thailand", "category": "transport", "app_name": "Grab", "description": "Ride-hailing & delivery", "icon_url": None},
        {"country_code": "THA", "country_name": "Thailand", "category": "convenience", "app_name": "Line", "description": "Messaging & payments", "icon_url": None},
        {"country_code": "THA", "country_name": "Thailand", "category": "food", "app_name": "Foodpanda", "description": "Food delivery", "icon_url": None},
        {"country_code": "THA", "country_name": "Thailand", "category": "sightseeing", "app_name": "Amazing Thailand", "description": "Tourism guide", "icon_url": None},
        
        # Singapore
        {"country_code": "SGP", "country_name": "Singapore", "category": "transport", "app_name": "MyTransport.SG", "description": "Public transport info", "icon_url": None},
        {"country_code": "SGP", "country_name": "Singapore", "category": "convenience", "app_name": "GrabPay", "description": "Digital wallet", "icon_url": None},
        {"country_code": "SGP", "country_name": "Singapore", "category": "food", "app_name": "GrabFood", "description": "Food delivery", "icon_url": None},
        {"country_code": "SGP", "country_name": "Singapore", "category": "sightseeing", "app_name": "Visit Singapore", "description": "Official guide", "icon_url": None},
        
        # UAE
        {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "transport", "app_name": "Careem", "description": "Ride-hailing", "icon_url": None},
        {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "convenience", "app_name": "Noon", "description": "E-commerce", "icon_url": None},
        {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "food", "app_name": "Talabat", "description": "Food delivery", "icon_url": None},
        {"country_code": "ARE", "country_name": "United Arab Emirates", "category": "sightseeing", "app_name": "Visit Dubai", "description": "Tourism guide", "icon_url": None},
        
        # Australia
        {"country_code": "AUS", "country_name": "Australia", "category": "transport", "app_name": "TripView", "description": "Public transport", "icon_url": None},
        {"country_code": "AUS", "country_name": "Australia", "category": "convenience", "app_name": "CommBank", "description": "Mobile banking", "icon_url": None},
        {"country_code": "AUS", "country_name": "Australia", "category": "food", "app_name": "Menulog", "description": "Food delivery", "icon_url": None},
        {"country_code": "AUS", "country_name": "Australia", "category": "sightseeing", "app_name": "Australia.com", "description": "Official travel guide", "icon_url": None},
        
        # Canada
        {"country_code": "CAN", "country_name": "Canada", "category": "transport", "app_name": "Transit", "description": "Public transport", "icon_url": None},
        {"country_code": "CAN", "country_name": "Canada", "category": "convenience", "app_name": "Interac", "description": "Mobile payments", "icon_url": None},
        {"country_code": "CAN", "country_name": "Canada", "category": "food", "app_name": "SkipTheDishes", "description": "Food delivery", "icon_url": None},
        {"country_code": "CAN", "country_name": "Canada", "category": "sightseeing", "app_name": "Destination Canada", "description": "Travel guide", "icon_url": None},
        
        # Spain
        {"country_code": "ESP", "country_name": "Spain", "category": "transport", "app_name": "Renfe", "description": "Train tickets", "icon_url": None},
        {"country_code": "ESP", "country_name": "Spain", "category": "convenience", "app_name": "Bizum", "description": "Mobile payments", "icon_url": None},
        {"country_code": "ESP", "country_name": "Spain", "category": "food", "app_name": "Glovo", "description": "Food & goods delivery", "icon_url": None},
        {"country_code": "ESP", "country_name": "Spain", "category": "sightseeing", "app_name": "Spain.info", "description": "Tourism guide", "icon_url": None},
        
        # Italy
        {"country_code": "ITA", "country_name": "Italy", "category": "transport", "app_name": "Trenitalia", "description": "Train tickets", "icon_url": None},
        {"country_code": "ITA", "country_name": "Italy", "category": "convenience", "app_name": "Satispay", "description": "Mobile payments", "icon_url": None},
        {"country_code": "ITA", "country_name": "Italy", "category": "food", "app_name": "Deliveroo IT", "description": "Food delivery", "icon_url": None},
        {"country_code": "ITA", "country_name": "Italy", "category": "sightseeing", "app_name": "Italia.it", "description": "Official tourism", "icon_url": None},
        
        # South Korea
        {"country_code": "KOR", "country_name": "South Korea", "category": "transport", "app_name": "KakaoT", "description": "Ride-hailing & taxi", "icon_url": None},
        {"country_code": "KOR", "country_name": "South Korea", "category": "convenience", "app_name": "KakaoPay", "description": "Mobile wallet", "icon_url": None},
        {"country_code": "KOR", "country_name": "South Korea", "category": "food", "app_name": "Yogiyo", "description": "Food delivery", "icon_url": None},
        {"country_code": "KOR", "country_name": "South Korea", "category": "sightseeing", "app_name": "Visit Korea", "description": "Tourism guide", "icon_url": None},
        
        # Brazil
        {"country_code": "BRA", "country_name": "Brazil", "category": "transport", "app_name": "99", "description": "Ride-hailing", "icon_url": None},
        {"country_code": "BRA", "country_name": "Brazil", "category": "convenience", "app_name": "Nubank", "description": "Digital banking", "icon_url": None},
        {"country_code": "BRA", "country_name": "Brazil", "category": "food", "app_name": "iFood", "description": "Food delivery", "icon_url": None},
        {"country_code": "BRA", "country_name": "Brazil", "category": "sightseeing", "app_name": "Visit Brasil", "description": "Tourism guide", "icon_url": None},
        
        # Mexico
        {"country_code": "MEX", "country_name": "Mexico", "category": "transport", "app_name": "Didi", "description": "Ride-hailing", "icon_url": None},
        {"country_code": "MEX", "country_name": "Mexico", "category": "convenience", "app_name": "Mercado Pago", "description": "Mobile payments", "icon_url": None},
        {"country_code": "MEX", "country_name": "Mexico", "category": "food", "app_name": "Rappi", "description": "Food & goods delivery", "icon_url": None},
        {"country_code": "MEX", "country_name": "Mexico", "category": "sightseeing", "app_name": "Visit Mexico", "description": "Tourism guide", "icon_url": None},
        
        # China
        {"country_code": "CHN", "country_name": "China", "category": "transport", "app_name": "Didi Chuxing", "description": "Ride-hailing", "icon_url": None},
        {"country_code": "CHN", "country_name": "China", "category": "convenience", "app_name": "Alipay", "description": "Mobile payment", "icon_url": None},
        {"country_code": "CHN", "country_name": "China", "category": "food", "app_name": "Meituan", "description": "Food delivery & services", "icon_url": None},
        {"country_code": "CHN", "country_name": "China", "category": "sightseeing", "app_name": "Ctrip", "description": "Travel bookings", "icon_url": None},
        
        # Indonesia
        {"country_code": "IDN", "country_name": "Indonesia", "category": "transport", "app_name": "Gojek", "description": "Ride-hailing & services", "icon_url": None},
        {"country_code": "IDN", "country_name": "Indonesia", "category": "convenience", "app_name": "OVO", "description": "Digital wallet", "icon_url": None},
        {"country_code": "IDN", "country_name": "Indonesia", "category": "food", "app_name": "GoFood", "description": "Food delivery", "icon_url": None},
        {"country_code": "IDN", "country_name": "Indonesia", "category": "sightseeing", "app_name": "Wonderful Indonesia", "description": "Tourism guide", "icon_url": None},
        
        # India
        {"country_code": "IND", "country_name": "India", "category": "transport", "app_name": "Ola", "description": "Ride-hailing", "icon_url": None},
        {"country_code": "IND", "country_name": "India", "category": "convenience", "app_name": "Paytm", "description": "Digital wallet & payments", "icon_url": None},
        {"country_code": "IND", "country_name": "India", "category": "food", "app_name": "Zomato", "description": "Food delivery", "icon_url": None},
        {"country_code": "IND", "country_name": "India", "category": "sightseeing", "app_name": "Incredible India", "description": "Official tourism", "icon_url": None},
    ]
    
    print(f"Inserting {len(apps_data)} app records...")
    await db.apps.insert_many(apps_data)
    
    print(f"\n✅ Successfully populated:")
    print(f"   - {len(seasons_data)} seasons records")
    print(f"   - {len(visa_data)} visa records")
    print(f"   - {len(blogs_data)} blog articles")
    print(f"   - {len(apps_data)} app recommendations")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_final_data())
