const NS = 'walmart-inv:';

export const store = {
  get(key, fallback) {
    const raw = localStorage.getItem(NS + key);
    return raw ? JSON.parse(raw) : (fallback ?? null);
  },
  set(key, value) {
    localStorage.setItem(NS + key, JSON.stringify(value));
  },
  async loadSeed() {
    const [skus, stores, inventory] = await Promise.all([
      fetch('/data/seed-skus.json').then(r => r.json()),
      fetch('/data/seed-stores.json').then(r => r.json()),
      fetch('/data/seed-inventory.json').then(r => r.json())
    ]);
    this.set('skus', skus);
    this.set('stores', stores);
    this.set('inventory', inventory);
    this.set('sales', []);
    this.set('purchaseOrders', []);
    this.set('alerts', []);
  },
  exportState() {
    return {
      skus: this.get('skus', []),
      stores: this.get('stores', []),
      inventory: this.get('inventory', [])
    };
  }
};