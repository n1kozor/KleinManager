// Main Application - Combines all manager functionality
class KleinManager extends KleinManagerCore {
    constructor() {
        super();

        // Initialize managers - they receive `this` as app reference
        this._dashboard = new DashboardManager(this);
        this._orders = new OrdersManager(this);
        this._watcher = new WatcherManager(this);
        this._tracking = new TrackingManager(this);
        this._listings = new ListingsManager(this);
        this._statistics = new StatisticsManager(this);
        this._settings = new SettingsManager(this);
        this._notifications = new NotificationsManager(this);

        // Delegate manager methods to app
        this._delegateAll(this._dashboard);
        this._delegateAll(this._orders);
        this._delegateAll(this._watcher);
        this._delegateAll(this._tracking);
        this._delegateAll(this._listings);
        this._delegateAll(this._statistics);
        this._delegateAll(this._settings);
        this._delegateAll(this._notifications);

        this.init();
    }

    _delegateAll(manager) {
        const proto = Object.getPrototypeOf(manager);
        Object.getOwnPropertyNames(proto).forEach(name => {
            if (name === 'constructor' || typeof proto[name] !== 'function') return;
            if (this[name]) return; // don't override
            this[name] = (...args) => manager[name](...args);
        });
    }

    async init() {
        // Set language label from stored preference
        const langEl = document.getElementById('currentLang');
        if (langEl) langEl.textContent = this.currentLang.toUpperCase();
        this.updateTranslations();
        this.updateViewIcon();
        await this.loadSettings();
        this._notifications.initNotificationSound();
        this.loadDashboard();
        this._notifications.startNotificationPolling();

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) this.closeMobileMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeOrderDetail();
        });
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(section);
        if (target) target.classList.add('active');

        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        if (navItem) navItem.classList.add('active');

        // Update page title
        const titleKey = section === 'dashboard' ? 'nav.dashboard' :
                         section === 'orders' ? 'nav.orders' :
                         section === 'watcher' ? 'nav.watcher' :
                         section === 'tracking' ? 'nav.tracking' :
                         section === 'listings' ? 'nav.listings' :
                         section === 'statistics' ? 'nav.statistics' :
                         section === 'settings' ? 'nav.settings' : 'nav.dashboard';
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = this.t(titleKey);

        this.currentSection = section;
        this.closeMobileMenu();

        // Load section data
        switch (section) {
            case 'dashboard': this.loadDashboard(); break;
            case 'orders': this.loadOrders(); break;
            case 'watcher': this.loadWatchedItems(); break;
            case 'tracking': this.loadTracking(); break;
            case 'listings': this.loadMyListings(); break;
            case 'statistics': this.loadStatistics(); break;
            case 'settings': this.loadSettings(); break;
        }
    }
}

// Initialize
const app = new KleinManager();
