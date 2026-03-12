"""
Script to add dates to existing festival data in MongoDB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Festival dates mapping - comprehensive list
FESTIVAL_DATES = {
    # January
    "new year": "January 1",
    "new year celebrations": "January 1",
    "chinese new year": "Late January - February",
    "spring festival": "Late January - February",
    "republic day": "January 26",
    "pongal": "January 14-17",
    "makar sankranti": "January 14",
    
    # February
    "rio carnival": "February (varies)",
    "carnival": "February - March",
    "venice carnival": "February (varies)",
    "mardi gras": "February - March",
    "valentine's day": "February 14",
    "super bowl": "First Sunday of February",
    "losar": "February (varies)",
    
    # March
    "holi": "March (Full Moon)",
    "st. patrick's day": "March 17",
    "st patrick's day": "March 17",
    "nowruz": "March 20-21",
    "persian new year": "March 20-21",
    "nyepi": "March (varies)",
    
    # April
    "cherry blossom": "Late March - April",
    "hanami": "Late March - April",
    "songkran": "April 13-15",
    "easter": "March/April (varies)",
    "baisakhi": "April 13-14",
    "king's day": "April 27",
    "koningsdag": "April 27",
    
    # May
    "may day": "May 1",
    "vesak": "May (Full Moon)",
    "buddha purnima": "May (Full Moon)",
    "memorial day": "Last Monday of May",
    "cinco de mayo": "May 5",
    
    # June
    "inti raymi": "June 24",
    "midsummer": "June 21-24",
    "summer solstice": "June 21",
    "dragon boat": "June (varies)",
    "pride month": "Throughout June",
    
    # July
    "running of the bulls": "July 6-14",
    "san fermin": "July 6-14",
    "independence day": "July 4",
    "bastille day": "July 14",
    "gion matsuri": "July 1-31",
    "eid al-adha": "July (varies)",
    "canada day": "July 1",
    
    # August
    "raksha bandhan": "August (Full Moon)",
    "la tomatina": "Last Wednesday of August",
    "independence day (india)": "August 15",
    "obon": "August 13-16",
    "edinburgh festival": "August",
    "burning man": "Late August",
    "janmashtami": "August (varies)",
    
    # September
    "oktoberfest": "Late September - October",
    "mid-autumn festival": "September (varies)",
    "moon festival": "September (varies)",
    "ganesh chaturthi": "August - September",
    "rosh hashanah": "September (varies)",
    "labor day": "First Monday of September",
    "onam": "August - September",
    
    # October
    "diwali": "October - November",
    "deepavali": "October - November",
    "halloween": "October 31",
    "durga puja": "October (varies)",
    "navratri": "September - October",
    "dussehra": "October (varies)",
    "oktoberfest munich": "Late September - October",
    "day of the dead": "November 1-2",
    "dia de los muertos": "November 1-2",
    
    # November
    "thanksgiving": "4th Thursday of November",
    "loy krathong": "November (Full Moon)",
    "yi peng": "November (Full Moon)",
    "diwali": "October - November",
    "guru nanak jayanti": "November (Full Moon)",
    
    # December
    "christmas": "December 25",
    "christmas markets": "December 1-24",
    "new year's eve": "December 31",
    "hanukkah": "December (varies)",
    "winter solstice": "December 21",
    "boxing day": "December 26",
    "kwanzaa": "December 26 - January 1",
    "hogmanay": "December 31",
}

# Month names for generating default dates
MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December']

async def update_festivals():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'visa_forex_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    festivals = await db.festivals.find({}).to_list(1000)
    updated_count = 0
    
    print(f"Found {len(festivals)} festivals to process")
    
    for festival in festivals:
        festival_name = festival.get('festival_name') or festival.get('name', '')
        festival_name_lower = festival_name.lower().strip()
        
        # Try to find exact match or partial match
        date = None
        
        # First try exact match
        if festival_name_lower in FESTIVAL_DATES:
            date = FESTIVAL_DATES[festival_name_lower]
        else:
            # Try partial matches
            for key, value in FESTIVAL_DATES.items():
                if key in festival_name_lower or festival_name_lower in key:
                    date = value
                    break
        
        # If no match found, generate a generic date based on month
        if not date and 'month' in festival:
            month_num = festival['month']
            if isinstance(month_num, int) and 1 <= month_num <= 12:
                date = f"{MONTH_NAMES[month_num]} (varies by year)"
        
        if date:
            await db.festivals.update_one(
                {'_id': festival['_id']},
                {'$set': {'date': date}}
            )
            updated_count += 1
            print(f"Updated: {festival_name} -> {date}")
    
    print(f"\nTotal updated: {updated_count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_festivals())
