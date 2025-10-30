import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import { useStore } from './state/store';
import { store as ls } from './services/storageService';
import './styles.css';

function App() {
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    // Cargar datos desde los archivos JSON
    const initializeData = async () => {
      try {
        // Verificar si ya hay datos en localStorage
        const existingData = ls.get('skus', null);
        
        if (!existingData) {
          // Cargar datos de los archivos JSON
          const [skusData, storesData, inventoryData] = await Promise.all([
            fetch('/data/seed-skus.json').then(res => res.json()),
            fetch('/data/seed-stores.json').then(res => res.json()),
            fetch('/data/seed-inventory.json').then(res => res.json()),
          ]);

          // Guardar en localStorage
          ls.set('skus', skusData);
          ls.set('stores', storesData);
          ls.set('inventory', inventoryData);
        }

        // Cargar los datos en el store de Zustand
        loadData();
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };

    initializeData();
  }, [loadData]);

  return (
    <BrowserRouter>
      <div className="page-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
