import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const ClientSelectionContext = createContext(null);

/**
 * Estructura de selectedClient:
 * {
 *   id: string | number | null,
 *   name: string | null,
 *   schema: string | null
 * }
 */
export const ClientSelectionProvider = ({ children }) => {
  const { user, currentClientId, currentKeyClient } = useAuth();
  const [selectedClient, setSelectedClient] = useState(null);

  // Normalizar role (el JWT puede enviarlo como array)
  const rawRole = user?.role ?? null;
  const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;
  const isSuperAdmin =
    role === "super_admin" || role === 1 || role === "1";
  const isClientScoped =
    role === "client_superadmin" || role === "client_contract_admin";

  useEffect(() => {
    if (!user) {
      setSelectedClient(null);
      return;
    }

    // Super_admin: usa selección desde storage (TopNavbar)
    if (isSuperAdmin) {
      const storedId = sessionStorage.getItem("selected_client_id");
      const storedName = sessionStorage.getItem("selected_client_name");
      const storedSchema =
        window.localStorage?.getItem("selected_schema") || null;

      if (storedId || storedName || storedSchema) {
        setSelectedClient({
          id: storedId ?? null,
          name: storedName ?? null,
          schema: storedSchema,
        });
      }
      return;
    }

    // client_superadmin / client_contract_admin: fijar cliente desde JWT
    // (misma fuente que TopNavbar: currentKeyClient)
    if (isClientScoped) {
      const clientId = Array.isArray(currentClientId)
        ? currentClientId[0]
        : currentClientId;
      const clientName = Array.isArray(currentKeyClient)
        ? currentKeyClient[0]
        : currentKeyClient;

      if (clientId || clientName) {
        setSelectedClient({
          id: clientId ?? null,
          name: clientName ?? null,
          schema: null,
        });
      } else {
        setSelectedClient(null);
      }
      return;
    }

    // Otros roles: sin selección global
    setSelectedClient(null);
  }, [user, currentClientId, currentKeyClient, isSuperAdmin, isClientScoped]);

  // Sincronizar cualquier cambio hacia storage
  useEffect(() => {
    if (!selectedClient) {
      sessionStorage.removeItem("selected_client_id");
      sessionStorage.removeItem("selected_client_name");
      window.localStorage?.removeItem("selected_schema");
      return;
    }

    if (selectedClient.id != null) {
      sessionStorage.setItem(
        "selected_client_id",
        String(selectedClient.id),
      );
    }
    if (selectedClient.name != null) {
      sessionStorage.setItem("selected_client_name", selectedClient.name);
    }
    if (selectedClient.schema != null) {
      window.localStorage?.setItem(
        "selected_schema",
        String(selectedClient.schema),
      );
    }
  }, [selectedClient]);

  const clearSelection = () => {
    setSelectedClient(null);
  };

  return (
    <ClientSelectionContext.Provider
      value={{
        selectedClient,
        setSelectedClient,
        clearSelection,
      }}
    >
      {children}
    </ClientSelectionContext.Provider>
  );
};

export const useSelectedClient = () => {
  const ctx = useContext(ClientSelectionContext);
  if (!ctx) {
    throw new Error(
      "useSelectedClient debe usarse dentro de un ClientSelectionProvider",
    );
  }
  return ctx;
};
