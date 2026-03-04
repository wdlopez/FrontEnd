import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import ConfirmActionModal from '../../components/organisms/Forms/ConfirmActionModal';
import GenericEditModal from '../../components/organisms/Forms/GenericEditModal';
import GenericAddModal from '../../components/organisms/Forms/GenericAddModal';
import Alerts from '../../components/molecules/Alerts';
import ClientService from '../../services/Clients/client.service';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';
import { CLIENT_CONFIG } from '../../config/entities/client.config';
import { mapBackendToTable } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';

const ClientsPage = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [rawClients, setRawClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [editClientId, setEditClientId] = useState(null);
  
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState("delete"); // 'delete' | 'restore'
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });
  const [showInactive, setShowInactive] = useState(false);

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Clientes", url: null }
  ];

  const hasInitialized = useRef(false);

  const fetchClients = async (showDeleted = showInactive) => {
    setLoading(true);
    try {
      const response = showDeleted
        ? await ClientService.getAllDeleted()
        : await ClientService.getAll();
      const dataList = normalizeList(response);
      setRawClients(dataList);
      const formattedClients = mapBackendToTable(dataList, CLIENT_CONFIG);
      setClients(formattedClients);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setAlert({ open: true, message: "No se pudieron cargar los clientes.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Cargar la primera vez
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchClients(showInactive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refrescar cuando cambia el filtro de activos/inactivos
  useEffect(() => {
    if (hasInitialized.current) {
      fetchClients(showInactive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  const openEditModal = (row) => {
    if (row?.id) {
      setEditClientId(row.id);
      setIsEditModalOpen(true);
    }
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await ClientService.update(row.id, { [realColumn]: newValue });
      setClients(prev => prev.map(c =>
        c.id === row.id ? { ...c, [column]: newValue } : c
      ));
      setAlert({ open: true, message: 'Campo actualizado correctamente', type: 'success' });
    } catch (error) {
      console.error("Error actualizando campo:", error);
      setAlert({ open: true, message: 'No se pudo actualizar el campo', type: 'error' });
    }
  };

  const handleDeleteRequest = (row, { isDeleted } = {}) => {
    if (row?.id) {
      const action = isDeleted ? "restore" : "delete";
      setSelectedAction(action);
      setSelectedClient({
        id: row.id,
        name:
          row["Nombre del cliente"] ||
          row["NOMBRE"] ||
          row["name"] ||
          "Sin nombre",
      });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedClient?.id) return;
    setDeletingLoading(true);
    try {
      if (selectedAction === "restore") {
        await ClientService.restore(selectedClient.id);
        setAlert({
          open: true,
          message: "Cliente restaurado correctamente",
          type: "success",
        });
      } else {
        await ClientService.delete(selectedClient.id);
        setAlert({
          open: true,
          message: "Cliente desactivado correctamente",
          type: "success",
        });
      }
      await fetchClients(showInactive);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error eliminando:", error);
      setAlert({
        open: true,
        message:
          selectedAction === "restore"
            ? "No se pudo restaurar el cliente"
            : "No se pudo desactivar el cliente",
        type: "error",
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  CLIENT_CONFIG.columns.forEach(col => {
    if (col.backendKey) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const handleClientCreated = (response) => {
    // Refrescamos la tabla de clientes
    fetchClients();

    // Intentamos extraer el objeto de datos de la respuesta
    const data = response?.data || response;

    // Heurísticas para obtener id y nombre del cliente
    let clientId = data?.id || data?.clientId || data?.ClientEntity_id;
    let clientName = data?.name || data?.ClientEntity_name;

    if (Array.isArray(data) && data.length > 0) {
      clientId = clientId || data[0]?.id || data[0]?.clientId || data[0]?.ClientEntity_id;
      clientName = clientName || data[0]?.name || data[0]?.ClientEntity_name;
    }

    if (clientId && clientName) {
      // Toast guiado hacia la creación del administrador
      Swal.fire({
        title: "Client created! Now, let's assign an Administrator.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      const searchParams = new URLSearchParams({
        action: "create_admin",
        clientId: String(clientId),
        clientName: clientName,
      });

      // Ruta real del listado de usuarios protegida en App.jsx
      navigate(`/settings/userNroles?${searchParams.toString()}`);
    } else {
      console.warn("No se pudo obtener el ID o el nombre del cliente desde la respuesta:", response);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb como antes, sobre el fondo gris general */}
      <div className="space-y-1">
        <BreadCrumb paths={breadcrumbPaths} />

        {/* Solo la franja del título tiene fondo blanco horizontal (InfoTooltip + título + descripción) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="flex gap-2 items-center">
                <InfoTooltip size="sm" message={getText("intros.clients")} sticky={true}>
                  <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de {CLIENT_CONFIG.name}s</h1>
              </div>
              <p className="text-gray-500 text-sm mt-1">Administra la base de datos centralizada.</p>
            </div>
          </div>
        </div>
      </div>

      <Alerts
        open={alert.open} 
        setOpen={(val) => setAlert(prev => ({ ...prev, open: val }))} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            <p className="mt-2">Cargando información...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={clients}
            originData={rawClients}
            parameterId="id"
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={openEditModal}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteRequest}
            onAdd={() => setIsAddModalOpen(true)}
            path="/client/"
            rowsPerPage={10}
            hiddenColumns={showInactive ? ["Estado"] : []}
            rowActionsRenderer={
              showInactive
                ? (row) => (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(row, { isDeleted: true })}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Restaurar"
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
                onAdd={() => setIsAddModalOpen(true)}
                addButtonLabel={`Nuevo ${CLIENT_CONFIG.name}`}
                isActive={!showInactive}
                onToggle={() => setShowInactive((prev) => !prev)}
                showExport={true}
                onRefresh={() => fetchClients(showInactive)}
              />
            }
          />
        )}
      </div>

      {/* Modal de Creación (Específico o Genérico si lo refactorizas luego) */}
      <GenericAddModal 
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        service={ClientService}
        config={CLIENT_CONFIG}
        onSuccess={handleClientCreated}
      />

      {/* Modal Genérico de Edición */}
      <GenericEditModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        entityId={editClientId}
        service={ClientService}
        config={CLIENT_CONFIG}
        onSuccess={fetchClients}
      />

      {/* Modal Genérico de Confirmación */}
      <ConfirmActionModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          selectedAction === "restore"
            ? "Confirmar restauración"
            : "Confirmar desactivación"
        }
        message={
          selectedAction === "restore"
            ? `¿Estás seguro de que deseas restaurar el ${CLIENT_CONFIG.name.toLowerCase()} "${selectedClient?.name || "sin nombre"}"?`
            : `¿Estás seguro de que deseas desactivar el ${CLIENT_CONFIG.name.toLowerCase()} "${selectedClient?.name || "sin nombre"}"?`
        }
        isDangerous={selectedAction !== "restore"}
        confirmLabel={selectedAction === "restore" ? "Restaurar" : "Desactivar"}
        loading={deletingLoading}
      />
    </div>
  );
};

export default ClientsPage;