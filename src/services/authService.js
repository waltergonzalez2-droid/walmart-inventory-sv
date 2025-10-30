import { store } from './storageService';

// Simulación del servicio de correo para desarrollo
const DEMO_CODE = '123456'; // Código fijo para pruebas

// Genera un código aleatorio de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simula el envío del código de verificación
const sendVerificationCode = async (email) => {
  // En desarrollo, usamos un código fijo
  store.set('verificationCode', {
    code: DEMO_CODE,
    email,
    expiresAt: Date.now() + 10 * 60 * 1000
  });
  
  console.log(`Código de verificación para ${email}: ${DEMO_CODE}`);
  return true;
};

// Verifica el código ingresado
const verifyCode = (email, code) => {
  const storedData = store.get('verificationCode');
  
  if (!storedData) return false;
  
  const { code: storedCode, email: storedEmail, expiresAt } = storedData;
  
  // Verificar si el código ha expirado
  if (Date.now() > expiresAt) {
    store.remove('verificationCode');
    return false;
  }

  // Verificar si el correo y código coinciden
  if (email === storedEmail && code === storedCode) {
    store.remove('verificationCode');
    return true;
  }

  return false;
};

export const auth = {
  sendVerificationCode,
  verifyCode
};