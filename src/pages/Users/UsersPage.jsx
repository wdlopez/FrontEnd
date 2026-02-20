import React, { useEffect, useState, useRef } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import ConfirmActionModal from '../../components/organisms/Forms/ConfirmActionModal';
import GenericEditModal from '../../components/organisms/Forms/GenericEditModal';
import GenericAddModal from '../../components/organisms/Forms/GenericAddModal';
import Alerts from '../../components/molecules/Alerts';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import UserService from '../../services/User/user.service';
import RoleService from '../../services/Role/role.service';
import ClientService from '../../services/Clients/client.service';
import ProviderService from '../../services/Providers/provider.service';
import { USER_CONFIG } from '../../config/entities/user.config';
import { mapBackendToTable } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';
import { getText } from '../../utils/text';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(USER_CONFIG);

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });
  const formColumns = dynamicConfig.columns.filter(col => !col.hideInForm);

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Usuarios", url: null }
  ];

  const hasInitialized = useRef(false);

  // 1. Cargar datos de la tabla y opciones de los Selects
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, clientsRes, providersRes] = await Promise.allSettled([
        UserService.getAll(),
        RoleService.getRoles(),
        ClientService.getAll(),
        ProviderService.getAll()
      ]);

      // --- Procesar Usuarios para la Tabla ---
      if (usersRes.status === 'fulfilled') {
        const dataList = normalizeList(usersRes.value);
        const formattedUsers = mapBackendToTable(dataList, USER_CONFIG);
        setUsers(formattedUsers);
      }

      // --- Inyectar Opciones Dinámicas en la Configuración ---
      const newConfig = { ...USER_CONFIG };
      
      if (rolesRes.status === 'fulfilled') {
        const roleCol = newConfig.columns.find(c => c.backendKey === 'roleId');
        if (roleCol) roleCol.options = normalizeList(rolesRes.value).map(r => ({ 
          value: r.id, 
          label: r.name || r.description 
        }));
      }

      if (clientsRes.status === 'fulfilled') {
        const clientCol = newConfig.columns.find(c => c.backendKey === 'entityId');
        if (clientCol) clientCol.options = normalizeList(clientsRes.value).map(c => ({ 
          value: `c_${c.id}`, 
          label: `Cliente: ${c.name}` 
        }));
      }

      if (providersRes.status === 'fulfilled') {
        const providerCol = newConfig.columns.find(c => c.backendKey === 'providerId');
        if (providerCol) providerCol.options = normalizeList(providersRes.value).map(p => ({ 
          value: p.id, 
          label: `Proveedor: ${p.name || p.legal_name}` 
        }));
      }

      setDynamicConfig(newConfig);

    } catch (error) {
      console.error("Error cargando datos de usuarios:", error);
      setAlert({ open: true, message: "Error al cargar la información", type: "error" });
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

  // Acciones de Fila
  const openEditModal = (row) => {
    if (row?.id) {
      setEditUserId(row.id);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteRequest = (row) => {
    if (row?.id) {
      setSelectedUser({
        id: row.id,
        name: row['NOMBRE'] || row['email'] || 'Usuario',
        state: true,
      });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await UserService.delete(data.id);
      setAlert({ open: true, message: 'Usuario eliminado correctamente', type: 'success' });
      setUsers(prev => prev.filter(u => u.id !== data.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setAlert({ open: true, message: 'No se pudo eliminar el usuario', type: 'error' });
    } finally {
      setDeletingLoading(false);
    }
  };

  // Preparar mapeos para InteractiveTable
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach(col => {
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
            <InfoTooltip size="sm" message={getText("usersIntro")} sticky={true}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de {dynamicConfig.name}s</h1>
          </div>
          <p className="text-gray-500 text-sm">Administra los accesos y roles del sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            <p className="mt-2">Cargando usuarios y permisos...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={users}
            config={dynamicConfig}
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={openEditModal} 
            onDelete={handleDeleteRequest}
            onAdd={() => setIsAddModalOpen(true)}
            path="/settings/userNroles/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsAddModalOpen(true)}
                addButtonLabel={`Nuevo ${dynamicConfig.name}`}
                showExport={true} 
                onRefresh={fetchData}
              />
            }
          />
        )}
      </div>

      {/* Modal de Creación Genérico */}
      <GenericAddModal 
        fields={formColumns}
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        service={UserService}
        config={dynamicConfig}
        onSuccess={fetchData}
      />

      {/* Modal de Edición Genérico */}
      <GenericEditModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        entityId={editUserId}
        service={UserService}
        config={dynamicConfig}
        onSuccess={fetchData}
      />

      {/* Modal de Eliminación */}
      <ConfirmActionModal 
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        data={selectedUser}
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={dynamicConfig.name}
      />
    </div>
  );
};

export default UsersPage;