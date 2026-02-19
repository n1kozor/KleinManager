// KleinManager Core - Base utilities and state
class KleinManagerCore {
    constructor() {
        this.currentLang = localStorage.getItem('km_language') || 'de';
        this.currentSection = 'dashboard';
        this.viewMode = localStorage.getItem('km_viewMode') || 'grid';
        this.apiBase = '/api/v1';
        this.mobileMenuOpen = false;
        this.settings = {};
        this.notifications = [];
        this.notificationsOpen = false;
        this.selectedOrderForColor = null;
        this.selectedColor = undefined;
        this.notificationSound = null;
        this.charts = {};
        this.confirmCallback = null;

        this.translations = {
            en: {
                // Nav
                'nav.dashboard': 'Dashboard', 'nav.orders': 'Orders', 'nav.watcher': 'Price Watcher',
                'nav.tracking': 'Package Tracking', 'nav.listings': 'My Listings',
                'nav.statistics': 'Statistics', 'nav.settings': 'Settings',
                'nav.notifications': 'Notifications',

                // Section titles
                'dashboard.title': 'Dashboard', 'orders.title': 'Orders',
                'watcher.title': 'Price Watcher', 'tracking.title': 'Package Tracking',
                'listings.title': 'My Listings', 'statistics.title': 'Statistics',
                'settings.title': 'Settings',

                // Statuses
                'status.ordered': 'Ordered', 'status.shipped': 'Shipped', 'status.delivered': 'Delivered',

                // Actions
                'actions.addOrder': 'Add Order', 'actions.save': 'Save', 'actions.cancel': 'Cancel',
                'actions.refresh': 'Refresh', 'actions.updateAll': 'Update All',
                'actions.edit': 'Edit', 'actions.delete': 'Delete',
                'actions.addTracking': 'Add Tracking', 'actions.updateTracking': 'Update',
                'actions.viewListing': 'View Ad', 'actions.viewOrder': 'View Order',
                'actions.checkPrices': 'Check Prices', 'actions.addWatch': 'Add Watch',
                'actions.sync': 'Sync Listings', 'actions.clear': 'Clear',
                'actions.view': 'View', 'actions.track': 'Track',
                'actions.color': 'Color', 'actions.remove': 'Remove',
                'actions.apply': 'Apply', 'actions.startWatching': 'Start Watching',
                'actions.viewListing2': 'View Listing', 'actions.saveSettings': 'Save Settings',
                'actions.addColor': 'Add Color', 'actions.startMonitoring': 'Start Monitoring',
                'actions.stopMonitoring': 'Stop Monitoring', 'actions.refreshStatus': 'Refresh Status',
                'actions.details': 'Details', 'actions.clearAll': 'Clear All',

                // Loading
                'loading.title': 'Loading...', 'loading.addingOrder': 'Adding order...',
                'loading.saving': 'Saving...', 'loading.savingSettings': 'Saving settings...',
                'loading.addingTracking': 'Adding tracking...', 'loading.updatingTracking': 'Updating tracking...',
                'loading.updatingAllTracking': 'Updating all tracking...',
                'loading.addingToWatchList': 'Adding to watch list...',
                'loading.checkingPrice': 'Checking price...',
                'loading.checkingAllPrices': 'Checking all prices...',
                'loading.syncingListings': 'Syncing listings...',
                'loading.startingMonitoring': 'Starting monitoring...',
                'loading.stoppingMonitoring': 'Stopping monitoring...',

                // Toast messages
                'toast.orderAdded': 'Order added successfully',
                'toast.orderUpdated': 'Order updated',
                'toast.orderDeleted': 'Order deleted',
                'toast.colorApplied': 'Color applied',
                'toast.trackingAdded': 'Tracking added',
                'toast.trackingUpdated': 'Tracking updated',
                'toast.settingsSaved': 'Settings saved',
                'toast.monitoringStarted': 'Monitoring started',
                'toast.monitoringStopped': 'Monitoring stopped',
                'toast.itemAddedToWatchList': 'Item added to watch list',
                'toast.itemRemoved': 'Item removed',
                'toast.noPriceChange': 'No price change',
                'toast.priceChange': 'Price: €{old} → €{new}',
                'toast.checkedItems': 'Checked {checked} items, {changes} changes',
                'toast.syncedListings': 'Synced {count} listings',
                'toast.updatedShipments': 'Updated {count} shipments',

                // Error messages
                'error.loadOrders': 'Failed to load orders',
                'error.loadOrder': 'Failed to load order',
                'error.saveFailed': 'Failed to save',
                'error.deleteFailed': 'Failed to delete',
                'error.colorFailed': 'Failed to apply color',
                'error.addTracking': 'Failed to add tracking',
                'error.updateTracking': 'Failed to update tracking',
                'error.loadTracking': 'Failed to load tracking',
                'error.loadWatched': 'Failed to load watched items',
                'error.removeFailed': 'Failed to remove',
                'error.checkPriceFailed': 'Failed to check prices',
                'error.loadPriceHistory': 'Failed to load price history',
                'error.loadStatistics': 'Failed to load statistics',
                'error.loadListings': 'Failed to load listings',
                'error.syncFailed': 'Failed to sync',
                'error.saveSettings': 'Failed to save settings',
                'error.startFailed': 'Failed to start',
                'error.stopFailed': 'Failed to stop',
                'error.fillAllFields': 'Please fill in all fields',
                'error.itemNotFound': 'Item not found',
                'error.updateFailed': 'Failed to update',
                'error.failed': 'Failed',

                // Confirm dialogs
                'confirm.deleteOrder': 'Delete Order',
                'confirm.deleteOrderMsg': 'This order will be permanently deleted.',
                'confirm.removeItem': 'Remove Item',
                'confirm.removeItemMsg': 'Remove this item from your watch list?',

                // Seller
                'seller.new': 'New Seller', 'seller.since': 'Since',
                'seller.newSellerAlert': 'New Seller: {name} (Since {since})',

                // Dashboard
                'dashboard.totalOrders': 'Total', 'dashboard.inTransit': 'In Transit',
                'dashboard.delivered': 'Delivered', 'dashboard.value': 'Value',
                'dashboard.avgOrder': 'Avg Order', 'dashboard.newSellers': 'New Sellers',
                'dashboard.orderStatus': 'Order Status', 'dashboard.dayTrend': '30-Day Trend',
                'dashboard.priceRanges': 'Price Ranges', 'dashboard.topSellers': 'Top Sellers',
                'dashboard.monthlyOverview': 'Monthly Overview', 'dashboard.quickInsights': 'Quick Insights',
                'dashboard.recentActivity': 'Recent Activity', 'dashboard.noRecentActivity': 'No recent activity',

                // Insights
                'insight.newSellers': '{count} New Seller(s)',
                'insight.newSellersDesc': 'Check their profiles carefully.',
                'insight.inTransit': '{count} In Transit',
                'insight.inTransitDesc': 'Packages on the way.',
                'insight.allGood': 'All Good!',
                'insight.allGoodDesc': 'No urgent matters.',

                // Orders
                'orders.addNew': 'Add New Order', 'orders.noOrdersFound': 'No Orders Found',
                'orders.noOrdersDesc': 'Try adjusting your filters or add a new order',
                'orders.allStatus': 'All Status', 'orders.allColors': 'All Colors',
                'orders.allSellers': 'All Sellers', 'orders.noColor': 'No Color',
                'orders.searchPlaceholder': 'Search orders...',
                'orders.total': 'Total', 'orders.ordered': 'Ordered',
                'orders.shipped': 'Shipped', 'orders.delivered': 'Delivered',
                'orders.value': 'Value', 'orders.newSellers': 'New Sellers',
                'orders.na': 'N/A', 'orders.new': 'NEW',

                // Table headers
                'table.item': 'Item', 'table.price': 'Price', 'table.status': 'Status',
                'table.seller': 'Seller', 'table.tracking': 'Tracking', 'table.actions': 'Actions',

                // Tracking
                'tracking.addTitle': 'Add Tracking Number', 'tracking.carrier': 'Carrier',
                'tracking.number': 'Tracking Number', 'tracking.progress': 'Progress',
                'tracking.history': 'Tracking History', 'tracking.lastUpdate': 'Last Update',
                'tracking.noActiveShipments': 'No Active Shipments',
                'tracking.noActiveShipmentsDesc': 'Add tracking numbers to your orders to see them here',
                'tracking.selectCarrier': 'Select carrier...',
                'tracking.enterNumber': 'Enter tracking number...',
                'tracking.unknown': 'Unknown',

                // Watcher
                'watcher.addItem': 'Add Item to Watch',
                'watcher.urlPlaceholder': 'Kleinanzeigen URL to watch...',
                'watcher.noWatchedItems': 'No Watched Items',
                'watcher.noWatchedItemsDesc': 'Add a Kleinanzeigen URL to start monitoring prices',
                'watcher.initial': 'Initial', 'watcher.current': 'Current', 'watcher.lowest': 'Lowest', 'watcher.changes': 'Changes',
                'watcher.noHistory': 'No history', 'watcher.priceHistory': 'Price History',
                'watcher.noChange': 'No change', 'watcher.noPriceHistory': 'No price history',

                // Statistics
                'stats.byStatus': 'By Status', 'stats.topCategories': 'Top Categories',
                'stats.topSellers': 'Top Sellers', 'stats.spendingTrend': 'Spending Trend (30 Days)',
                'stats.priceDistribution': 'Price Distribution', 'stats.monthlyOrders': 'Monthly Orders',
                'stats.categoryDistribution': 'Category Distribution',
                'stats.noData': 'No data', 'stats.unknown': 'Unknown',
                'stats.spending': 'Spending (€)', 'stats.orders': 'Orders',

                // Settings
                'settings.orderColors': 'Order Colors', 'settings.notifications': 'Notifications',
                'settings.autoMonitoring': 'Auto-Monitoring', 'settings.enableNotifications': 'Enable Notifications',
                'settings.sound': 'Sound', 'settings.priceMonitoring': 'Price Monitoring',
                'settings.trackingMonitoring': 'Tracking Monitoring',
                'settings.intervalMin': 'Interval (min)', 'settings.taskStatus': 'Task Status',
                'settings.controls': 'Controls', 'settings.active': 'Active', 'settings.inactive': 'Inactive',
                'settings.never': 'Never', 'settings.lastPriceCheck': 'Last Price Check',
                'settings.lastTrackingCheck': 'Last Tracking Check',
                'settings.newColor': 'Color {num}',

                // Listings
                'listings.noListings': 'No Listings Found',
                'listings.noListingsDesc': 'Sync your listings from Kleinanzeigen',
                'listings.ends': 'Ends: {date}', 'listings.views': '{count} views',
                'listings.favs': '{count} favs',

                // Notifications
                'notifications.noNew': 'No new notifications',

                // Color modal
                'color.selectColor': 'Select Color', 'color.removeColor': 'Remove',

                // Edit modal
                'edit.title': 'Edit Order', 'edit.titleField': 'Title', 'edit.priceField': 'Price (€)',
                'edit.statusField': 'Status', 'edit.colorField': 'Color', 'edit.notesField': 'Notes',

                // Order Detail Panel
                'detail.title': 'Order Details', 'detail.editable': 'Edit',
                'detail.tracking': 'Tracking', 'detail.trackingCarrier': 'Carrier',
                'detail.trackingNumber': 'Number', 'detail.removeTracking': 'Remove Tracking',
                'detail.updateTracking': 'Refresh', 'detail.noTracking': 'No tracking yet',
                'detail.images': 'Images', 'detail.seller': 'Seller Info',
                'detail.sellerName': 'Seller', 'detail.sellerSince': 'Member since',
                'detail.category': 'Category', 'detail.location': 'Location',
                'detail.openListing': 'Open Listing', 'detail.saveChanges': 'Save Changes',
                'detail.deleteOrder': 'Delete',
                'confirm.removeTracking': 'Remove Tracking',
                'confirm.removeTrackingMsg': 'The tracking number will be cleared.',
                'toast.trackingRemoved': 'Tracking removed',

                // Time
                'time.justNow': 'just now', 'time.mAgo': '{n}m ago',
                'time.hAgo': '{n}h ago', 'time.dAgo': '{n}d ago',

                // Misc
                'misc.urlPlaceholder': 'Kleinanzeigen URL...',
                'misc.minPrice': 'Min €', 'misc.maxPrice': 'Max €',
            },
            de: {
                // Nav
                'nav.dashboard': 'Übersicht', 'nav.orders': 'Bestellungen',
                'nav.watcher': 'Preis-Watcher', 'nav.tracking': 'Sendungsverfolgung',
                'nav.listings': 'Meine Anzeigen', 'nav.statistics': 'Statistiken',
                'nav.settings': 'Einstellungen', 'nav.notifications': 'Benachrichtigungen',

                // Section titles
                'dashboard.title': 'Übersicht', 'orders.title': 'Bestellungen',
                'watcher.title': 'Preis-Watcher', 'tracking.title': 'Sendungsverfolgung',
                'listings.title': 'Meine Anzeigen', 'statistics.title': 'Statistiken',
                'settings.title': 'Einstellungen',

                // Statuses
                'status.ordered': 'Bestellt', 'status.shipped': 'Versendet', 'status.delivered': 'Zugestellt',

                // Actions
                'actions.addOrder': 'Bestellung hinzufügen', 'actions.save': 'Speichern',
                'actions.cancel': 'Abbrechen', 'actions.refresh': 'Aktualisieren',
                'actions.updateAll': 'Alle aktualisieren', 'actions.edit': 'Bearbeiten',
                'actions.delete': 'Löschen', 'actions.addTracking': 'Sendungsnr. hinzufügen',
                'actions.updateTracking': 'Aktualisieren', 'actions.viewListing': 'Anzeige öffnen',
                'actions.viewOrder': 'Bestellung anzeigen', 'actions.checkPrices': 'Preise prüfen',
                'actions.addWatch': 'Überwachung hinzufügen', 'actions.sync': 'Synchronisieren',
                'actions.clear': 'Löschen', 'actions.view': 'Ansehen', 'actions.track': 'Verfolgen',
                'actions.color': 'Farbe', 'actions.remove': 'Entfernen',
                'actions.apply': 'Anwenden', 'actions.startWatching': 'Überwachung starten',
                'actions.viewListing2': 'Anzeige ansehen', 'actions.saveSettings': 'Einstellungen speichern',
                'actions.addColor': 'Farbe hinzufügen', 'actions.startMonitoring': 'Überwachung starten',
                'actions.stopMonitoring': 'Überwachung stoppen', 'actions.refreshStatus': 'Status aktualisieren',
                'actions.details': 'Details', 'actions.clearAll': 'Alle löschen',

                // Loading
                'loading.title': 'Lädt...', 'loading.addingOrder': 'Bestellung wird hinzugefügt...',
                'loading.saving': 'Wird gespeichert...', 'loading.savingSettings': 'Einstellungen werden gespeichert...',
                'loading.addingTracking': 'Sendungsverfolgung wird hinzugefügt...',
                'loading.updatingTracking': 'Sendungsverfolgung wird aktualisiert...',
                'loading.updatingAllTracking': 'Alle Sendungen werden aktualisiert...',
                'loading.addingToWatchList': 'Wird zur Beobachtungsliste hinzugefügt...',
                'loading.checkingPrice': 'Preis wird geprüft...',
                'loading.checkingAllPrices': 'Alle Preise werden geprüft...',
                'loading.syncingListings': 'Anzeigen werden synchronisiert...',
                'loading.startingMonitoring': 'Überwachung wird gestartet...',
                'loading.stoppingMonitoring': 'Überwachung wird gestoppt...',

                // Toast messages
                'toast.orderAdded': 'Bestellung erfolgreich hinzugefügt',
                'toast.orderUpdated': 'Bestellung aktualisiert',
                'toast.orderDeleted': 'Bestellung gelöscht',
                'toast.colorApplied': 'Farbe angewendet',
                'toast.trackingAdded': 'Sendungsverfolgung hinzugefügt',
                'toast.trackingUpdated': 'Sendungsverfolgung aktualisiert',
                'toast.settingsSaved': 'Einstellungen gespeichert',
                'toast.monitoringStarted': 'Überwachung gestartet',
                'toast.monitoringStopped': 'Überwachung gestoppt',
                'toast.itemAddedToWatchList': 'Artikel zur Beobachtungsliste hinzugefügt',
                'toast.itemRemoved': 'Artikel entfernt',
                'toast.noPriceChange': 'Keine Preisänderung',
                'toast.priceChange': 'Preis: €{old} → €{new}',
                'toast.checkedItems': '{checked} Artikel geprüft, {changes} Änderungen',
                'toast.syncedListings': '{count} Anzeigen synchronisiert',
                'toast.updatedShipments': '{count} Sendungen aktualisiert',

                // Error messages
                'error.loadOrders': 'Bestellungen konnten nicht geladen werden',
                'error.loadOrder': 'Bestellung konnte nicht geladen werden',
                'error.saveFailed': 'Speichern fehlgeschlagen',
                'error.deleteFailed': 'Löschen fehlgeschlagen',
                'error.colorFailed': 'Farbe konnte nicht angewendet werden',
                'error.addTracking': 'Sendungsverfolgung konnte nicht hinzugefügt werden',
                'error.updateTracking': 'Aktualisierung fehlgeschlagen',
                'error.loadTracking': 'Sendungsverfolgung konnte nicht geladen werden',
                'error.loadWatched': 'Beobachtungsliste konnte nicht geladen werden',
                'error.removeFailed': 'Entfernen fehlgeschlagen',
                'error.checkPriceFailed': 'Preisüberprüfung fehlgeschlagen',
                'error.loadPriceHistory': 'Preisverlauf konnte nicht geladen werden',
                'error.loadStatistics': 'Statistiken konnten nicht geladen werden',
                'error.loadListings': 'Anzeigen konnten nicht geladen werden',
                'error.syncFailed': 'Synchronisierung fehlgeschlagen',
                'error.saveSettings': 'Einstellungen konnten nicht gespeichert werden',
                'error.startFailed': 'Start fehlgeschlagen',
                'error.stopFailed': 'Stopp fehlgeschlagen',
                'error.fillAllFields': 'Bitte alle Felder ausfüllen',
                'error.itemNotFound': 'Artikel nicht gefunden',
                'error.updateFailed': 'Aktualisierung fehlgeschlagen',
                'error.failed': 'Fehlgeschlagen',

                // Confirm dialogs
                'confirm.deleteOrder': 'Bestellung löschen',
                'confirm.deleteOrderMsg': 'Diese Bestellung wird dauerhaft gelöscht.',
                'confirm.removeItem': 'Artikel entfernen',
                'confirm.removeItemMsg': 'Diesen Artikel von der Beobachtungsliste entfernen?',

                // Seller
                'seller.new': 'Neuer Verkäufer', 'seller.since': 'Seit',
                'seller.newSellerAlert': 'Neuer Verkäufer: {name} (Seit {since})',

                // Dashboard
                'dashboard.totalOrders': 'Gesamt', 'dashboard.inTransit': 'Unterwegs',
                'dashboard.delivered': 'Zugestellt', 'dashboard.value': 'Wert',
                'dashboard.avgOrder': 'Ø Bestellung', 'dashboard.newSellers': 'Neue Verkäufer',
                'dashboard.orderStatus': 'Bestellstatus', 'dashboard.dayTrend': '30-Tage-Trend',
                'dashboard.priceRanges': 'Preisbereiche', 'dashboard.topSellers': 'Top Verkäufer',
                'dashboard.monthlyOverview': 'Monatsübersicht', 'dashboard.quickInsights': 'Schnellinfos',
                'dashboard.recentActivity': 'Letzte Aktivitäten', 'dashboard.noRecentActivity': 'Keine Aktivitäten',

                // Insights
                'insight.newSellers': '{count} Neue(r) Verkäufer',
                'insight.newSellersDesc': 'Profile sorgfältig überprüfen.',
                'insight.inTransit': '{count} Unterwegs',
                'insight.inTransitDesc': 'Pakete sind auf dem Weg.',
                'insight.allGood': 'Alles in Ordnung!',
                'insight.allGoodDesc': 'Keine dringenden Angelegenheiten.',

                // Orders
                'orders.addNew': 'Neue Bestellung hinzufügen', 'orders.noOrdersFound': 'Keine Bestellungen gefunden',
                'orders.noOrdersDesc': 'Passen Sie Ihre Filter an oder fügen Sie eine neue Bestellung hinzu',
                'orders.allStatus': 'Alle Status', 'orders.allColors': 'Alle Farben',
                'orders.allSellers': 'Alle Verkäufer', 'orders.noColor': 'Keine Farbe',
                'orders.searchPlaceholder': 'Bestellungen suchen...',
                'orders.total': 'Gesamt', 'orders.ordered': 'Bestellt',
                'orders.shipped': 'Versendet', 'orders.delivered': 'Zugestellt',
                'orders.value': 'Wert', 'orders.newSellers': 'Neue Verkäufer',
                'orders.na': 'K.A.', 'orders.new': 'NEU',

                // Table headers
                'table.item': 'Artikel', 'table.price': 'Preis', 'table.status': 'Status',
                'table.seller': 'Verkäufer', 'table.tracking': 'Sendung', 'table.actions': 'Aktionen',

                // Tracking
                'tracking.addTitle': 'Sendungsnummer hinzufügen', 'tracking.carrier': 'Versanddienst',
                'tracking.number': 'Sendungsnummer', 'tracking.progress': 'Fortschritt',
                'tracking.history': 'Sendungsverlauf', 'tracking.lastUpdate': 'Letztes Update',
                'tracking.noActiveShipments': 'Keine aktiven Sendungen',
                'tracking.noActiveShipmentsDesc': 'Fügen Sie Sendungsnummern zu Ihren Bestellungen hinzu',
                'tracking.selectCarrier': 'Versanddienst wählen...',
                'tracking.enterNumber': 'Sendungsnummer eingeben...',
                'tracking.unknown': 'Unbekannt',

                // Watcher
                'watcher.addItem': 'Artikel zur Beobachtung hinzufügen',
                'watcher.urlPlaceholder': 'Kleinanzeigen-URL zur Überwachung...',
                'watcher.noWatchedItems': 'Keine überwachten Artikel',
                'watcher.noWatchedItemsDesc': 'Fügen Sie eine Kleinanzeigen-URL hinzu, um Preise zu überwachen',
                'watcher.initial': 'Start', 'watcher.current': 'Aktuell', 'watcher.lowest': 'Tiefst', 'watcher.changes': 'Änderungen',
                'watcher.noHistory': 'Kein Verlauf', 'watcher.priceHistory': 'Preisverlauf',
                'watcher.noChange': 'Keine Änderung', 'watcher.noPriceHistory': 'Kein Preisverlauf',

                // Statistics
                'stats.byStatus': 'Nach Status', 'stats.topCategories': 'Top Kategorien',
                'stats.topSellers': 'Top Verkäufer', 'stats.spendingTrend': 'Ausgabentrend (30 Tage)',
                'stats.priceDistribution': 'Preisverteilung', 'stats.monthlyOrders': 'Monatliche Bestellungen',
                'stats.categoryDistribution': 'Kategorieverteilung',
                'stats.noData': 'Keine Daten', 'stats.unknown': 'Unbekannt',
                'stats.spending': 'Ausgaben (€)', 'stats.orders': 'Bestellungen',

                // Settings
                'settings.orderColors': 'Bestellfarben', 'settings.notifications': 'Benachrichtigungen',
                'settings.autoMonitoring': 'Auto-Überwachung', 'settings.enableNotifications': 'Benachrichtigungen aktivieren',
                'settings.sound': 'Ton', 'settings.priceMonitoring': 'Preisüberwachung',
                'settings.trackingMonitoring': 'Sendungsüberwachung',
                'settings.intervalMin': 'Intervall (Min.)', 'settings.taskStatus': 'Aufgabenstatus',
                'settings.controls': 'Steuerung', 'settings.active': 'Aktiv', 'settings.inactive': 'Inaktiv',
                'settings.never': 'Nie', 'settings.lastPriceCheck': 'Letzte Preisprüfung',
                'settings.lastTrackingCheck': 'Letzte Sendungsprüfung',
                'settings.newColor': 'Farbe {num}',

                // Listings
                'listings.noListings': 'Keine Anzeigen gefunden',
                'listings.noListingsDesc': 'Synchronisieren Sie Ihre Anzeigen von Kleinanzeigen',
                'listings.ends': 'Endet: {date}', 'listings.views': '{count} Aufrufe',
                'listings.favs': '{count} Favoriten',

                // Notifications
                'notifications.noNew': 'Keine neuen Benachrichtigungen',

                // Color modal
                'color.selectColor': 'Farbe wählen', 'color.removeColor': 'Entfernen',

                // Edit modal
                'edit.title': 'Bestellung bearbeiten', 'edit.titleField': 'Titel',
                'edit.priceField': 'Preis (€)', 'edit.statusField': 'Status',
                'edit.colorField': 'Farbe', 'edit.notesField': 'Notizen',

                // Order Detail Panel
                'detail.title': 'Bestellungsdetails', 'detail.editable': 'Bearbeiten',
                'detail.tracking': 'Sendung', 'detail.trackingCarrier': 'Versanddienst',
                'detail.trackingNumber': 'Nummer', 'detail.removeTracking': 'Sendung entfernen',
                'detail.updateTracking': 'Aktualisieren', 'detail.noTracking': 'Noch keine Sendung',
                'detail.images': 'Bilder', 'detail.seller': 'Verkäufer-Info',
                'detail.sellerName': 'Verkäufer', 'detail.sellerSince': 'Mitglied seit',
                'detail.category': 'Kategorie', 'detail.location': 'Standort',
                'detail.openListing': 'Anzeige öffnen', 'detail.saveChanges': 'Änderungen speichern',
                'detail.deleteOrder': 'Löschen',
                'confirm.removeTracking': 'Sendung entfernen',
                'confirm.removeTrackingMsg': 'Die Sendungsnummer wird gelöscht.',
                'toast.trackingRemoved': 'Sendung entfernt',

                // Time
                'time.justNow': 'gerade eben', 'time.mAgo': 'vor {n} Min.',
                'time.hAgo': 'vor {n} Std.', 'time.dAgo': 'vor {n} T.',

                // Misc
                'misc.urlPlaceholder': 'Kleinanzeigen-URL...',
                'misc.minPrice': 'Min €', 'misc.maxPrice': 'Max €',
            }
        };
    }

    // ---- Mobile Menu ----
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const sidebar = document.getElementById('sidebarWrapper');
        const overlay = document.getElementById('mobileOverlay');
        if (this.mobileMenuOpen) {
            sidebar.classList.add('open');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.add('hidden');
        }
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
        const sidebar = document.getElementById('sidebarWrapper');
        const overlay = document.getElementById('mobileOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
    }

    // ---- Language ----
    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
        localStorage.setItem('km_language', this.currentLang);
        document.getElementById('currentLang').textContent = this.currentLang.toUpperCase();
        this.updateTranslations();
        // Re-render current section to apply translations
        if (this.showSection) {
            this.showSection(this.currentSection);
        }
    }

    updateTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.translations[this.currentLang]?.[key];
            if (val) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = this.translations[this.currentLang]?.[key];
            if (val) el.placeholder = val;
        });
    }

    t(key, params) {
        let str = this.translations[this.currentLang]?.[key] || this.translations['en']?.[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                str = str.replace(`{${k}}`, v);
            });
        }
        return str;
    }

    // ---- View Mode ----
    toggleView() {
        const modes = ['grid', 'list', 'table'];
        const idx = modes.indexOf(this.viewMode);
        this.viewMode = modes[(idx + 1) % modes.length];
        localStorage.setItem('km_viewMode', this.viewMode);
        this.updateViewIcon();
        this.loadOrders();
    }

    updateViewIcon() {
        const icon = document.getElementById('viewToggleIcon');
        if (icon) {
            const icons = { grid: 'fas fa-th', list: 'fas fa-list', table: 'fas fa-table' };
            icon.className = icons[this.viewMode] || 'fas fa-th';
        }
    }

    // ---- UI Helpers ----
    showLoading(text) {
        const overlay = document.getElementById('loadingOverlay');
        document.getElementById('loadingText').textContent = text || '';
        overlay.classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toastIcon');
        const text = document.getElementById('toastText');

        text.textContent = message;
        toast.className = 'toast toast-' + type + ' show';

        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
        icon.className = 'fas ' + (icons[type] || icons.success);

        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 4000);
    }

    // ---- Modals ----
    openModal(id) { document.getElementById(id).classList.add('active'); }
    closeModal(id) { document.getElementById(id).classList.remove('active'); }

    // ---- Confirm Dialog ----
    showConfirm(title, message, callback, btnText) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmAction').textContent = btnText || this.t('actions.delete');
        this.confirmCallback = callback;
        this.openModal('confirmModal');
    }

    executeConfirm() {
        if (this.confirmCallback) { this.confirmCallback(); this.confirmCallback = null; }
        this.closeModal('confirmModal');
    }

    cancelConfirm() { this.confirmCallback = null; this.closeModal('confirmModal'); }

    // ---- API ----
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers }
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Request failed' }));
                throw new Error(error.detail || 'Request failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ---- Safe JSON Parse ----
    safeJsonParse(str, fallback = null) {
        if (!str) return fallback;
        try { return JSON.parse(str); } catch { return fallback; }
    }

    // ---- Settings ----
    async loadSettings() {
        try {
            this.settings = await this.apiRequest('/settings');
        } catch {
            this.settings = {
                colors: [
                    { name: 'Red', value: '#ef4444' }, { name: 'Blue', value: '#3b82f6' },
                    { name: 'Green', value: '#10b981' }, { name: 'Yellow', value: '#f59e0b' },
                    { name: 'Purple', value: '#8b5cf6' }, { name: 'Pink', value: '#ec4899' }
                ],
                notifications_enabled: true, notification_sound: 'default'
            };
        }
        this.updateColorFilters();
        this.updateEditColorOptions();
        if (this.updateSettingsUI) this.updateSettingsUI();
    }

    updateColorFilters() {
        const filter = document.getElementById('colorFilter');
        if (!filter || !this.settings.colors) return;
        filter.innerHTML = `<option value="">${this.t('orders.allColors')}</option>`;
        this.settings.colors.forEach(c => { filter.innerHTML += `<option value="${c.value}">${c.name}</option>`; });
    }

    updateEditColorOptions() {
        const sel = document.getElementById('edit_color');
        if (!sel || !this.settings.colors) return;
        const val = sel.value;
        sel.innerHTML = `<option value="">${this.t('orders.noColor')}</option>`;
        this.settings.colors.forEach(c => { sel.innerHTML += `<option value="${c.value}">${c.name}</option>`; });
        sel.value = val;
    }

    // ---- Status Helpers ----
    getStatusClass(status) {
        return { Ordered: 'badge-ordered', Shipped: 'badge-shipped', Delivered: 'badge-delivered' }[status] || 'badge-ordered';
    }

    getStatusIcon(status) {
        return { Ordered: 'fa-box', Shipped: 'fa-truck', Delivered: 'fa-check-circle' }[status] || 'fa-box';
    }

    // ---- Time Ago ----
    getTimeAgo(dateString) {
        const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
        if (diff < 60) return this.t('time.justNow');
        if (diff < 3600) return this.t('time.mAgo', { n: Math.floor(diff / 60) });
        if (diff < 86400) return this.t('time.hAgo', { n: Math.floor(diff / 3600) });
        if (diff < 2592000) return this.t('time.dAgo', { n: Math.floor(diff / 86400) });
        return new Date(dateString).toLocaleDateString();
    }

    // ---- Tracking Details Toggle ----
    toggleTrackingDetails(orderId) {
        const details = document.getElementById(`tracking-details-${orderId}`);
        const icon = document.getElementById(`tracking-icon-${orderId}`);
        if (details && icon) {
            const hidden = details.classList.toggle('hidden');
            icon.className = hidden ? 'fas fa-chevron-down text-blue-400' : 'fas fa-chevron-up text-blue-400';
        }
    }
}
