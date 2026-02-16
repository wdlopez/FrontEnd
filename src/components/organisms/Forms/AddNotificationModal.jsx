import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import NotificationService from "../../../services/Notifications/notification.service";
import UserService from "../../../services/User/user.service";
import PreferenceService from "../../../services/Notifications/Preferences/preference.service";
import ContractService from "../../../services/Contracts/contract.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const NOTIF_TYPES = [
  { value: "system", label: "Sistema" },
  { value: "alert", label: "Alerta" },
  { value: "reminder", label: "Recordatorio" },
  { value: "message", label: "Mensaje" },
];

const ENTITY_TYPES = [
  { value: "", label: "Ninguna (Notificación general)" },
  { value: "Contract", label: "Contrato" },
  { value: "User", label: "Usuario" },
];

const NOTIF_STATUS = [
  { value: 0, label: "No leída (0)" },
  { value: 1, label: "Leída (1)" },
];

const AddNotificationModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({ users: [], preferences: [], contracts: [], dynamicEntities: []});
  const [selectedEntityType, setSelectedEntityType] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        setLoadingOptions(true);
        try {
          // Asumiendo que UserService.getAllUsers() existe para obtener a quién notificar
          const [resUsers, resPrefs, resContracts] = await Promise.all([
            UserService.getAllUsers(),
            PreferenceService.getAllPreferences(),
            ContractService.getAllContracts()
          ]);
          
          setOptions({
            users: normalizeList(resUsers).map(u => ({ 
              value: u.id, 
              label: u.name || u.email || `Usuario ${u.id.substring(0,8)}` 
            })),
            // Mapeamos las preferencias para que el usuario vea algo útil (ej. el límite de días)
            preferences: normalizeList(resPrefs).map(p => ({
              value: p.id,
              label: `Límite: ${p.days_limit} días (Contrato: ${p.cont_id.substring(0,5)}...)`
            })),
          contracts: normalizeList(resContracts).map(c => ({
              value: c.id,
              label: c.contract_number || `Contrato ${c.id.substring(0,8)}`
            })),
            dynamicEntities: []
          });
          
        } catch (error) {
          console.error("Error cargando usuarios:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchDependencies();
    }
  }, [isOpen]);

  useEffect(() => {
    let newOptions = [];
    if (selectedEntityType === "Contract") {
      newOptions = options.contracts;
    } else if (selectedEntityType === "User") {
      newOptions = options.users;
    }
    setOptions(prev => ({ ...prev, dynamicEntities: newOptions }));
  }, [selectedEntityType, options.contracts, options.users]);

 const notificationFields = [
    { name: "notif_title", type: "text", label: "Título *", placeholder: "Ej: Vencimiento de Contrato", required: true },
    { name: "notif_type", type: "select", label: "Tipo *", options: NOTIF_TYPES, defaultValue: "system", required: true },
    { name: "user_id", type: "select", label: "Usuario Destino *", options: options.users, required: true },
    { 
      name: "days_limit_id", 
      type: "select", 
      label: "Preferencia Aplicada *", 
      options: options.preferences, 
      required: true 
    },
    { 
        name: "assigned_entity_type", 
        type: "select", 
        label: "Vincular a...", 
        options: ENTITY_TYPES,
        onChange: (e) => setSelectedEntityType(e.target.value) 
    },
    { 
        name: "assigned_entity_id", 
        type: "select", 
        label: "Registro Específico", 
        options: options.dynamicEntities,
        disabled: !selectedEntityType 
    },
    { name: "current_days_limit", type: "number", label: "Días actuales de la alerta", placeholder: "Ej: 3" },
    { name: "notif_status", type: "select", label: "Estado Inicial", options: NOTIF_STATUS, defaultValue: 0 },
    { name: "notif_message", type: "textarea", label: "Mensaje de la notificación *", fullWidth: true, required: true },
  ];

  const handleCreateNotification = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        notif_status: parseInt(formData.notif_status, 10),
        current_days_limit: formData.current_days_limit ? parseInt(formData.current_days_limit, 10) : undefined,
      };

    if (!payload.assigned_entity_id || payload.assigned_entity_id === "") {
        delete payload.assigned_entity_id;
        delete payload.assigned_entity_type;
      }

      // Conversión de tipos de datos
      payload.notif_status = parseInt(payload.notif_status, 10);
      if (payload.current_days_limit) {
        payload.current_days_limit = parseInt(payload.current_days_limit, 10);
      }

      await NotificationService.createNotification(payload);

      Swal.fire("¡Éxito!", "Notificación enviada correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || "Ocurrió un error al crear la notificación.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formNotifInfo") || "Crea notificaciones manuales para alertar a usuarios específicos sobre eventos del sistema."}>
          <span className="material-symbols-outlined text-gray-400">notifications</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Notificación</h2>
      </div>

      {loadingOptions ? (
        <div className="py-10 text-center text-gray-500">Cargando usuarios...</div>
      ) : (
        <Form
          fields={notificationFields}
          onSubmit={handleCreateNotification}
          loading={loading}
          sendMessage="Enviar Notificación"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddNotificationModal;