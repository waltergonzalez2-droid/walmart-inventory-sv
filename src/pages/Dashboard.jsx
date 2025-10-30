import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { startSimulator } from '../services/demandSimulator';
import { evaluateInventory } from '../services/reorderEngine';
import { 
  BsBoxSeam, 
  BsCartDash, 
  BsClipboardCheck, 
  BsArrowRepeat, 
  BsPlay, 
  BsStop, 
  BsShieldLock 
} from 'react-icons/bs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import EmailAuth from '../components/EmailAuth';

export default function Dashboard() {
  const { skus, stores, inventory, sales, orders, loadData, applySale, addOrder } = useStore();
  const [simRunning, setSimRunning] = useState(false);
  const [stopSim, setStopSim] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { loadData(); }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const toggleSimulation = () => {
    if (simRunning) {
      // 🔴 Detener simulación
      if (stopSim) stopSim();
      setStopSim(null);
      setSimRunning(false);
    } else {
      // 🟢 Iniciar simulación
      const stop = startSimulator((sale) => {
        applySale(sale);
        const skuMap = Object.fromEntries(skus.map(s => [s.id, s]));
        const newOrders = evaluateInventory(inventory, skuMap);
        newOrders.forEach(o => addOrder(o));
      }, skus, stores, 2000);

      setStopSim(() => stop);
      setSimRunning(true);
    }
  };

  const lowStock = inventory.filter(i => i.onHand <= i.reorderPoint).length;

  const chartData = skus.map(s => ({
    name: s.name,
    stock: inventory.filter(i => i.skuId === s.id).reduce((a, b) => a + b.onHand, 0)
  }));

  const resetData = async () => {
    if (!confirm('¿Resetear datos iniciales?')) return;

    try {
      const [stores, skus, inventory] = await Promise.all([
        fetch('/data/seed-stores.json').then(r => r.json()),
        fetch('/data/seed-skus.json').then(r => r.json()),
        fetch('/data/seed-inventory.json').then(r => r.json())
      ]);

      localStorage.setItem('walmart-inv:stores', JSON.stringify(stores));
      localStorage.setItem('walmart-inv:skus', JSON.stringify(skus));
      localStorage.setItem('walmart-inv:inventory', JSON.stringify(inventory));
      localStorage.setItem('walmart-inv:sales', '[]');
      localStorage.setItem('walmart-inv:purchaseOrders', '[]');
      localStorage.setItem('walmart-inv:alerts', '[]');

      alert('✅ Datos cargados correctamente');
      window.location.reload();
    } catch (err) {
      alert('❌ Error al cargar datos: ' + err.message);
    }
  };

  if (!isAuthenticated) {
    return <EmailAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-walmart-gray">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 shadow-lg mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-walmart-black">Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={toggleSimulation}
                className={`order-button ${simRunning ? 'danger' : 'primary'}`}
              >
                {simRunning ? <BsStop className="text-lg" /> : <BsPlay className="text-lg" />}
                {simRunning ? 'Detener Simulación' : 'Iniciar Simulación'}
              </button>
              <button
                onClick={resetData}
                className="order-button secondary"
              >
                <BsArrowRepeat className="text-lg" /> Resetear datos
              </button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between py-3 px-5 bg-walmart-gray rounded-lg text-sm border border-gray-200">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${simRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-walmart-black">Estado:</span>
                <span className="font-medium text-walmart-blue">{simRunning ? 'Simulación en curso' : 'En espera'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-walmart-black">Última actualización:</span>
                <span className="font-medium text-walmart-blue">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-walmart-blue bg-white py-1.5 px-3 rounded-lg shadow-sm">
              <BsShieldLock />
              <span className="font-medium">Sesión autenticada</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6">
        {/* KPI Cards */}
        <section className="dashboard-grid">
          <KpiCard
            title="Ventas Simuladas"
            value={sales.length}
            trend={sales.length > 0 ? ((sales.length - Math.floor(sales.length * 0.8)) / sales.length * 100).toFixed(1) : 0}
            icon={<BsCartDash />}
            color="#0071DC"
          />
          <KpiCard
            title="Bajo Stock"
            value={lowStock}
            trend={((lowStock / inventory.length) * 100).toFixed(1)}
            icon={<BsBoxSeam />}
            color="#E60012"
            alert={lowStock > inventory.length * 0.2}
          />
          <KpiCard
            title="Órdenes Creadas"
            value={orders.filter(o => o.status === 'CREATED').length}
            trend={((orders.filter(o => o.status === 'CREATED').length / Math.max(1, orders.length)) * 100).toFixed(1)}
            icon={<BsClipboardCheck />}
            color="#2DA44E"
          />
        </section>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <section className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-walmart-black">Inventario por Producto</h2>
              <select className="text-sm border-2 border-gray-200 rounded-lg px-4 py-2 bg-white text-walmart-black font-medium focus:border-walmart-blue focus:ring-2 focus:ring-walmart-blue/20 outline-none">
                <option>Últimos 7 días</option>
                <option>Último mes</option>
                <option>Último año</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#2D2D2D" fontSize={12} />
                <YAxis stroke="#2D2D2D" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #F8F9FA',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="stock" fill="#0071DC" radius={[8, 8, 0, 0]}>
                  {/* Gradient for bars */}
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0071DC" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#0071DC" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Quick Stats */}
          <section className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold text-walmart-black mb-6">Estadísticas Rápidas</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-walmart-black font-medium">Eficiencia de Inventario</span>
                  <span className="font-bold text-walmart-blue">{((1 - (lowStock / inventory.length)) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-walmart-blue rounded-full transition-all duration-500"
                    style={{ width: `${((1 - (lowStock / inventory.length)) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-walmart-black font-medium">Tasa de Reposición</span>
                  <span className="font-bold text-green-600">
                    {((orders.filter(o => o.status === 'CREATED').length / Math.max(1, lowStock)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (orders.filter(o => o.status === 'CREATED').length / Math.max(1, lowStock)) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              <div className="pt-6 border-t-2 border-gray-100">
                <h3 className="text-walmart-black font-bold mb-4">Resumen de Actividad</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-walmart-gray rounded-lg p-3">
                    <span className="text-sm font-medium text-walmart-black">Total de Productos</span>
                    <span className="text-sm font-bold text-walmart-blue">{skus.length}</span>
                  </div>
                  <div className="flex items-center justify-between bg-walmart-gray rounded-lg p-3">
                    <span className="text-sm font-medium text-walmart-black">Total de Tiendas</span>
                    <span className="text-sm font-bold text-walmart-blue">{stores.length}</span>
                  </div>
                  <div className="flex items-center justify-between bg-walmart-gray rounded-lg p-3">
                    <span className="text-sm font-medium text-walmart-black">Inventario Total</span>
                    <span className="text-sm font-bold text-walmart-blue">
                      {inventory.reduce((sum, item) => sum + item.onHand, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, trend, icon, color, alert }) {
  return (
    <div className={`stat-card ${alert ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            color === '#0071DC' 
              ? 'bg-walmart-blue' 
              : color === '#E60012' 
                ? 'bg-red-500' 
                : 'bg-green-500'
          } text-white`}>
            {icon}
          </div>
          <p className="text-sm text-walmart-black font-medium flex items-center gap-2">
            {title}
            {alert && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold text-walmart-black">{value}</p>
          <p className="text-sm mt-2 flex items-center gap-1">
            {trend >= 0 ? (
              <span className="status-badge received">
                <span className="text-lg mr-1">↑</span> {trend}%
              </span>
            ) : (
              <span className="status-badge danger">
                <span className="text-lg mr-1">↓</span> {Math.abs(trend)}%
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-20 h-20">
            <div 
              className="w-full h-full rounded-full border-4 border-walmart-gray relative transform -rotate-90"
              style={{
                background: `conic-gradient(${
                  color === '#0071DC' 
                    ? 'var(--walmart-blue)' 
                    : color === '#E60012' 
                      ? '#E60012' 
                      : '#2DA44E'
                } ${Math.abs(trend)}%, transparent 0)`
              }}
            >
              <div className="absolute inset-1.5 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
