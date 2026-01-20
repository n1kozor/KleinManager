from unittest.mock import MagicMock, patch
import pytest

def test_get_settings(client):
    response = client.get("/api/v1/settings")
    assert response.status_code == 200
    data = response.json()
    assert "colors" in data
    assert "notifications_enabled" in data

def test_get_orders_empty(client):
    response = client.get("/api/v1/orders")
    assert response.status_code == 200
    assert response.json() == []

@patch("app.api.routes.scraper.scrape_listing")
def test_create_order(mock_scrape, client):
    # Mock return value
    mock_scrape.return_value = {
        "ad_id": "12345678",
        "title": "Test Item",
        "price": 50.0,
        "description": "A test description",
        "location": "Berlin",
        "status": "Ordered",
        "article_url": "https://www.kleinanzeigen.de/s-anzeige/test-item/12345678",
        "image_urls": "[]",
        "local_images": "[]"
    }

    payload = {"url": "https://www.kleinanzeigen.de/s-anzeige/test-item/12345678"}
    response = client.post("/api/v1/orders", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Item"
    assert data["price"] == 50.0
    assert data["ad_id"] == "12345678"

    # Verify it is in the list
    response = client.get("/api/v1/orders")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_get_stats(client):
    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    data = response.json()
    # Should be empty initially
    assert data["total"] == 0
    assert data["value"] == "0.00"
