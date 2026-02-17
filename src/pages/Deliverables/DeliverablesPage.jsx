import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddDeliverableModal from '../../components/organisms/Forms/AddDeliverableModal';
import Alerts from '../../components/molecules/Alerts';
import Tabs from '../../components/molecules/Tabs';
import DeliverablesSonPage from './DeliverablesSon/DeliverablesSonPage';
import DeliverablesSonResponsiblePage from './DeliverablesSonResponsible/DeliverablesSonResponsiblePage';
import DeliverableService from '../../services/Deliverables/deliverable.service';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';
import { normalizeList } from '../../utils/api-helpers';

const NAV_ITEMS = [
    { key: "deliverables", label: "Entregables" },
    { key: "deliverables-son", label: "Entregables Hijos" },
    { key: "deliverables-son-responsible", label: "Responsables de Sub-Entregables" },
];

const DeliverablesPage = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Entregables", url: null }
  ];

  const fetchDeliverables = async () => {
    setLoading(true);
    try {
      const response = await DeliverableService.getAllDeliverables();
      const rawList = normalizeList(response);

      const formatted = rawList.map((d, i) => ({
        ...d,
        index: i + 1,
        // Formateo visual
        priority_display: formatPriority(d.priority),
        status_display: formatStatus(d.status),
        due_date_formatted: d.due_date ? new Date(d.due_date).toLocaleDateString() : 'S/F',
        type_upper: d.type ? d.type.toUpperCase() : '-',
        // Preview de descripción
        desc_preview: d.description?.length > 40 ? `${d.description.substring(0, 40)}...` : d.description || '-'
      }));

      setDeliverables(formatted);
    } catch (error) {
      console.error("Error cargando entregables:", error);
      setAlert({ open: true, message: "Error al cargar los entregables.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Helpers visuales
  const formatPriority = (priority) => {
    const map = {
      low: '🔵 Baja',
      medium: '🟡 Media',
      high: '🟠 Alta',
      critical: '🔴 Crítica'
    };
    return map[priority] || priority;
  };

  const formatStatus = (status) => {
    const map = {
      pending: '⏳ Pendiente',
      in_progress: '🔨 En Progreso',
      completed: '✅ Completado',
      rejected: '❌ Rechazado'
    };
    return map[status] || status;
  };

  useEffect(() => { fetchDeliverables(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Código': 'deliverable_number',
    'Nombre': 'name',
    'Tipo': 'type_upper',
    'Frecuencia': 'frequency',
    'Prioridad': 'priority_display',
    'Fecha Límite': 'due_date_formatted',
    'Estado': 'status_display'
  };

  const handleDelete = async (row) => {
    // Aquí puedes implementar SweetAlert para confirmar antes de borrar
    if (window.confirm(`¿Eliminar el entregable ${row.deliverable_number}?`)) {
      try {
        await DeliverableService.deleteDeliverable(row.id);
        setAlert({ open: true, message: 'Entregable eliminado correctamente', type: 'success' });
        fetchDeliverables();
      } catch (error) {
        console.error("Error eliminando entregable:", error);
        setAlert({ open: true, message: 'No se pudo eliminar el entregable', type: 'error' });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
        message={alert.message} 
        type={alert.type} 
      />

      {activeTab === 'deliverables' ? (
      <>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("deliverablesIntro") || "Administre los entregables contractuales, fechas y responsables."}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Entregables (Deliverables)</h1>
          </div>
          <p className="text-gray-500 text-sm">Seguimiento de obligaciones, informes y fechas de cumplimiento.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><p>Cargando entregables...</p></div>
        ) : (
          <InteractiveTable 
            data={deliverables}
            columnMapping={columnMapping}
            actions={true}
            onEdit={(row) => console.log("Editar", row.id)} // Implementar modal de edición si es necesario
            onDelete={handleDelete}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nuevo Entregable"
                onRefresh={fetchDeliverables}
              />
            }
          />
        )}
      </div>

      <AddDeliverableModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchDeliverables} />
      </>
      ) : activeTab === 'deliverables-son' ? (
        <DeliverablesSonPage />
      ) : activeTab === 'deliverables-son-responsible' ? (
        <DeliverablesSonResponsiblePage />
      ) : null}
      
    </div>
  );
};

export default DeliverablesPage;