// My Listings Manager
class ListingsManager {
    constructor(app) {
        this.app = app;
    }

    async loadMyListings() {
        try {
            const listings = await this.app.apiRequest('/my-listings');
            const container = document.getElementById('my-listings-list');

            if (!listings.length) {
                container.innerHTML = `
                    <div class="col-span-full empty-state card">
                        <i class="fas fa-list-alt"></i>
                        <h3>${this.app.t('listings.noListings')}</h3>
                        <p>${this.app.t('listings.noListingsDesc')}</p>
                        <button onclick="app.syncMyListings()" class="btn btn-success"><i class="fas fa-sync"></i> ${this.app.t('actions.sync')}</button>
                    </div>`;
            } else {
                container.innerHTML = listings.map(l => this._renderCard(l)).join('');
            }
        } catch {
            this.app.showToast(this.app.t('error.loadListings'), 'error');
        }
    }

    _renderCard(listing) {
        return `
            <div class="order-card">
                <div class="relative">
                    ${listing.image_url
                        ? `<img src="${listing.image_url}" class="order-card-image">`
                        : `<div class="order-card-placeholder"><i class="fas fa-image"></i></div>`}
                    <span class="absolute top-2 right-2 badge badge-delivered">${listing.status}</span>
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                        <span class="text-lg font-bold text-emerald-400">€${listing.price.toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-card-body">
                    <div class="order-card-title">${listing.title}</div>
                    <div class="space-y-1 mb-3">
                        <div class="order-card-meta"><i class="fas fa-tag w-3"></i><span class="truncate">${listing.category || this.app.t('orders.na')}</span></div>
                        <div class="order-card-meta"><i class="fas fa-calendar w-3"></i><span>${this.app.t('listings.ends', { date: listing.end_date || this.app.t('orders.na') })}</span></div>
                    </div>
                    <div class="flex justify-between items-center text-xs text-[var(--text-muted)] mb-3">
                        <span><i class="fas fa-eye mr-1"></i>${this.app.t('listings.views', { count: listing.visitors })}</span>
                        <span><i class="fas fa-heart mr-1"></i>${this.app.t('listings.favs', { count: listing.favorites })}</span>
                    </div>
                    ${listing.url ? `
                        <a href="${listing.url}" target="_blank" class="btn btn-primary btn-sm w-full">
                            <i class="fas fa-external-link-alt"></i> ${this.app.t('actions.viewListing2')}
                        </a>` : ''}
                </div>
            </div>`;
    }

    async syncMyListings() {
        this.app.showLoading(this.app.t('loading.syncingListings'));
        try {
            const result = await this.app.apiRequest('/my-listings/sync', { method: 'POST' });
            this.app.hideLoading();
            this.app.showToast(this.app.t('toast.syncedListings', { count: result.synced }), 'success');
            this.loadMyListings();
        } catch {
            this.app.hideLoading();
            this.app.showToast(this.app.t('error.syncFailed'), 'error');
        }
    }
}
