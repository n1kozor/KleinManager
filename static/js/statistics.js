// Statistics Manager - Complete implementation with charts
class StatisticsManager {
    constructor(app) {
        this.app = app;
        this.charts = {};
    }

    async loadStatistics() {
        try {
            const [detail, trends, price] = await Promise.all([
                this.app.apiRequest('/stats/detail'),
                this.app.apiRequest('/stats/trends'),
                this.app.apiRequest('/stats/price-analysis')
            ]);
            this._render(detail, trends, price);
        } catch {
            this.app.showToast(this.app.t('error.loadStatistics'), 'error');
        }
    }

    _render(detail, trends, price) {
        const el = document.getElementById('stats-content');
        if (!el) return;

        el.innerHTML = `
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="card p-5">
                    <h3 class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">${this.app.t('stats.byStatus')}</h3>
                    <div class="space-y-3">
                        ${Object.entries(detail.by_status || {}).map(([status, count]) => {
                            const colors = { Ordered: '#f59e0b', Shipped: '#3b82f6', Delivered: '#10b981' };
                            const total = Object.values(detail.by_status).reduce((a, b) => a + b, 0);
                            const pct = total ? ((count / total) * 100).toFixed(0) : 0;
                            return `
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span>${this.app.t('status.' + status.toLowerCase())}</span>
                                        <span class="font-bold">${count} <span class="text-[var(--text-muted)] font-normal">(${pct}%)</span></span>
                                    </div>
                                    <div class="progress-bar" style="height:4px;">
                                        <div style="width:${pct}%; height:100%; border-radius:var(--radius-full); background:${colors[status] || '#64748b'};"></div>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>
                <div class="card p-5">
                    <h3 class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">${this.app.t('stats.topCategories')}</h3>
                    <div class="space-y-2">
                        ${(detail.top_categories || []).map((cat, i) => `
                            <div class="flex justify-between items-center p-2 rounded-lg ${i === 0 ? 'bg-blue-500/10' : 'bg-[var(--bg-secondary)]'}">
                                <span class="text-sm truncate">${cat.category || this.app.t('stats.unknown')}</span>
                                <span class="text-sm font-bold ml-2">${cat.count}</span>
                            </div>
                        `).join('') || `<p class="text-[var(--text-muted)] text-sm">${this.app.t('stats.noData')}</p>`}
                    </div>
                </div>
                <div class="card p-5">
                    <h3 class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">${this.app.t('stats.topSellers')}</h3>
                    <div class="space-y-2">
                        ${(detail.top_sellers || []).map((s, i) => `
                            <div class="flex justify-between items-center p-2 rounded-lg ${i === 0 ? 'bg-purple-500/10' : 'bg-[var(--bg-secondary)]'}">
                                <span class="text-sm truncate">${s.name}</span>
                                <span class="text-sm font-bold ml-2">${s.order_count}</span>
                            </div>
                        `).join('') || `<p class="text-[var(--text-muted)] text-sm">${this.app.t('stats.noData')}</p>`}
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div class="card p-5">
                    <h3 class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">${this.app.t('stats.spendingTrend')}</h3>
                    <div class="chart-container"><canvas id="statsTrendChart"></canvas></div>
                </div>
                <div class="card p-5">
                    <h3 class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">${this.app.t('stats.priceDistribution')}</h3>
                    <div class="chart-container"><canvas id="statsPriceChart"></canvas></div>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="card p-5">
                    <h3 class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">${this.app.t('stats.monthlyOrders')}</h3>
                    <div class="chart-container"><canvas id="statsMonthlyChart"></canvas></div>
                </div>
                <div class="card p-5">
                    <h3 class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">${this.app.t('stats.categoryDistribution')}</h3>
                    <div class="chart-container"><canvas id="statsCategoryChart"></canvas></div>
                </div>
            </div>`;

        // Render charts after DOM update
        setTimeout(() => {
            this._renderTrendChart(trends);
            this._renderPriceChart(price);
            this._renderMonthlyChart(trends);
            this._renderCategoryChart(detail);
        }, 50);
    }

    _defaults() {
        return {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8', usePointStyle: true, font: { size: 11 } } },
                tooltip: { backgroundColor: '#1c1f2e', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#2a2d3e', borderWidth: 1, cornerRadius: 8 }
            }
        };
    }

    _renderTrendChart(trends) {
        const ctx = document.getElementById('statsTrendChart');
        if (!ctx) return;
        if (this.charts.trend) this.charts.trend.destroy();
        const days = trends.last_30_days || [];
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(d => new Date(d.date).toLocaleDateString(this.app.currentLang === 'de' ? 'de-DE' : 'en', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: this.app.t('stats.spending'), data: days.map(d => d.total_value),
                    borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.08)',
                    fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2
                }]
            },
            options: {
                ...this._defaults(),
                scales: {
                    x: { grid: { color: 'rgba(42,45,62,0.5)', drawBorder: false }, ticks: { color: '#64748b', maxTicksLimit: 7, font: { size: 10 } } },
                    y: { beginAtZero: true, grid: { color: 'rgba(42,45,62,0.5)', drawBorder: false }, ticks: { color: '#64748b', callback: v => '€' + v, font: { size: 10 } } }
                }
            }
        });
    }

    _renderPriceChart(price) {
        const ctx = document.getElementById('statsPriceChart');
        if (!ctx) return;
        if (this.charts.price) this.charts.price.destroy();
        const ranges = price.price_ranges || {};
        this.charts.price = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(ranges).map(r => '€' + r),
                datasets: [{ data: Object.values(ranges), backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'], borderWidth: 0 }]
            },
            options: { ...this._defaults(), cutout: '60%', plugins: { ...this._defaults().plugins, legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 16 } } } }
        });
    }

    _renderMonthlyChart(trends) {
        const ctx = document.getElementById('statsMonthlyChart');
        if (!ctx) return;
        if (this.charts.monthly) this.charts.monthly.destroy();
        const months = trends.monthly || [];
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months.map(m => new Date(m.month + '-01').toLocaleDateString(this.app.currentLang === 'de' ? 'de-DE' : 'en', { month: 'short', year: '2-digit' })),
                datasets: [{
                    label: this.app.t('stats.orders'), data: months.map(m => m.orders),
                    backgroundColor: '#3b82f6', borderRadius: 6
                }]
            },
            options: {
                ...this._defaults(),
                plugins: { ...this._defaults().plugins, legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y: { beginAtZero: true, grid: { color: 'rgba(42,45,62,0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                }
            }
        });
    }

    _renderCategoryChart(detail) {
        const ctx = document.getElementById('statsCategoryChart');
        if (!ctx) return;
        if (this.charts.category) this.charts.category.destroy();
        const cats = detail.top_categories || [];
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
        this.charts.category = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cats.map(c => (c.category || this.app.t('stats.unknown')).slice(0, 15)),
                datasets: [{ data: cats.map(c => c.count), backgroundColor: cats.map((_, i) => colors[i % colors.length]), borderRadius: 4 }]
            },
            options: {
                ...this._defaults(), indexAxis: 'y',
                plugins: { ...this._defaults().plugins, legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: 'rgba(42,45,62,0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                }
            }
        });
    }
}
