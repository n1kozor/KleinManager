from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_get_trends():
    response = client.get("/api/v1/stats/trends")
    assert response.status_code == 200
    data = response.json()
    assert "last_30_days" in data
    assert "monthly" in data
    assert isinstance(data["last_30_days"], list)
    assert len(data["last_30_days"]) == 30

    # Check structure of a day entry
    day = data["last_30_days"][0]
    assert "date" in day
    assert "orders" in day
    assert "total_value" in day

def test_get_price_analysis():
    response = client.get("/api/v1/stats/price-analysis")
    assert response.status_code == 200
    data = response.json()
    assert "price_ranges" in data
    assert "0-50" in data["price_ranges"]
    assert "50-100" in data["price_ranges"]
    assert "100-500" in data["price_ranges"]
    assert "500+" in data["price_ranges"]
