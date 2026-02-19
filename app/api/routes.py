from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import time
import asyncio
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.order import Order, WatchedItem, MyListing, AppSettings
from app.models.schemas import (
    OrderCreate, OrderUpdate, OrderResponse,
    WatchedItemCreate, WatchedItemUpdate, WatchedItemResponse,
    MyListingResponse, SettingsUpdate,
    StatsResponse, TrackingUpdate, NotificationResponse,
    TrendsResponse, PriceAnalysisResponse
)
from app.services.scraper import KleinanzeigenScraper
from app.api.tracking_service import TrackingService
from app.services.watcher import PriceWatcher
from app.services.listings_scraper import MyListingsScraper
from app.services.notification_service import NotificationService
from app.services.background_tasks import BackgroundTaskManager

router = APIRouter(prefix="/api/v1")
scraper = KleinanzeigenScraper()
tracking_service = TrackingService()
price_watcher = PriceWatcher()
listings_scraper = MyListingsScraper()
notification_service = NotificationService()
background_tasks = BackgroundTaskManager()


# Orders endpoints (unchanged)
@router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order from a Kleinanzeigen URL"""
    try:
        listing_data = scraper.scrape_listing(str(order_data.url))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape listing: {str(e)}")

    existing = db.query(Order).filter(Order.ad_id == listing_data['ad_id']).first()
    if existing:
        raise HTTPException(status_code=400, detail="Order already exists")

    db_order = Order(**listing_data)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
        search: Optional[str] = "",
        status: Optional[str] = "",
        color: Optional[str] = "",
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """Get all orders with optional filtering"""
    query = db.query(Order)

    if search:
        query = query.filter(Order.title.contains(search))
    if status:
        query = query.filter(Order.status == status)
    if color:
        query = query.filter(Order.color == color)

    orders = query.order_by(Order.created_at.desc()).limit(limit).all()

    for order in orders:
        if not order.tracking_details and order.dhl_details:
            order.tracking_details = order.dhl_details
            order.carrier = 'dhl'

    return orders


@router.get("/orders/tracking", response_model=List[OrderResponse])
async def get_tracking_orders(db: Session = Depends(get_db)):
    """Get orders with active tracking"""
    orders = db.query(Order).filter(
        Order.tracking_number.isnot(None),
        Order.status != 'Delivered'
    ).all()

    for order in orders:
        if not order.tracking_details and order.dhl_details:
            order.tracking_details = order.dhl_details
            order.carrier = 'dhl'

    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not order.tracking_details and order.dhl_details:
        order.tracking_details = order.dhl_details
        order.carrier = 'dhl'

    return order


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
        order_id: int,
        order_update: OrderUpdate,
        db: Session = Depends(get_db)
):
    """Update an existing order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(order, field):
            setattr(order, field, value)

    order.updated_at = datetime.now()

    if 'tracking_number' in update_data and update_data['tracking_number']:
        carrier = update_data.get('carrier', 'auto')
        tracking_data = tracking_service.track_package(update_data['tracking_number'], carrier)

        order.carrier = tracking_data.get('carrier', '').lower() if 'carrier' in tracking_data else None
        order.tracking_details = json.dumps(tracking_data)
        order.dhl_details = json.dumps(tracking_data)
        order.dhl_status = tracking_data.get('status', '')
        order.dhl_last_update = datetime.now()

        if 'error' not in tracking_data:
            order.status = 'Shipped'
            if tracking_data.get('progress', 0) == 100:
                order.status = 'Delivered'

    db.commit()
    db.refresh(order)

    if not order.tracking_details and order.dhl_details:
        order.tracking_details = order.dhl_details

    return order


@router.post("/orders/{order_id}/tracking")
async def update_tracking(order_id: int, db: Session = Depends(get_db)):
    """Update tracking for a specific order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or not order.tracking_number:
        raise HTTPException(status_code=404, detail="No tracking number found")

    carrier = getattr(order, 'carrier', None) or 'auto'
    tracking_data = tracking_service.track_package(order.tracking_number, carrier)

    if hasattr(order, 'carrier'):
        order.carrier = tracking_data.get('carrier', '').lower() if 'carrier' in tracking_data else carrier

    order.tracking_details = json.dumps(tracking_data)
    order.dhl_details = json.dumps(tracking_data)
    order.dhl_status = tracking_data.get('status', '')
    order.dhl_last_update = datetime.now()

    if tracking_data.get('progress', 0) == 100:
        order.status = 'Delivered'
    elif 'error' not in tracking_data and order.status == 'Ordered':
        order.status = 'Shipped'

    db.commit()
    return tracking_data


@router.post("/tracking/update-all", response_model=TrackingUpdate)
async def update_all_tracking(db: Session = Depends(get_db)):
    """Update tracking for all active shipments"""
    orders = db.query(Order).filter(
        Order.tracking_number.isnot(None),
        Order.status != 'Delivered'
    ).all()

    updated_count = 0

    for order in orders:
        try:
            carrier = getattr(order, 'carrier', None) or 'auto'
            tracking_data = tracking_service.track_package(order.tracking_number, carrier)

            if hasattr(order, 'carrier'):
                order.carrier = tracking_data.get('carrier', '').lower() if 'carrier' in tracking_data else carrier

            order.tracking_details = json.dumps(tracking_data)
            order.dhl_details = json.dumps(tracking_data)
            order.dhl_status = tracking_data.get('status', '')
            order.dhl_last_update = datetime.now()

            if 'error' not in tracking_data and tracking_data.get('history'):
                updated_count += 1

            if tracking_data.get('progress', 0) == 100:
                order.status = 'Delivered'
            elif 'error' not in tracking_data and order.status == 'Ordered':
                order.status = 'Shipped'

            time.sleep(1)
        except Exception:
            continue

    db.commit()
    return {"updated": updated_count}


@router.delete("/orders/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.local_images:
        import os
        from app.core.config import settings
        for img in json.loads(order.local_images):
            img_path = os.path.join(settings.IMAGE_STORAGE_PATH, img)
            if os.path.exists(img_path):
                os.remove(img_path)

    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}


# Watched items endpoints
@router.post("/watched-items", response_model=WatchedItemResponse)
async def create_watched_item(item_data: WatchedItemCreate, db: Session = Depends(get_db)):
    """Create a new watched item"""
    try:
        listing_data = scraper.scrape_listing(str(item_data.url))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape listing: {str(e)}")

    existing = db.query(WatchedItem).filter(WatchedItem.ad_id == listing_data['ad_id']).first()
    if existing:
        raise HTTPException(status_code=400, detail="Item already being watched")

    watched_item = WatchedItem(
        ad_id=listing_data['ad_id'],
        title=listing_data['title'],
        url=str(item_data.url),
        current_price=listing_data['price'],
        initial_price=listing_data['price'],
        last_price=listing_data['price'],
        price_history=json.dumps([{
            'price': listing_data['price'],
            'date': datetime.now().isoformat()
        }])
    )

    db.add(watched_item)
    db.commit()
    db.refresh(watched_item)

    # Restart background tasks if this is the first watched item
    if db.query(WatchedItem).count() == 1:
        await background_tasks.start_price_monitoring()

    return watched_item


@router.get("/watched-items", response_model=List[WatchedItemResponse])
async def get_watched_items(db: Session = Depends(get_db)):
    """Get all watched items"""
    return db.query(WatchedItem).order_by(WatchedItem.created_at.desc()).all()


@router.put("/watched-items/{item_id}", response_model=WatchedItemResponse)
async def update_watched_item(item_id: int, item_update: WatchedItemUpdate, db: Session = Depends(get_db)):
    """Update watched item settings"""
    item = db.query(WatchedItem).filter(WatchedItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watched item not found")

    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    item.updated_at = datetime.now()
    db.commit()
    db.refresh(item)

    return item


@router.delete("/watched-items/{item_id}")
async def delete_watched_item(item_id: int, db: Session = Depends(get_db)):
    """Delete watched item"""
    item = db.query(WatchedItem).filter(WatchedItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watched item not found")

    db.delete(item)
    db.commit()

    # Stop background tasks if no more watched items
    if db.query(WatchedItem).count() == 0:
        await background_tasks.stop_price_monitoring()

    return {"message": "Watched item deleted"}


@router.post("/watched-items/check-all")
async def check_all_prices(db: Session = Depends(get_db)):
    """Check all watched items for price changes"""
    items = db.query(WatchedItem).filter(WatchedItem.notifications_enabled == True).all()
    updates = []

    for item in items:
        try:
            result = price_watcher.check_price_change(item, db)
            if result:
                updates.append(result)
            time.sleep(2)
        except Exception:
            continue

    return {"checked": len(items), "updates": updates}


# My listings endpoints (unchanged)
@router.get("/my-listings", response_model=List[MyListingResponse])
async def get_my_listings(db: Session = Depends(get_db)):
    """Get all my listings"""
    return db.query(MyListing).order_by(MyListing.created_at.desc()).all()


@router.post("/my-listings/sync")
async def sync_my_listings(db: Session = Depends(get_db)):
    """Sync my listings from Kleinanzeigen"""
    try:
        listings = listings_scraper.scrape_my_listings()

        db.query(MyListing).delete()

        for listing_data in listings:
            listing = MyListing(**listing_data)
            db.add(listing)

        db.commit()
        return {"synced": len(listings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync listings: {str(e)}")


# Settings endpoints with new auto-check settings
@router.get("/settings")
async def get_settings(db: Session = Depends(get_db)):
    """Get application settings"""
    settings = {}

    db_settings = db.query(AppSettings).all()
    for setting in db_settings:
        try:
            settings[setting.key] = json.loads(setting.value)
        except:
            settings[setting.key] = setting.value

    # Default settings
    if 'colors' not in settings:
        settings['colors'] = [
            {'name': 'Red', 'value': '#ef4444'},
            {'name': 'Blue', 'value': '#3b82f6'},
            {'name': 'Green', 'value': '#10b981'},
            {'name': 'Yellow', 'value': '#f59e0b'},
            {'name': 'Purple', 'value': '#8b5cf6'},
            {'name': 'Pink', 'value': '#ec4899'}
        ]

    if 'notifications_enabled' not in settings:
        settings['notifications_enabled'] = True

    if 'notification_sound' not in settings:
        settings['notification_sound'] = 'default'

    # NEW: Auto-check settings
    if 'auto_check_enabled' not in settings:
        settings['auto_check_enabled'] = True

    if 'auto_check_interval' not in settings:
        settings['auto_check_interval'] = 60  # minutes

    if 'auto_tracking_enabled' not in settings:
        settings['auto_tracking_enabled'] = True

    if 'auto_tracking_interval' not in settings:
        settings['auto_tracking_interval'] = 30  # minutes

    return settings


@router.put("/settings")
async def update_settings(settings_update: SettingsUpdate, background_tasks_dep: BackgroundTasks,
                          db: Session = Depends(get_db)):
    """Update application settings"""
    update_data = settings_update.dict(exclude_unset=True)

    for key, value in update_data.items():
        setting = db.query(AppSettings).filter(AppSettings.key == key).first()

        if setting:
            setting.value = json.dumps(value) if isinstance(value, (list, dict)) else str(value)
            setting.updated_at = datetime.now()
        else:
            setting = AppSettings(
                key=key,
                value=json.dumps(value) if isinstance(value, (list, dict)) else str(value)
            )
            db.add(setting)

    db.commit()

    # Restart background tasks with new settings
    background_tasks_dep.add_task(background_tasks.restart_with_new_settings, update_data)

    return {"message": "Settings updated"}


# Background task control endpoints
@router.post("/background-tasks/start")
async def start_background_tasks():
    """Start background monitoring tasks"""
    await background_tasks.start_all_tasks()
    return {"message": "Background tasks started"}


@router.post("/background-tasks/stop")
async def stop_background_tasks():
    """Stop background monitoring tasks"""
    await background_tasks.stop_all_tasks()
    return {"message": "Background tasks stopped"}


@router.get("/background-tasks/status")
async def get_background_tasks_status():
    """Get status of background tasks"""
    return {
        "price_monitoring_active": background_tasks.price_task_active,
        "tracking_monitoring_active": background_tasks.tracking_task_active,
        "last_price_check": background_tasks.last_price_check.isoformat() if background_tasks.last_price_check else None,
        "last_tracking_check": background_tasks.last_tracking_check.isoformat() if background_tasks.last_tracking_check else None
    }


# Notifications endpoints (unchanged)
@router.get("/notifications")
async def get_notifications(db: Session = Depends(get_db)):
    """Get all notifications"""
    return notification_service.get_unread_notifications(db)


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark notification as read"""
    return notification_service.mark_as_read(notification_id, db)


@router.delete("/notifications")
async def clear_all_notifications(db: Session = Depends(get_db)):
    """Clear all notifications"""
    return notification_service.clear_all_notifications(db)


# Stats endpoints (unchanged)
@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    total = db.query(Order).count()
    transit = db.query(Order).filter(Order.status == 'Shipped').count()
    delivered = db.query(Order).filter(Order.status == 'Delivered').count()
    value = db.query(func.sum(Order.price)).scalar() or 0
    new_sellers = db.query(Order).filter(Order.seller_is_new == True).count()

    avg_order = 0
    if total > 0:
        avg_order = value / total

    return {
        "total_orders": total,
        "in_transit": transit,
        "total_value": f"{value:.2f}",
        "new_sellers": new_sellers,
        "delivered": delivered,
        "average_order_value": f"{avg_order:.2f}"
    }


@router.get("/stats/detail")
async def get_detailed_stats(db: Session = Depends(get_db)):
    """Get detailed statistics"""
    by_status = {}
    for status in ['Ordered', 'Shipped', 'Delivered']:
        count = db.query(Order).filter(Order.status == status).count()
        if count > 0:
            by_status[status] = count

    top_categories = db.query(
        Order.category,
        func.count(Order.id).label('count')
    ).group_by(Order.category).order_by(func.count(Order.id).desc()).limit(5).all()

    top_sellers = db.query(
        Order.seller_name.label('name'),
        func.count(Order.id).label('order_count')
    ).filter(Order.seller_name.isnot(None))\
    .group_by(Order.seller_name)\
    .order_by(func.count(Order.id).desc())\
    .limit(5).all()

    return {
        "by_status": by_status,
        "top_categories": [{"category": cat[0], "count": cat[1]} for cat in top_categories],
        "top_sellers": [{"name": s.name, "order_count": s.order_count} for s in top_sellers]
    }

@router.get("/stats/trends", response_model=TrendsResponse)
async def get_trends(db: Session = Depends(get_db)):
    """Get order trends for charts"""
    # Last 30 days
    last_30_days = []
    today = datetime.now()

    for i in range(29, -1, -1):
        date = today - timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        next_date = date + timedelta(days=1)

        day_stats = db.query(
            func.count(Order.id).label('orders'),
            func.coalesce(func.sum(Order.price), 0).label('total_value')
        ).filter(
            Order.created_at >= date.replace(hour=0, minute=0, second=0, microsecond=0),
            Order.created_at < next_date.replace(hour=0, minute=0, second=0, microsecond=0)
        ).first()

        last_30_days.append({
            "date": date_str,
            "orders": day_stats.orders or 0,
            "total_value": float(day_stats.total_value or 0)
        })

    # Monthly
    monthly_query = db.query(
        func.strftime('%Y-%m', Order.created_at).label('month'),
        func.count(Order.id).label('orders'),
        func.sum(Order.price).label('total_value')
    ).group_by('month').order_by('month').limit(12).all()

    monthly = [
        {
            "month": m.month,
            "orders": m.orders,
            "total_value": float(m.total_value or 0)
        }
        for m in monthly_query if m.month
    ]

    return {"last_30_days": last_30_days, "monthly": monthly}

@router.get("/stats/price-analysis", response_model=PriceAnalysisResponse)
async def get_price_analysis(db: Session = Depends(get_db)):
    """Get price distribution analysis"""
    ranges = {
        "0-50": db.query(Order).filter(Order.price >= 0, Order.price < 50).count(),
        "50-100": db.query(Order).filter(Order.price >= 50, Order.price < 100).count(),
        "100-500": db.query(Order).filter(Order.price >= 100, Order.price < 500).count(),
        "500+": db.query(Order).filter(Order.price >= 500).count(),
    }

    return {"price_ranges": ranges}
