import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddTrackingNotificationModal from '../../../components/organisms/Forms/AddTrackingNotificationModal';
import Alerts from '../../../components/molecules/Alerts';
import TrackingNotificationService from '../../../services/Notifications/Tracking/tracking-notification.service';
import { normalizeList } from '../../../utils/api-helpers';

const ACTION_MAP = {
  'read': { label: '👀 Leída', style: 'text-blue-600' },
  'clicked': { label: '🖱️ Clic', style: 'text-green-600 font-bold' },
  'dismissed': { label: '🚫 Ignorada', style: 'text-gray-400' },
  'archived': { label: '📁 Archivada', style: 'text-purple-600' }
};

const TrackingNotificationPage = () => {
  const [trackingLogs, setTrackingLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Sistema", url: null },
    { name: "Auditoría de Notificaciones", url: null }
  ];

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const response = await TrackingNotificationService.getAllTrackingNotifications();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, i) => ({
        ...item,
        index: i + 1,
        notif_display: `Notif: ${item.notif_id.substring(0, 8)}`,
        user_display: `User: ${item.user_id.substring(0, 8)}`,
        action_display: ACTION_MAP[item.action]?.label || item.action,
        date_display: item.tracked_at ? new Date(item.tracked_at).toLocaleString() : 'N/A',
        comment_display: item.comment || '---'
      }));

      setTrackingLogs(formatted);
    } catch (error) {
        console.error("Error fetching tracking notifications:", error);
      setAlert({ open: true, message: "Error al cargar el historial de tracking.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTracking(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Notificación': 'notif_display',
    'Usuario': 'user_display',
    'Acción': 'action_display',
    'Fecha': 'date_display',
    'Comentario': 'comment_display'
  };

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tracking de Notificaciones</h1>
          <p className="text-gray-500 text-sm">Historial de interacciones de los usuarios con el sistema de alertas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando historial de seguimiento...</div>
        ) : (
          <InteractiveTable 
            data={trackingLogs}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              await TrackingNotificationService.deleteTrackingNotification(row.id);
              fetchTracking();
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Registrar Acción"
                onRefresh={fetchTracking}
              />
            }
          />
        )}
      </div>

      <AddTrackingNotificationModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchTracking} 
      />
    </div>
  );
};

export default TrackingNotificationPage;