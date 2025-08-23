import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'HolaMundoVerde';

export const generarToken = (payload: object): string => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
};
