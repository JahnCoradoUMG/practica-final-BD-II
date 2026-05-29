import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function login(username, password) {
  if (username !== env.adminUser || password !== env.adminPassword) {
    throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const payload = { sub: username, role: 'admin' };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

  return {
    token,
    expiresIn: env.jwtExpiresIn,
    user: { username, role: 'admin' },
  };
}
