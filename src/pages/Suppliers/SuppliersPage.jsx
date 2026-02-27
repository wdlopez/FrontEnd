import React, { useEffect, useState, useRef } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import ConfirmActionModal from '../../components/organisms/Forms/ConfirmActionModal';
import GenericEditModal from '../../components/organisms/Forms/GenericEditModal';
import GenericAddModal from '../../components/organisms/Forms/GenericAddModal';
import Alerts from '../../components/molecules/Alerts';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import ProviderService from '../../services/Providers/provider.service';
import { PROVIDER_CONFIG } from '../../config/entities/provider.config';
import { mapBackendToTable } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';
import { getText } from '../../utils/text';

const SuppliersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estados de selección
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [editProviderId, setEditProviderId] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const hasInitialized = useRef(false);

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Gestión Integral", url: "/suppliers" },
    { name: "Proveedores", url: null }
  ];

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ProviderService.getAll();
      const dataList = normalizeList(response);
      
      // Usamos el mapper genérico con la configuración de proveedores
      const formattedProviders = mapBackendToTable(dataList, PROVIDER_CONFIG);
      setProviders(formattedProviders);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setAlert({ open: true, message: "Error al cargar los proveedores", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchData();
    }
  }, []);

  // Acciones de Tabla
  const openEditModal = (row) => {
    if (row?.id) {
      setEditProviderId(row.id);
      setIsEditModalOpen(true);
    }
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await ProviderService.update(row.id, { [realColumn]: newValue });
      setProviders(prev => prev.map(p =>
        p.id === row.id ? { ...p, [column]: newValue } : p
      ));
    } catch (error) {
      console.error("Error actualizando campo:", error);
    }
  };

  const handleDeleteRequest = (row) => {
    if (row?.id) {
      setSelectedProvider({
        id: row.id,
        name: row['Razón Social'] || row['legal_name'] || 'Proveedor',
        state: true, // Indica que es para eliminar (dar de baja)
      });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await ProviderService.delete(data.id);
      setAlert({ open: true, message: 'Proveedor eliminado correctamente', type: 'success' });
      fetchData(); // Recargar lista
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
      setAlert({ open: true, message: 'No se pudo eliminar el proveedor', type: 'error' });
    } finally {
      setDeletingLoading(false);
    }
  };

  // Mapeos automáticos para InteractiveTable desde PROVIDER_CONFIG
  const columnMapping = {};
  PROVIDER_CONFIG.columns.forEach(col => {
    if (col.backendKey) columnMapping[col.header] = col.backendKey;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <BreadCrumb paths={breadcrumbPaths} />
      </div>
      
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert(prev => ({ ...prev, open: val }))} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("intros.providers")} sticky={true}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de {PROVIDER_CONFIG.name}es</h1>
          </div>
          <p className="text-gray-500 text-sm">Administra la base de datos de tus aliados estratégicos.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            <p className="mt-2">Cargando proveedores...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={providers}
            config={PROVIDER_CONFIG}
            columnMapping={columnMapping}
            onEdit={openEditModal}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteRequest}
            onAdd={() => setIsAddModalOpen(true)}
            path="/suppliers/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions
                AddComponent={
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Nuevo {PROVIDER_CONFIG.name}</span>
                  </button>
                }
                showExport={true}
                onRefresh={fetchData}
              />
            }
          />
        )}
      </div>

      {/* MODALES GENÉRICOS */}
      <GenericAddModal 
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        service={ProviderService}
        config={PROVIDER_CONFIG}
        onSuccess={fetchData}
      />

      <GenericEditModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        entityId={editProviderId}
        service={ProviderService}
        config={PROVIDER_CONFIG}
        onSuccess={fetchData}
      />

      <ConfirmActionModal 
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        data={selectedProvider}
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={PROVIDER_CONFIG.name}
      />
    </div>
  );
};

export default SuppliersPage;