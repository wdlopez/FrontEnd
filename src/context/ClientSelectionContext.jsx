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
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState(null);

  // Cargar selección previa desde storage (solo para super_admin)
  useEffect(() => {
    const role = user?.role;
    const isSuperAdmin =
      role === "super_admin" || role === 1 || role === "1";

    if (!isSuperAdmin) {
      // Para otros roles, no usamos selección global de cliente
      setSelectedClient(null);
      return;
    }

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
  }, [user]);

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
