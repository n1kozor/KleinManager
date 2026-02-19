// Settings Manager
class SettingsManager {
    constructor(app) {
        this.app = app;
    }

    updateSettingsUI() {
        const get = id => document.getElementById(id);

        const notifEnabled = get('notifications-enabled');
        const notifSound = get('notification-sound');
        const autoCheck = get('auto-check-enabled');
        const autoCheckInt = get('auto-check-interval');
        const autoTrack = get('auto-tracking-enabled');
        const autoTrackInt = get('auto-tracking-interval');

        if (notifEnabled) notifEnabled.checked = this.app.settings.notifications_enabled;
        if (notifSound) notifSound.value = this.app.settings.notification_sound || 'default';
        if (autoCheck) autoCheck.checked = this.app.settings.auto_check_enabled !== false;
        if (autoCheckInt) autoCheckInt.value = this.app.settings.auto_check_interval || 60;
        if (autoTrack) autoTrack.checked = this.app.settings.auto_tracking_enabled !== false;
        if (autoTrackInt) autoTrackInt.value = this.app.settings.auto_tracking_interval || 30;

        this.renderColorSettings();
        this.updateBackgroundTaskStatus();
    }

    async updateBackgroundTaskStatus() {
        try {
            const status = await this.app.apiRequest('/background-tasks/status');

            const priceEl = document.getElementById('price-monitoring-status');
            const trackEl = document.getElementById('tracking-monitoring-status');
            const lastPrice = document.getElementById('last-price-check');
            const lastTrack = document.getElementById('last-tracking-check');

            if (priceEl) {
                priceEl.textContent = status.price_monitoring_active ? this.app.t('settings.active') : this.app.t('settings.inactive');
                priceEl.className = 'font-medium ' + (status.price_monitoring_active ? 'text-emerald-400' : 'text-red-400');
            }
            if (trackEl) {
                trackEl.textContent = status.tracking_monitoring_active ? this.app.t('settings.active') : this.app.t('settings.inactive');
                trackEl.className = 'font-medium ' + (status.tracking_monitoring_active ? 'text-emerald-400' : 'text-red-400');
            }
            if (lastPrice) lastPrice.textContent = status.last_price_check ? new Date(status.last_price_check).toLocaleString(this.app.currentLang === 'de' ? 'de-DE' : 'en') : this.app.t('settings.never');
            if (lastTrack) lastTrack.textContent = status.last_tracking_check ? new Date(status.last_tracking_check).toLocaleString(this.app.currentLang === 'de' ? 'de-DE' : 'en') : this.app.t('settings.never');
        } catch {
            console.error('Failed to get task status');
        }
    }

    renderColorSettings() {
        const container = document.getElementById('color-settings');
        if (!container || !this.app.settings.colors) return;

        container.innerHTML = this.app.settings.colors.map((color, i) => `
            <div class="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
                <div class="w-6 h-6 rounded-md flex-shrink-0" style="background:${color.value}"></div>
                <input type="text" value="${color.name}" onchange="app.updateColorName(${i}, this.value)"
                       class="input flex-1" style="padding: 4px 8px; font-size: 0.8125rem;">
                <button onclick="app.removeColor(${i})" class="btn btn-ghost btn-icon btn-sm" style="color:var(--accent-red);"><i class="fas fa-trash text-xs"></i></button>
            </div>
        `).join('');
    }

    updateColorName(index, name) {
        if (this.app.settings.colors?.[index]) {
            this.app.settings.colors[index].name = name;
        }
    }

    removeColor(index) {
        if (this.app.settings.colors) {
            this.app.settings.colors.splice(index, 1);
            this.renderColorSettings();
        }
    }

    addNewColor() {
        const palette = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#74b9ff', '#a29bfe'];
        const color = palette[Math.floor(Math.random() * palette.length)];
        if (!this.app.settings.colors) this.app.settings.colors = [];
        this.app.settings.colors.push({ name: this.app.t('settings.newColor', { num: this.app.settings.colors.length + 1 }), value: color });
        this.renderColorSettings();
    }

    async saveSettings() {
        const data = {
            colors: this.app.settings.colors || [],
            notifications_enabled: document.getElementById('notifications-enabled')?.checked || false,
            notification_sound: document.getElementById('notification-sound')?.value || 'default',
            auto_check_enabled: document.getElementById('auto-check-enabled')?.checked || false,
            auto_check_interval: parseInt(document.getElementById('auto-check-interval')?.value) || 60,
            auto_tracking_enabled: document.getElementById('auto-tracking-enabled')?.checked || false,
            auto_tracking_interval: parseInt(document.getElementById('auto-tracking-interval')?.value) || 30
        };

        this.app.showLoading(this.app.t('loading.savingSettings'));
        try {
            await this.app.apiRequest('/settings', { method: 'PUT', body: JSON.stringify(data) });
            this.app.settings = { ...this.app.settings, ...data };
            this.app.updateColorFilters();
            this.app.updateEditColorOptions();
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.settingsSaved'), 'success');
            setTimeout(() => this.updateBackgroundTaskStatus(), 2000);
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.saveSettings'), 'error');
        }
    }

    async startBackgroundTasks() {
        this.app.showLoading(this.app.t('loading.startingMonitoring'));
        try {
            await this.app.apiRequest('/background-tasks/start', { method: 'POST' });
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.monitoringStarted'), 'success');
            this.updateBackgroundTaskStatus();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.startFailed'), 'error');
        }
    }

    async stopBackgroundTasks() {
        this.app.showLoading(this.app.t('loading.stoppingMonitoring'));
        try {
            await this.app.apiRequest('/background-tasks/stop', { method: 'POST' });
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.monitoringStopped'), 'success');
            this.updateBackgroundTaskStatus();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.stopFailed'), 'error');
        }
    }
}
