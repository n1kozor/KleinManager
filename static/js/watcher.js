// Price Watcher Manager
class WatcherManager {
    constructor(app) {
        this.app = app;
        this.priceHistoryChart = null;
    }

    showAddWatchForm() {
        document.getElementById('addWatchForm').classList.remove('hidden');
        document.getElementById('watchUrl').focus();
    }

    hideAddWatchForm() {
        document.getElementById('addWatchForm').classList.add('hidden');
        document.getElementById('watchUrl').value = '';
    }

    async addWatchedItem(event) {
        event.preventDefault();
        const url = document.getElementById('watchUrl').value;
        this.app.showLoading(this.app.t('loading.addingToWatchList'));
        try {
            await this.app.apiRequest('/watched-items', { method: 'POST', body: JSON.stringify({ url }) });
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.itemAddedToWatchList'), 'success');
            this.hideAddWatchForm();
            if (this.app.currentSection === 'watcher') this.loadWatchedItems();
        } catch (error) {
            this.app.hideLoading();
            this.app.showToast(error.message, 'error');
        }
    }

    async loadWatchedItems() {
        try {
            const items = await this.app.apiRequest('/watched-items');
            const container = document.getElementById('watched-items-list');
            if (!items.length) {
                container.innerHTML = `<div class="col-span-full empty-state card"><i class="fas fa-eye-slash"></i><h3>${this.app.t('watcher.noWatchedItems')}</h3><p>${this.app.t('watcher.noWatchedItemsDesc')}</p></div>`;
            } else {
                container.innerHTML = items.map(item => this._renderCard(item)).join('');
            }
        } catch {
            this.app.showToast(this.app.t('error.loadWatched'), 'error');
        }
    }

    _renderCard(item) {
        const history = this.app.safeJsonParse(item.price_history, []);
        const change = item.current_price - item.initial_price;
        const cls = change > 0 ? 'price-up' : change < 0 ? 'price-down' : 'price-same';
        const icon = change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';
        const prices = history.map(p => p.price);
        const lowest = prices.length ? Math.min(...prices) : item.initial_price;

        return `
            <div class="watcher-card">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-sm truncate mb-2" title="${item.title}">${item.title}</h3>
                        <div class="flex items-center gap-2 text-sm">
                            <span class="font-bold text-blue-400">€${item.current_price.toFixed(2)}</span>
                            <span class="${cls} text-xs font-medium"><i class="fas ${icon}"></i> ${change !== 0 ? (change > 0 ? '+' : '') + '€' + change.toFixed(2) : '€0'}</span>
                        </div>
                    </div>
                    <label class="toggle ml-2">
                        <input type="checkbox" ${item.notifications_enabled ? 'checked' : ''} onchange="app.toggleWatchNotifications(${item.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="grid grid-cols-3 gap-2 mb-3">
                    <div class="text-center p-2 rounded-lg bg-[var(--bg-secondary)]">
                        <div class="text-[0.65rem] text-[var(--text-muted)]">${this.app.t('watcher.initial')}</div>
                        <div class="text-xs font-bold">€${item.initial_price.toFixed(2)}</div>
                    </div>
                    <div class="text-center p-2 rounded-lg bg-[var(--bg-secondary)]">
                        <div class="text-[0.65rem] text-[var(--text-muted)]">${this.app.t('watcher.lowest')}</div>
                        <div class="text-xs font-bold text-emerald-400">€${lowest.toFixed(2)}</div>
                    </div>
                    <div class="text-center p-2 rounded-lg bg-[var(--bg-secondary)]">
                        <div class="text-[0.65rem] text-[var(--text-muted)]">${this.app.t('watcher.changes')}</div>
                        <div class="text-xs font-bold text-orange-400">${history.length}</div>
                    </div>
                </div>

                ${this._miniChart(item, history)}

                <div class="flex gap-2 mt-3">
                    <a href="${item.url}" target="_blank" class="btn btn-primary btn-sm flex-1"><i class="fas fa-external-link-alt"></i> ${this.app.t('actions.view')}</a>
                    <button onclick="app.showPriceHistory(${item.id})" class="btn btn-ghost btn-sm"><i class="fas fa-chart-line"></i></button>
                    <button onclick="app.checkSinglePrice(${item.id})" class="btn btn-ghost btn-sm"><i class="fas fa-sync"></i></button>
                    <button onclick="app.deleteWatchedItem(${item.id})" class="btn btn-ghost btn-sm" style="color:var(--accent-red);"><i class="fas fa-trash"></i></button>
                </div>

                <div class="mt-3 pt-2 border-t border-[var(--border-primary)] text-[0.65rem] text-[var(--text-muted)] flex justify-between">
                    <span><i class="fas fa-clock mr-1"></i>${new Date(item.last_checked).toLocaleDateString()}</span>
                    <span><i class="fas fa-calendar-plus mr-1"></i>${new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
            </div>`;
    }

    _miniChart(item, history) {
        if (!history.length) return `<div class="h-16 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center"><span class="text-xs text-[var(--text-muted)]">${this.app.t('watcher.noHistory')}</span></div>`;

        const recent = history.slice(-20);
        const prices = recent.map(p => p.price);
        const max = Math.max(...prices), min = Math.min(...prices);
        const range = max - min || 1;
        const w = 100, h = 50;
        const points = recent.map((e, i) => {
            const x = (i / Math.max(recent.length - 1, 1)) * w;
            const y = h - ((e.price - min) / range) * h;
            return `${x},${y}`;
        }).join(' ');

        const color = prices[prices.length - 1] > prices[0] ? '#f87171' : prices[prices.length - 1] < prices[0] ? '#34d399' : '#60a5fa';

        return `
            <div class="h-16 rounded-lg bg-[var(--bg-secondary)] p-2 overflow-hidden">
                <svg class="w-full h-full" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
                    <defs><linearGradient id="g${item.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.15"/><stop offset="100%" stop-color="${color}" stop-opacity="0.01"/></linearGradient></defs>
                    <polygon points="0,${h} ${points} ${w},${h}" fill="url(#g${item.id})"/>
                    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>`;
    }

    async showPriceHistory(itemId) {
        try {
            const items = await this.app.apiRequest('/watched-items');
            const item = items.find(i => i.id === itemId);
            if (!item) return this.app.showToast(this.app.t('error.itemNotFound'), 'error');

            const history = this.app.safeJsonParse(item.price_history, []);
            document.getElementById('priceHistoryItemTitle').textContent = item.title;
            document.getElementById('initialPrice').textContent = `€${item.initial_price.toFixed(2)}`;
            document.getElementById('currentPrice').textContent = `€${item.current_price.toFixed(2)}`;

            const prices = history.map(p => p.price);
            document.getElementById('lowestPrice').textContent = `€${(prices.length ? Math.min(...prices) : item.initial_price).toFixed(2)}`;
            document.getElementById('totalChanges').textContent = history.length;

            this._createHistoryChart(item, history);
            this._createHistoryTable(history);
            this.app.openModal('priceHistoryModal');
        } catch {
            this.app.showToast(this.app.t('error.loadPriceHistory'), 'error');
        }
    }

    _createHistoryChart(item, history) {
        const ctx = document.getElementById('priceHistoryChart')?.getContext('2d');
        if (!ctx) return;
        if (this.priceHistoryChart) this.priceHistoryChart.destroy();

        const all = [{ price: item.initial_price, date: item.created_at || new Date().toISOString() }, ...history];
        this.priceHistoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: all.map(p => new Date(p.date).toLocaleDateString(this.app.currentLang === 'de' ? 'de-DE' : 'en')),
                datasets: [{
                    label: this.app.t('table.price') + ' (€)', data: all.map(p => p.price),
                    borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)',
                    borderWidth: 2, fill: true, tension: 0.3,
                    pointBackgroundColor: '#3b82f6', pointBorderColor: '#1c1f2e',
                    pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1c1f2e', borderColor: '#2a2d3e', borderWidth: 1, cornerRadius: 8 } },
                scales: {
                    x: { grid: { color: 'rgba(42,45,62,0.5)' }, ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 10 } } },
                    y: { grid: { color: 'rgba(42,45,62,0.5)' }, ticks: { color: '#64748b', callback: v => '€' + v.toFixed(2), font: { size: 10 } } }
                }
            }
        });
    }

    _createHistoryTable(history) {
        const tbody = document.getElementById('priceHistoryTableBody');
        if (!history.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="px-4 py-6 text-center text-[var(--text-muted)]">${this.app.t('watcher.noPriceHistory')}</td></tr>`;
            return;
        }
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
        tbody.innerHTML = sorted.slice(0, 50).map((entry, i) => {
            const prev = i < sorted.length - 1 ? sorted[i + 1].price : entry.price;
            const diff = entry.price - prev;
            const cls = diff > 0 ? 'price-up' : diff < 0 ? 'price-down' : 'price-same';
            const icon = diff > 0 ? 'fa-arrow-up' : diff < 0 ? 'fa-arrow-down' : 'fa-minus';
            return `<tr class="border-b border-[var(--border-primary)] hover:bg-[var(--bg-card)]">
                <td class="px-4 py-2 text-sm">${new Date(entry.date).toLocaleString(this.app.currentLang === 'de' ? 'de-DE' : 'en')}</td>
                <td class="px-4 py-2 text-sm font-medium">€${entry.price.toFixed(2)}</td>
                <td class="px-4 py-2 text-sm ${cls}"><i class="fas ${icon} mr-1"></i>${diff !== 0 ? (diff > 0 ? '+' : '') + '€' + diff.toFixed(2) : this.app.t('watcher.noChange')}</td>
            </tr>`;
        }).join('');
    }

    closePriceHistoryModal() {
        this.app.closeModal('priceHistoryModal');
        if (this.priceHistoryChart) { this.priceHistoryChart.destroy(); this.priceHistoryChart = null; }
    }

    async toggleWatchNotifications(itemId, checked) {
        try {
            await this.app.apiRequest(`/watched-items/${itemId}`, { method: 'PUT', body: JSON.stringify({ notifications_enabled: checked }) });
        } catch {
            this.app.showToast(this.app.t('error.updateFailed'), 'error');
        }
    }

    deleteWatchedItem(itemId) {
        this.app.showConfirm(this.app.t('confirm.removeItem'), this.app.t('confirm.removeItemMsg'), async () => {
            try {
                await this.app.apiRequest(`/watched-items/${itemId}`, { method: 'DELETE' });
                this.app.showToast(this.app.t('toast.itemRemoved'), 'success');
                this.loadWatchedItems();
            } catch {
                this.app.showToast(this.app.t('error.removeFailed'), 'error');
            }
        }, this.app.t('actions.remove'));
    }

    async checkSinglePrice(itemId) {
        this.app.showLoading(this.app.t('loading.checkingPrice'));
        try {
            const result = await this.app.apiRequest('/watched-items/check-all', { method: 'POST' });
            this.app.hideLoading();
            const update = result.updates?.find(u => u.item_id === itemId);
            if (update) {
                this.app.showToast(this.app.t('toast.priceChange', { old: update.old_price, new: update.new_price }), update.new_price > update.old_price ? 'warning' : 'success');
            } else {
                this.app.showToast(this.app.t('toast.noPriceChange'), 'success');
            }
            this.loadWatchedItems();
        } catch (error) {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.checkPriceFailed'), 'error');
        }
    }

    async checkAllPrices() {
        this.app.showLoading(this.app.t('loading.checkingAllPrices'));
        try {
            const result = await this.app.apiRequest('/watched-items/check-all', { method: 'POST' });
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.checkedItems', { checked: result.checked, changes: result.updates?.length || 0 }), 'success');
            this.loadWatchedItems();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.checkPriceFailed'), 'error');
        }
    }
}
