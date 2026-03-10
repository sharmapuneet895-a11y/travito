#!/usr/bin/env python3

import requests
import sys
from datetime import datetime

class PasseportAPITester:
    def __init__(self, base_url="https://visa-forex-explorer.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, min_data_count=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                response_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                
                # Additional validation for data count if specified
                if min_data_count and 'data' in response_data:
                    data_count = len(response_data['data'])
                    if data_count >= min_data_count:
                        print(f"✅ Passed - Status: {response.status_code}, Data count: {data_count}")
                        self.tests_passed += 1
                    else:
                        print(f"❌ Failed - Expected at least {min_data_count} items, got {data_count}")
                        success = False
                else:
                    print(f"✅ Passed - Status: {response.status_code}")
                    self.tests_passed += 1
                
                return success, response_data
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_seasons_api(self):
        """Test seasons API endpoint"""
        success, response = self.run_test(
            "Seasons API",
            "GET",
            "api/seasons",
            200,
            min_data_count=20  # Should have data for 20 countries
        )
        
        if success and response:
            # Validate structure
            sample_item = response['data'][0] if response['data'] else {}
            required_fields = ['country_code', 'country_name', 'season_type', 'best_months']
            missing_fields = [field for field in required_fields if field not in sample_item]
            
            if not missing_fields:
                print(f"   ✅ Data structure valid")
                # Check season types
                season_types = set(item['season_type'] for item in response['data'])
                expected_types = {'peak', 'shoulder', 'off'}
                if season_types.issubset(expected_types):
                    print(f"   ✅ Season types valid: {season_types}")
                else:
                    print(f"   ⚠️ Unexpected season types: {season_types - expected_types}")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
        
        return success

    def test_visa_api(self):
        """Test visa API endpoint"""
        success, response = self.run_test(
            "Visa API",
            "GET",
            "api/visa",
            200,
            min_data_count=20  # Should have data for 20 countries
        )
        
        if success and response:
            # Validate structure
            sample_item = response['data'][0] if response['data'] else {}
            required_fields = ['country_code', 'country_name', 'visa_type']
            missing_fields = [field for field in required_fields if field not in sample_item]
            
            if not missing_fields:
                print(f"   ✅ Data structure valid")
                # Check visa types
                visa_types = set(item['visa_type'] for item in response['data'])
                expected_types = {'visa_on_arrival', 'e_visa', 'visa_required'}
                if visa_types.issubset(expected_types):
                    print(f"   ✅ Visa types valid: {visa_types}")
                else:
                    print(f"   ⚠️ Unexpected visa types: {visa_types - expected_types}")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
        
        return success

    def test_forex_api(self):
        """Test forex API endpoint"""
        success, response = self.run_test(
            "Forex API",
            "GET",
            "api/forex/rates",
            200
        )
        
        if success and response:
            # Validate structure
            required_fields = ['base_currency', 'rates', 'last_updated']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ Data structure valid")
                if response['base_currency'] == 'INR':
                    print(f"   ✅ Base currency is INR")
                else:
                    print(f"   ❌ Expected base currency INR, got {response['base_currency']}")
                
                # Check if we have major currencies
                expected_currencies = {'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'AED', 'THB', 'NZD'}
                rates_currencies = set(response['rates'].keys())
                if expected_currencies.issubset(rates_currencies):
                    print(f"   ✅ All 12 major currencies present: {len(response['rates'])} rates")
                else:
                    missing = expected_currencies - rates_currencies
                    print(f"   ⚠️ Missing currencies: {missing}")
                
                # Check if it's mocked data
                if 'note' in response:
                    print(f"   ℹ️ Using sample data: {response['note']}")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
        
        return success

    def test_apps_api(self):
        """Test apps API endpoint"""
        success, response = self.run_test(
            "Apps API",
            "GET",
            "api/apps",
            200
        )
        
        if success and response:
            # Validate structure
            sample_item = response['data'][0] if response['data'] else {}
            required_fields = ['country_code', 'country_name', 'category', 'app_name', 'description']
            missing_fields = [field for field in required_fields if field not in sample_item]
            
            if not missing_fields:
                print(f"   ✅ Data structure valid, found {len(response['data'])} apps")
                # Check categories
                categories = set(item['category'] for item in response['data'])
                expected_categories = {'transport', 'convenience', 'food', 'sightseeing'}
                if categories.issubset(expected_categories):
                    print(f"   ✅ App categories valid: {categories}")
                else:
                    print(f"   ⚠️ Unexpected categories: {categories - expected_categories}")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
        
        return success

    def test_apps_filtering(self):
        """Test apps API with filters"""
        # Test country filter
        success1, response1 = self.run_test(
            "Apps API with country filter (USA)",
            "GET",
            "api/apps?country_code=USA",
            200
        )
        
        if success1 and response1:
            usa_apps = response1['data']
            if all(app['country_code'] == 'USA' for app in usa_apps):
                print(f"   ✅ Country filter working - {len(usa_apps)} USA apps")
            else:
                print(f"   ❌ Country filter not working properly")
        
        # Test category filter
        success2, response2 = self.run_test(
            "Apps API with category filter (transport)",
            "GET",
            "api/apps?category=transport",
            200
        )
        
        if success2 and response2:
            transport_apps = response2['data']
            if all(app['category'] == 'transport' for app in transport_apps):
                print(f"   ✅ Category filter working - {len(transport_apps)} transport apps")
            else:
                print(f"   ❌ Category filter not working properly")
        
        return success1 and success2

    def test_countries_api(self):
        """Test countries API endpoint"""
        success, response = self.run_test(
            "Countries API",
            "GET",
            "api/countries",
            200,
            min_data_count=20  # Should have data for 20 countries
        )
        
        if success and response:
            # Validate structure
            sample_item = response['data'][0] if response['data'] else {}
            required_fields = ['country_code', 'country_name']
            missing_fields = [field for field in required_fields if field not in sample_item]
            
            if not missing_fields:
                print(f"   ✅ Data structure valid")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
        
        return success

def main():
    """Main test runner"""
    print("🚀 Pass-e-port Backend API Testing")
    print("=" * 50)
    
    tester = PasseportAPITester()
    
    # Run all tests
    tests = [
        ("Seasons", tester.test_seasons_api),
        ("Visa", tester.test_visa_api),
        ("Forex", tester.test_forex_api),
        ("Apps", tester.test_apps_api),
        ("Apps Filtering", tester.test_apps_filtering),
        ("Countries", tester.test_countries_api),
    ]
    
    print(f"\nRunning {len(tests)} test suites...\n")
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name} Tests")
        print("-" * 30)
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} test suite failed with error: {e}")
            tester.tests_run += 1
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())