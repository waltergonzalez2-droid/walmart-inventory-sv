import { Link, useLocation } from "react-router-dom";
import { 
  MdDashboard, 
  MdInventory, 
  MdShoppingCart,
  MdStorefront
} from "react-icons/md";

export default function Navbar() {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", name: "DASHBOARD", icon: <MdDashboard size={20} /> },
    { path: "/inventory", name: "INVENTORY", icon: <MdInventory size={20} /> },
    { path: "/orders", name: "ORDERS", icon: <MdShoppingCart size={20} /> }
  ];

  

  return (
    <nav className="navbar">
      <div className="brand">
        <div className="logo">
          <MdStorefront size={24} />
        </div>
        <div>
          <h1>WALMART</h1>
          <p className="subtitle">SISTEMA DE INVENTARIO</p>
        </div>
      </div>

      <div className="nav-links">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
