from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class OrderCreate(BaseModel):
    """Schema for creating a new order"""
    url: HttpUrl

class OrderUpdate(BaseModel):
    """Schema for updating an order"""
    title: Optional[str] = None
    price: Optional[float] = None
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    status: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    """Schema for order response"""
    id: int
    ad_id: Optional[str]
    title: str
    price: float
    description: Optional[str]
    category: Optional[str]
    location: Optional[str]
    seller_name: Optional[str]
    seller_profile_url: Optional[str]
    seller_since: Optional[str]
    seller_is_new: bool
    article_url: Optional[str]
    image_urls: Optional[str]
    local_images: Optional[str]
    tracking_number: Optional[str]
    carrier: Optional[str]
    tracking_details: Optional[str]
    dhl_status: Optional[str]
    dhl_last_update: Optional[datetime]
    status: str
    color: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WatchedItemCreate(BaseModel):
    """Schema for creating a watched item"""
    url: HttpUrl

class WatchedItemUpdate(BaseModel):
    """Schema for updating a watched item"""
    notifications_enabled: Optional[bool] = None

class WatchedItemResponse(BaseModel):
    """Schema for watched item response"""
    id: int
    ad_id: str
    title: str
    url: str
    current_price: float
    initial_price: float
    last_price: float
    price_history: Optional[str]
    notifications_enabled: bool
    last_checked: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MyListingResponse(BaseModel):
    """Schema for my listing response"""
    id: int
    ad_id: str
    title: str
    price: float
    category: Optional[str]
    url: Optional[str]
    image_url: Optional[str]
    status: str
    visitors: int
    favorites: int
    end_date: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    """Schema for settings update"""
    colors: Optional[List[Dict[str, str]]] = None
    notifications_enabled: Optional[bool] = None
    notification_sound: Optional[str] = None
    # NEW: Auto-check settings
    auto_check_enabled: Optional[bool] = None
    auto_check_interval: Optional[int] = None  # minutes
    auto_tracking_enabled: Optional[bool] = None
    auto_tracking_interval: Optional[int] = None  # minutes

class StatsResponse(BaseModel):
    """Schema for statistics response"""
    total_orders: int
    in_transit: int
    total_value: str
    new_sellers: int
    delivered: int
    average_order_value: str

class TrackingUpdate(BaseModel):
    """Schema for tracking update response"""
    updated: int

class NotificationResponse(BaseModel):
    """Schema for notification response"""
    id: int
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]]
    read: bool
    created_at: datetime

class BackgroundTaskStatus(BaseModel):
    """Schema for background task status"""
    price_monitoring_active: bool
    tracking_monitoring_active: bool
    last_price_check: Optional[datetime]
    last_tracking_check: Optional[datetime]
class DailyTrend(BaseModel):
    date: str
    orders: int
    total_value: float

class MonthlyTrend(BaseModel):
    month: str
    orders: int
    total_value: float

class TrendsResponse(BaseModel):
    last_30_days: List[DailyTrend]
    monthly: List[MonthlyTrend]

class PriceAnalysisResponse(BaseModel):
    price_ranges: Dict[str, int]
