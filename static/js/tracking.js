// Tracking Manager
class TrackingManager {
    constructor(app) {
        this.app = app;
    }

    showTrackingModal(orderId) {
        document.getElementById('tracking_order_id').value = orderId;
        document.getElementById('tracking_carrier').value = '';
        document.getElementById('tracking_number').value = '';
        this.app.openModal('trackingModal');
        setTimeout(() => document.getElementById('tracking_carrier').focus(), 100);
    }

    closeTrackingModal() { this.app.closeModal('trackingModal'); }

    async saveTracking(event) {
        event.preventDefault();
        const orderId = document.getElementById('tracking_order_id').value;
        const carrier = document.getElementById('tracking_carrier').value;
        const trackingNumber = document.getElementById('tracking_number').value;

        if (!carrier || !trackingNumber) {
            this.app.showToast(this.app.t('error.fillAllFields'), 'error');
            return;
        }

        this.app.showLoading(this.app.t('loading.addingTracking'));
        try {
            await this.app.apiRequest(`/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ tracking_number: trackingNumber, carrier })
            });
            this.app.hideLoading();
            this.closeTrackingModal();
            this.app.showToast(this.app.t('toast.trackingAdded'), 'success');
            this._reloadCurrent();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.addTracking'), 'error');
        }
    }

    async loadTracking() {
        try {
            const orders = await this.app.apiRequest('/orders/tracking');
            const container = document.getElementById('tracking-list');
            if (!orders.length) {
                container.innerHTML = `<div class="empty-state card"><i class="fas fa-truck"></i><h3>${this.app.t('tracking.noActiveShipments')}</h3><p>${this.app.t('tracking.noActiveShipmentsDesc')}</p></div>`;
            } else {
                container.innerHTML = orders.map(o => this._renderCard(o)).join('');
            }
        } catch {
            this.app.showToast(this.app.t('error.loadTracking'), 'error');
        }
    }

    async updateAllTracking() {
        this.app.showLoading(this.app.t('loading.updatingAllTracking'));
        try {
            const result = await this.app.apiRequest('/tracking/update-all', { method: 'POST' });
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.updatedShipments', { count: result.updated }), 'success');
            this._reloadCurrent();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.updateTracking'), 'error');
        }
    }

    async updateTracking(id) {
        this.app.showLoading(this.app.t('loading.updatingTracking'));
        try {
            await this.app.apiRequest(`/orders/${id}/tracking`, { method: 'POST' });
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.trackingUpdated'), 'success');
            this._reloadCurrent();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.updateTracking'), 'error');
        }
    }

    goToOrder(orderId) {
        this.app.showSection('orders');
        setTimeout(() => {
            const el = document.querySelector(`[data-order-id="${orderId}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.boxShadow = '0 0 0 2px var(--accent-blue)';
                setTimeout(() => { el.style.boxShadow = ''; }, 3000);
            }
        }, 500);
    }

    _reloadCurrent() {
        const s = this.app.currentSection;
        if (s === 'tracking') this.loadTracking();
        else if (s === 'dashboard') this.app.loadDashboard();
        else if (s === 'orders') this.app.loadOrders();
    }

    _renderCard(order) {
        const data = this.app.safeJsonParse(order.tracking_details, null);
        if (!data || data.error) return '';

        const progressColor = (data.progress || 0) === 100 ? 'var(--accent-green)' : 'var(--accent-blue)';

        return `
            <div class="tracking-card" data-order-id="${order.id}">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div class="flex-1 min-w-0">
                        <h3 class="font-semibold truncate mb-1">${order.title}</h3>
                        <div class="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <span class="badge" style="background:${data.carrier === 'DHL' ? 'rgba(252,186,3,0.15)' : 'rgba(0,120,215,0.15)'}; color:${data.carrier === 'DHL' ? '#fcba03' : '#0078d7'};">
                                <i class="fas fa-truck"></i> ${data.carrier || this.app.t('tracking.unknown')}
                            </span>
                            <span class="text-xs font-mono">${order.tracking_number}</span>
                        </div>
                    </div>
                    <span class="badge badge-shipped">${data.status}</span>
                </div>

                <div class="mb-4">
                    <div class="flex justify-between text-xs mb-2">
                        <span class="text-[var(--text-muted)]">${this.app.t('tracking.progress')}</span>
                        <span class="font-bold" style="color:${progressColor}">${data.progress || 0}%</span>
                    </div>
                    <div class="progress-bar" style="height:8px;">
                        <div class="progress-bar-fill" style="width:${data.progress || 0}%; background:linear-gradient(90deg, ${progressColor}, ${progressColor});"></div>
                    </div>
                </div>

                ${data.history?.length ? `
                    <div class="mb-4">
                        <h4 class="text-xs font-semibold text-[var(--text-muted)] uppercase mb-3">${this.app.t('tracking.history')}</h4>
                        <div class="tracking-timeline">
                            ${data.history.slice(0, 5).map(e => `
                                <div class="tracking-event">
                                    <div class="text-xs text-[var(--text-muted)]">${e.time}</div>
                                    <div class="text-sm">${e.text}</div>
                                    ${e.location ? `<div class="text-xs text-[var(--text-muted)]">${e.location}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="flex flex-wrap gap-2">
                    <button onclick="app.goToOrder(${order.id})" class="btn btn-primary btn-sm"><i class="fas fa-box"></i> ${this.app.t('actions.viewOrder')}</button>
                    <button onclick="app.updateTracking(${order.id})" class="btn btn-warning btn-sm"><i class="fas fa-sync"></i> ${this.app.t('actions.refresh')}</button>
                    ${data.url ? `<a href="${data.url}" target="_blank" class="btn btn-ghost btn-sm"><i class="fas fa-external-link-alt"></i> ${data.carrier}</a>` : ''}
                </div>
            </div>`;
    }
}
