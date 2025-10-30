import { create } from 'zustand';
import { store as ls } from '../services/storageService';

export const useStore = create((set, get) => ({
  skus: [],
  stores: [],
  inventory: [],
  sales: [],
  orders: [],
  alerts: [],

  loadData: () => {
    const skus = ls.get('skus', []);
    const stores = ls.get('stores', []);
    let inventory = ls.get('inventory', []);
    const sales = ls.get('sales', []);
    const orders = ls.get('purchaseOrders', []);
    const alerts = ls.get('alerts', []);

    // 🔹 Asegurar que cada tienda tenga todos los SKUs
    stores.forEach((store) => {
      skus.forEach((sku) => {
        const exists = inventory.some(
          (inv) => inv.storeId === store.id && inv.skuId === sku.id
        );
        if (!exists) {
          inventory.push({
            storeId: store.id,
            skuId: sku.id,
            onHand: 0,
            reorderPoint: 10, // Valor inicial
          });
        }
      });
    });

    // Guardar inventario actualizado en localStorage
    ls.set('inventory', inventory);

    set({ skus, stores, inventory, sales, orders, alerts });
  },

  applySale: (sale) => {
    const inv = get().inventory.map((i) =>
      i.storeId === sale.storeId && i.skuId === sale.skuId
        ? { ...i, onHand: Math.max(0, i.onHand - sale.qty) }
        : i
    );
    set({ inventory: inv, sales: [sale, ...get().sales] });
    ls.set('inventory', inv);
    ls.set('sales', get().sales);
  },

  addOrder: (order) => {
    const o = [order, ...get().orders];
    set({ orders: o });
    ls.set('purchaseOrders', o);
  },
}));
