import { createContext, useContext, useMemo, useState } from 'react';
import { loginRequest } from '../services/apiClient';

const AuthContext = createContext(null);
const TOKEN_KEY = 'dataops_token';

function getInitialToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getInitialToken);
  const [user, setUser] = useState(null);

  const isAuthenticated = Boolean(token);

  async function login(username, password) {
    const response = await loginRequest(username, password);
    setToken(response.token);
    setUser(response.user);
    window.localStorage.setItem(TOKEN_KEY, response.token);
  }

  function logout() {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(TOKEN_KEY);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      logout,
    }),
    [token, user, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }
  return context;
}
