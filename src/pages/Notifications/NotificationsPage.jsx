import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddNotificationModal from '../../components/organisms/Forms/AddNotificationModal';
import Alerts from '../../components/molecules/Alerts';
import NotificationService from '../../services/Notifications/notification.service';
import { useAuth } from "../../context/AuthContext";
import { useSelectedClient } from "../../context/ClientSelectionContext";
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';
import { normalizeList } from '../../utils/api-helpers';

const STATUS_MAP = {
  0: { label: '🔵 No leída', color: 'text-blue-600 font-bold' },
  1: { label: '⚪ Leída', color: 'text-gray-500' },
};

const TYPE_MAP = {
  'system': '⚙️ Sistema',
  'alert': '⚠️ Alerta',
  'reminder': '⏰ Recordatorio',
  'message': '✉️ Mensaje'
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const { user } = useAuth();
  const { selectedClient } = useSelectedClient();

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Sistema", url: null },
    { name: "Notificaciones", url: null }
  ];

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await NotificationService.getAllNotifications();
      const rawList = normalizeList(response);

      const role = user?.role || null;
      const isSuperAdmin =
        role === "super_admin" || role === 1 || role === "1";

      let filteredList = rawList;
      if (isSuperAdmin && selectedClient?.id) {
        const clientIdStr = String(selectedClient.id);
        filteredList = rawList.filter((notif) => {
          const notifClientId =
            notif.client_id || notif.clientId || notif.client?.id || null;
          return (
            notifClientId != null &&
            String(notifClientId) === clientIdStr
          );
        });
      }

      const formatted = filteredList.map((notif, i) => ({
        ...notif,
        index: i + 1,
        title_display: notif.notif_title,
        type_display: TYPE_MAP[notif.notif_type] || notif.notif_type,
        // Mostramos un resumen del mensaje si es muy largo
        message_display: notif.notif_message?.length > 40 
          ? `${notif.notif_message.substring(0, 40)}...` 
          : notif.notif_message,
        status_display: STATUS_MAP[notif.notif_status]?.label || `Desconocido (${notif.notif_status})`,
        date_display: new Date(notif.created_at).toLocaleString(),
        preference_display: notif.preference 
    ? `${notif.preference.days_limit} días` 
    : 'Sin regla'
      }));

      setNotifications(formatted);
    } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      setAlert({ open: true, message: "Error al cargar las notificaciones.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Título': 'title_display',
    'Tipo': 'type_display',
    'Mensaje': 'message_display',
    'Fecha': 'date_display',
    'Estado': 'status_display',
    'Regla (Días)': 'preference_display'
  };

  const handleDelete = async (row) => {
    try {
      await NotificationService.deleteNotification(row.id);
      setAlert({ open: true, message: "Notificación eliminada con éxito", type: "success" });
      fetchNotifications();
    } catch (error) {
        console.error("Error al eliminar notificación:", error);
      setAlert({ open: true, message: "No se pudo eliminar la notificación", type: "error" });
    }
  };

  const handleMarkAsRead = async (row) => {
    if (row.notif_status === 1) return; // Ya está leída
    try {
      await NotificationService.updateNotificationStatus(row.id, 1);
      setAlert({ open: true, message: "Marcada como leída", type: "success" });
      fetchNotifications();
    } catch (error) {
        console.error("Error al actualizar estado de notificación:", error);
      setAlert({ open: true, message: "Error al actualizar estado", type: "error" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("intros.notifications") || "Visualiza y administra las alertas y notificaciones enviadas a los usuarios del sistema."}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Centro de Notificaciones</h1>
          </div>
          <p className="text-gray-500 text-sm">Monitorea el envío de alertas y su estado de lectura.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando notificaciones...</div>
        ) : (
          <InteractiveTable 
            data={notifications}
            columnMapping={columnMapping}
            actions={true}
            onEdit={handleMarkAsRead} // Reutilizamos el botón de edición para marcar como leída
            onDelete={handleDelete}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nueva Notificación"
                onRefresh={fetchNotifications}
              />
            }
          />
        )}
      </div>

      <AddNotificationModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchNotifications} />
    </div>
  );
};

export default NotificationsPage;