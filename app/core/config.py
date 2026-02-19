# Configuration settings for KleinManager
import os
from typing import Optional

class Settings:
    """Application settings"""
    # Database
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///kleinmanager.db")

    # Paths
    IMAGE_STORAGE_PATH: str = os.environ.get("IMAGE_STORAGE_PATH", "images")
    TEMPLATE_DIR: str = "templates"
    STATIC_DIR: str = "static"
    
    # API Settings
    API_PREFIX: str = "/api/v1"
    
    # DHL Tracking
    DHL_API_URL: str = "https://www.dhl.de/int-verfolgen/data/search"
    DHL_TRACKING_DELAY: int = 1  # Seconds between requests
    
    # Application
    APP_NAME: str = "KleinManager"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Scraping
    USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

settings = Settings()

# Create directories if they don't exist
os.makedirs(settings.IMAGE_STORAGE_PATH, exist_ok=True)
