import React, { useEffect, useState, useRef } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddClientModal from '../../components/organisms/Forms/AddClientModal';
import ConfirmActionModal from '../../components/organisms/Forms/ConfirmActionModal'; // Nuevo componente
import GenericEditModal from '../../components/organisms/Forms/GenericEditModal';   // Nuevo componente
import Alerts from '../../components/molecules/Alerts';
import ClientService from '../../services/Clients/client.service';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';
import { CLIENT_CONFIG } from '../../config/entities/client.config';
import { mapBackendToTable, mapTableToBackend } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';

const ClientsPage = () => {
  // --- Estados ---
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Estado para modal de edición
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState(null); // Para eliminar
  const [editClientId, setEditClientId] = useState(null);     // Para editar
  
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  // Breadcrumb
  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Clientes", url: null }
  ];

  const hasInitialized = useRef(false);

  // --- Carga de Datos ---
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await ClientService.getAll();
      const dataList = normalizeList(response);
      const formattedClients = mapBackendToTable(dataList, CLIENT_CONFIG);
      setClients(formattedClients);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setAlert({ open: true, message: "No se pudieron cargar los clientes.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchClients();
    }
  }, []);

  // --- Manejadores ---

  // 1. Edición vía Modal
  const openEditModal = (row) => {
    if (row?.id) {
      setEditClientId(row.id);
      setIsEditModalOpen(true);
    }
  };

  // 3. Eliminación
  const handleDeleteRequest = (row) => {
    if (row?.id) {
      setSelectedClient({
        id: row.id,
        name: row['NOMBRE'] || 'Sin nombre',
        state: true, // true indica intención de eliminar
      });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await ClientService.delete(data.id);
      setAlert({ open: true, message: 'Cliente eliminado exitosamente', type: 'success' });
      setClients(prev => prev.filter(c => c.id !== data.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error eliminando:", error);
      setAlert({ open: true, message: 'Error al eliminar', type: 'error' });
    } finally {
      setDeletingLoading(false);
    }
  };

  // --- Configuración de Tabla ---
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  CLIENT_CONFIG.columns.forEach(col => {
    if (col.backendKey) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />
      
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert(prev => ({ ...prev, open: val }))} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("clientsIntro")} sticky={true}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de {CLIENT_CONFIG.name}s</h1>
          </div>
          <p className="text-gray-500 text-sm">Administra la base de datos centralizada.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            <p className="mt-2">Cargando información...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={clients}
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={openEditModal} 
            onDelete={handleDeleteRequest}
            onAdd={() => setIsAddModalOpen(true)}
            path="/client/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsAddModalOpen(true)}
                addButtonLabel={`Nuevo ${CLIENT_CONFIG.name}`}
                showExport={true} 
                onRefresh={fetchClients}
              />
            }
          />
        )}
      </div>

      {/* Modal de Creación (Específico o Genérico si lo refactorizas luego) */}
      <AddClientModal 
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        onSuccess={fetchClients}
      />

      {/* Modal Genérico de Edición */}
      <GenericEditModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        entityId={editClientId}
        service={ClientService} // Pasamos el servicio
        config={CLIENT_CONFIG}  // Pasamos la config
        onSuccess={fetchClients}
      />

      {/* Modal Genérico de Confirmación */}
      <ConfirmActionModal 
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        data={selectedClient}
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={CLIENT_CONFIG.name}
      />
    </div>
  );
};

export default ClientsPage;