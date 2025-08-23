// src/utils/auth-helper.ts
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'HolaMundoVerde2025';

/**
 * Genera un token JWT para testing/desarrollo
 */
export function generateTestToken(payload: any = { id: 1, username: 'testuser' }): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
}

/**
 * Valida un token JWT
 */
export function validateToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// Si se ejecuta directamente, genera un token de prueba
if (require.main === module) {
  const testToken = generateTestToken();
  console.log('🔑 Token JWT generado para testing:');
  console.log(testToken);
  console.log('\n📋 Para usarlo en tus peticiones, incluye este header:');
  console.log(`Authorization: Bearer ${testToken}`);
}
