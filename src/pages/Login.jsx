import { useState } from 'react';
import { MdStorefront, MdEmail, MdLock } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="logo">
            <MdStorefront size={32} />
          </div>
          <h1>WALMART</h1>
          <p className="subtitle">SISTEMA DE INVENTARIO</p>
        </div>

        {/* Login Form */}
        <div className="login-form">
          <h2>Acceso al Sistema</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <MdEmail />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <MdLock />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit">
            Continuar
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <div className="secure-badge">
            <span className="secure-dot"></span>
            <p>Sistema Seguro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
