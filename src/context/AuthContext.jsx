import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import AuthService from "../services/auth/auth.service";
import { registerUpdateTokens } from "./authTokensBridge";
import { parseJwtPayload } from "../utils/jwt";

const AuthContext = createContext();

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
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_data");
    setUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
    setRefreshToken(null);
  };

  // Al cargar la app, verificamos si hay cookie
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth_token");
      const storedRefreshToken = Cookies.get("refresh_token");
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
          setAccessToken(token);
          setRefreshToken(storedRefreshToken || null);
        } catch (error) {
          console.error("Error al recuperar sesión:", error);
          logout(); // Si el JSON está mal, limpiamos
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const applyTokensToState = (token, newRefreshToken, baseUserFromStorage = null) => {
    const payload = parseJwtPayload(token) || {};
    const baseUser =
      baseUserFromStorage ||
      user ||
      (Cookies.get("user_data") ? JSON.parse(Cookies.get("user_data")) : {});

    const rawClientIdFromToken =
      payload.clientId ?? payload.client_id ?? baseUser.clientId;
    let clientId = null;
    if (Array.isArray(rawClientIdFromToken)) {
      clientId = rawClientIdFromToken;
    } else if (typeof rawClientIdFromToken === "string") {
      clientId = [rawClientIdFromToken];
    } else if (baseUser.clientId) {
      clientId = Array.isArray(baseUser.clientId)
        ? baseUser.clientId
        : [baseUser.clientId];
    }

    const rawKeyClientFromToken =
      payload.key_client ?? payload.keyClient ?? baseUser.key_client;
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
      id: baseUser.userId ?? baseUser.id ?? payload.sub ?? null,
      firstName: baseUser.firstName ?? payload.firstName ?? "",
      lastName: baseUser.lastName ?? payload.lastName ?? "",
      role: baseUser.roles?.[0] || roleFromToken || baseUser.role || null,
      clientId,
      providerId: baseUser.providerId ?? null,
      key_client,
    };

    setUser(userData);
    Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });
    setIsAuthenticated(true);
    setAccessToken(token);
    setRefreshToken(newRefreshToken || null);
  };

  const updateTokens = (newAccessToken, newRefreshToken) => {
    if (!newAccessToken) return;

    Cookies.set("auth_token", newAccessToken, {
      expires: 1,
      secure: true,
      sameSite: "strict",
    });
    if (newRefreshToken) {
      Cookies.set("refresh_token", newRefreshToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
    }

    applyTokensToState(newAccessToken, newRefreshToken);
  };

  useEffect(() => {
    registerUpdateTokens(updateTokens);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      const authData = response.data || response;

      if (authData && authData.accessToken) {
        const token = authData.accessToken;
        const newRefreshToken = authData.refreshToken;

        Cookies.set("auth_token", token, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
        if (newRefreshToken) {
          Cookies.set("refresh_token", newRefreshToken, {
            expires: 1,
            secure: true,
            sameSite: "strict",
          });
        }

        applyTokensToState(token, newRefreshToken, authData);
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
        accessToken,
        refreshToken,
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
