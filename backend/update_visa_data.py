"""
Update visa data with official information from Ministry of External Affairs
Source: visa-facility-for-indian-nationals.pdf
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Country code mappings
COUNTRY_CODES = {
    # Visa Free Countries (16)
    "Barbados": "BRB",
    "Bhutan": "BTN",
    "Dominica": "DMA",
    "Grenada": "GRD",
    "Haiti": "HTI",
    "Hong Kong": "HKG",
    "Maldives": "MDV",
    "Mauritius": "MUS",
    "Montserrat": "MSR",
    "Nepal": "NPL",
    "Niue Island": "NIU",
    "Saint Vincent & the Grenadines": "VCT",
    "Samoa": "WSM",
    "Senegal": "SEN",
    "Serbia": "SRB",
    "Trinidad & Tobago": "TTO",
    
    # Visa on Arrival Countries (26)
    "Angola": "AGO",
    "Bolivia": "BOL",
    "Cabo Verde": "CPV",
    "Cape Verde": "CPV",
    "Cameroon Republic": "CMR",
    "Cameroon": "CMR",
    "Cook Islands": "COK",
    "Fiji": "FJI",
    "Guinea Bissau": "GNB",
    "Indonesia": "IDN",
    "Iran": "IRN",
    "Jamaica": "JAM",
    "Jordan": "JOR",
    "Kiribati": "KIR",
    "Laos": "LAO",
    "Madagascar": "MDG",
    "Mauritania": "MRT",
    "Nigeria": "NGA",
    "Qatar": "QAT",
    "Republic of Marshall Islands": "MHL",
    "Marshall Islands": "MHL",
    "Reunion Island": "REU",
    "Rwanda": "RWA",
    "Seychelles": "SYC",
    "Somalia": "SOM",
    "Tunisia": "TUN",
    "Tuvalu": "TUV",
    "Vanuatu": "VUT",
    "Zimbabwe": "ZWE",
    
    # E-Visa Countries (25)
    "Argentina": "ARG",
    "Armenia": "ARM",
    "Azerbaijan": "AZE",
    "Bahrain": "BHR",
    "Benin": "BEN",
    "Colombia": "COL",
    "Cote D'Ivoire": "CIV",
    "Ivory Coast": "CIV",
    "Djibouti": "DJI",
    "Georgia": "GEO",
    "Kazakhstan": "KAZ",
    "Kyrgyzstan Republic": "KGZ",
    "Kyrgyzstan": "KGZ",
    "Lesotho": "LSO",
    "Malaysia": "MYS",
    "Moldova": "MDA",
    "New Zealand": "NZL",
    "Oman": "OMN",
    "Papua New Guinea": "PNG",
    "Russian Federation": "RUS",
    "Russia": "RUS",
    "Singapore": "SGP",
    "South Korea": "KOR",
    "Korea": "KOR",
    "Taiwan": "TWN",
    "Turkey": "TUR",
    "Uganda": "UGA",
    "Uzbekistan": "UZB",
    "Zambia": "ZMB",
    
    # VoA + E-Visa Countries (11)
    "Kenya": "KEN",
    "Myanmar": "MMR",
    "Saint Lucia": "LCA",
    "Sri Lanka": "LKA",
    "Suriname": "SUR",
    "Tajikistan": "TJK",
    "Tanzania": "TZA",
    "Thailand": "THA",
    "Vietnam": "VNM",
    "Ethiopia": "ETH",
    "Cambodia": "KHM",
}

# Official visa data from MEA PDF
VISA_DATA = [
    # Visa Free Countries (16)
    {"country_code": "BRB", "country_name": "Barbados", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "BTN", "country_name": "Bhutan", "visa_type": "visa_free", "requirements": "Permit required, not visa"},
    {"country_code": "DMA", "country_name": "Dominica", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "GRD", "country_name": "Grenada", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "HTI", "country_name": "Haiti", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "HKG", "country_name": "Hong Kong", "visa_type": "visa_free", "requirements": "14 days visa-free stay"},
    {"country_code": "MDV", "country_name": "Maldives", "visa_type": "visa_free", "requirements": "30 days visa-free on arrival"},
    {"country_code": "MUS", "country_name": "Mauritius", "visa_type": "visa_free", "requirements": "90 days visa-free"},
    {"country_code": "MSR", "country_name": "Montserrat", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "NPL", "country_name": "Nepal", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "NIU", "country_name": "Niue Island", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "VCT", "country_name": "Saint Vincent & the Grenadines", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "WSM", "country_name": "Samoa", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "SEN", "country_name": "Senegal", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    {"country_code": "SRB", "country_name": "Serbia", "visa_type": "visa_free", "requirements": "30 days visa-free"},
    {"country_code": "TTO", "country_name": "Trinidad & Tobago", "visa_type": "visa_free", "requirements": "No visa required for Indians"},
    
    # Visa on Arrival Countries (26)
    {"country_code": "AGO", "country_name": "Angola", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "BOL", "country_name": "Bolivia", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "CPV", "country_name": "Cabo Verde", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "CMR", "country_name": "Cameroon", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "COK", "country_name": "Cook Islands", "visa_type": "visa_on_arrival", "requirements": "31 days visa on arrival"},
    {"country_code": "FJI", "country_name": "Fiji", "visa_type": "visa_on_arrival", "requirements": "4 months visa on arrival"},
    {"country_code": "GNB", "country_name": "Guinea Bissau", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "IDN", "country_name": "Indonesia", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
    {"country_code": "IRN", "country_name": "Iran", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
    {"country_code": "JAM", "country_name": "Jamaica", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "JOR", "country_name": "Jordan", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "KIR", "country_name": "Kiribati", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "LAO", "country_name": "Laos", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
    {"country_code": "MDG", "country_name": "Madagascar", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "MRT", "country_name": "Mauritania", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "NGA", "country_name": "Nigeria", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "QAT", "country_name": "Qatar", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
    {"country_code": "MHL", "country_name": "Marshall Islands", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "REU", "country_name": "Reunion Island", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "RWA", "country_name": "Rwanda", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival"},
    {"country_code": "SYC", "country_name": "Seychelles", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "SOM", "country_name": "Somalia", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "TUN", "country_name": "Tunisia", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "TUV", "country_name": "Tuvalu", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "VUT", "country_name": "Vanuatu", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    {"country_code": "ZWE", "country_name": "Zimbabwe", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival available"},
    
    # E-Visa Countries (25)
    {"country_code": "ARG", "country_name": "Argentina", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "ARM", "country_name": "Armenia", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "AZE", "country_name": "Azerbaijan", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "BHR", "country_name": "Bahrain", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "BEN", "country_name": "Benin", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "COL", "country_name": "Colombia", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "CIV", "country_name": "Cote D'Ivoire", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "DJI", "country_name": "Djibouti", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "GEO", "country_name": "Georgia", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "KAZ", "country_name": "Kazakhstan", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "KGZ", "country_name": "Kyrgyzstan", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "LSO", "country_name": "Lesotho", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "MYS", "country_name": "Malaysia", "visa_type": "e_visa", "requirements": "30 days e-visa (eNTRI)"},
    {"country_code": "MDA", "country_name": "Moldova", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "NZL", "country_name": "New Zealand", "visa_type": "e_visa", "requirements": "NZeTA required online"},
    {"country_code": "OMN", "country_name": "Oman", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "PNG", "country_name": "Papua New Guinea", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "RUS", "country_name": "Russia", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "SGP", "country_name": "Singapore", "visa_type": "e_visa", "requirements": "30 days e-visa"},
    {"country_code": "KOR", "country_name": "South Korea", "visa_type": "e_visa", "requirements": "K-ETA required online"},
    {"country_code": "TWN", "country_name": "Taiwan", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "TUR", "country_name": "Turkey", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "UGA", "country_name": "Uganda", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "UZB", "country_name": "Uzbekistan", "visa_type": "e_visa", "requirements": "E-visa available online"},
    {"country_code": "ZMB", "country_name": "Zambia", "visa_type": "e_visa", "requirements": "E-visa available online"},
    
    # VoA + E-Visa Countries (11) - marking as visa_on_arrival for simplicity
    {"country_code": "KEN", "country_name": "Kenya", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "MMR", "country_name": "Myanmar", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "LCA", "country_name": "Saint Lucia", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "LKA", "country_name": "Sri Lanka", "visa_type": "visa_on_arrival", "requirements": "ETA visa on arrival or e-visa"},
    {"country_code": "SUR", "country_name": "Suriname", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "TJK", "country_name": "Tajikistan", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "TZA", "country_name": "Tanzania", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "THA", "country_name": "Thailand", "visa_type": "visa_on_arrival", "requirements": "15 days visa on arrival or e-visa"},
    {"country_code": "VNM", "country_name": "Vietnam", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "ETH", "country_name": "Ethiopia", "visa_type": "visa_on_arrival", "requirements": "Visa on arrival or e-visa available"},
    {"country_code": "KHM", "country_name": "Cambodia", "visa_type": "visa_on_arrival", "requirements": "30 days visa on arrival or e-visa"},
    
    # Major countries requiring regular visa
    {"country_code": "USA", "country_name": "United States", "visa_type": "visa_required", "requirements": "B1/B2 Tourist Visa required"},
    {"country_code": "GBR", "country_name": "United Kingdom", "visa_type": "visa_required", "requirements": "Standard Visitor Visa required"},
    {"country_code": "CAN", "country_name": "Canada", "visa_type": "visa_required", "requirements": "Visitor Visa required"},
    {"country_code": "AUS", "country_name": "Australia", "visa_type": "visa_required", "requirements": "Visitor Visa (subclass 600) required"},
    {"country_code": "FRA", "country_name": "France", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "DEU", "country_name": "Germany", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "ITA", "country_name": "Italy", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "ESP", "country_name": "Spain", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "NLD", "country_name": "Netherlands", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "BEL", "country_name": "Belgium", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "CHE", "country_name": "Switzerland", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "AUT", "country_name": "Austria", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "PRT", "country_name": "Portugal", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "GRC", "country_name": "Greece", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "SWE", "country_name": "Sweden", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "NOR", "country_name": "Norway", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "DNK", "country_name": "Denmark", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "FIN", "country_name": "Finland", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "POL", "country_name": "Poland", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "CZE", "country_name": "Czech Republic", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "HUN", "country_name": "Hungary", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "HRV", "country_name": "Croatia", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "SVN", "country_name": "Slovenia", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "SVK", "country_name": "Slovakia", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "IRL", "country_name": "Ireland", "visa_type": "visa_required", "requirements": "Irish Visa required"},
    {"country_code": "ISL", "country_name": "Iceland", "visa_type": "visa_required", "requirements": "Schengen Visa required"},
    {"country_code": "CHN", "country_name": "China", "visa_type": "visa_required", "requirements": "Tourist Visa (L) required"},
    {"country_code": "JPN", "country_name": "Japan", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "ARE", "country_name": "United Arab Emirates", "visa_type": "visa_required", "requirements": "Tourist Visa or On-arrival for specific airports"},
    {"country_code": "SAU", "country_name": "Saudi Arabia", "visa_type": "e_visa", "requirements": "E-visa for tourism"},
    {"country_code": "EGY", "country_name": "Egypt", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "MAR", "country_name": "Morocco", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "ZAF", "country_name": "South Africa", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "BRA", "country_name": "Brazil", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "MEX", "country_name": "Mexico", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "PER", "country_name": "Peru", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "CHL", "country_name": "Chile", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "ISR", "country_name": "Israel", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
    {"country_code": "PHL", "country_name": "Philippines", "visa_type": "visa_required", "requirements": "Tourist Visa required"},
]

async def update_visa_data():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing visa data
    await db.visa.delete_many({})
    print("Cleared existing visa data")
    
    # Insert new visa data
    await db.visa.insert_many(VISA_DATA)
    print(f"Inserted {len(VISA_DATA)} visa records")
    
    # Verify counts
    visa_free = await db.visa.count_documents({"visa_type": "visa_free"})
    visa_on_arrival = await db.visa.count_documents({"visa_type": "visa_on_arrival"})
    e_visa = await db.visa.count_documents({"visa_type": "e_visa"})
    visa_required = await db.visa.count_documents({"visa_type": "visa_required"})
    
    print(f"\nVisa data summary:")
    print(f"  Visa Free: {visa_free}")
    print(f"  Visa on Arrival: {visa_on_arrival}")
    print(f"  E-Visa: {e_visa}")
    print(f"  Visa Required: {visa_required}")
    print(f"  Total: {visa_free + visa_on_arrival + e_visa + visa_required}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_visa_data())
