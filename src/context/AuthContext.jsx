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

      if (response && response.accessToken) {
        Cookies.set("auth_token", response.accessToken, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
        const userData = {
          id: response.userId,
          firstName: response.firstName,
          lastName: response.lastName,
          role:
            response.roles && response.roles.length > 0
              ? response.roles[0]
              : null,
          clientId: response.clientId,
          providerId: response.providerId,
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
