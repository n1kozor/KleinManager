// Notifications Manager
class NotificationsManager {
    constructor(app) {
        this.app = app;
    }

    initNotificationSound() {
        if (this.app.settings.notification_sound && this.app.settings.notification_sound !== 'default') {
            this.app.notificationSound = new Audio(`/static/sounds/${this.app.settings.notification_sound}.mp3`);
        }
    }

    startNotificationPolling() {
        this.checkNotifications();
        setInterval(() => this.checkNotifications(), 30000);
    }

    async checkNotifications() {
        try {
            const notifs = await this.app.apiRequest('/notifications');
            if (notifs.length > this.app.notifications.length && this.app.settings.notifications_enabled && this.app.notificationSound) {
                this.app.notificationSound.play().catch(() => {});
            }
            this.app.notifications = notifs;
            this._updateBadge();
        } catch {
            // silent
        }
    }

    _updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;
        if (this.app.notifications.length > 0) {
            badge.textContent = this.app.notifications.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    toggleNotifications() {
        this.app.notificationsOpen = !this.app.notificationsOpen;
        if (this.app.notificationsOpen) {
            this.app.openModal('notificationsModal');
            this._renderList();
        } else {
            this.closeNotifications();
        }
    }

    closeNotifications() {
        this.app.notificationsOpen = false;
        this.app.closeModal('notificationsModal');
    }

    _renderList() {
        const container = document.getElementById('notificationsList');
        if (!this.app.notifications.length) {
            container.innerHTML = `<div class="empty-state" style="padding:2rem 1rem;"><i class="fas fa-bell-slash" style="font-size:2rem;"></i><p>${this.app.t('notifications.noNew')}</p></div>`;
            return;
        }

        const icons = { price_change: 'fa-chart-line', tracking_update: 'fa-truck', system: 'fa-info-circle' };

        container.innerHTML = this.app.notifications.map(n => `
            <div class="flex items-start gap-3 p-4 border-b border-[var(--border-primary)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
                 onclick="app.markNotificationRead(${n.id})">
                <div class="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <i class="fas ${icons[n.type] || 'fa-bell'} text-blue-400 text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium">${n.title}</p>
                    <p class="text-xs text-[var(--text-muted)] mt-0.5">${n.message}</p>
                    <p class="text-xs text-[var(--text-muted)] mt-1 opacity-60">${new Date(n.created_at).toLocaleString(this.app.currentLang === 'de' ? 'de-DE' : 'en')}</p>
                </div>
            </div>
        `).join('');
    }

    async markNotificationRead(id) {
        try {
            await this.app.apiRequest(`/notifications/${id}/read`, { method: 'POST' });
            this.checkNotifications();
        } catch { /* silent */ }
    }

    async clearAllNotifications() {
        try {
            await this.app.apiRequest('/notifications', { method: 'DELETE' });
            this.app.notifications = [];
            this._updateBadge();
            this._renderList();
        } catch { /* silent */ }
    }
}
