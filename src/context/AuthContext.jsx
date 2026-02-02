import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import AuthService from "../services/auth/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = () => {
      Cookies.remove("auth_token");
      Cookies.remove("user_data");
      setUser(null);
      setIsAuthenticated(false);
    };

  // Al cargar la app, verificamos si hay cookie
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth_token");
      const savedUser = Cookies.get("user_data"); // Intentamos recuperar datos guardados

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error al recuperar sesión:", error);
          logout(); // Si el JSON está mal, limpiamos
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      const authData = response.data || response;

     if (authData && authData.accessToken) {
      Cookies.set("auth_token", authData.accessToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
        const userData = {
        id: authData.userId,
        firstName: authData.firstName,
        lastName: authData.lastName,
        role: authData.roles?.[0] || null,
        clientId: authData.clientId,
        providerId: authData.providerId,
      };

        setUser(userData);
        Cookies.set("user_data", JSON.stringify(userData), { expires: 1 }); // Guardamos datos del usuario
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Error en login context:", error);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
