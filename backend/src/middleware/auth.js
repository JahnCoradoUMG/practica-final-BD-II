import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Token no proporcionado', 401, 'UNAUTHORIZED'));
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new AppError('Token inválido o expirado', 401, 'INVALID_TOKEN'));
  }
}
