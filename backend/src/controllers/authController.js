import * as authService from '../services/authService.js';
import { success } from '../utils/apiResponse.js';

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = authService.login(username, password);
    return success(res, result, 'Autenticación exitosa');
  } catch (err) {
    return next(err);
  }
}
