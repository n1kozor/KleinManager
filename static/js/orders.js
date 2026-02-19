// Orders Manager
class OrdersManager {
    constructor(app) {
        this.app = app;
        this._currentDetailOrder = null;
    }

    showAddOrderForm() {
        document.getElementById('addOrderForm').classList.remove('hidden');
        document.getElementById('orderUrl').focus();
    }

    hideAddOrderForm() {
        document.getElementById('addOrderForm').classList.add('hidden');
        document.getElementById('orderUrl').value = '';
    }

    async loadOrders() {
        try {
            const filters = {
                search: document.getElementById('searchInput')?.value || '',
                status: document.getElementById('statusFilter')?.value || '',
                color: document.getElementById('colorFilter')?.value || '',
                seller: document.getElementById('sellerFilter')?.value || '',
                priceMin: document.getElementById('priceMinFilter')?.value || '',
                priceMax: document.getElementById('priceMaxFilter')?.value || ''
            };

            let url = '/orders?';
            Object.entries(filters).forEach(([k, v]) => { if (v) url += `${k}=${encodeURIComponent(v)}&`; });

            const orders = await this.app.apiRequest(url);
            const container = document.getElementById('orders-list');

            if (!orders.length) {
                container.innerHTML = `
                    <div class="empty-state card">
                        <i class="fas fa-search"></i>
                        <h3>${this.app.t('orders.noOrdersFound')}</h3>
                        <p>${this.app.t('orders.noOrdersDesc')}</p>
                        <button onclick="app.showAddOrderForm()" class="btn btn-primary"><i class="fas fa-plus"></i> ${this.app.t('actions.addOrder')}</button>
                    </div>`;
                container.className = '';
            } else {
                this._renderOrders(orders, container);
            }

            this._updateStats(orders);
            this._updateSellerFilter(orders);
        } catch (error) {
            this.app.showToast(this.app.t('error.loadOrders'), 'error');
        }
    }

    _renderOrders(orders, container) {
        const mode = this.app.viewMode;
        if (mode === 'grid') {
            container.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4';
            container.innerHTML = orders.map(o => this._cardView(o)).join('');
        } else if (mode === 'list') {
            container.className = 'space-y-3';
            container.innerHTML = orders.map(o => this._listView(o)).join('');
        } else {
            container.className = 'card overflow-hidden';
            container.innerHTML = this._tableView(orders);
        }
    }

    _updateStats(orders) {
        const el = document.getElementById('order-stats');
        if (!el) return;
        const s = {
            total: orders.length,
            ordered: orders.filter(o => o.status === 'Ordered').length,
            shipped: orders.filter(o => o.status === 'Shipped').length,
            delivered: orders.filter(o => o.status === 'Delivered').length,
            value: orders.reduce((sum, o) => sum + (o.price || 0), 0),
            newSellers: orders.filter(o => o.seller_is_new).length
        };
        el.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
                <div class="stat-card blue"><div class="stat-value text-blue-400 text-xl">${s.total}</div><div class="stat-label">${this.app.t('orders.total')}</div></div>
                <div class="stat-card yellow"><div class="stat-value text-yellow-400 text-xl">${s.ordered}</div><div class="stat-label">${this.app.t('orders.ordered')}</div></div>
                <div class="stat-card orange"><div class="stat-value text-orange-400 text-xl">${s.shipped}</div><div class="stat-label">${this.app.t('orders.shipped')}</div></div>
                <div class="stat-card green"><div class="stat-value text-emerald-400 text-xl">${s.delivered}</div><div class="stat-label">${this.app.t('orders.delivered')}</div></div>
                <div class="stat-card purple"><div class="stat-value text-purple-400 text-xl">€${s.value.toFixed(0)}</div><div class="stat-label">${this.app.t('orders.value')}</div></div>
                <div class="stat-card red"><div class="stat-value text-red-400 text-xl">${s.newSellers}</div><div class="stat-label">${this.app.t('orders.newSellers')}</div></div>
            </div>`;
    }

    _updateSellerFilter(orders) {
        const sel = document.getElementById('sellerFilter');
        if (!sel) return;
        const currentVal = sel.value;
        const sellers = [...new Set(orders.map(o => o.seller_name).filter(Boolean))].sort();
        sel.innerHTML = `<option value="">${this.app.t('orders.allSellers')}</option>`;
        sellers.forEach(s => { sel.innerHTML += `<option value="${s}">${s}</option>`; });
        sel.value = currentVal;
    }

    // ---- Card/List/Table Views ----

    _cardView(order) {
        const images = this.app.safeJsonParse(order.local_images, []);
        const tracking = this.app.safeJsonParse(order.tracking_details, null);
        const na = this.app.t('orders.na');

        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="relative cursor-pointer" onclick="app.openOrderDetail(${order.id})">
                    ${images.length
                        ? `<img src="/images/${images[0]}" class="order-card-image">`
                        : `<div class="order-card-placeholder"><i class="fas fa-image"></i></div>`}
                    <div class="absolute top-2 right-2"><span class="badge ${this.app.getStatusClass(order.status)}"><i class="fas ${this.app.getStatusIcon(order.status)}"></i> ${this.app.t('status.' + order.status.toLowerCase())}</span></div>
                    ${order.color ? `<div class="absolute top-2 left-2 color-dot" style="background:${order.color}"></div>` : ''}
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                        <span class="order-card-price">€${order.price.toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-card-body cursor-pointer" onclick="app.openOrderDetail(${order.id})">
                    <div class="order-card-title">${order.title}</div>
                    <div class="space-y-1 mb-3">
                        <div class="order-card-meta"><i class="fas fa-tag w-3"></i><span class="truncate">${order.category || na}</span></div>
                        <div class="order-card-meta"><i class="fas fa-map-marker-alt w-3"></i><span class="truncate">${order.location || na}</span></div>
                        <div class="order-card-meta"><i class="fas fa-user w-3"></i><span class="truncate">${order.seller_name || na}</span>
                            ${order.seller_is_new ? `<span class="badge badge-new-seller ml-1" style="font-size:0.6rem;padding:1px 5px;">${this.app.t('orders.new')}</span>` : ''}
                        </div>
                    </div>
                    ${tracking && !tracking.error ? `
                        <div class="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-blue-400 font-medium"><i class="fas fa-truck mr-1"></i>${tracking.carrier}</span>
                                <span class="text-blue-400 font-bold">${tracking.progress || 0}%</span>
                            </div>
                            <div class="progress-bar" style="height:4px;"><div class="progress-bar-fill" style="width:${tracking.progress || 0}%"></div></div>
                        </div>` : ''}
                </div>
                <div class="order-card-actions">
                    <button onclick="app.openOrderDetail(${order.id})" class="btn btn-ghost btn-sm flex-1" title="${this.app.t('actions.edit')}">
                        <i class="fas fa-pen-to-square"></i> ${this.app.t('actions.details')}
                    </button>
                    <a href="${order.article_url}" target="_blank" class="btn btn-ghost btn-sm" title="${this.app.t('actions.view')}" onclick="event.stopPropagation()">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>`;
    }

    _listView(order) {
        const images = this.app.safeJsonParse(order.local_images, []);
        const tracking = this.app.safeJsonParse(order.tracking_details, null);
        const na = this.app.t('orders.na');

        return `
            <div class="card p-4 flex gap-4 cursor-pointer hover:border-[var(--border-hover)] transition-colors" data-order-id="${order.id}" onclick="app.openOrderDetail(${order.id})">
                <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                    ${order.color ? `<div class="absolute -top-1 -left-1 color-dot z-10" style="background:${order.color}"></div>` : ''}
                    ${images.length
                        ? `<img src="/images/${images[0]}" class="w-full h-full object-cover">`
                        : `<div class="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center"><i class="fas fa-image text-[var(--text-muted)]"></i></div>`}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="font-medium truncate pr-4">${order.title}</h3>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span class="text-lg font-bold text-blue-400">€${order.price.toFixed(2)}</span>
                            <span class="badge ${this.app.getStatusClass(order.status)}"><i class="fas ${this.app.getStatusIcon(order.status)}"></i> ${this.app.t('status.' + order.status.toLowerCase())}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-2">
                        <span><i class="fas fa-tag mr-1"></i>${order.category || na}</span>
                        <span><i class="fas fa-map-marker-alt mr-1"></i>${order.location || na}</span>
                        <span><i class="fas fa-user mr-1"></i>${order.seller_name || na}${order.seller_is_new ? ` <span class="badge badge-new-seller" style="font-size:0.6rem;padding:1px 5px;">${this.app.t('orders.new')}</span>` : ''}</span>
                    </div>
                    ${tracking && !tracking.error ? `
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-blue-400"><i class="fas fa-truck mr-1"></i>${tracking.carrier}: ${order.tracking_number}</span>
                            <div class="progress-bar flex-1" style="height:4px;max-width:120px;"><div class="progress-bar-fill" style="width:${tracking.progress || 0}%"></div></div>
                            <span class="text-xs text-blue-400 font-bold">${tracking.progress || 0}%</span>
                        </div>` : ''}
                </div>
            </div>`;
    }

    _tableView(orders) {
        return `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">${this.app.t('table.item')}</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">${this.app.t('table.price')}</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">${this.app.t('table.status')}</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">${this.app.t('table.seller')}</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">${this.app.t('table.tracking')}</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">${this.app.t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[var(--border-primary)]">
                        ${orders.map(o => this._tableRow(o)).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    _tableRow(order) {
        const images = this.app.safeJsonParse(order.local_images, []);
        const tracking = this.app.safeJsonParse(order.tracking_details, null);
        const na = this.app.t('orders.na');
        return `
            <tr class="hover:bg-[var(--bg-card)] transition-colors cursor-pointer" data-order-id="${order.id}" onclick="app.openOrderDetail(${order.id})">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                            ${order.color ? `<div class="absolute -top-0.5 -left-0.5 color-dot" style="background:${order.color};width:8px;height:8px;"></div>` : ''}
                            ${images.length ? `<img src="/images/${images[0]}" class="w-full h-full object-cover">` : `<div class="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center"><i class="fas fa-image text-[var(--text-muted)] text-xs"></i></div>`}
                        </div>
                        <div class="min-w-0"><div class="font-medium truncate max-w-[200px]">${order.title}</div><div class="text-xs text-[var(--text-muted)]">${order.category || na}</div></div>
                    </div>
                </td>
                <td class="px-4 py-3 font-bold text-blue-400">€${order.price.toFixed(2)}</td>
                <td class="px-4 py-3"><span class="badge ${this.app.getStatusClass(order.status)}"><i class="fas ${this.app.getStatusIcon(order.status)}"></i> ${this.app.t('status.' + order.status.toLowerCase())}</span></td>
                <td class="px-4 py-3"><div class="text-sm">${order.seller_name || na}</div>${order.seller_is_new ? `<span class="badge badge-new-seller" style="font-size:0.6rem;">${this.app.t('orders.new')}</span>` : ''}</td>
                <td class="px-4 py-3">${tracking && !tracking.error ? `<div class="text-xs text-blue-400">${tracking.carrier}</div><div class="progress-bar mt-1" style="height:3px;width:80px;"><div class="progress-bar-fill" style="width:${tracking.progress || 0}%"></div></div>` : '<span class="text-[var(--text-muted)] text-xs">—</span>'}</td>
                <td class="px-4 py-3" onclick="event.stopPropagation()">
                    <div class="flex gap-1">
                        <button onclick="app.openOrderDetail(${order.id})" class="btn btn-ghost btn-icon btn-sm"><i class="fas fa-pen-to-square"></i></button>
                        <a href="${order.article_url}" target="_blank" class="btn btn-ghost btn-icon btn-sm"><i class="fas fa-external-link-alt"></i></a>
                    </div>
                </td>
            </tr>`;
    }

    // ---- Order Detail Panel ----

    async openOrderDetail(id) {
        try {
            const order = await this.app.apiRequest(`/orders/${id}`);
            this._currentDetailOrder = order;
            this._renderOrderDetail(order);

            document.getElementById('orderDetailTitle').textContent = order.title;
            const link = document.getElementById('orderDetailLink');
            link.href = order.article_url || '#';
            link.title = this.app.t('detail.openListing');

            document.getElementById('orderDetailPanel').classList.add('open');
            document.getElementById('orderDetailBackdrop').classList.add('active');
        } catch {
            this.app.showToast(this.app.t('error.loadOrder'), 'error');
        }
    }

    closeOrderDetail() {
        document.getElementById('orderDetailPanel').classList.remove('open');
        document.getElementById('orderDetailBackdrop').classList.remove('active');
        this._currentDetailOrder = null;
    }

    _renderOrderDetail(order) {
        const body = document.getElementById('orderDetailBody');
        const images = this.app.safeJsonParse(order.local_images, []);
        const tracking = this.app.safeJsonParse(order.tracking_details, null);
        const colors = this.app.settings.colors || [];
        const na = this.app.t('orders.na');

        // Color swatches
        const colorSwatches = colors.map(c => `
            <div class="detail-color-swatch ${order.color === c.value ? 'selected' : ''}"
                 style="background:${c.value}"
                 onclick="app._selectDetailColor('${c.value}', this)"
                 title="${c.name}"></div>
        `).join('') + `
            <div class="detail-color-swatch ${!order.color ? 'selected' : ''}"
                 style="background:var(--bg-card); border:1px dashed var(--border-hover);"
                 onclick="app._selectDetailColor('', this)"
                 title="${this.app.t('color.removeColor')}">
                <i class="fas fa-times text-[var(--text-muted)]" style="font-size:0.6rem;"></i>
            </div>`;

        // Status buttons
        const statuses = ['Ordered', 'Shipped', 'Delivered'];
        const statusButtons = statuses.map(s => {
            const active = order.status === s ? `active-${s.toLowerCase()}` : '';
            return `<button class="status-toggle-btn ${active}"
                            onclick="app._setDetailStatus('${s}', this)">
                        <i class="fas ${this.app.getStatusIcon(s)} mr-1"></i>
                        ${this.app.t('status.' + s.toLowerCase())}
                    </button>`;
        }).join('');

        // Tracking section
        let trackingHtml;
        if (order.tracking_number) {
            const isValid = tracking && !tracking.error;
            trackingHtml = `
                <div class="detail-tracking-block">
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('detail.trackingCarrier')}</label>
                            <select id="detail_carrier" class="input" style="font-size:0.8125rem;">
                                <option value="dhl" ${order.carrier === 'dhl' ? 'selected' : ''}>DHL</option>
                                <option value="hermes" ${order.carrier === 'hermes' ? 'selected' : ''}>Hermes</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('detail.trackingNumber')}</label>
                            <input type="text" id="detail_tracking_number" value="${order.tracking_number || ''}" class="input" style="font-size:0.8125rem;">
                        </div>
                    </div>
                    ${isValid ? `
                        <div class="mb-3">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-blue-400"><i class="fas fa-truck mr-1"></i>${tracking.carrier}</span>
                                <span class="text-blue-400 font-bold">${tracking.progress || 0}%</span>
                            </div>
                            <div class="progress-bar" style="height:5px;">
                                <div class="progress-bar-fill" style="width:${tracking.progress || 0}%"></div>
                            </div>
                            ${tracking.status ? `<div class="text-xs text-[var(--text-secondary)] mt-1">${tracking.status}</div>` : ''}
                        </div>` : ''}
                    <div class="flex gap-2">
                        <button onclick="app.updateTracking(${order.id})" class="btn btn-ghost btn-sm flex-1">
                            <i class="fas fa-sync"></i> ${this.app.t('detail.updateTracking')}
                        </button>
                        <button onclick="app.removeTrackingFromDetail(${order.id})" class="btn btn-ghost btn-sm" style="color:var(--accent-red);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>`;
        } else {
            trackingHtml = `
                <div class="text-xs text-[var(--text-muted)] mb-2">${this.app.t('detail.noTracking')}</div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('detail.trackingCarrier')}</label>
                        <select id="detail_carrier" class="input" style="font-size:0.8125rem;">
                            <option value="">${this.app.t('tracking.selectCarrier')}</option>
                            <option value="dhl">DHL</option>
                            <option value="hermes">Hermes</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('detail.trackingNumber')}</label>
                        <input type="text" id="detail_tracking_number" placeholder="${this.app.t('tracking.enterNumber')}" class="input" style="font-size:0.8125rem;">
                    </div>
                </div>`;
        }

        body.innerHTML = `
            ${images.length ? `
                <div class="detail-section-label">${this.app.t('detail.images')}</div>
                <div class="detail-image-gallery">
                    ${images.map(img => `<img src="/images/${img}" onclick="window.open('/images/${img}','_blank')" title="${order.title}">`).join('')}
                </div>` : ''}

            <div class="detail-section-label">${this.app.t('edit.statusField')}</div>
            <div class="status-toggle-group" id="detail_status_group" data-status="${order.status}">
                ${statusButtons}
            </div>

            <div class="detail-section-label">${this.app.t('detail.editable')}</div>
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('edit.titleField')}</label>
                    <input type="text" id="detail_title" value="${(order.title || '').replace(/"/g, '&quot;')}" class="input">
                </div>
                <div>
                    <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('edit.priceField')}</label>
                    <input type="number" id="detail_price" step="0.01" min="0" value="${order.price || ''}" class="input">
                </div>
                <div>
                    <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('edit.colorField')}</label>
                    <div class="detail-color-swatches">${colorSwatches}</div>
                    <input type="hidden" id="detail_color" value="${order.color || ''}">
                </div>
                <div>
                    <label class="text-xs text-[var(--text-muted)] block mb-1">${this.app.t('edit.notesField')}</label>
                    <textarea id="detail_notes" rows="3" class="input" style="resize:vertical;">${order.notes || ''}</textarea>
                </div>
            </div>

            <div class="detail-section-label">${this.app.t('detail.tracking')}</div>
            ${trackingHtml}

            <div class="detail-section-label">${this.app.t('detail.seller')}</div>
            <div class="card p-3 space-y-1.5 text-sm">
                <div class="flex justify-between">
                    <span class="text-[var(--text-muted)]">${this.app.t('detail.sellerName')}</span>
                    <span class="font-medium">
                        ${order.seller_profile_url
                            ? `<a href="${order.seller_profile_url}" target="_blank" class="text-blue-400 hover:underline">${order.seller_name || na}</a>`
                            : (order.seller_name || na)}
                        ${order.seller_is_new ? `<span class="badge badge-new-seller ml-1" style="font-size:0.6rem;">${this.app.t('orders.new')}</span>` : ''}
                    </span>
                </div>
                ${order.seller_since ? `
                <div class="flex justify-between">
                    <span class="text-[var(--text-muted)]">${this.app.t('detail.sellerSince')}</span>
                    <span>${order.seller_since}</span>
                </div>` : ''}
                ${order.category ? `
                <div class="flex justify-between">
                    <span class="text-[var(--text-muted)]">${this.app.t('detail.category')}</span>
                    <span class="truncate ml-2 text-right max-w-[60%]">${order.category}</span>
                </div>` : ''}
                ${order.location ? `
                <div class="flex justify-between">
                    <span class="text-[var(--text-muted)]">${this.app.t('detail.location')}</span>
                    <span class="text-right">${order.location}</span>
                </div>` : ''}
            </div>
        `;
    }

    _selectDetailColor(color, el) {
        document.querySelectorAll('#orderDetailBody .detail-color-swatch')
            .forEach(s => s.classList.remove('selected'));
        if (el) el.classList.add('selected');
        const input = document.getElementById('detail_color');
        if (input) input.value = color;
    }

    _setDetailStatus(status, btn) {
        const group = document.getElementById('detail_status_group');
        if (!group) return;
        group.querySelectorAll('.status-toggle-btn').forEach(b => {
            b.classList.remove('active-ordered', 'active-shipped', 'active-delivered');
        });
        btn.classList.add(`active-${status.toLowerCase()}`);
        group.dataset.status = status;
    }

    async saveOrderDetail() {
        if (!this._currentDetailOrder) return;
        const id = this._currentDetailOrder.id;

        const statusGroup = document.getElementById('detail_status_group');
        const data = {
            title: document.getElementById('detail_title').value,
            price: parseFloat(document.getElementById('detail_price').value) || 0,
            status: statusGroup ? statusGroup.dataset.status : this._currentDetailOrder.status,
            color: document.getElementById('detail_color').value,
            notes: document.getElementById('detail_notes').value,
        };

        const carrier = document.getElementById('detail_carrier')?.value;
        const trackingNumber = document.getElementById('detail_tracking_number')?.value;
        if (carrier && trackingNumber) {
            data.carrier = carrier;
            data.tracking_number = trackingNumber;
        }

        this.app.showLoading(this.app.t('loading.saving'));
        try {
            const updated = await this.app.apiRequest(`/orders/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            this.app.hideLoading();
            this._currentDetailOrder = updated;
            this._renderOrderDetail(updated);
            document.getElementById('orderDetailTitle').textContent = updated.title;
            this.app.showToast(this.app.t('toast.orderUpdated'), 'success');
            this.loadOrders();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.saveFailed'), 'error');
        }
    }

    removeTrackingFromDetail(id) {
        this.app.showConfirm(
            this.app.t('confirm.removeTracking'),
            this.app.t('confirm.removeTrackingMsg'),
            async () => {
                try {
                    const updated = await this.app.apiRequest(`/orders/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ tracking_number: '', carrier: '' })
                    });
                    this._currentDetailOrder = updated;
                    this._renderOrderDetail(updated);
                    this.app.showToast(this.app.t('toast.trackingRemoved'), 'success');
                    this.loadOrders();
                } catch {
                    this.app.showToast(this.app.t('error.updateFailed'), 'error');
                }
            },
            this.app.t('actions.remove')
        );
    }

    deleteOrderFromDetail() {
        if (!this._currentDetailOrder) return;
        const id = this._currentDetailOrder.id;
        this.app.showConfirm(
            this.app.t('confirm.deleteOrder'),
            this.app.t('confirm.deleteOrderMsg'),
            async () => {
                try {
                    await this.app.apiRequest(`/orders/${id}`, { method: 'DELETE' });
                    this.closeOrderDetail();
                    this.app.showToast(this.app.t('toast.orderDeleted'), 'success');
                    this.loadOrders();
                } catch {
                    this.app.showToast(this.app.t('error.deleteFailed'), 'error');
                }
            }
        );
    }

    // ---- Legacy methods (kept for dashboard/tracking page compatibility) ----

    async editOrder(id) {
        this.openOrderDetail(id);
    }

    closeEdit() { this.app.closeModal('editModal'); }

    showColorPicker(orderId) {
        this.openOrderDetail(orderId);
    }

    selectColor(color, el) {
        document.querySelectorAll('#color-picker .color-swatch').forEach(s => s.classList.remove('selected'));
        if (el) el.classList.add('selected');
        this.app.selectedColor = color;
    }

    async applyColor() {
        if (this.app.selectedOrderForColor && this.app.selectedColor !== undefined) {
            try {
                await this.app.apiRequest(`/orders/${this.app.selectedOrderForColor}`, {
                    method: 'PUT', body: JSON.stringify({ color: this.app.selectedColor })
                });
                this.app.closeModal('colorModal');
                this.app.showToast(this.app.t('toast.colorApplied'), 'success');
                this.loadOrders();
            } catch {
                this.app.showToast(this.app.t('error.colorFailed'), 'error');
            }
        }
    }

    closeColorModal() {
        this.app.closeModal('colorModal');
        this.app.selectedOrderForColor = null;
        this.app.selectedColor = undefined;
    }

    deleteOrder(id) {
        this.app.showConfirm(this.app.t('confirm.deleteOrder'), this.app.t('confirm.deleteOrderMsg'), async () => {
            try {
                await this.app.apiRequest(`/orders/${id}`, { method: 'DELETE' });
                this.app.showToast(this.app.t('toast.orderDeleted'), 'success');
                this.loadOrders();
            } catch {
                this.app.showToast(this.app.t('error.deleteFailed'), 'error');
            }
        });
    }

    // ---- Add Order ----

    async addOrder(event) {
        event.preventDefault();
        const url = document.getElementById('orderUrl').value;
        this.app.showLoading(this.app.t('loading.addingOrder'));
        try {
            const order = await this.app.apiRequest('/orders', { method: 'POST', body: JSON.stringify({ url }) });
            this.app.hideLoading();
            if (order.seller_is_new) {
                this.app.showToast(this.app.t('seller.newSellerAlert', { name: order.seller_name, since: order.seller_since }), 'warning');
            } else {
                this.app.showToast(this.app.t('toast.orderAdded'), 'success');
            }
            this.hideAddOrderForm();
            this.loadOrders();
        } catch (error) {
            this.app.hideLoading();
            this.app.showToast(error.message, 'error');
        }
    }

    clearAllFilters() {
        ['searchInput', 'statusFilter', 'colorFilter', 'sellerFilter', 'priceMinFilter', 'priceMaxFilter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        this.loadOrders();
    }

    async saveEdit(event) {
        event.preventDefault();
        const id = document.getElementById('edit_id').value;
        const data = {
            title: document.getElementById('edit_title').value,
            price: parseFloat(document.getElementById('edit_price').value) || 0,
            status: document.getElementById('edit_status').value,
            color: document.getElementById('edit_color').value,
            notes: document.getElementById('edit_notes').value
        };
        this.app.showLoading(this.app.t('loading.saving'));
        try {
            await this.app.apiRequest(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            this.app.hideLoading();
            this.closeEdit();
            this.app.showToast(this.app.t('toast.orderUpdated'), 'success');
            if (this.app.currentSection === 'dashboard') this.app.loadDashboard();
            else this.loadOrders();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.saveFailed'), 'error');
        }
    }
}
