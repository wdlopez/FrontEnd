import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import ViewEmailLogModal from '../../../components/organisms/Views/ViewEmailLogModal';
import EmailLogService from '../../../services/Reports/Emails/email-log.service'; 
import { normalizeList } from '../../../utils/api-helpers';
import Swal from 'sweetalert2';

const EmailLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Auditoría", url: null },
    { name: "Logs de Email", url: null }
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await EmailLogService.getAllEmailLogs();
      const rawList = normalizeList(response);

      const formatted = rawList.map((log) => ({
        ...log,
        status_badge: log.success ? '✅ Enviado' : '❌ Fallido',
        date_display: new Date(log.sent_at).toLocaleString(),
        subject_short: log.subject.length > 35 ? `${log.subject.substring(0, 35)}...` : log.subject
      }));

      setLogs(formatted);
    } catch (error) {
      console.error("Error cargando logs de email:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleDeleteLog = async (log) => {
    try {
      await EmailLogService.deleteEmailLog(log.id);
      Swal.fire("Eliminado", "El registro de auditoría ha sido borrado.", "success");
      fetchLogs();
    } catch (error) {
        console.error("Error al eliminar el registro:", error);
      Swal.fire("Error", "No se pudo eliminar el registro.", "error");
    }
  };

  const columnMapping = {
    'Fecha de Envío': 'date_display',
    'Destinatario': 'email_to',
    'Tipo': 'notif_type',
    'Asunto': 'subject_short',
    'Estado': 'status_badge'
  };

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logs de Notificaciones</h1>
          <p className="text-gray-500 text-sm">Historial de correos electrónicos salientes y estado de entrega.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Actualizar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 italic">Cargando registros...</div>
        ) : (
          <InteractiveTable 
            data={logs}
            columnMapping={columnMapping}
            actions={true}
            onEdit={handleViewDetail}
            onDelete={handleDeleteLog}
          />
        )}
      </div>

      <ViewEmailLogModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        logData={selectedLog} 
      />
    </div>
  );
};

export default EmailLogsPage;