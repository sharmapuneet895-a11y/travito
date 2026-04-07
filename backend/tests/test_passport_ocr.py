"""
Backend API tests for Travito Travel Visa Website
Tests passport OCR endpoint and related visa features
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://visa-forex-explorer.preview.emergentagent.com')

class TestPassportOCR:
    """Tests for /api/visa/passport-ocr endpoint"""
    
    def test_passport_ocr_endpoint_exists(self):
        """Test that passport OCR endpoint exists and responds"""
        # Send invalid base64 to test endpoint exists
        response = requests.post(
            f"{BASE_URL}/api/visa/passport-ocr",
            json={"image_base64": "invalid_base64_data"},
            headers={"Content-Type": "application/json"}
        )
        # Should return 200 with error in response body (not 404)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "success" in data, "Response should have 'success' field"
        assert data["success"] == False, "Should return success=false for invalid image"
        assert "error" in data, "Should have error message for invalid image"
        print(f"✓ Passport OCR endpoint exists and returns proper error: {data['error'][:50]}...")
    
    def test_passport_ocr_missing_image(self):
        """Test passport OCR with missing image_base64 field"""
        response = requests.post(
            f"{BASE_URL}/api/visa/passport-ocr",
            json={},
            headers={"Content-Type": "application/json"}
        )
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for missing field, got {response.status_code}"
        print("✓ Passport OCR returns 422 for missing image_base64 field")
    
    def test_passport_ocr_empty_image(self):
        """Test passport OCR with empty image_base64"""
        response = requests.post(
            f"{BASE_URL}/api/visa/passport-ocr",
            json={"image_base64": ""},
            headers={"Content-Type": "application/json"}
        )
        # Should return 200 with error
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["success"] == False, "Should return success=false for empty image"
        print("✓ Passport OCR handles empty image correctly")


class TestVisaEndpoints:
    """Tests for visa-related endpoints"""
    
    def test_visa_eligibility_check_endpoint(self):
        """Test visa eligibility check endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/visa/eligibility-check",
            json={
                "country": "Japan",
                "age": 30,
                "education": "bachelors",
                "monthly_income": 100000,
                "travel_history": "few_international",
                "bank_balance": 500000,
                "purpose": "tourism",
                "visa_type": "tourist",
                "employment_status": "employed"
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "success" in data, "Response should have 'success' field"
        assert "approval_chance" in data, "Response should have 'approval_chance' field"
        print(f"✓ Visa eligibility check works - approval chance: {data.get('approval_chance')}%")
    
    def test_visa_document_checklist_endpoint(self):
        """Test document checklist endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/visa/document-checklist",
            json={
                "country": "Japan",
                "visa_type": "tourist",
                "purpose": "tourism"
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "success" in data, "Response should have 'success' field"
        assert "mandatory_documents" in data, "Response should have 'mandatory_documents' field"
        print(f"✓ Document checklist works - {len(data.get('mandatory_documents', []))} mandatory docs")
    
    def test_visa_pricing_endpoint(self):
        """Test visa pricing endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/visa/pricing",
            json={
                "country": "Japan",
                "country_code": "JPN"
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "success" in data, "Response should have 'success' field"
        assert "pricing" in data, "Response should have 'pricing' field"
        print(f"✓ Visa pricing works - pricing data: {data.get('pricing')}")


class TestCoreEndpoints:
    """Tests for core API endpoints"""
    
    def test_seasons_endpoint(self):
        """Test seasons endpoint"""
        response = requests.get(f"{BASE_URL}/api/seasons")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "data" in data, "Response should have 'data' field"
        assert len(data["data"]) > 0, "Should have season data"
        print(f"✓ Seasons endpoint works - {len(data['data'])} countries")
    
    def test_visa_info_endpoint(self):
        """Test visa info endpoint"""
        response = requests.get(f"{BASE_URL}/api/visa")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "data" in data, "Response should have 'data' field"
        print(f"✓ Visa info endpoint works - {len(data['data'])} countries")
    
    def test_countries_endpoint(self):
        """Test countries endpoint"""
        response = requests.get(f"{BASE_URL}/api/countries")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "data" in data, "Response should have 'data' field"
        print(f"✓ Countries endpoint works - {len(data['data'])} countries")
    
    def test_forex_rates_endpoint(self):
        """Test forex rates endpoint"""
        response = requests.get(f"{BASE_URL}/api/forex/rates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "base_currency" in data, "Response should have 'base_currency' field"
        assert "rates" in data, "Response should have 'rates' field"
        print(f"✓ Forex rates endpoint works - base: {data['base_currency']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
