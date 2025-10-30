import { useStore } from '../state/store';
import { store as ls } from '../services/storageService';

export default function Orders() {
  const { orders, inventory, stores, skus, loadData } = useStore();
  
  // Crear mapas para búsqueda rápida
  const storeMap = {};
  stores.forEach(store => {
    storeMap[store.id] = store.name;
  });

  const skuMap = {};
  skus.forEach(sku => {
    skuMap[sku.id] = sku.name;
  });

  const send = (id) => {
    const upd = orders.map(o => (o.id === id ? { ...o, status: 'SENT' } : o));
    ls.set('purchaseOrders', upd);
    loadData();
  };

  const receive = (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const inv = inventory.map(i =>
      i.storeId === order.storeId && i.skuId === order.skuId
        ? { ...i, onHand: i.onHand + order.qty }
        : i
    );
    ls.set('inventory', inv);
    const ord = orders.map(o => (o.id === id ? { ...o, status: 'RECEIVED' } : o));
    ls.set('purchaseOrders', ord);
    loadData();
  };

  // 🚀 NUEVO: enviar todas las órdenes CREATED
  const sendAll = () => {
    if (!window.confirm('¿Deseas enviar todas las órdenes creadas?')) return;
    const upd = orders.map(o => o.status === 'CREATED' ? { ...o, status: 'SENT' } : o);
    ls.set('purchaseOrders', upd);
    loadData();
  };

  // 🚀 NUEVO: recibir todas las órdenes SENT
  const receiveAll = () => {
    if (!window.confirm('¿Deseas recibir todas las órdenes enviadas?')) return;

    const newInventory = [...inventory];
    orders.forEach(order => {
      if (order.status === 'SENT') {
        const idx = newInventory.findIndex(
          i => i.storeId === order.storeId && i.skuId === order.skuId
        );
        if (idx !== -1) {
          newInventory[idx] = {
            ...newInventory[idx],
            onHand: newInventory[idx].onHand + order.qty
          };
        } else {
          newInventory.push({
            storeId: order.storeId,
            skuId: order.skuId,
            onHand: order.qty
          });
        }
      }
    });

    ls.set('inventory', newInventory);
    const upd = orders.map(o => o.status === 'SENT' ? { ...o, status: 'RECEIVED' } : o);
    ls.set('purchaseOrders', upd);
    loadData();
  };

  // 🚀 NUEVO: limpiar todas las órdenes
  const clearAll = () => {
    if (!window.confirm('¿Seguro que quieres eliminar todas las órdenes?')) return;
    ls.set('purchaseOrders', []);
    loadData();
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="text-2xl font-bold text-walmart-black">Órdenes de Compra</h1>
      </div>

      <div className="orders-controls">
        <button
          onClick={sendAll}
          className="order-button primary"
        >
          Enviar todo
        </button>
        <button
          onClick={receiveAll}
          className="order-button secondary"
        >
          Recibir todo
        </button>
        <button
          onClick={clearAll}
          className="order-button danger"
        >
          Limpiar todo
        </button>
      </div>

      <div className="orders-table">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Orden #</th>
              <th>Tienda</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-walmart-blue">{o.id.slice(-8).toUpperCase()}</span>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-walmart-blue"></span>
                    <span className="font-medium">{storeMap[o.storeId] || 'Tienda no encontrada'}</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-medium">{skuMap[o.skuId] || 'Producto no encontrado'}</span>
                    <span className="text-xs text-gray-500">SKU: {o.skuId}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{o.qty}</span>
                    <span className="text-xs text-gray-500">unidades</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${o.status.toLowerCase()}`}>
                    {o.status === 'CREATED' ? 'Por Enviar' : 
                     o.status === 'SENT' ? 'En Tránsito' : 
                     'Recibido'}
                  </span>
                </td>
                <td className="flex gap-2">
                  {o.status === 'CREATED' && (
                    <button
                      onClick={() => send(o.id)}
                      className="order-button primary"
                    >
                      Enviar
                    </button>
                  )}
                  {o.status === 'SENT' && (
                    <button
                      onClick={() => receive(o.id)}
                      className="order-button secondary"
                    >
                      Recibir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
