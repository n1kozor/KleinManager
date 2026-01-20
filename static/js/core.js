// Core functionality and utilities
class KleinManagerCore {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.currentSection = 'dashboard';
        this.viewMode = localStorage.getItem('viewMode') || 'grid';
        this.theme = localStorage.getItem('theme') || 'dark';
        this.apiBase = '/api/v1';
        this.mobileMenuOpen = false;
        this.settings = {};
        this.notifications = [];
        this.notificationsOpen = false;
        this.selectedOrderForColor = null;
        this.selectedColor = undefined;
        this.notificationSound = null;
        this.charts = {};

        this.translations = {
            en: {
                'app.title': 'KleinManager',
                'nav.dashboard': 'Dashboard',
                'nav.orders': 'Orders',
                'nav.watcher': 'Price Watcher',
                'nav.tracking': 'Tracking',
                'nav.listings': 'My Listings',
                'nav.statistics': 'Statistics',
                'nav.settings': 'Settings',
                'dashboard.title': 'Dashboard',
                'orders.title': 'Orders',
                'watcher.title': 'Price Watcher',
                'tracking.title': 'Package Tracking',
                'listings.title': 'My Listings',
                'statistics.title': 'Statistics',
                'settings.title': 'Settings',
                'orders.addNew': 'Add New Order',
                'orders.searchPlaceholder': 'Search orders...',
                'orders.urlPlaceholder': 'Enter Kleinanzeigen URL...',
                'orders.allStatus': 'All Status',
                'orders.allColors': 'All Colors',
                'orders.allSellers': 'All Sellers',
                'actions.checkPrices': 'Check Prices',
                'actions.addWatch': 'Add Watch',
                'actions.sync': 'Sync Listings',
                'actions.addOrder': 'Add Order',
                'actions.save': 'Save',
                'actions.cancel': 'Cancel',
                'actions.refresh': 'Refresh',
                'actions.updateAll': 'Update All',
                'actions.edit': 'Edit',
                'actions.delete': 'Delete',
                'actions.addTracking': 'Add Tracking',
                'actions.updateTracking': 'Update',
                'actions.viewListing': 'View Ad',
                'actions.viewOrder': 'View Order',
                'loading.title': 'Loading...',
                'seller.new': 'New Seller',
                'seller.since': 'Since',
                'tracking.progress': 'Progress',
                'tracking.history': 'Tracking History',
                'tracking.lastUpdate': 'Last Update',
                'tracking.addTitle': 'Add Tracking Number',
                'tracking.carrier': 'Carrier',
                'tracking.number': 'Tracking Number',
                'order.price': 'Price',
                'order.category': 'Category',
                'order.location': 'Location',
                'order.seller': 'Seller',
                'edit.title': 'Edit Order',
                'stats.total': 'Total Orders',
                'stats.transit': 'In Transit',
                'stats.delivered': 'Delivered',
                'stats.value': 'Total Value',
                'stats.avgOrder': 'Avg. Order',
                'stats.newSellers': 'New Sellers',
                'stats.statusChart': 'Order Status',
                'stats.trendsChart': '30-Day Trends',
                'stats.insights': 'Quick Insights',
                'stats.priceChart': 'Price Ranges',
                'stats.sellerChart': 'Top Sellers',
                'stats.monthlyChart': 'Monthly Overview',
                'stats.recent': 'Recent Activity',
                'status.ordered': 'Ordered',
                'status.shipped': 'Shipped',
                'status.delivered': 'Delivered',
                'notifications.title': 'Notifications',
                'notifications.clearAll': 'Clear All',
                'notifications.empty': 'No new notifications',
                'notifications.enable': 'Enable Notifications',
                'notifications.sound': 'Notification Sound',
                'settings.colors': 'Order Colors',
                'settings.addColor': 'Add Color',
                'settings.autoMonitor': 'Auto-Monitoring',
                'settings.autoPrice': 'Auto Price Check',
                'settings.priceInterval': 'Price Check Interval (minutes)',
                'settings.autoTrack': 'Auto Tracking Check',
                'settings.trackInterval': 'Tracking Check Interval (minutes)',
                'settings.backgroundStatus': 'Background Task Status',
                'settings.manualControls': 'Manual Controls',
                'settings.startMonitor': 'Start Monitoring',
                'settings.stopMonitor': 'Stop Monitoring',
                'settings.refreshStatus': 'Refresh Status',
                'settings.save': 'Save All Settings',
                'settings.apply': 'Apply',
                'settings.cancel': 'Cancel',
                'filter.minPrice': 'Min €',
                'filter.maxPrice': 'Max €',
                'theme.toggle': 'Toggle Theme'
            },
            de: {
                'app.title': 'KleinManager',
                'nav.dashboard': 'Übersicht',
                'nav.orders': 'Bestellungen',
                'nav.watcher': 'Preis-Watcher',
                'nav.tracking': 'Sendungsverfolgung',
                'nav.listings': 'Meine Anzeigen',
                'nav.statistics': 'Statistiken',
                'nav.settings': 'Einstellungen',
                'dashboard.title': 'Übersicht',
                'orders.title': 'Bestellungen',
                'watcher.title': 'Preis-Watcher',
                'tracking.title': 'Sendungsverfolgung',
                'listings.title': 'Meine Anzeigen',
                'statistics.title': 'Statistiken',
                'settings.title': 'Einstellungen',
                'orders.addNew': 'Neue Bestellung hinzufügen',
                'orders.searchPlaceholder': 'Suchen...',
                'orders.urlPlaceholder': 'Kleinanzeigen URL eingeben...',
                'orders.allStatus': 'Alle Status',
                'orders.allColors': 'Alle Farben',
                'orders.allSellers': 'Alle Verkäufer',
                'actions.checkPrices': 'Preise prüfen',
                'actions.addWatch': 'Überwachung hinzufügen',
                'actions.sync': 'Synchronisieren',
                'actions.addOrder': 'Bestellung hinzufügen',
                'actions.save': 'Speichern',
                'actions.cancel': 'Abbrechen',
                'actions.refresh': 'Aktualisieren',
                'actions.updateAll': 'Alle aktualisieren',
                'actions.edit': 'Bearbeiten',
                'actions.delete': 'Löschen',
                'actions.addTracking': 'Sendungsnr. hinzufügen',
                'actions.updateTracking': 'Aktualisieren',
                'actions.viewListing': 'Anzeige öffnen',
                'actions.viewOrder': 'Bestellung anzeigen',
                'loading.title': 'Lädt...',
                'seller.new': 'Neuer Verkäufer',
                'seller.since': 'Seit',
                'tracking.progress': 'Fortschritt',
                'tracking.history': 'Sendungsverlauf',
                'tracking.lastUpdate': 'Letztes Update',
                'tracking.addTitle': 'Sendungsnummer hinzufügen',
                'tracking.carrier': 'Versanddienst',
                'tracking.number': 'Sendungsnummer',
                'order.price': 'Preis',
                'order.category': 'Kategorie',
                'order.location': 'Ort',
                'order.seller': 'Verkäufer',
                'edit.title': 'Bestellung bearbeiten',
                'stats.total': 'Gesamt',
                'stats.transit': 'Unterwegs',
                'stats.delivered': 'Zugestellt',
                'stats.value': 'Gesamtwert',
                'stats.avgOrder': 'Ø Bestellung',
                'stats.newSellers': 'Neue Verkäufer',
                'stats.statusChart': 'Bestellstatus',
                'stats.trendsChart': '30-Tage Trends',
                'stats.insights': 'Schnelle Einblicke',
                'stats.priceChart': 'Preisspannen',
                'stats.sellerChart': 'Top Verkäufer',
                'stats.monthlyChart': 'Monatsübersicht',
                'stats.recent': 'Letzte Aktivitäten',
                'status.ordered': 'Bestellt',
                'status.shipped': 'Versendet',
                'status.delivered': 'Zugestellt',
                'notifications.title': 'Benachrichtigungen',
                'notifications.clearAll': 'Alle löschen',
                'notifications.empty': 'Keine neuen Benachrichtigungen',
                'notifications.enable': 'Benachrichtigungen aktivieren',
                'notifications.sound': 'Benachrichtigungston',
                'settings.colors': 'Bestellfarben',
                'settings.addColor': 'Farbe hinzufügen',
                'settings.autoMonitor': 'Auto-Überwachung',
                'settings.autoPrice': 'Auto-Preisprüfung',
                'settings.priceInterval': 'Intervall (Minuten)',
                'settings.autoTrack': 'Auto-Sendungsverfolgung',
                'settings.trackInterval': 'Intervall (Minuten)',
                'settings.backgroundStatus': 'Hintergrundaufgaben',
                'settings.manualControls': 'Manuelle Steuerung',
                'settings.startMonitor': 'Überwachung starten',
                'settings.stopMonitor': 'Überwachung stoppen',
                'settings.refreshStatus': 'Status aktualisieren',
                'settings.save': 'Alle speichern',
                'settings.apply': 'Anwenden',
                'settings.cancel': 'Abbrechen',
                'filter.minPrice': 'Min €',
                'filter.maxPrice': 'Max €',
                'theme.toggle': 'Design wechseln'
            },
            hu: {
                'app.title': 'KleinManager',
                'nav.dashboard': 'Áttekintés',
                'nav.orders': 'Rendelések',
                'nav.watcher': 'Árfigyelő',
                'nav.tracking': 'Csomagkövetés',
                'nav.listings': 'Hirdetéseim',
                'nav.statistics': 'Statisztikák',
                'nav.settings': 'Beállítások',
                'dashboard.title': 'Áttekintés',
                'orders.title': 'Rendelések',
                'watcher.title': 'Árfigyelő',
                'tracking.title': 'Csomagkövetés',
                'listings.title': 'Hirdetéseim',
                'statistics.title': 'Statisztikák',
                'settings.title': 'Beállítások',
                'orders.addNew': 'Új rendelés',
                'orders.searchPlaceholder': 'Keresés...',
                'orders.urlPlaceholder': 'Kleinanzeigen URL...',
                'orders.allStatus': 'Összes állapot',
                'orders.allColors': 'Összes szín',
                'orders.allSellers': 'Összes eladó',
                'actions.checkPrices': 'Árak ellenőrzése',
                'actions.addWatch': 'Figyelés hozzáadása',
                'actions.sync': 'Szinkronizálás',
                'actions.addOrder': 'Rendelés hozzáadása',
                'actions.save': 'Mentés',
                'actions.cancel': 'Mégse',
                'actions.refresh': 'Frissítés',
                'actions.updateAll': 'Összes frissítése',
                'actions.edit': 'Szerkesztés',
                'actions.delete': 'Törlés',
                'actions.addTracking': 'Követés hozzáadása',
                'actions.updateTracking': 'Frissítés',
                'actions.viewListing': 'Hirdetés megtekintése',
                'actions.viewOrder': 'Rendelés megtekintése',
                'loading.title': 'Betöltés...',
                'seller.new': 'Új eladó',
                'seller.since': 'Tagság kezdete',
                'tracking.progress': 'Állapot',
                'tracking.history': 'Előzmények',
                'tracking.lastUpdate': 'Utolsó frissítés',
                'tracking.addTitle': 'Csomagkövetési szám',
                'tracking.carrier': 'Szolgáltató',
                'tracking.number': 'Követési szám',
                'order.price': 'Ár',
                'order.category': 'Kategória',
                'order.location': 'Hely',
                'order.seller': 'Eladó',
                'edit.title': 'Rendelés szerkesztése',
                'stats.total': 'Összes rendelés',
                'stats.transit': 'Szállítás alatt',
                'stats.delivered': 'Kézbesítve',
                'stats.value': 'Összérték',
                'stats.avgOrder': 'Átlag rendelés',
                'stats.newSellers': 'Új eladók',
                'stats.statusChart': 'Rendelés állapotok',
                'stats.trendsChart': '30 napos trend',
                'stats.insights': 'Gyors elemzés',
                'stats.priceChart': 'Ártartományok',
                'stats.sellerChart': 'Legjobb eladók',
                'stats.monthlyChart': 'Havi áttekintés',
                'stats.recent': 'Legutóbbi tevékenységek',
                'status.ordered': 'Megrendelve',
                'status.shipped': 'Feladva',
                'status.delivered': 'Kézbesítve',
                'notifications.title': 'Értesítések',
                'notifications.clearAll': 'Összes törlése',
                'notifications.empty': 'Nincsenek új értesítések',
                'notifications.enable': 'Értesítések engedélyezése',
                'notifications.sound': 'Értesítési hang',
                'settings.colors': 'Rendelés színek',
                'settings.addColor': 'Szín hozzáadása',
                'settings.autoMonitor': 'Automatikus figyelés',
                'settings.autoPrice': 'Auto árfigyelés',
                'settings.priceInterval': 'Időköz (perc)',
                'settings.autoTrack': 'Auto csomagkövetés',
                'settings.trackInterval': 'Időköz (perc)',
                'settings.backgroundStatus': 'Háttérfolyamatok állapota',
                'settings.manualControls': 'Kézi vezérlés',
                'settings.startMonitor': 'Figyelés indítása',
                'settings.stopMonitor': 'Figyelés leállítása',
                'settings.refreshStatus': 'Állapot frissítése',
                'settings.save': 'Beállítások mentése',
                'settings.apply': 'Alkalmaz',
                'settings.cancel': 'Mégse',
                'filter.minPrice': 'Min €',
                'filter.maxPrice': 'Max €',
                'theme.toggle': 'Téma váltás'
            }
        };

        // Initialize theme
        this.initTheme();
    }

    // Mobile Menu
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (this.mobileMenuOpen) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('mobileOverlay').classList.add('hidden');
    }

    // Language Management
    toggleLanguage() {
        const langs = ['en', 'de', 'hu'];
        let currentIndex = langs.indexOf(this.currentLang);
        this.currentLang = langs[(currentIndex + 1) % langs.length];

        localStorage.setItem('language', this.currentLang);
        document.getElementById('currentLang').textContent = this.currentLang.toUpperCase();
        this.updateTranslations();
    }

    updateTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[this.currentLang][key]) {
                element.textContent = this.translations[this.currentLang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (this.translations[this.currentLang][key]) {
                element.placeholder = this.translations[this.currentLang][key];
            }
        });
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    // Theme Management
    initTheme() {
        if (this.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.initTheme();
    }

    // View Mode Management
    toggleView() {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
        localStorage.setItem('viewMode', this.viewMode);
        this.updateViewIcon();
        this.loadOrders();
    }

    updateViewIcon() {
        const icon = document.getElementById('viewToggleIcon');
        if (icon) {
            icon.className = this.viewMode === 'grid' ? 'fas fa-list' : 'fas fa-th';
        }
    }

    // UI Helpers
    showLoading(text) {
        document.getElementById('loadingText').textContent = text;
        document.getElementById('loadingOverlay').classList.remove('hidden');
        document.getElementById('loadingOverlay').classList.add('flex');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
        document.getElementById('loadingOverlay').classList.remove('flex');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const content = document.getElementById('toastContent');
        const icon = document.getElementById('toastIcon');
        const text = document.getElementById('toastText');

        text.textContent = message;

        if (type === 'success') {
            content.className = 'px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md bg-green-500 text-white';
            icon.className = 'fas fa-check-circle text-xl';
        } else if (type === 'error') {
            content.className = 'px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md bg-red-500 text-white';
            icon.className = 'fas fa-exclamation-circle text-xl';
        } else if (type === 'warning') {
            content.className = 'px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md bg-yellow-500 text-white';
            icon.className = 'fas fa-exclamation-triangle text-xl';
        }

        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
    }

    // API Calls
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Settings Management
    async loadSettings() {
        try {
            this.settings = await this.apiRequest('/settings');
            this.updateColorFilters();
            this.updateEditColorOptions();
            if (this.updateSettingsUI) {
                this.updateSettingsUI();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = {
                colors: [
                    {'name': 'Red', 'value': '#ef4444'},
                    {'name': 'Blue', 'value': '#3b82f6'},
                    {'name': 'Green', 'value': '#10b981'},
                    {'name': 'Yellow', 'value': '#f59e0b'},
                    {'name': 'Purple', 'value': '#8b5cf6'},
                    {'name': 'Pink', 'value': '#ec4899'}
                ],
                notifications_enabled: true,
                notification_sound: 'default'
            };
            this.updateColorFilters();
            this.updateEditColorOptions();
        }
    }

    updateColorFilters() {
        const colorFilter = document.getElementById('colorFilter');
        const editColor = document.getElementById('edit_color');

        if (!this.settings.colors) return;

        if (colorFilter) {
            colorFilter.innerHTML = `<option value="" data-i18n="orders.allColors">${this.t('orders.allColors')}</option>`;
            this.settings.colors.forEach(color => {
                colorFilter.innerHTML += `<option value="${color.value}">${color.name}</option>`;
            });
        }

        if (editColor) {
            const currentValue = editColor.value;
            editColor.innerHTML = '<option value="">No Color</option>';
            this.settings.colors.forEach(color => {
                editColor.innerHTML += `<option value="${color.value}">${color.name}</option>`;
            });
            editColor.value = currentValue;
        }
    }

    updateEditColorOptions() {
        const editColor = document.getElementById('edit_color');
        if (!editColor || !this.settings.colors) return;

        const currentValue = editColor.value;
        editColor.innerHTML = '<option value="">No Color</option>';
        this.settings.colors.forEach(color => {
            editColor.innerHTML += `<option value="${color.value}">${color.name}</option>`;
        });
        editColor.value = currentValue;
    }

    // Utility functions
    getStatusClass(status) {
        const classes = {
            'Ordered': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'Shipped': 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
            'Delivered': 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200'
        };
        return classes[status] || classes['Ordered'];
    }

    toggleTrackingDetails(orderId) {
        const details = document.getElementById(`tracking-details-${orderId}`);
        const icon = document.getElementById(`tracking-icon-${orderId}`);

        if (details && icon) {
            if (details.classList.contains('hidden')) {
                details.classList.remove('hidden');
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                details.classList.add('hidden');
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
    }
}