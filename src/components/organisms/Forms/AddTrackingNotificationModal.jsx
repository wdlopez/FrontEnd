import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import TrackingNotificationService from "../../../services/Notifications/Tracking/tracking-notification.service";
import NotificationService from "../../../services/Notifications/notification.service";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const TRACKING_ACTIONS = [
  { value: "read", label: "Leída (Read)" },
  { value: "clicked", label: "Clic en Enlace (Clicked)" },
  { value: "dismissed", label: "Descartada (Dismissed)" },
  { value: "archived", label: "Archivada (Archived)" },
];

const AddTrackingNotificationModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const { user } = useAuth(); // Obtenemos el usuario de la sesión
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({ notifications: [] });

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        setLoadingOptions(true);
        try {
          // Solo cargamos las notificaciones, ya no necesitamos los usuarios
          const resNotifs = await NotificationService.getAllNotifications();

          setOptions({
            notifications: normalizeList(resNotifs).map((n) => ({
              value: n.id,
              label: `${n.notif_title} (${n.id.substring(0, 8)})`,
            })),
          });
        } catch (error) {
          console.error("Error cargando notificaciones para tracking:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchDependencies();
    }
  }, [isOpen]);

  const trackingFields = [
    {
      name: "notif_id",
      type: "select",
      label: "Notificación Original *",
      options: options.notifications,
      required: true,
    },
    {
      name: "action",
      type: "select",
      label: "Acción realizada *",
      options: TRACKING_ACTIONS,
      defaultValue: "read",
      required: true,
    },
    {
      name: "comment",
      type: "textarea",
      label: "Comentario/Observación",
      placeholder: "Ej: El usuario confirmó la lectura manualmente",
      fullWidth: true,
    },
  ];

  const handleCreateTracking = async (formData) => {
    setLoading(true);
    try {
      // Inyectamos el user_id del contexto directamente en el payload
      const payload = {
        ...formData,
        user_id: user?.id,
      };

      if (!payload.user_id) {
        throw new Error("Sesión no válida. No se encontró el ID del usuario.");
      }

      await TrackingNotificationService.createTrackingNotification(payload);
      
      Swal.fire("¡Éxito!", "Seguimiento registrado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Error al crear el tracking.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip
          size="sm"
          message={getText("modals.formTrackingInfo") || "Registra la interacción del usuario actual con una notificación."}
        >
          <span className="material-symbols-outlined text-purple-500">analytics</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Registrar Seguimiento</h2>
      </div>

      {/* Banner informativo del usuario actual */}
      <div className="mb-6 p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-600">account_circle</span>
          <span className="text-sm text-purple-800 font-medium">
            Acción realizada por: {user?.name || user?.email}
          </span>
        </div>
        <span className="text-[10px] bg-purple-200 text-purple-700 px-2 py-1 rounded-full uppercase font-bold">
          ID: {user?.id?.substring(0, 8)}
        </span>
      </div>

      {loadingOptions ? (
        <div className="py-10 text-center text-gray-500 italic">
          Cargando notificaciones disponibles...
        </div>
      ) : (
        <Form
          fields={trackingFields}
          onSubmit={handleCreateTracking}
          loading={loading}
          sendMessage="Guardar Seguimiento"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddTrackingNotificationModal;