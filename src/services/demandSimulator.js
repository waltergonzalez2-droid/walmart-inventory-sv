import { generateUUID } from '../utils/uuid';

let intervalId = null;

export function startSimulator(callback, skus, stores, rate = 1500) {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    const sku = skus[Math.floor(Math.random() * skus.length)];
    const store = stores[Math.floor(Math.random() * stores.length)];
    const qty = Math.random() < 0.8 ? 1 : Math.floor(Math.random() * 3) + 1;
    const sale = {
      id: generateUUID(),
      timestamp: Date.now(),
      storeId: store.id,
      skuId: sku.id,
      qty,
      channel: 'in-store'
    };
    callback(sale);
  }, rate);
  return () => clearInterval(intervalId);
}
