import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import AuthService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificamos si hay cookie
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('auth_token');
      if (token) {
        // OPCIONAL: Aquí podrías llamar a un endpoint /auth/me para validar el token real
        // Por ahora asumimos que si hay token, está logueado
        setIsAuthenticated(true);
        // Si tienes datos del usuario guardados (ej: en otra cookie o decodificando el token), cárgalos aquí
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const response = await AuthService.login(credentials);
    
    if (response && response.accessToken) {
      // GUARDADO SEGURO:
      // 1. 'expires: 1': Expira en 1 día
      // 2. 'secure: true': Solo se envía por HTTPS (importante en producción)
      // 3. 'sameSite: strict': Protege contra ataques CSRF
      Cookies.set('auth_token', response.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
      
      setUser(response.user); // Si el backend devuelve info del usuario
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);