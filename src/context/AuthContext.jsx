import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import AuthService from "../services/auth/auth.service";

const AuthContext = createContext();

// Helper para decodificar el payload de un JWT (base64url)
export const parseJwtPayload = (token) => {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decodificando JWT:", error);
    return null;
  }
};

// Helpers puros para reutilizar en servicios/páginas
export const isGlobalAdminRole = (role) => role === "super_admin";

export const hasClientScopeRole = (role) =>
  role === "client_superadmin" || role === "client_contract_admin";

export const getCurrentClientIdFromUser = (user) => {
  if (!user) return null;
  if (Array.isArray(user.clientId)) return user.clientId[0] ?? null;
  return user.clientId ?? null;
};

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
          const baseUser = JSON.parse(savedUser);
          const payload = parseJwtPayload(token);

          let clientId = baseUser.clientId ?? null;
          let key_client = baseUser.key_client ?? null;
          let role = baseUser.role ?? null;

          if (payload) {
            const rawClientId = payload.clientId ?? payload.client_id;
            if (Array.isArray(rawClientId)) {
              clientId = rawClientId;
            } else if (typeof rawClientId === "string") {
              clientId = [rawClientId];
            }

            const rawKeyClient = payload.key_client;
            if (Array.isArray(rawKeyClient)) {
              key_client = rawKeyClient;
            } else if (typeof rawKeyClient === "string") {
              key_client = [rawKeyClient];
            }

            if (!role) {
              const roleFromToken = Array.isArray(payload.role)
                ? payload.role[0]
                : payload.role;
              role = roleFromToken || baseUser.role || null;
            }
          }

          setUser({ ...baseUser, clientId, key_client, role });
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
        const token = authData.accessToken;

        Cookies.set("auth_token", token, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });

        const payload = parseJwtPayload(token) || {};

        const rawClientIdFromToken =
          payload.clientId ?? payload.client_id ?? authData.clientId;
        let clientId = null;
        if (Array.isArray(rawClientIdFromToken)) {
          clientId = rawClientIdFromToken;
        } else if (typeof rawClientIdFromToken === "string") {
          clientId = [rawClientIdFromToken];
        } else if (authData.clientId) {
          clientId = Array.isArray(authData.clientId)
            ? authData.clientId
            : [authData.clientId];
        }

        // key_client puede venir como string o array en el token
        const rawKeyClientFromToken =
          payload.key_client ?? payload.keyClient ?? authData.key_client;
        let key_client = null;
        if (Array.isArray(rawKeyClientFromToken)) {
          key_client = rawKeyClientFromToken;
        } else if (typeof rawKeyClientFromToken === "string") {
          key_client = [rawKeyClientFromToken];
        }

        const roleFromToken = Array.isArray(payload.role)
          ? payload.role[0]
          : payload.role;

        const userData = {
          id: authData.userId ?? payload.sub ?? null,
          firstName: authData.firstName ?? payload.firstName ?? "",
          lastName: authData.lastName ?? payload.lastName ?? "",
          role: authData.roles?.[0] || roleFromToken || null,
          clientId,
          providerId: authData.providerId ?? null,
          key_client,
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

  const currentUserClientId = getCurrentClientIdFromUser(user);
  const currentClientId = currentUserClientId;
  const currentKeyClient = Array.isArray(user?.key_client)
    ? user.key_client[0]
    : user?.key_client ?? null;
  const isGlobalAdmin = isGlobalAdminRole(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        currentUserClientId,
        currentClientId,
        currentKeyClient,
        isGlobalAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
