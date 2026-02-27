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

import SlaService from '../../services/Slas/sla.service';
import ContractService from '../../services/Contracts/contract.service';
import ServiceService from '../../services/Contracts/Services/service.service';
import MWindowService from '../../services/Slas/MeasurementWindows/mwindow.service';
import { useAuth } from "../../context/AuthContext";
import { useSelectedClient } from "../../context/ClientSelectionContext";

import { SLA_CONFIG } from '../../config/entities/sla.config';
import { mapBackendToTable } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';
import { getText } from '../../utils/text';

import MeasurementPage from './Measurement/MeasurementsPage';
import MeasurementWindowsPage from './MeasurementWindows/MeasurementWindowsPage';
import SlasCreditsPage from './Credits/SlasCreditsPage';

const NAV_ITEMS = [
    { key: 'slas', label: 'SLAs' },
    { key: 'measurement', label: 'Mediciones' },
    { key: 'measurement-windows', label: 'Ventanas de medición' },
    { key: 'slas-credits', label: 'Créditos SLA' }
];

const SlasPage = () => {
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(SLA_CONFIG);

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
    { name: "SLAs", url: null }
  ];

  const { user } = useAuth();
  const { selectedClient } = useSelectedClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cargar SLAs
      const slasRes = await SlaService.getAll();
      
      // 2. Cargar Relaciones (Contratos, Servicios, Ventanas de Medición)
      const [contractsRes, servicesRes, mWindowsRes] = await Promise.allSettled([
        ContractService.getAll(),
        ServiceService.getAll(),
        MWindowService.getAll()
      ]);

      const newConfig = { ...SLA_CONFIG, columns: [...SLA_CONFIG.columns] };
      
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

      let mWindowsList = [];
      if (mWindowsRes.status === "fulfilled") {
        mWindowsList = normalizeList(mWindowsRes.value);
        const mWindowCol = newConfig.columns.find(c => c.backendKey === 'mwindow_id');
        if (mWindowCol) {
            mWindowCol.options = mWindowsList.map(w => ({
                value: w.id,
                label: w.definition || `Ventana ${w.id}`
            }));
        }
      }

      // Mapear SLAs
      if (slasRes) {
        const rawList = normalizeList(slasRes);

        const role = user?.role || null;
        const isSuperAdmin =
          role === "super_admin" || role === 1 || role === "1";

        let filteredSlas = rawList;
        if (isSuperAdmin && selectedClient?.id) {
          const clientIdStr = String(selectedClient.id);
          filteredSlas = rawList.filter((s) => {
            const slaClientId =
              s.client_id || s.clientId || s.client?.id || null;
            return (
              slaClientId != null && String(slaClientId) === clientIdStr
            );
          });
        }

        const enrichedList = filteredSlas.map(s => {
            const contract = contractsList.find(c => c.id === s.contract_id);
            const service = servicesList.find(srv => srv.id === s.service_id);
            const mWindow = mWindowsList.find(w => w.id === s.mwindow_id);
            return {
                ...s,
                contract_name: contract ? (contract.contract_number || contract.name) : 'N/A',
                service_name: service ? (service.tower ? `${service.tower} - ${service.group}` : service.name) : 'N/A',
                mwindow_name: mWindow ? mWindow.definition : 'N/A'
            };
        });

        setSlas(mapBackendToTable(enrichedList, newConfig));
      }

      setDynamicConfig(newConfig);

    } catch (error) {
      console.error("Error cargando SLAs:", error);
      setAlert({ open: true, message: "Error al cargar los SLAs.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'slas') {
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
      await SlaService.update(row.id, { [realColumn]: newValue });
      setSlas(prev => prev.map(s =>
        s.id === row.id ? { ...s, [column]: newValue } : s
      ));
      setAlert({ open: true, message: 'Campo actualizado correctamente', type: 'success' });
    } catch (error) {
      console.error("Error actualizando campo:", error);
      setAlert({ open: true, message: 'No se pudo actualizar el campo', type: 'error' });
    }
  };

  const handleDeleteReq = (row) => {
    setSelectedRow({ 
        id: row.id, 
        name: row["Nombre"] || "SLA", 
        state: true 
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await SlaService.delete(data.id);
      setAlert({ open: true, message: 'SLA eliminado correctamente', type: 'success' });
      setSlas(prev => prev.filter(s => s.id !== data.id));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error eliminando SLA:", error);
      setAlert({ open: true, message: 'No se pudo eliminar el SLA', type: 'error' });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tabs y breadcrumb sobre el fondo gris general */}
      <div className="space-y-2">
        <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />
        <BreadCrumb paths={breadcrumbPaths} />

        {/* Solo el bloque del título tiene fondo blanco horizontal */}
        {activeTab === 'slas' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex gap-2 items-center">
                  <InfoTooltip size="sm" message={getText("intros.slas") || "Gestione los Acuerdos de Nivel de Servicio y sus métricas de cumplimiento"} sticky={true}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                  </InfoTooltip>
                  <h1 className="text-2xl font-bold text-gray-800">Service Level Agreements (SLA)</h1>
                </div>
                <p className="text-gray-500 text-sm">Configuración de métricas de rendimiento y calidad por servicio.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Alerts 
        open={alert.open} 
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
        message={alert.message} 
        type={alert.type} 
      />

      {activeTab === 'slas' ? (
      <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-blue-600">progress_activity</span>
            <p>Cargando SLAs...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={slas}
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={handleEdit}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteReq}
            onAdd={() => setIsAddOpen(true)}
            path="/contract/sla/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions
                AddComponent={
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Nuevo SLA</span>
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
        service={SlaService}
        config={dynamicConfig}
        onSuccess={fetchData}
        initialValues={{
          active: 1,
          type: 1,
          months_penality: 2,
          recargo_percentage: 0.5,
          risk: 10,
          report_period: 30
        }}
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={SlaService} 
        config={dynamicConfig} 
        onSuccess={fetchData}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        setIsOpen={setIsDeleteOpen} 
        data={selectedRow} 
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={SLA_CONFIG.name}
      />

      </>
      ) : activeTab === 'measurement' ? (
        <MeasurementPage />
      ) : activeTab === 'measurement-windows' ? (
        <MeasurementWindowsPage />
      ) : activeTab === 'slas-credits' ? (
        <SlasCreditsPage />
      ) : null}
      
    </div>
  );
};

export default SlasPage;
