import React, { useEffect, useState, useCallback } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import Alerts from '../../components/molecules/Alerts';
import Tabs from '../../components/molecules/Tabs';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import GenericAddModal from '../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../components/organisms/Forms/ConfirmActionModal';

import DeliverablesSonPage from './DeliverablesSon/DeliverablesSonPage';
import DeliverablesSonResponsiblePage from './DeliverablesSonResponsible/DeliverablesSonResponsiblePage';

import DeliverableService from '../../services/Deliverables/deliverable.service';
import ContractService from '../../services/Contracts/contract.service';
import ServiceService from '../../services/Contracts/Services/service.service';
import { useAuth } from "../../context/AuthContext";
import { useSelectedClient } from "../../context/ClientSelectionContext";

import { DELIVERABLE_CONFIG } from '../../config/entities/deliverable.config';
import { mapBackendToTable } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';
import { getText } from '../../utils/text';

const NAV_ITEMS = [
    { key: "deliverables", label: "Entregables" },
    { key: "deliverables-son", label: "Entregables Hijos" },
    { key: "deliverables-son-responsible", label: "Responsables de Sub-Entregables" },
];

const DeliverablesPage = () => {
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(DELIVERABLE_CONFIG);

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Entregables", url: null }
  ];

  const { user } = useAuth();
  const { selectedClient } = useSelectedClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cargar Entregables
      const deliverablesRes = await DeliverableService.getAll();
      
      // 2. Cargar Contratos y Servicios para los Selects y Mapeo
      const [contractsRes, servicesRes] = await Promise.allSettled([
        ContractService.getAll(),
        ServiceService.getAll()
      ]);

      const newConfig = { ...DELIVERABLE_CONFIG, columns: [...DELIVERABLE_CONFIG.columns] };
      
      let contractsList = [];
      if (contractsRes.status === "fulfilled") {
        contractsList = normalizeList(contractsRes.value);
        const contractCol = newConfig.columns.find(c => c.backendKey === 'contract_id');
        if (contractCol) {
            contractCol.options = contractsList.map(c => ({
                value: c.id,
                label: c.contract_number || c.name || `Contrato ${c.id}`
            }));
        }
      }

      let servicesList = [];
      if (servicesRes.status === "fulfilled") {
        servicesList = normalizeList(servicesRes.value);
        const serviceCol = newConfig.columns.find(c => c.backendKey === 'service_id');
        if (serviceCol) {
            serviceCol.options = servicesList.map(s => ({
                value: s.id,
                label: s.tower ? `${s.tower} - ${s.group}` : (s.name || `Servicio ${s.id}`)
            }));
        }
      }

      // Mapear Entregables
      if (deliverablesRes) {
        const rawList = normalizeList(deliverablesRes);

        const role = user?.role || null;
        const isSuperAdmin =
          role === "super_admin" || role === 1 || role === "1";

        let filteredDeliverables = rawList;
        if (isSuperAdmin && selectedClient?.id) {
          const clientIdStr = String(selectedClient.id);
          filteredDeliverables = rawList.filter((d) => {
            const delClientId =
              d.client_id || d.clientId || d.client?.id || null;
            return (
              delClientId != null && String(delClientId) === clientIdStr
            );
          });
        }

        // Enriquecer datos con nombres de contrato y servicio
        const enrichedList = filteredDeliverables.map(d => {
            const contract = contractsList.find(c => c.id === d.contract_id);
            const service = servicesList.find(s => s.id === d.service_id);
            return {
                ...d,
                contract_name: contract ? (contract.contract_number || contract.name) : 'N/A',
                service_name: service ? (service.tower ? `${service.tower} - ${service.group}` : service.name) : 'N/A'
            };
        });

        setDeliverables(mapBackendToTable(enrichedList, newConfig));
      }

      setDynamicConfig(newConfig);

    } catch (error) {
      console.error("Error cargando entregables:", error);
      setAlert({ open: true, message: "Error al cargar los entregables.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'deliverables') {
        fetchData();
    }
  }, [activeTab, fetchData]);

  // Mapeo de columnas para InteractiveTable
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach(col => {
    if (col.backendKey && !col.hiddenInTable) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setIsEditOpen(true);
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await DeliverableService.update(row.id, { [realColumn]: newValue });
      setDeliverables(prev => prev.map(d =>
        d.id === row.id ? { ...d, [column]: newValue } : d
      ));
    } catch (error) {
      console.error("Error actualizando campo:", error);
    }
  };

  const handleDeleteReq = (row) => {
    setSelectedRow({ 
        id: row.id, 
        name: row["Código"] || row["Nombre"] || "Entregable", 
        state: true 
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await DeliverableService.delete(data.id);
      setAlert({ open: true, message: 'Entregable eliminado correctamente', type: 'success' });
      setDeliverables(prev => prev.filter(d => d.id !== data.id));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error eliminando entregable:", error);
      setAlert({ open: true, message: 'No se pudo eliminar el entregable', type: 'error' });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />
        <BreadCrumb paths={breadcrumbPaths} />
      </div>
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
            <InfoTooltip size="sm" message={getText("intros.deliverables") || "Administre los entregables contractuales, fechas y responsables."} sticky={true}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Entregables (Deliverables)</h1>
          </div>
          <p className="text-gray-500 text-sm">Seguimiento de obligaciones, informes y fechas de cumplimiento.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-blue-600">progress_activity</span>
            <p>Cargando entregables...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={deliverables}
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={handleEdit}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteReq}
            onAdd={() => setIsAddOpen(true)}
            path="/contract/deliverables/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions
                AddComponent={
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Nuevo Entregable</span>
                  </button>
                }
                showExport={true}
                onRefresh={fetchData}
              />
            }
          />
        )}
      </div>

      {/* MODALES */}
      <GenericAddModal 
        isOpen={isAddOpen} 
        setIsOpen={setIsAddOpen} 
        service={DeliverableService}
        config={dynamicConfig}
        onSuccess={fetchData}
        initialValues={{
          status: "pending",
          active: true,
          priority: "medium",
          type: "report",
          frequency: "monthly",
          penalty: false,
          value_penalty: 0,
          punctuality: "A tiempo"
        }}
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={DeliverableService} 
        config={dynamicConfig} 
        onSuccess={fetchData}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        setIsOpen={setIsDeleteOpen} 
        data={selectedRow} 
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={DELIVERABLE_CONFIG.name}
      />

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
