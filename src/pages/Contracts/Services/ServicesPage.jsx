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

const ServicesPage = ({ id_client }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(SERVICE_CONFIG);
  
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
    { name: "Servicios", url: null }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cargar Servicios
      // Si hay id_client, idealmente filtraríamos por contratos de ese cliente, 
      // pero por ahora traemos todo o lo que permita el endpoint.
      const servicesRes = await ServiceService.getAll();
      
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
      setAlert({ 
        open: true, 
        message: "Error al cargar la lista de servicios.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }, [id_client]);

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
    setSelectedRow({ 
        id: row.id, 
        name: `${row["Torre"]} - ${row["Grupo"]}`, 
        state: true 
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await ServiceService.delete(data.id);
      setAlert({ open: true, message: "Servicio eliminado correctamente", type: "success" });
      setServices(prev => prev.filter(s => s.id !== data.id));
      setIsDeleteOpen(false);
    } catch (e) {
      console.error("Error al eliminar servicio:", e);
      setAlert({ open: true, message: "Error al eliminar el servicio", type: "error" });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <BreadCrumb paths={breadcrumbPaths} />
        </div>
        <Alerts 
          open={alert.open} 
          setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
          message={alert.message} 
          type={alert.type} 
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex gap-2 items-center">
                <InfoTooltip size="sm" message={getText("intros.services") || "Gestión de servicios contratados por torre y grupo"} sticky={true}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h1 className="text-2xl font-bold text-gray-800">Servicios Contratados</h1>
            </div>
            <p className="text-gray-500 text-sm">Detalle operativo de los servicios asociados a contratos.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Barra de acciones sobre la tabla */}
          <div className="flex flex-wrap items-center justify-center gap-3 px-4 pt-3 pb-2 border-b border-gray-100">
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
            />
          </div>

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
              onEdit={handleEdit}
              onSubmit={handleInlineEdit}
              onDelete={handleDeleteReq}
              onAdd={() => setIsAddOpen(true)}
              path="/contract/services/"
              rowsPerPage={10}
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
            active: true,
            charges_model: 1,
            currency: "USD",
            country: "Colombia"
          }}
        />

        <GenericEditModal 
          isOpen={isEditOpen} 
          setIsOpen={setIsEditOpen} 
          entityId={selectedId} 
          service={ServiceService} 
          config={dynamicConfig} 
          onSuccess={fetchData}
        />

        <ConfirmActionModal 
          isOpen={isDeleteOpen} 
          setIsOpen={setIsDeleteOpen} 
          data={selectedRow} 
          onConfirm={handleConfirmDelete}
          loading={deletingLoading}
          entityName={SERVICE_CONFIG.name}
        />
      </div>
  );
};

export default ServicesPage;
