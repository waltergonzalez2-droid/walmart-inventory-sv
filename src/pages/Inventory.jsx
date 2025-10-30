import { useState, useMemo } from "react";
import { useStore } from "../state/store";
import { store as ls } from "../services/storageService";
import * as XLSX from "xlsx";
import { 
  BsSearch, 
  BsFilter, 
  BsDownload, 
  BsPlusCircle, 
  BsDashCircle,
  BsExclamationTriangle,
  BsCheckCircle,
  BsBoxSeam
} from "react-icons/bs";

export default function Inventory() {
  const { inventory, skus, stores, loadData } = useStore();
  const [selectedStore, setSelectedStore] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const skuMap = useMemo(() => 
    Object.fromEntries(skus.map((s) => [s.id, s])),
    [skus]
  );
  
  const storeMap = useMemo(() => 
    Object.fromEntries(stores.map((s) => [s.id, s])),
    [stores]
  );

  // ✅ FIX: comparar bien por storeId y skuId
  const adjust = (item, delta) => {
    const upd = inventory.map((it) =>
      it.storeId === item.storeId && it.skuId === item.skuId
        ? { ...it, onHand: Math.max(0, it.onHand + delta) }
        : it
    );
    ls.set("inventory", upd);
    loadData();
  };

  

  // 📊 Exportar Excel
  const exportExcel = () => {
    try {
      const data = filteredInventory.map((i) => ({
        Tienda: storeMap[i.storeId]?.name || "",
        SKU: skuMap[i.skuId]?.name || "",
        "En Mano": i.onHand,
        "Punto Pedido": i.reorderPoint,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");
      XLSX.writeFile(wb, "inventario_walmart.xlsx");
    } catch (err) {
      alert("Error al generar Excel: " + err.message);
    }
  };

  // 🔎 Filtrar y ordenar inventario
  const filteredInventory = useMemo(() => {
    let result = selectedStore === "all"
      ? inventory
      : inventory.filter((i) => i.storeId === selectedStore);

    // Aplicar búsqueda
    if (searchTerm) {
      result = result.filter(i => 
        skuMap[i.skuId]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        storeMap[i.storeId]?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue = sortConfig.key === 'sku' 
          ? skuMap[a.skuId]?.name 
          : sortConfig.key === 'store'
          ? storeMap[a.storeId]?.name
          : a[sortConfig.key];
        let bValue = sortConfig.key === 'sku'
          ? skuMap[b.skuId]?.name
          : sortConfig.key === 'store'
          ? storeMap[b.storeId]?.name
          : b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [inventory, selectedStore, searchTerm, sortConfig, skuMap, storeMap]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="min-h-screen bg-walmart-gray">
      {/* Header con herramientas */}
      <header className="inventory-header">
        <div className="inventory-tools">
          {/* Búsqueda */}
          <div className="inventory-search">
            <BsSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por tienda o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Selector de Tienda */}
          <div className="inventory-filter">
            <BsFilter className="filter-icon" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="all">Todas las Tiendas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Exportar */}
          <button onClick={exportExcel} className="inventory-export">
            <BsDownload /> Exportar Excel
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="inventory-table-wrapper">
        <div className="inventory-table">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('store')}>
                  <div className="flex items-center gap-2">
                    Tienda
                    {sortConfig.key === 'store' && (
                      <span className={sortConfig.direction === 'asc' ? '↑' : '↓'} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('sku')}>
                  <div className="flex items-center gap-2">
                    SKU
                    {sortConfig.key === 'sku' && (
                      <span className={sortConfig.direction === 'asc' ? '↑' : '↓'} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('onHand')}>
                  <div className="flex items-center gap-2">
                    En Mano
                    {sortConfig.key === 'onHand' && (
                      <span className={sortConfig.direction === 'asc' ? '↑' : '↓'} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('reorderPoint')}>
                  <div className="flex items-center gap-2">
                    Punto de Pedido
                    {sortConfig.key === 'reorderPoint' && (
                      <span className={sortConfig.direction === 'asc' ? '↑' : '↓'} />
                    )}
                  </div>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((i) => {
                const isLowStock = i.onHand <= i.reorderPoint;
                return (
                  <tr key={`${i.storeId}-${i.skuId}`}>
                    <td>
                      <span className="font-medium text-walmart-blue">
                        {storeMap[i.storeId]?.name || "Sin tienda"}
                      </span>
                    </td>
                    <td>{skuMap[i.skuId]?.name || "Sin SKU"}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`stock-number ${isLowStock ? 'low' : 'good'}`}>
                          {i.onHand}
                          {isLowStock && (
                            <span className="stock-alert">
                              <BsExclamationTriangle /> Bajo stock
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="font-medium text-walmart-blue">{i.reorderPoint}</td>
                    <td>
                      <div className="stock-actions">
                        <button
                          onClick={() => adjust(i, -1)}
                          className="stock-action-button decrease"
                          title="Disminuir stock"
                        >
                          <BsDashCircle size={20} />
                        </button>
                        <button
                          onClick={() => adjust(i, 1)}
                          className="stock-action-button increase"
                          title="Aumentar stock"
                        >
                          <BsPlusCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-walmart-gray rounded-full flex items-center justify-center">
                        <BsSearch size={24} className="text-walmart-blue opacity-60" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No se encontraron productos que coincidan con tu búsqueda.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Estadísticas */}
        <div className="inventory-stats">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total productos</p>
                <p className="text-2xl font-bold text-walmart-black mt-1">
                  {filteredInventory.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BsBoxSeam className="text-walmart-blue text-xl" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Productos bajo stock</p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  {filteredInventory.filter(i => i.onHand <= i.reorderPoint).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <BsExclamationTriangle className="text-red-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Stock total</p>
                <p className="text-2xl font-bold text-walmart-blue mt-1">
                  {filteredInventory.reduce((sum, i) => sum + i.onHand, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-walmart-gray rounded-lg flex items-center justify-center">
                <BsCheckCircle className="text-walmart-blue text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
