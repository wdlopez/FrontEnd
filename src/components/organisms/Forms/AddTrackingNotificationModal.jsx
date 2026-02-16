import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import TrackingNotificationService from "../../../services/Notifications/Tracking/tracking-notification.service";
import NotificationService from "../../../services/Notifications/notification.service";
import UserService from "../../../services/User/user.service";
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
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({ notifications: [], users: [] });

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        setLoadingOptions(true);
        try {
          const [resNotifs, resUsers] = await Promise.all([
            NotificationService.getAllNotifications(),
            UserService.getAllUsers(),
          ]);

          setOptions({
            notifications: normalizeList(resNotifs).map((n) => ({
              value: n.id,
              label: `${n.notif_title} (${n.id.substring(0, 5)}...)`,
            })),
            users: normalizeList(resUsers).map((u) => ({
              value: u.id,
              label: u.name || u.email || `Usuario ${u.id.substring(0, 8)}`,
            })),
          });
        } catch (error) {
          console.error("Error cargando dependencias de tracking:", error);
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
      name: "user_id",
      type: "select",
      label: "Usuario que realiza la acción *",
      options: options.users,
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
      placeholder: "Ej: El usuario abrió el enlace desde el móvil",
      fullWidth: true,
    },
  ];

  const handleCreateTracking = async (formData) => {
    setLoading(true);
    try {
      await TrackingNotificationService.createTrackingNotification(formData);
      Swal.fire("¡Éxito!", "Seguimiento registrado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || "Error al crear el tracking.";
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
          message={getText("formTrackingInfo") || "Registra manualmente o vía sistema la interacción del usuario con una notificación."}
        >
          <span className="material-symbols-outlined text-purple-500">analytics</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Registrar Seguimiento</h2>
      </div>

      {loadingOptions ? (
        <div className="py-10 text-center text-gray-500">Cargando datos...</div>
      ) : (
        <Form
          fields={trackingFields}
          onSubmit={handleCreateTracking}
          loading={loading}
          sendMessage="Registrar Acción"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddTrackingNotificationModal;