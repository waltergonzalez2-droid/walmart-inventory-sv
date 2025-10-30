export function evaluateInventory(inventory, skusMap) {
  const orders = [];
  inventory.forEach(item => {
    const onHand = item.onHand + (item.incoming?.reduce((s, i) => s + i.qty, 0) || 0);
    if (onHand <= item.reorderPoint) {
      const sku = skusMap[item.skuId];
      const qtyToOrder = Math.max(item.maxStock - onHand, sku?.moq || 1);
      orders.push({
        id: crypto.randomUUID(),
        skuId: item.skuId,
        storeId: item.storeId,
        qty: qtyToOrder,
        status: 'CREATED',
        createdAt: Date.now(),
        eta: Date.now() + (item.leadTimeDays || 2) * 24 * 60 * 60 * 1000
      });
    }
  });
  return orders;
}