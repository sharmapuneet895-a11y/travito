"""
Backend API tests for Pass-e-port Travel Information Website
Tests all endpoints: seasons, visa, weather, plugs, festivals, forex, apps
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Test basic health and core endpoints"""
    
    def test_seasons_endpoint(self):
        """Test seasons endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/seasons")
        assert response.status_code == 200, f"Seasons failed: {response.status_code}"
        data = response.json()
        assert "data" in data
        assert len(data["data"]) >= 20, f"Expected at least 20 seasons, got {len(data['data'])}"
        # Verify data structure
        season = data["data"][0]
        assert "country_code" in season
        assert "country_name" in season
        assert "season_type" in season
        assert "best_months" in season
        print(f"✓ Seasons: {len(data['data'])} countries")
    
    def test_visa_endpoint(self):
        """Test visa endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/visa")
        assert response.status_code == 200, f"Visa failed: {response.status_code}"
        data = response.json()
        assert "data" in data
        assert len(data["data"]) >= 20, f"Expected at least 20 visa records, got {len(data['data'])}"
        # Verify data structure
        visa = data["data"][0]
        assert "country_code" in visa
        assert "country_name" in visa
        assert "visa_type" in visa
        print(f"✓ Visa: {len(data['data'])} countries")


class TestWeatherEndpoint:
    """Test weather endpoint returns 110 countries"""
    
    def test_weather_returns_110_countries(self):
        """Verify weather endpoint returns exactly 110 countries"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200, f"Weather failed: {response.status_code}"
        data = response.json()
        assert "data" in data
        assert len(data["data"]) == 110, f"Expected 110 weather records, got {len(data['data'])}"
        # Verify data structure
        weather = data["data"][0]
        assert "country_code" in weather
        assert "country_name" in weather
        assert "weather_type" in weather
        assert "avg_temp" in weather
        print(f"✓ Weather: {len(data['data'])} countries")
    
    def test_weather_types_are_valid(self):
        """Verify weather types are from allowed set"""
        response = requests.get(f"{BASE_URL}/api/weather")
        data = response.json()
        valid_types = {"hot", "snow", "sandy", "rainy"}
        for weather in data["data"]:
            assert weather["weather_type"] in valid_types, f"Invalid weather type: {weather['weather_type']}"
        print("✓ All weather types are valid")


class TestPlugsEndpoint:
    """Test power plugs endpoint returns 109 countries"""
    
    def test_plugs_returns_109_countries(self):
        """Verify plugs endpoint returns exactly 109 countries"""
        response = requests.get(f"{BASE_URL}/api/plugs")
        assert response.status_code == 200, f"Plugs failed: {response.status_code}"
        data = response.json()
        assert "data" in data
        assert len(data["data"]) == 109, f"Expected 109 plug records, got {len(data['data'])}"
        # Verify data structure
        plug = data["data"][0]
        assert "country_code" in plug
        assert "country_name" in plug
        assert "plug_type" in plug
        assert "voltage" in plug
        assert "frequency" in plug
        print(f"✓ Plugs: {len(data['data'])} countries")


class TestFestivalsEndpoint:
    """Test festivals endpoint - NEW feature"""
    
    def test_festivals_endpoint_returns_data(self):
        """Verify festivals endpoint returns festival data"""
        response = requests.get(f"{BASE_URL}/api/festivals")
        assert response.status_code == 200, f"Festivals failed: {response.status_code}"
        data = response.json()
        assert "data" in data
        assert len(data["data"]) >= 50, f"Expected at least 50 festivals, got {len(data['data'])}"
        print(f"✓ Festivals: {len(data['data'])} festivals total")
    
    def test_festival_data_structure(self):
        """Verify festival records have required fields"""
        response = requests.get(f"{BASE_URL}/api/festivals")
        data = response.json()
        festival = data["data"][0]
        required_fields = ["country_code", "country_name", "festival_name", "month", "description", "highlight"]
        for field in required_fields:
            assert field in festival, f"Missing field: {field}"
        print("✓ Festival data structure is correct")
    
    def test_festivals_filter_by_month(self):
        """Test filtering festivals by month"""
        # Test month filter for January (month=1)
        response = requests.get(f"{BASE_URL}/api/festivals?month=1")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert len(data["data"]) > 0, "Expected at least 1 January festival"
        # Verify all returned festivals are in January
        for festival in data["data"]:
            assert festival["month"] == 1, f"Festival {festival['festival_name']} is not in January"
        print(f"✓ January filter: {len(data['data'])} festivals")
        
        # Test June (month=6)
        response = requests.get(f"{BASE_URL}/api/festivals?month=6")
        assert response.status_code == 200
        data = response.json()
        for festival in data["data"]:
            assert festival["month"] == 6
        print(f"✓ June filter: {len(data['data'])} festivals")
    
    def test_festivals_cover_all_months(self):
        """Verify festivals exist across multiple months"""
        response = requests.get(f"{BASE_URL}/api/festivals")
        data = response.json()
        months_covered = set(f["month"] for f in data["data"])
        assert len(months_covered) >= 10, f"Expected at least 10 months covered, got {len(months_covered)}"
        print(f"✓ Festivals cover {len(months_covered)} months")


class TestForexEndpoint:
    """Test FOREX rates endpoint"""
    
    def test_forex_rates_endpoint(self):
        """Test forex rates returns data with INR base"""
        response = requests.get(f"{BASE_URL}/api/forex/rates")
        assert response.status_code == 200, f"Forex failed: {response.status_code}"
        data = response.json()
        assert "base_currency" in data
        assert data["base_currency"] == "INR"
        assert "rates" in data
        assert len(data["rates"]) >= 10, f"Expected at least 10 currency rates"
        # Check for major currencies
        expected_currencies = ["USD", "EUR", "GBP", "JPY"]
        for curr in expected_currencies:
            assert curr in data["rates"], f"Missing currency: {curr}"
        print(f"✓ Forex rates: {len(data['rates'])} currencies (INR base)")


class TestAppsEndpoint:
    """Test apps recommendations endpoint"""
    
    def test_apps_endpoint_returns_data(self):
        """Test apps endpoint returns recommendations"""
        response = requests.get(f"{BASE_URL}/api/apps")
        assert response.status_code == 200, f"Apps failed: {response.status_code}"
        data = response.json()
        assert "data" in data
        assert len(data["data"]) >= 20, f"Expected at least 20 apps"
        print(f"✓ Apps: {len(data['data'])} recommendations")
    
    def test_apps_filter_by_country(self):
        """Test filtering apps by country code"""
        response = requests.get(f"{BASE_URL}/api/apps?country_code=USA")
        assert response.status_code == 200
        data = response.json()
        for app in data["data"]:
            assert app["country_code"] == "USA"
        print(f"✓ USA apps: {len(data['data'])}")
    
    def test_apps_filter_by_category(self):
        """Test filtering apps by category"""
        response = requests.get(f"{BASE_URL}/api/apps?category=transport")
        assert response.status_code == 200
        data = response.json()
        for app in data["data"]:
            assert app["category"] == "transport"
        print(f"✓ Transport apps: {len(data['data'])}")


class TestCountryEndpoints:
    """Test country-related endpoints"""
    
    def test_countries_list(self):
        """Test get all countries endpoint"""
        response = requests.get(f"{BASE_URL}/api/countries")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        print(f"✓ Countries list: {len(data['data'])} countries")
    
    def test_country_detail(self):
        """Test single country detail endpoint"""
        response = requests.get(f"{BASE_URL}/api/country/USA")
        assert response.status_code == 200
        data = response.json()
        # Check season data
        assert "season" in data
        assert data["season"]["country_code"] == "USA"
        # Check visa data
        assert "visa" in data
        # Check apps data
        assert "apps" in data
        print("✓ Country detail for USA returned correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
