"""
Script to add areas_to_avoid data to the safety collection
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Areas to avoid data for countries with high crime or unsafe tourist areas
areas_to_avoid_data = {
    # High Risk Countries
    "AFG": {
        "areas_to_avoid": ["All areas - Travel not recommended", "Kabul city center after dark", "Border regions with Pakistan"],
        "safety_tips": ["Register with Indian Embassy immediately", "Avoid public gatherings", "Keep low profile", "Have evacuation plan ready"]
    },
    "IRQ": {
        "areas_to_avoid": ["Anbar Province", "Nineveh Province", "Areas near Syrian border", "Kirkuk region"],
        "safety_tips": ["Only travel with security escort", "Avoid all demonstrations", "Keep embassy contacts handy"]
    },
    "SYR": {
        "areas_to_avoid": ["All areas - Do not travel", "Damascus suburbs", "Aleppo", "Homs", "Border regions"],
        "safety_tips": ["Travel is strongly discouraged", "If present, seek immediate evacuation"]
    },
    "YEM": {
        "areas_to_avoid": ["All areas - Do not travel", "Aden", "Sana'a", "Border with Saudi Arabia"],
        "safety_tips": ["Extremely high risk of kidnapping", "No consular services available"]
    },
    "LBY": {
        "areas_to_avoid": ["All areas outside Tripoli center", "Benghazi", "Southern desert regions", "Border areas"],
        "safety_tips": ["Limited embassy services", "High kidnapping risk for foreigners"]
    },
    "SOM": {
        "areas_to_avoid": ["All areas - Extreme danger", "Mogadishu outskirts", "Al-Shabaab controlled regions", "Border with Kenya/Ethiopia"],
        "safety_tips": ["Piracy risk on coast", "No reliable emergency services"]
    },
    "SSD": {
        "areas_to_avoid": ["Unity State", "Upper Nile", "Jonglei", "All border regions"],
        "safety_tips": ["Armed conflict ongoing", "Limited medical facilities"]
    },
    
    # Caution Countries - Popular Tourist Destinations
    "MEX": {
        "areas_to_avoid": ["Tamaulipas state", "Sinaloa (outside tourist areas)", "Guerrero (except Ixtapa-Zihuatanejo)", "Michoacán (except Morelia)", "Colima", "Zacatecas", "Parts of Jalisco outside Guadalajara/Puerto Vallarta"],
        "safety_tips": ["Stick to well-known tourist areas", "Avoid driving at night", "Use toll roads (cuotas)", "Don't display expensive jewelry", "Use authorized taxis only"]
    },
    "BRA": {
        "areas_to_avoid": ["Favelas in Rio de Janeiro", "Complexo do Alemão", "Rocinha after dark", "Certain areas of São Paulo (Cracolândia)", "Porto Alegre outskirts", "Fortaleza suburbs"],
        "safety_tips": ["Don't walk alone at night", "Avoid displaying valuables", "Use registered taxis or Uber", "Be cautious at ATMs", "Avoid deserted beaches"]
    },
    "ZAF": {
        "areas_to_avoid": ["Johannesburg CBD after dark", "Hillbrow area", "Certain townships without guide", "Cape Flats", "Parts of Durban city center"],
        "safety_tips": ["Don't walk after sunset", "Keep car doors locked", "Avoid stopping at traffic lights at night in isolated areas", "Use guarded parking"]
    },
    "COL": {
        "areas_to_avoid": ["Arauca department", "Norte de Santander border areas", "Cauca rural areas", "Putumayo", "Catatumbo region", "Remote jungle areas"],
        "safety_tips": ["Stick to main cities and tourist routes", "Avoid discussing politics", "Don't accept drinks from strangers", "Use registered tour operators"]
    },
    "VEN": {
        "areas_to_avoid": ["Caracas - Petare, 23 de Enero, La Vega", "Maracaibo suburbs", "Border with Colombia", "Remote areas in Bolivar state"],
        "safety_tips": ["Severe economic crisis affects safety", "Cash shortages - carry small USD bills", "Avoid political demonstrations"]
    },
    "PHL": {
        "areas_to_avoid": ["Mindanao (except Davao City)", "Sulu Archipelago", "Basilan", "Marawi City", "Some areas of Manila at night"],
        "safety_tips": ["Terrorist and kidnapping threats in south", "Use reputable tour operators", "Register travel plans with embassy"]
    },
    "IND": {
        "areas_to_avoid": ["Kashmir (LOC areas)", "Manipur rural areas", "Parts of Chhattisgarh (Naxal areas)", "India-Pakistan border", "Remote areas of Arunachal Pradesh"],
        "safety_tips": ["Check permit requirements for Northeast", "Follow local travel advisories", "Avoid border areas"]
    },
    "PAK": {
        "areas_to_avoid": ["Balochistan", "KPK-Afghanistan border", "FATA region", "Interior Sindh rural areas", "Certain areas of Karachi"],
        "safety_tips": ["Travel with local contacts", "Avoid political gatherings", "Register with embassy", "Don't photograph sensitive areas"]
    },
    "EGY": {
        "areas_to_avoid": ["North Sinai", "Egypt-Libya border", "Remote Western Desert areas", "Some areas south of Luxor"],
        "safety_tips": ["Use vetted tour operators for desert trips", "Avoid demonstrations", "Women should dress modestly", "Be cautious at markets"]
    },
    "KEN": {
        "areas_to_avoid": ["Somalia border region", "Garissa County", "Lamu (except island)", "Mandera", "Parts of Nairobi (Eastleigh after dark)"],
        "safety_tips": ["Use safari companies with good reviews", "Avoid walking alone at night", "Don't display expensive items"]
    },
    "THA": {
        "areas_to_avoid": ["Deep South (Yala, Pattani, Narathiwat)", "Thai-Myanmar border in some areas", "Isolated beaches at night"],
        "safety_tips": ["Be wary of scams in tourist areas", "Don't disrespect monarchy", "Avoid political gatherings", "Be careful with motorbike rentals"]
    },
    "TUR": {
        "areas_to_avoid": ["Syrian border provinces", "Sirnak", "Hakkari", "Southeast Turkey (some areas)", "Diyarbakir (exercise caution)"],
        "safety_tips": ["Avoid political demonstrations", "Be aware of local customs", "Register with embassy for updates"]
    },
    "RUS": {
        "areas_to_avoid": ["North Caucasus (Chechnya, Dagestan, Ingushetia)", "Ukraine border regions", "Crimea"],
        "safety_tips": ["Register with local authorities if required", "Avoid political discussions", "Be cautious with photography near government buildings"]
    },
    "USA": {
        "areas_to_avoid": ["Parts of Chicago South Side", "Some areas of Detroit", "Parts of St. Louis", "Certain neighborhoods in Baltimore", "Parts of Memphis at night"],
        "safety_tips": ["Research specific neighborhoods", "Avoid walking alone late at night in cities", "Be aware of local news", "Don't leave valuables in rental cars"]
    },
    "GBR": {
        "areas_to_avoid": ["Generally safe - exercise normal precautions in all major cities at night"],
        "safety_tips": ["Be aware of pickpockets in tourist areas", "Avoid unlicensed taxis", "Keep belongings secure on public transport"]
    },
    "FRA": {
        "areas_to_avoid": ["Paris suburbs (Seine-Saint-Denis) at night", "Some areas near Gare du Nord late at night", "Marseille - certain northern districts"],
        "safety_tips": ["Watch for pickpockets at tourist sites", "Be cautious around Eiffel Tower area", "Avoid Roma camp areas", "Keep passport copies separate"]
    },
    "ITA": {
        "areas_to_avoid": ["Naples - Spanish Quarters at night", "Rome - Termini Station area late at night", "Milan - some peripheral areas"],
        "safety_tips": ["Beware of scooter thieves", "Watch bags at tourist sites", "Avoid unlicensed tour guides", "Don't buy from illegal vendors"]
    },
    "ESP": {
        "areas_to_avoid": ["Barcelona - Raval district late at night", "Some areas near Sagrada Familia at night"],
        "safety_tips": ["Watch for pickpockets on Las Ramblas", "Be careful at beaches with belongings", "Avoid fake petitions on streets"]
    },
    "GRC": {
        "areas_to_avoid": ["Athens - Omonia Square area at night", "Parts of Exarchia", "Some areas near ports"],
        "safety_tips": ["Watch for pickpockets in metros", "Be careful in crowded tourist areas", "Don't accept unsolicited help with luggage"]
    },
    "JPN": {
        "areas_to_avoid": ["Generally very safe - no specific areas to avoid"],
        "safety_tips": ["One of the safest countries", "Follow local customs and rules", "Earthquakes possible - know evacuation routes"]
    },
    "SGP": {
        "areas_to_avoid": ["Generally very safe - no specific areas to avoid"],
        "safety_tips": ["Strict laws - follow all regulations", "Heavy fines for littering, jaywalking", "Don't bring chewing gum"]
    },
    "ARE": {
        "areas_to_avoid": ["Generally safe - standard precautions in industrial areas at night"],
        "safety_tips": ["Respect local customs and dress codes", "Avoid public displays of affection", "Don't photograph government buildings", "Ramadan - don't eat/drink in public during day"]
    },
    "AUS": {
        "areas_to_avoid": ["Remote outback alone", "Kings Cross Sydney late at night", "Some areas of Melbourne CBD very late"],
        "safety_tips": ["Beach safety - swim between flags", "Watch for wildlife", "Sun protection essential", "Don't walk alone in remote areas"]
    },
    "NZL": {
        "areas_to_avoid": ["Generally very safe - no specific high-risk areas"],
        "safety_tips": ["Adventure activities - use licensed operators", "Be prepared for changing weather", "Respect Maori culture"]
    },
    "IDN": {
        "areas_to_avoid": ["Central Sulawesi (Poso area)", "Papua (some areas)", "Aceh (outside tourist areas)"],
        "safety_tips": ["Be careful of motorcycle theft in Bali", "Avoid drug involvement - severe penalties", "Watch for scams at tourist sites"]
    },
    "MYS": {
        "areas_to_avoid": ["Eastern Sabah coast (kidnapping risk)", "Thai border in some areas"],
        "safety_tips": ["Don't discuss sensitive topics (race, religion)", "Respect Islamic customs", "Be aware of bag snatchers"]
    },
    "VNM": {
        "areas_to_avoid": ["Generally safe - exercise normal precautions"],
        "safety_tips": ["Watch for motorbike bag snatchers", "Negotiate prices before services", "Traffic is chaotic - be very careful crossing streets"]
    },
    "PER": {
        "areas_to_avoid": ["VRAEM region", "Colombian border areas", "Parts of Lima (Callao, Villa El Salvador) at night"],
        "safety_tips": ["Altitude sickness possible - acclimatize gradually", "Use registered taxis", "Watch belongings in markets"]
    },
    "ARG": {
        "areas_to_avoid": ["Buenos Aires - La Boca (beyond tourist area)", "Villa 31", "Some areas of Mendoza outskirts"],
        "safety_tips": ["Economic instability - carry cash carefully", "Watch for express kidnappings", "Use radio taxis"]
    },
    "CHL": {
        "areas_to_avoid": ["Generally safe - some areas of Santiago outskirts", "Near protest areas"],
        "safety_tips": ["Be prepared for earthquakes", "Watch belongings in Santiago Metro", "Protests can occur - avoid"]
    },
    "MAR": {
        "areas_to_avoid": ["Western Sahara border areas", "Algeria border"],
        "safety_tips": ["Harassment of women can occur", "Use licensed guides in medinas", "Negotiate prices in advance", "Don't photograph people without permission"]
    },
    "TUN": {
        "areas_to_avoid": ["Libyan border", "Algerian border in south", "Kasserine and Jendouba mountains"],
        "safety_tips": ["Avoid political demonstrations", "Dress modestly outside resorts"]
    },
    "NGA": {
        "areas_to_avoid": ["Northeast (Borno, Yobe, Adamawa)", "Niger Delta", "Middle Belt during tensions", "Lagos - certain areas at night"],
        "safety_tips": ["High crime in urban areas", "Kidnapping risk", "Use verified transportation"]
    },
    "GHA": {
        "areas_to_avoid": ["Northern regions during conflicts", "Some areas of Accra at night"],
        "safety_tips": ["Generally safer than regional neighbors", "Petty crime in cities", "Be careful at ATMs"]
    },
    "ETH": {
        "areas_to_avoid": ["Tigray region", "Amhara (some areas)", "Oromia (some areas)", "Somali region border", "Afar (Danakil - only with tours)"],
        "safety_tips": ["Political instability possible", "Travel with tour operators to remote areas"]
    },
    "TZA": {
        "areas_to_avoid": ["Zanzibar - Stone Town alleys at night", "Dar es Salaam - certain areas after dark"],
        "safety_tips": ["Safari operators should be verified", "Malaria precautions essential", "Respect local customs"]
    },
    "HND": {
        "areas_to_avoid": ["Tegucigalpa - certain barrios", "San Pedro Sula outskirts", "La Ceiba at night"],
        "safety_tips": ["One of highest homicide rates", "Use authorized transportation only", "Don't resist robbery"]
    },
    "SLV": {
        "areas_to_avoid": ["Soyapango", "Apopa", "San Martín", "Parts of San Salvador at night"],
        "safety_tips": ["Gang activity present", "Avoid displaying wealth", "Use trusted taxi services"]
    },
    "GTM": {
        "areas_to_avoid": ["Guatemala City - Zone 18, Zone 21", "Border with Honduras", "Petén (some areas)"],
        "safety_tips": ["Don't travel on buses after dark", "Armed robbery possible", "Use ATMs in malls only"]
    },
    "JAM": {
        "areas_to_avoid": ["Kingston - West Kingston, Trench Town", "Montego Bay - certain downtown areas at night", "Spanish Town"],
        "safety_tips": ["Stay in resort areas", "Don't wander from tourist zones", "Avoid political discussions"]
    },
    "HTI": {
        "areas_to_avoid": ["Port-au-Prince - Cité Soleil, Martissant", "All areas outside secure compounds"],
        "safety_tips": ["Extreme caution required", "Kidnapping risk very high", "Infrastructure severely limited"]
    },
    "DOM": {
        "areas_to_avoid": ["Santo Domingo - Los Alcarrizos, Capotillo", "Haitian border"],
        "safety_tips": ["Stay in tourist areas", "Use hotel-recommended transportation", "Don't walk alone at night"]
    },
    "PAN": {
        "areas_to_avoid": ["Darién Gap (Colombia border)", "Colón (outside tourist port)", "Parts of Panama City (El Chorrillo)"],
        "safety_tips": ["Generally safe in tourist areas", "Be careful with valuables in cities"]
    },
    "CRI": {
        "areas_to_avoid": ["San José - certain areas at night", "Limón city center"],
        "safety_tips": ["Generally safest in Central America", "Petty theft common", "Don't leave items in rental cars"]
    },
    "ECU": {
        "areas_to_avoid": ["Colombian border (Esmeraldas province)", "Guayaquil - certain sectors", "Parts of Quito (south)"],
        "safety_tips": ["Express kidnapping possible", "Use trusted transportation", "Altitude sickness in Quito"]
    },
    "BOL": {
        "areas_to_avoid": ["Chapare region", "Some border areas", "El Alto at night"],
        "safety_tips": ["Political protests common", "Altitude sickness serious risk", "Fake police scams reported"]
    },
    "PRY": {
        "areas_to_avoid": ["Triple Frontier area", "Pedro Juan Caballero", "Remote Chaco"],
        "safety_tips": ["Drug trafficking route", "Stick to main cities and tourist areas"]
    },
    "UKR": {
        "areas_to_avoid": ["All areas due to ongoing conflict", "Crimea", "Donetsk", "Luhansk", "Kharkiv", "Zaporizhzhia", "Areas near Russian/Belarus borders"],
        "safety_tips": ["Do not travel", "Active war zone", "If present, evacuate immediately"]
    },
    "BLR": {
        "areas_to_avoid": ["Ukrainian border", "Areas near military installations"],
        "safety_tips": ["Political situation volatile", "Avoid all demonstrations", "Limited Western banking access"]
    },
    "LKA": {
        "areas_to_avoid": ["Generally safe post-conflict", "Exercise caution in Northern Province"],
        "safety_tips": ["Economic crisis may affect services", "Respect religious sites", "Don't photograph military areas"]
    },
    "NPL": {
        "areas_to_avoid": ["Generally safe - use trekking guides in mountains", "Tibet border (permits required)"],
        "safety_tips": ["Altitude sickness in mountains", "Use registered trekking agencies", "Political protests possible"]
    },
    "BGD": {
        "areas_to_avoid": ["Chittagong Hill Tracts (permit areas)", "Rohingya camp areas", "India border areas"],
        "safety_tips": ["Political protests can turn violent", "Traffic extremely chaotic", "Avoid demonstrations"]
    },
    "MMR": {
        "areas_to_avoid": ["All areas due to civil conflict", "Rakhine State", "Kachin State", "Shan State", "Chin State", "Sagaing Region"],
        "safety_tips": ["Military coup situation ongoing", "Arbitrary detention risk", "Very limited consular assistance"]
    },
    "CHN": {
        "areas_to_avoid": ["Tibet (requires special permit)", "Xinjiang (high surveillance)", "North Korea border"],
        "safety_tips": ["VPN needed for many websites", "Don't discuss sensitive political topics", "Follow all regulations strictly"]
    },
    "PRK": {
        "areas_to_avoid": ["All independent travel not permitted"],
        "safety_tips": ["Only organized tours allowed", "All movements monitored", "Severe penalties for violations"]
    }
}

async def update_safety_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    updated_count = 0
    
    for country_code, data in areas_to_avoid_data.items():
        update_fields = {}
        
        if "areas_to_avoid" in data:
            update_fields["areas_to_avoid"] = data["areas_to_avoid"]
        
        if "safety_tips" in data:
            update_fields["safety_tips"] = data["safety_tips"]
        
        if update_fields:
            result = await db.safety.update_one(
                {"country_code": country_code},
                {"$set": update_fields},
                upsert=False
            )
            if result.modified_count > 0:
                updated_count += 1
                print(f"Updated {country_code}")
    
    print(f"\nTotal updated: {updated_count} countries")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_safety_data())
