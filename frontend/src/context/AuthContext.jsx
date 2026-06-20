import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

// Note: request/response interceptors (attaching the JWT, handling 401/403)
// live in services/api.js on the shared `api` axios instance. Previously this
// file configured the *global* axios object separately with its own
// interceptors and hardcoded localhost URLs, which meant two HTTP clients
// with diverging behavior existed side by side. Using authApi here keeps
// everything on one configured client.

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic token expiry check (if your JWT includes exp)
        if (parsed?.token) {
          const payload = JSON.parse(atob(parsed.token.split('.')[1]));
          if (payload?.exp && payload.exp * 1000 < Date.now()) {
            // Token expired — clear it
            localStorage.removeItem('user');
          } else {
            setUser(parsed);
          }
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await authApi.login({ username, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
    }
    return response.data;
  };

  const register = async (username, email, password) => {
    return await authApi.register({
      username,
      email,
      password,
      role: ['user'],
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Redirect handled by the Navbar / caller
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
