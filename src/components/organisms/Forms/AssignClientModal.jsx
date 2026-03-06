import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal"; // Tu componente base de Modal
import ClientService from "../../../services/Clients/client.service";
import UserClientService from "../../../services/Clients/user-clients.service";
import { normalizeList } from "../../../utils/api-helpers";

// Extracción robusta de id/name por si el backend usa ClientEntity_id, etc.
const getClientId = (c) => c?.id ?? c?.ClientEntity_id ?? c?.uuid ?? "";
const getClientName = (c) => c?.name ?? c?.ClientEntity_name ?? "";

const AssignClientModal = ({
  isOpen,
  setIsOpen,
  predefinedUserId,
  predefinedUserName,
  onSuccess,
  defaultClientId,
  defaultClientName,
  lockClient = false,
  onNotify,
}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    userId: predefinedUserId || "",
    clientId: "",
    isPrincipal: false
  });

  // Resetear formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      setFormData({ userId: "", clientId: "", isPrincipal: false });
    }
  }, [isOpen]);

  // Cargar lista de clientes al abrir y preseleccionar cliente cuando aplica
  useEffect(() => {
    if (!isOpen) return;

    const loadAndPreselect = async () => {
      try {
        const response = await ClientService.getAll();
        const normalizedData = normalizeList(response);
        let list = Array.isArray(normalizedData) ? normalizedData : [];

        // Si viene un cliente fijo (ej. desde token de client_superadmin),
        // limitamos la lista a ese cliente.
        if (defaultClientId && lockClient && defaultClientId !== "*") {
          const filtered = list.filter((c) => getClientId(c) === defaultClientId);
          // Si el filtro no encuentra coincidencia (ej. API usa otra estructura),
          // añadimos opción sintética con el nombre del JWT (key_client)
          if (filtered.length === 0 && defaultClientName) {
            list = [{ id: defaultClientId, name: defaultClientName }];
          } else {
            list = filtered;
          }
        }

        setClients(list);

        // Preseleccionar userId y clientId después de cargar (evita race condition)
        setFormData((prev) => ({
          ...prev,
          userId: predefinedUserId || prev.userId,
          clientId: defaultClientId && defaultClientId !== "*" ? defaultClientId : prev.clientId,
        }));
      } catch (error) {
        console.error("Error cargando clientes", error);
      }
    };

    loadAndPreselect();
  }, [isOpen, predefinedUserId, defaultClientId, defaultClientName, lockClient]);

  const handleClientChange = (e) => {
    const selectedId = e.target.value;

    setFormData({
      ...formData,
      clientId: selectedId,
      // Aquí capturamos el nombre automáticamente para cumplir con el DTO 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.userId) {
      onNotify?.("warning", "Debes seleccionar un cliente", "Error");
      return;
    }

    setLoading(true);
    try {
      await UserClientService.create(formData);
      onNotify?.(
        "success",
        "El usuario ha sido vinculado al cliente correctamente.",
        "¡Asignado!"
      );
      setIsOpen(false);
      setFormData({ userId: "", clientId: "", isPrincipal: false });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      onNotify?.("error", "No se pudo crear la relación", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} setOpen={setIsOpen} title="Asignar Cliente a Usuario">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Asignar cliente para: <span className="text-blue-600">{predefinedUserName}</span>
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Selector de Clientes */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Cliente *</label>
            <select
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.clientId}
              onChange={handleClientChange}
              required
              disabled={lockClient}
            >
              <option value="">Seleccione un cliente...</option>
              {(clients || []).map((client) => {
                const cId = getClientId(client);
                return (
                  <option key={cId} value={cId}>
                    {getClientName(client) || cId}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Checkbox Principal */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isPrincipal"
              checked={formData.isPrincipal}
              onChange={(e) => setFormData({...formData, isPrincipal: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPrincipal" className="text-sm text-gray-700">
              Es el cliente principal de este usuario
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Omitir
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Relación"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AssignClientModal;