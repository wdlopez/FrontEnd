import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddWorkOrderModal from '../../../components/organisms/Forms/AddWorkOrderModal';
import Alerts from '../../../components/molecules/Alerts';
import WorkOrderService from '../../../services/Contracts/WorkOrders/orders.service';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import { getText } from '../../../utils/text';
import { normalizeList } from '../../../utils/api-helpers';

const WorkOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Gestión", url: null },
    { name: "Órdenes de Trabajo", url: null }
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await WorkOrderService.getAllOrders();
      const rawList = normalizeList(response);

      const formattedOrders = rawList.map((o, i) => ({
        ...o,
        index: i + 1,
        // Formateo de fechas
        req_date_display: new Date(o.request_date).toLocaleDateString(),
        due_date_display: new Date(o.due_date).toLocaleDateString(),
        // Badges de estado
        status_display: getStatusBadge(o.status),
        // Truncar descripción
        desc_preview: o.description && o.description.length > 30 
          ? o.description.substring(0, 30) + '...' 
          : (o.description || '-')
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      setAlert({ open: true, message: "Error cargando órdenes de trabajo.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      canceled: 'bg-red-50 text-red-700 border-red-200'
    };
    
    const labels = {
      open: 'Abierta',
      in_progress: 'En Progreso',
      completed: 'Completada',
      canceled: 'Cancelada'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.open}`}>
        {labels[status] || status}
      </span>
    );
  };

  const columnMapping = {
    '#': 'index',
    'Título': 'title',
    'Estado': 'status_display',
    'Solicitud': 'req_date_display',
    'Vencimiento': 'due_date_display',
    'Descripción': 'desc_preview',
    // 'Asignado': 'assigned_to' // Podríamos mapear el ID a nombre si tuviéramos la lista de usuarios
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

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("intros.workOrders") || "Seguimiento operativo de requerimientos contractuales"}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Órdenes de Trabajo</h1>
          </div>
          <p className="text-gray-500 text-sm">Administre entregables, fechas y responsables por contrato.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-blue-600">settings_suggest</span>
            <p>Obteniendo órdenes...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={orders}
            columnMapping={columnMapping}
            actions={true}
            onEdit={(row) => console.log("Editar WO", row.id)}
            onSubmit={async ({ row, column, realColumn, newValue }) => {
              try {
                await WorkOrderService.update(row.id, { [realColumn]: newValue });
                setOrders(prev => prev.map(o => o.id === row.id ? { ...o, [column]: newValue } : o));
              } catch (e) { console.error(e); }
            }}
            onDelete={(row) => console.log("Eliminar WO", row.id)}
            rowsPerPage={10}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nueva Orden"
                showExport={true} 
                onRefresh={fetchOrders}
              />
            }
          />
        )}
      </div>

      <AddWorkOrderModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchOrders} 
      />
    </div>
  );
};

export default WorkOrdersPage;