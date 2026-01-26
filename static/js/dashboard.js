// Dashboard functionality - Completely redesigned with real data
class DashboardManager extends KleinManagerCore {
    constructor() {
        super();
        this.charts = {};
        this.refreshInterval = null;
    }

    async loadDashboard() {
        try {
            this.showLoading('Loading dashboard data...');

            // Load all dashboard data in parallel
            const [stats, detailStats, recentOrders, trends, priceData] = await Promise.all([
                this.apiRequest('/stats'),
                this.apiRequest('/stats/detail'),
                this.apiRequest('/orders?limit=10&sort=created_at&order=desc'),
                this.apiRequest('/stats/trends'),
                this.apiRequest('/stats/price-analysis')
            ]);

            // Update main stats cards
            this.updateMainStats(stats);

            // Render charts with real data
            this.renderCharts(detailStats, trends, priceData);

            // Show recent activity
            this.renderRecentActivity(recentOrders);

            // Update quick insights
            this.renderQuickInsights(stats, detailStats, priceData);

            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            console.error('Dashboard load error:', error);
            this.showToast('Failed to load dashboard', 'error');
        }
    }

    updateMainStats(stats) {
        // Animate counter updates
        this.animateCounter('stat-total', stats.total_orders || 0);
        this.animateCounter('stat-transit', stats.in_transit || 0);
        this.animateCounter('stat-value', stats.total_value || 0, '€');
        this.animateCounter('stat-new-sellers', stats.new_sellers || 0);

        // Update additional stats
        const deliveredElement = document.getElementById('stat-delivered');
        const avgOrderElement = document.getElementById('stat-avg-order');

        if (deliveredElement) {
            this.animateCounter('stat-delivered', stats.delivered || 0);
        }

        if (avgOrderElement) {
            this.animateCounter('stat-avg-order', stats.average_order_value || 0, '€');
        }
    }

    animateCounter(elementId, targetValue, prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent.replace(/[€,]/g, '')) || 0;
        const duration = 1000; // 1 second
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuart);

            if (prefix === '€') {
                element.textContent = `€${currentValue.toLocaleString()}`;
            } else if (prefix) {
                element.textContent = `${prefix}${currentValue.toLocaleString()}`;
            } else {
                element.textContent = currentValue.toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    renderCharts(detailStats, trends, priceData) {
        this.renderStatusChart(detailStats);
        this.renderTrendsChart(trends);
        this.renderPriceChart(priceData);
        this.renderSellerChart(detailStats);
        this.renderMonthlyChart(trends);
    }

    renderStatusChart(stats) {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        if (this.charts.status) {
            this.charts.status.destroy();
        }

        const statusData = stats.by_status || {};
        const labels = Object.keys(statusData).map(status => {
            const translations = {
                'Ordered': '📦 Ordered',
                'Shipped': '🚚 Shipped',
                'Delivered': '✅ Delivered'
            };
            return translations[status] || status;
        });

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: [
                        '#fbbf24', // Ordered - Yellow
                        '#3b82f6', // Shipped - Blue
                        '#10b981'  // Delivered - Green
                    ],
                    borderColor: '#374151',
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e5e7eb',
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#f9fafb',
                        bodyColor: '#e5e7eb',
                        borderColor: '#374151',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderTrendsChart(trends) {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        const last30Days = trends.last_30_days || [];
        const labels = last30Days.map(day => new Date(day.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }));

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders',
                    data: last30Days.map(day => day.orders),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#1e40af',
                    pointHoverRadius: 6
                }, {
                    label: 'Value (€)',
                    data: last30Days.map(day => day.total_value),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#047857',
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e5e7eb',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#f9fafb',
                        bodyColor: '#e5e7eb',
                        borderColor: '#374151',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(107, 114, 128, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(107, 114, 128, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '€' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    renderPriceChart(priceData) {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        if (this.charts.price) {
            this.charts.price.destroy();
        }

        const priceRanges = priceData.price_ranges || {};
        const labels = Object.keys(priceRanges).map(range => {
            if (range === '0-50') return '€0-50';
            if (range === '50-100') return '€50-100';
            if (range === '100-500') return '€100-500';
            if (range === '500+') return '€500+';
            return range;
        });

        this.charts.price = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders',
                    data: Object.values(priceRanges),
                    backgroundColor: [
                        '#ef4444',
                        '#f59e0b',
                        '#10b981',
                        '#8b5cf6'
                    ],
                    borderColor: '#374151',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#f9fafb',
                        bodyColor: '#e5e7eb',
                        borderColor: '#374151',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(107, 114, 128, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    renderSellerChart(stats) {
        const ctx = document.getElementById('sellerChart');
        if (!ctx) return;

        if (this.charts.seller) {
            this.charts.seller.destroy();
        }

        const topSellers = stats.top_sellers || [];

        this.charts.seller = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topSellers.map(seller => seller.name.length > 15 ?
                    seller.name.substring(0, 15) + '...' : seller.name),
                datasets: [{
                    label: 'Orders',
                    data: topSellers.map(seller => seller.order_count),
                    backgroundColor: '#6366f1',
                    borderColor: '#4f46e5',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#f9fafb',
                        bodyColor: '#e5e7eb',
                        borderColor: '#374151',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(107, 114, 128, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    renderMonthlyChart(trends) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        const monthlyData = trends.monthly || [];
        const labels = monthlyData.map(month =>
            new Date(month.month + '-01').toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            })
        );

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders',
                    data: monthlyData.map(month => month.orders),
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                }, {
                    label: 'Total Value',
                    data: monthlyData.map(month => month.total_value),
                    type: 'line',
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e5e7eb',
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#f9fafb',
                        bodyColor: '#e5e7eb',
                        borderColor: '#374151',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(107, 114, 128, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '€' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    renderRecentActivity(orders) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-history text-gray-600 text-4xl mb-4"></i>
                    <p class="text-gray-400 mb-2">No recent activity</p>
                    <button onclick="app.showAddOrderForm()" class="text-blue-400 hover:text-blue-300 text-sm">
                        Add your first order
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = orders.map((order, index) => {
                const timeAgo = this.getTimeAgo(order.created_at);
                const images = order.local_images ? JSON.parse(order.local_images) : [];

                return `
                    <div class="flex items-center gap-4 p-3 hover:bg-gray-700 rounded-xl transition-all duration-200 group" style="animation-delay: ${index * 100}ms">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
                                ${images.length > 0 ?
                                    `<img src="/images/${images[0]}" class="w-full h-full object-cover">` :
                                    `<i class="fas fa-box text-gray-400"></i>`
                                }
                            </div>
                            ${order.color ?
                                `<div class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800" style="background-color: ${order.color}"></div>` :
                                ''
                            }
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="text-white font-medium truncate group-hover:text-blue-300 transition-colors">
                                    ${order.title}
                                </p>
                                <span class="text-white font-bold ml-3">€${order.price.toFixed(2)}</span>
                            </div>
                            <div class="flex items-center gap-3 mt-1">
                                <span class="text-xs px-2 py-1 rounded-md ${this.getStatusClass(order.status)}">
                                    ${this.getStatusIcon(order.status)} ${this.t(`status.${order.status.toLowerCase()}`)}
                                </span>
                                <span class="text-xs text-gray-400">${timeAgo}</span>
                                ${order.seller_is_new ? '<span class="text-xs text-red-400">⚠️ New Seller</span>' : ''}
                            </div>
                        </div>

                        <button onclick="app.showSection('orders'); app.editOrder(${order.id})"
                                class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    renderQuickInsights(stats, detailStats, priceData) {
        const container = document.getElementById('quick-insights');
        if (!container) return;

        const insights = this.generateInsights(stats, detailStats, priceData);

        container.innerHTML = `
            <div class="space-y-3">
                ${insights.map((insight, index) => `
                    <div class="flex items-start gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
                         style="animation-delay: ${index * 150}ms">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center ${insight.bgColor}">
                            <i class="${insight.icon} ${insight.iconColor}"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-medium text-white mb-1">${insight.title}</h4>
                            <p class="text-sm text-gray-400">${insight.description}</p>
                            ${insight.action ? `
                                <button onclick="${insight.action}" class="text-blue-400 hover:text-blue-300 text-xs mt-2">
                                    ${insight.actionText} →
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateInsights(stats, detailStats, priceData) {
        const insights = [];

        // New sellers insight
        if (stats.new_sellers > 0) {
            insights.push({
                icon: 'fas fa-exclamation-triangle',
                iconColor: 'text-yellow-400',
                bgColor: 'bg-yellow-900/30',
                title: `${stats.new_sellers} New Seller${stats.new_sellers > 1 ? 's' : ''} Detected`,
                description: 'Be extra careful with new sellers and check their profiles.',
                action: 'app.showSection("orders"); app.loadOrders()',
                actionText: 'Review orders'
            });
        }

        // High value orders
        if (stats.high_value_orders > 0) {
            insights.push({
                icon: 'fas fa-gem',
                iconColor: 'text-purple-400',
                bgColor: 'bg-purple-900/30',
                title: `${stats.high_value_orders} High-Value Orders`,
                description: `Orders over €200 - total value: €${stats.high_value_total}`,
                action: 'app.showSection("orders")',
                actionText: 'View expensive items'
            });
        }

        // Tracking updates
        if (stats.tracking_updates > 0) {
            insights.push({
                icon: 'fas fa-truck',
                iconColor: 'text-blue-400',
                bgColor: 'bg-blue-900/30',
                title: `${stats.tracking_updates} Package Update${stats.tracking_updates > 1 ? 's' : ''}`,
                description: 'Your packages are moving! Check latest tracking status.',
                action: 'app.showSection("tracking")',
                actionText: 'Check tracking'
            });
        }

        // Price changes in watched items
        if (stats.price_changes > 0) {
            insights.push({
                icon: 'fas fa-chart-line',
                iconColor: 'text-green-400',
                bgColor: 'bg-green-900/30',
                title: `${stats.price_changes} Price Change${stats.price_changes > 1 ? 's' : ''}`,
                description: 'Some watched items have changed prices.',
                action: 'app.showSection("watcher")',
                actionText: 'Check prices'
            });
        }

        // Monthly spending insight
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlySpending = stats.monthly_spending || 0;
        if (monthlySpending > 500) {
            insights.push({
                icon: 'fas fa-wallet',
                iconColor: 'text-orange-400',
                bgColor: 'bg-orange-900/30',
                title: 'High Monthly Spending',
                description: `You've spent €${monthlySpending} this month. Consider setting a budget.`,
                action: 'app.showSection("statistics")',
                actionText: 'View spending trends'
            });
        }

        // If no insights, show a positive message
        if (insights.length === 0) {
            insights.push({
                icon: 'fas fa-check-circle',
                iconColor: 'text-green-400',
                bgColor: 'bg-green-900/30',
                title: 'All Good!',
                description: 'No urgent matters require your attention right now.',
                action: 'app.showAddOrderForm()',
                actionText: 'Add new order'
            });
        }

        return insights;
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    }

    getStatusIcon(status) {
        const icons = {
            'Ordered': '📦',
            'Shipped': '🚚',
            'Delivered': '✅'
        };
        return icons[status] || '📦';
    }

    // Auto-refresh dashboard
    startAutoRefresh(interval = 300000) { // 5 minutes
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboard();
            }
        }, interval);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Cleanup charts on section change
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}