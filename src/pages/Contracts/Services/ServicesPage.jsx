import React, { useEffect, useState, useCallback } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import Alerts from '../../../components/molecules/Alerts';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import GenericAddModal from '../../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../../components/organisms/Forms/ConfirmActionModal';

import ServiceService from '../../../services/Contracts/Services/service.service';
import ContractService from '../../../services/Contracts/contract.service';
import { SERVICE_CONFIG } from '../../../config/entities/service.config';
import { mapBackendToTable } from '../../../utils/entityMapper';
import { normalizeList } from '../../../utils/api-helpers';
import { getText } from '../../../utils/text';

const ServicesPage = ({ id_client, embedded = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(SERVICE_CONFIG);
  const [showInactive, setShowInactive] = useState(false);
  
  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info', title: '' });

  const showAlert = (type, message, title = "") => {
    setAlert({ open: true, message, type, title });
  };

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Servicios", url: null }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cargar Servicios
      // Si hay id_client, idealmente filtraríamos por contratos de ese cliente, 
      // pero por ahora traemos todo o lo que permita el endpoint.
      const params = { page: 1, limit: 100 };
      const servicesRes = showInactive
        ? await ServiceService.getAllDeleted(params)
        : await ServiceService.getAll(params);
      
      // 2. Cargar Contratos para el Select
      const contractsRes = await ContractService.getAll();

      // Configurar opciones de Contratos en el Config
      const newConfig = { ...SERVICE_CONFIG, columns: [...SERVICE_CONFIG.columns] };
      const contractCol = newConfig.columns.find(c => c.backendKey === 'contract_id');
      
      let contractsList = [];
      if (contractsRes) {
        contractsList = normalizeList(contractsRes);
        if (contractCol) {
            contractCol.options = contractsList.map(c => ({
                value: c.id,
                label: c.contract_number || c.keyName || `Contrato ${c.id}`
            }));
        }
      }

      // Mapear Servicios
      if (servicesRes) {
        const rawList = normalizeList(servicesRes);
        
        // Enriquecer datos si es necesario (ej: nombre del contrato)
        const enrichedList = rawList.map(s => {
            const contract = contractsList.find(c => c.id === s.contract_id);
            return {
                ...s,
                contract_name: contract ? (contract.contract_number || contract.keyName) : 'N/A'
            };
        });

        setServices(mapBackendToTable(enrichedList, newConfig));
      }

      setDynamicConfig(newConfig);

    } catch (error) {
      console.error("Error cargando servicios:", error);
      showAlert("error", "Error al cargar la lista de servicios.", "Error");
    } finally {
      setLoading(false);
    }
  }, [id_client, showInactive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mapeo de columnas para InteractiveTable
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach(col => {
    if (col.backendKey && !col.hiddenInTable) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await ServiceService.update(row.id, { [realColumn]: newValue });
      setServices(prev => prev.map(s =>
        s.id === row.id ? { ...s, [column]: newValue } : s
      ));
    } catch (error) {
      console.error("Error actualizando campo:", error);
    }
  };

  const handleEdit = (row) => {
    // Importante: El row trae los datos mapeados (nombres, fechas formateadas).
    // GenericEditModal usa 'entityId' para hacer un getById y obtener los datos crudos para el formulario.
    setSelectedId(row.id);
    setIsEditOpen(true);
  };

  const handleDeleteReq = (row) => {
    const towerLabel =
      row["Torre de servicio"] || row["Torre"] || row.tower || "";
    const groupLabel =
      row["Categoría de servicio"] || row["Grupo"] || row.group || "";

    setSelectedRow({ 
        id: row.id, 
        name: `${towerLabel || "Servicio"}${groupLabel ? ` - ${groupLabel}` : ""}`, 
        state: true 
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      if (showInactive) {
        await ServiceService.restore(data.id);
        setAlert({ open: true, message: "Servicio restaurado correctamente", type: "success", title: "Restaurado" });
      } else {
        await ServiceService.delete(data.id);
        setAlert({ open: true, message: "Servicio desactivado correctamente", type: "success", title: "Desactivado" });
      }
      await fetchData();
      setIsDeleteOpen(false);
    } catch (e) {
      console.error("Error al eliminar servicio:", e);
      showAlert("error", showInactive ? "Error al restaurar el servicio" : "Error al desactivar el servicio", "Error");
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
      <div className={`${embedded ? 'pt-0 px-4 pb-4' : 'p-4'} space-y-4`}>
        {/* Breadcrumb sobre el fondo gris general */}
        <div className="space-y-1">
          <BreadCrumb paths={breadcrumbPaths} />

          {/* Solo el bloque del título tiene fondo blanco horizontal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <div className="flex gap-2 items-center">
                    <InfoTooltip size="sm" message={getText("intros.services") || "Gestión de servicios contratados por torre y grupo"} sticky={true}>
                        <span className="material-symbols-outlined text-gray-400">info</span>
                    </InfoTooltip>
                    <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
                </div>
                <p className="text-gray-500 text-sm">Detalle operativo de los servicios asociados a contratos.</p>
              </div>
            </div>
          </div>
        </div>

        <Alerts 
          open={alert.open} 
          setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
          message={alert.message} 
          type={alert.type}
          title={alert.title}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
               <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-blue-600">progress_activity</span>
               <p>Cargando servicios...</p>
            </div>
          ) : (
            <InteractiveTable 
              data={services}
              columnMapping={columnMapping}
              selectColumns={selectColumns}
              nonEditableColumns={nonEditableColumns}
              onEdit={showInactive ? undefined : handleEdit}
              onSubmit={showInactive ? undefined : handleInlineEdit}
              onDelete={handleDeleteReq}
              onAdd={showInactive ? undefined : () => setIsAddOpen(true)}
              path="/contract/services/"
              rowsPerPage={10}
              hiddenColumns={showInactive ? ["Estado"] : []}
              rowActionsRenderer={
                showInactive
                  ? (row) => (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteReq(row)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Restaurar servicio"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            settings_backup_restore
                          </span>
                        </button>
                      </div>
                    )
                  : undefined
              }
              headerButtons={
                <HeaderActions
                  AddComponent={
                    <button
                      onClick={() => setIsAddOpen(true)}
                      className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                      <span>Nuevo Servicio</span>
                    </button>
                  }
                  showExport={true}
                  onRefresh={fetchData}
                  isActive={!showInactive}
                  onToggle={() => setShowInactive(prev => !prev)}
                />
              }
            />
          )}
        </div>

        {/* MODALES */}
        <GenericAddModal 
          isOpen={isAddOpen} 
          setIsOpen={setIsAddOpen} 
          service={ServiceService}
          config={dynamicConfig}
          onSuccess={fetchData}
          initialValues={{
            charges_model: 1,
            currency: "USD",
            country: "Colombia"
          }}
          getExtraPayload={() => ({ active: true })}
          onNotify={showAlert}
        />

        <GenericEditModal 
          isOpen={isEditOpen} 
          setIsOpen={setIsEditOpen} 
          entityId={selectedId} 
          service={ServiceService} 
          config={dynamicConfig} 
          onSuccess={fetchData}
          onNotify={showAlert}
        />

        <ConfirmActionModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        data={selectedRow}
        entityName={SERVICE_CONFIG.name}
        title={
          showInactive
            ? "Confirmar restauración"
            : "Confirmar desactivación"
        }
        message={
          selectedRow
            ? showInactive
              ? `¿Estás seguro de que deseas restaurar el ${SERVICE_CONFIG.name.toLowerCase()} "${selectedRow.name}"?`
              : `¿Estás seguro de que deseas desactivar el ${SERVICE_CONFIG.name.toLowerCase()} "${selectedRow.name}"?`
            : showInactive
              ? `¿Estás seguro de que deseas restaurar este ${SERVICE_CONFIG.name.toLowerCase()}?`
              : `¿Estás seguro de que deseas desactivar este ${SERVICE_CONFIG.name.toLowerCase()}?`
        }
        isDangerous={!showInactive}
        confirmLabel={showInactive ? "Restaurar" : "Desactivar"}
        />
      </div>
  );
};

export default ServicesPage;
