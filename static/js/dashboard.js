// Dashboard Manager
class DashboardManager {
    constructor(app) {
        this.app = app;
        this.charts = {};
    }

    async loadDashboard() {
        try {
            const [stats, detailStats, recentOrders, trends, priceData] = await Promise.all([
                this.app.apiRequest('/stats'),
                this.app.apiRequest('/stats/detail'),
                this.app.apiRequest('/orders?limit=10&sort=created_at&order=desc'),
                this.app.apiRequest('/stats/trends'),
                this.app.apiRequest('/stats/price-analysis')
            ]);

            this.updateMainStats(stats);
            this.renderCharts(detailStats, trends, priceData);
            this.renderRecentActivity(recentOrders);
            this.renderQuickInsights(stats, detailStats, priceData);
        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    }

    updateMainStats(stats) {
        this._animateCounter('stat-total', stats.total_orders || 0);
        this._animateCounter('stat-transit', stats.in_transit || 0);
        this._animateCounter('stat-delivered', stats.delivered || 0);
        this._animateCounter('stat-value', parseFloat(stats.total_value) || 0, '€');
        this._animateCounter('stat-avg-order', parseFloat(stats.average_order_value) || 0, '€');
        this._animateCounter('stat-new-sellers', stats.new_sellers || 0);
    }

    _animateCounter(id, target, prefix = '') {
        const el = document.getElementById(id);
        if (!el) return;
        const start = parseInt(el.textContent.replace(/[€,\s]/g, '')) || 0;
        const duration = 800;
        const startTime = Date.now();

        const tick = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            const val = Math.round(start + (target - start) * ease);
            el.textContent = prefix ? `${prefix}${val.toLocaleString()}` : val.toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
    }

    renderCharts(detail, trends, price) {
        this._renderStatusChart(detail);
        this._renderTrendsChart(trends);
        this._renderPriceChart(price);
        this._renderSellerChart(detail);
        this._renderMonthlyChart(trends);
    }

    _chartDefaults() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8', usePointStyle: true, padding: 12, font: { size: 11 } } },
                tooltip: {
                    backgroundColor: '#1c1f2e', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
                    borderColor: '#2a2d3e', borderWidth: 1, cornerRadius: 8, padding: 10
                }
            }
        };
    }

    _gridColor() { return 'rgba(42, 45, 62, 0.5)'; }

    _renderStatusChart(stats) {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;
        if (this.charts.status) this.charts.status.destroy();
        const data = stats.by_status || {};
        const translatedLabels = Object.keys(data).map(s => this.app.t('status.' + s.toLowerCase()));
        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: translatedLabels,
                datasets: [{ data: Object.values(data), backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'], borderWidth: 0, hoverBorderWidth: 2, hoverBorderColor: '#f1f5f9' }]
            },
            options: { ...this._chartDefaults(), cutout: '65%', plugins: { ...this._chartDefaults().plugins, legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 16 } } } }
        });
    }

    _renderTrendsChart(trends) {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;
        if (this.charts.trends) this.charts.trends.destroy();
        const days = trends.last_30_days || [];
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(d => new Date(d.date).toLocaleDateString(this.app.currentLang === 'de' ? 'de-DE' : 'en', { month: 'short', day: 'numeric' })),
                datasets: [
                    { label: this.app.t('stats.orders'), data: days.map(d => d.orders), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2 },
                    { label: this.app.t('dashboard.value') + ' (€)', data: days.map(d => d.total_value), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2, yAxisID: 'y1' }
                ]
            },
            options: {
                ...this._chartDefaults(), interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { grid: { color: this._gridColor(), drawBorder: false }, ticks: { color: '#64748b', maxTicksLimit: 7, font: { size: 10 } } },
                    y: { beginAtZero: true, grid: { color: this._gridColor(), drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#64748b', callback: v => '€' + v, font: { size: 10 } } }
                }
            }
        });
    }

    _renderPriceChart(data) {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;
        if (this.charts.price) this.charts.price.destroy();
        const ranges = data.price_ranges || {};
        this.charts.price = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges).map(r => '€' + r),
                datasets: [{ data: Object.values(ranges), backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'], borderRadius: 6, borderSkipped: false }]
            },
            options: {
                ...this._chartDefaults(),
                plugins: { ...this._chartDefaults().plugins, legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y: { beginAtZero: true, grid: { color: this._gridColor(), drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                }
            }
        });
    }

    _renderSellerChart(stats) {
        const ctx = document.getElementById('sellerChart');
        if (!ctx) return;
        if (this.charts.seller) this.charts.seller.destroy();
        const sellers = stats.top_sellers || [];
        this.charts.seller = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sellers.map(s => s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name),
                datasets: [{ data: sellers.map(s => s.order_count), backgroundColor: '#6366f1', borderRadius: 4 }]
            },
            options: {
                ...this._chartDefaults(), indexAxis: 'y',
                plugins: { ...this._chartDefaults().plugins, legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: this._gridColor(), drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                }
            }
        });
    }

    _renderMonthlyChart(trends) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        if (this.charts.monthly) this.charts.monthly.destroy();
        const months = trends.monthly || [];
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months.map(m => new Date(m.month + '-01').toLocaleDateString(this.app.currentLang === 'de' ? 'de-DE' : 'en', { month: 'short', year: '2-digit' })),
                datasets: [
                    { label: this.app.t('stats.orders'), data: months.map(m => m.orders), backgroundColor: '#3b82f6', borderRadius: 6 },
                    { label: this.app.t('dashboard.value'), data: months.map(m => m.total_value), type: 'line', borderColor: '#10b981', fill: false, tension: 0.4, yAxisID: 'y1', pointRadius: 3, borderWidth: 2 }
                ]
            },
            options: {
                ...this._chartDefaults(),
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y: { beginAtZero: true, position: 'left', grid: { color: this._gridColor(), drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#64748b', callback: v => '€' + v, font: { size: 10 } } }
                }
            }
        });
    }

    renderRecentActivity(orders) {
        const el = document.getElementById('recent-activity');
        if (!el) return;
        if (!orders.length) {
            el.innerHTML = `<div class="empty-state"><i class="fas fa-history"></i><p>${this.app.t('dashboard.noRecentActivity')}</p></div>`;
            return;
        }
        el.innerHTML = orders.map(order => {
            const images = this.app.safeJsonParse(order.local_images, []);
            return `
                <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors cursor-pointer group" onclick="app.showSection('orders'); app.editOrder(${order.id})">
                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg-card)] flex-shrink-0 flex items-center justify-center">
                        ${images.length ? `<img src="/images/${images[0]}" class="w-full h-full object-cover">` : '<i class="fas fa-box text-[var(--text-muted)]"></i>'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium truncate group-hover:text-blue-400 transition-colors">${order.title}</span>
                            <span class="text-sm font-bold ml-2 text-blue-400">€${order.price.toFixed(2)}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="badge ${this.app.getStatusClass(order.status)}" style="font-size:0.625rem; padding: 2px 6px;">
                                <i class="fas ${this.app.getStatusIcon(order.status)}"></i> ${this.app.t('status.' + order.status.toLowerCase())}
                            </span>
                            <span class="text-xs text-[var(--text-muted)]">${this.app.getTimeAgo(order.created_at)}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    renderQuickInsights(stats, detail, price) {
        const el = document.getElementById('quick-insights');
        if (!el) return;
        const insights = [];

        if (stats.new_sellers > 0) insights.push({ icon: 'fa-exclamation-triangle', color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: this.app.t('insight.newSellers', { count: stats.new_sellers }), desc: this.app.t('insight.newSellersDesc') });
        if (stats.in_transit > 0) insights.push({ icon: 'fa-truck', color: 'text-blue-400', bg: 'bg-blue-500/10', title: this.app.t('insight.inTransit', { count: stats.in_transit }), desc: this.app.t('insight.inTransitDesc') });
        if (!insights.length) insights.push({ icon: 'fa-check-circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: this.app.t('insight.allGood'), desc: this.app.t('insight.allGoodDesc') });

        el.innerHTML = insights.map(i => `
            <div class="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-card)]/50 mb-2">
                <div class="w-8 h-8 rounded-lg ${i.bg} flex items-center justify-center flex-shrink-0">
                    <i class="fas ${i.icon} ${i.color} text-sm"></i>
                </div>
                <div>
                    <h4 class="text-sm font-medium">${i.title}</h4>
                    <p class="text-xs text-[var(--text-muted)] mt-0.5">${i.desc}</p>
                </div>
            </div>
        `).join('');
    }
}
