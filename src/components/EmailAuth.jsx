import { useState } from 'react';
import { BsShieldLock, BsEnvelope, BsKey, BsArrowRight } from 'react-icons/bs';

export default function EmailAuth({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: email/pass, 2: verification code
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === 1) {
      if (email && password) {
        // Para desarrollo, aceptamos cualquier correo/contraseña
        console.log('Código de verificación (desarrollo): 123456');
        alert('Para desarrollo, use el código: 123456');
        setStep(2);
      } else {
        alert('Por favor ingrese correo y contraseña');
      }
    } else {
      // Para desarrollo, el código siempre es 123456
      if (verificationCode === '123456') {
        alert('¡Verificación exitosa!');
        onAuthSuccess();
      } else {
        alert('Código incorrecto. Use: 123456');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          
          <h1 className="auth-title">Acceso al Sistema</h1>
          <p className="auth-subtitle">
            {step === 1 
              ? 'Ingresa tus credenciales para continuar'
              : 'Ingresa el código de verificación enviado a tu correo'
            }
          </p>
        </div>

        <div className="auth-form-container">
          <div className="auth-icon-container">
            <BsShieldLock className="auth-icon" />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div className="auth-input-group">
                  <label className="auth-label">
                    Correo Electrónico
                  </label>
                  <div className="auth-input-container">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input"
                      placeholder="ejemplo@correo.com"
                      required
                    />
                    <BsEnvelope className="auth-input-icon" />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">
                    Contraseña
                  </label>
                  <div className="auth-input-container">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input"
                      placeholder="••••••••"
                      required
                    />
                    <BsKey className="auth-input-icon" />
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-input-group">
                <label className="auth-label">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="auth-verification-input"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="auth-verification-text">
                  Revisa tu correo {email}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`auth-submit-button ${isLoading ? 'auth-loading' : ''}`}
            >
              {isLoading ? 'Procesando...' : (
                <>
                  {step === 1 ? 'Continuar' : 'Verificar'} <BsArrowRight />
                </>
              )}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="auth-back-button"
              >
                ← Volver
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}