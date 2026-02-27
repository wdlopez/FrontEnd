import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import ConfirmActionModal from '../../components/organisms/Forms/ConfirmActionModal';
import GenericEditModal from '../../components/organisms/Forms/GenericEditModal';
import GenericAddModal from '../../components/organisms/Forms/GenericAddModal';
import AssignClientModal from "../../components/organisms/Forms/AssignClientModal";
import Alerts from '../../components/molecules/Alerts';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import UserService from '../../services/User/user.service';
import RoleService from '../../services/Role/role.service';
import ClientService from '../../services/Clients/client.service';
import ProviderService from '../../services/Providers/provider.service';
import UserClientService from '../../services/Clients/user-clients.service';
import { USER_CONFIG } from '../../config/entities/user.config';
import { mapBackendToTable } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';
import { getText } from '../../utils/text';
import { useAuth } from "../../context/AuthContext";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(USER_CONFIG);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados de Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estado para el encadenamiento de creación
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  // Estados de selección y edición
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  // Estado para valores iniciales del formulario de creación (flujo guiado)
  const [addInitialValues, setAddInitialValues] = useState({});

  // Auth: aislamiento por cliente
  const { user, currentClientId, isGlobalAdmin } = useAuth();
  const role = user?.role || null;
  const isClientScopedRole =
    role === "client_superadmin" || role === "client_contract_admin";

  // Router: leer parámetros de la URL para el flujo guiado
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const actionParam = searchParams.get('action');
  const clientIdParam = searchParams.get('clientId');
  const clientNameParam = searchParams.get('clientName');

  const formColumns = dynamicConfig.columns.filter(col => !col.hideInForm);

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Usuarios", url: null }
  ];

  const hasInitialized = useRef(false);
  const hasHandledCreateAdmin = useRef(false);

  // 1. Cargar datos
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, clientsRes, providersRes] = await Promise.allSettled([
        UserService.getAll({ page, limit: 10 }),
        RoleService.getRoles(),
        ClientService.getAll(),
        ProviderService.getAll()
      ]);

      if (usersRes.status === 'fulfilled') {
        const usersResponse = usersRes.value;
        const dataList = normalizeList(usersResponse);

        // Aislamiento por cliente en frontend para roles client-scoped.
        // IMPORTANTE: solo filtramos si la respuesta realmente trae campos de cliente (clientId / entityId);
        // en muchos casos el backend ya está aislando por tenant (key_client) y no envía esos campos.
        let filteredList = dataList;
        const role = user?.role || null;
        const isClientScoped =
          role === "client_superadmin" || role === "client_contract_admin";

        const hasClientFields = dataList.some(
          (u) =>
            u.clientId !== undefined ||
            u.client_id !== undefined ||
            u.entityId !== undefined ||
            u.entity_id !== undefined,
        );

        if (!isGlobalAdmin && isClientScoped && currentClientId && hasClientFields) {
          filteredList = dataList.filter((u) => {
            const userClientId = u.clientId || u.client_id || null;
            const userEntityId = u.entityId || u.entity_id || null;
            const matchesClientId = userClientId === currentClientId;
            const matchesEntityId =
              typeof userEntityId === "string" &&
              (userEntityId === `c_${currentClientId}` ||
                userEntityId === currentClientId);
            return matchesClientId || matchesEntityId;
          });
        }

        if (import.meta.env.DEV) {
          console.debug(
            "[UsersPage] role:",
            role,
            "currentClientId:",
            currentClientId,
            "hasClientFields:",
            hasClientFields,
            "users total:",
            dataList.length,
            "users filtrados:",
            filteredList.length,
          );
        }

        const formattedUsers = mapBackendToTable(filteredList, USER_CONFIG);
        setUsers(formattedUsers);

        const meta = usersResponse?.data || {};
        setCurrentPage(meta.page || 1);
        setTotalPages(meta.totalPages || 1);
      }

      // Configuración dinámica de Selects
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
        if (clientCol) {
          let clients = normalizeList(clientsRes.value);

          const role = user?.role || null;
          const isClientScoped =
            role === "client_superadmin" || role === "client_contract_admin";

          // Si el usuario está acotado a un cliente, solo mostramos su cliente
          if (!isGlobalAdmin && isClientScoped && currentClientId) {
            clients = clients.filter((c) => c.id === currentClientId);
          }

          clientCol.options = (clients || []).map(c => ({ 
            value: `c_${c.id}`, 
            label: `Cliente: ${c.name}` 
          }));

          // Si venimos del flujo guiado de creación de cliente,
          // mostramos el campo de cliente en el formulario de usuario y lo bloqueamos.
          if (actionParam === 'create_admin' && clientIdParam) {
            clientCol.hideInForm = false;
            clientCol.disabled = true;
          } else if (!isGlobalAdmin && isClientScoped && currentClientId) {
            // Para client_superadmin / client_contract_admin, mostrar su cliente pero sin permitir cambiarlo
            clientCol.hideInForm = false;
            clientCol.disabled = true;
          }
        }
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
      fetchData(1);
    }
  }, []);

  // Efecto: flujo guiado desde la creación de Cliente -> creación de Usuario administrador
  useEffect(() => {
    if (actionParam === 'create_admin' && clientIdParam && !hasHandledCreateAdmin.current) {
      hasHandledCreateAdmin.current = true;

      // Prellenamos el valor de cliente usando el mismo formato que las options (c_{id})
      setAddInitialValues(prev => ({
        ...prev,
        entityId: `c_${clientIdParam}`,
      }));

      // Abrimos automáticamente el modal de creación de usuario
      setIsAddModalOpen(true);

      // Mensaje sutil para reforzar el contexto (opcional, sin bloquear)
      if (clientNameParam) {
        Swal.fire({
          title: 'Crear Administrador',
          text: `Ahora crea el primer usuario administrador para el cliente "${clientNameParam}".`,
          icon: 'info',
          timer: 3500,
          showConfirmButton: false,
        });
      }
    }
  }, [actionParam, clientIdParam, clientNameParam]);

  const handleUserCreated = async (response) => {
    setIsAddModalOpen(false);
    fetchData(currentPage);
  
    console.log("Respuesta completa del servidor:", response);

    // Intentamos extraer el objeto de datos
    const data = response?.data || response;

    const userId = data?.id || data?.userId || (Array.isArray(data) ? data[0]?.id : null);

    if (!userId) {
      console.error("No se pudo obtener el ID. Verifica que GenericAddModal pase el resultado al onSuccess.");
      return;
    }

    setCreatedUser({
      id: userId,
      name: data?.firstName ? `${data.firstName} ${data.lastName || ''}` : "Nuevo Usuario"
    });

    // Flujo guiado: venimos de crear un cliente y debemos asociar automáticamente
    if (actionParam === 'create_admin' && clientIdParam) {
      try {
        await UserClientService.create({
          userId,
          clientId: clientIdParam,
          isPrincipal: true,
        });

        Swal.fire({
          title: "¡Usuario creado y asignado!",
          text: clientNameParam
            ? `El usuario ha sido vinculado automáticamente al cliente "${clientNameParam}".`
            : "El usuario ha sido vinculado automáticamente al cliente.",
          icon: "success",
          timer: 3500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error creando relación usuario-cliente:", error);
        Swal.fire(
          "Usuario creado",
          "Se creó el usuario, pero no se pudo crear la relación con el cliente. Puedes asignarlo manualmente más tarde.",
          "warning"
        );
      }

      // No mostramos el AssignClientModal en este flujo guiado
      return;
    }

    // Flujo normal: seguimos usando el AssignClientModal opcional
    Swal.fire({
      title: "¡Usuario Creado!",
      text: "¿Deseas asociar este usuario a un cliente ahora?",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Sí, asociar cliente",
      cancelButtonText: "No, finalizar",
      confirmButtonColor: "#2563EB",
    }).then((result) => {
      if (result.isConfirmed) {
        setShowAssignModal(true);
      }
    });
  };

  // Acciones de Tabla
  const openEditModal = (row) => {
    if (row?.id) {
      setEditUserId(row.id);
      setIsEditModalOpen(true);
    }
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await UserService.update(row.id, { [realColumn]: newValue });
      setUsers(prev => prev.map(u =>
        u.id === row.id ? { ...u, [column]: newValue } : u
      ));
    } catch (error) {
      console.error("Error actualizando campo:", error);
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

  // Mapeos para InteractiveTable
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach(col => {
    if (col.backendKey) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const getUserExtraPayload = () => {
    // Flujo guiado desde creación de cliente
    if (actionParam === 'create_admin' && clientIdParam) {
      return {
        entityId: `c_${clientIdParam}`,
      };
    }

    // Aislamiento por cliente para roles client-scoped
    const role = user?.role || null;
    const isClientScoped =
      role === "client_superadmin" || role === "client_contract_admin";
    if (!isGlobalAdmin && isClientScoped && currentClientId) {
      return {
        entityId: `c_${currentClientId}`,
      };
    }

    return {};
  };

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
            <InfoTooltip size="sm" message={getText("intros.users")} sticky={true}>
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
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteRequest}
            onAdd={() => setIsAddModalOpen(true)}
            path="/settings/userNroles/"
            rowsPerPage={10}
            serverPagination={true}
            serverPage={currentPage}
            serverTotalPages={totalPages}
            onServerPageChange={(page) => fetchData(page)}
            headerButtons={
              <HeaderActions
                AddComponent={
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Nuevo {dynamicConfig.name}</span>
                  </button>
                }
                showExport={true}
                onRefresh={() => fetchData(currentPage)}
              />
            }
          />
        )}
      </div>

      {/* Modal de Creación de Usuario */}
      <GenericAddModal 
        fields={formColumns}
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        service={UserService}
        config={dynamicConfig}
        onSuccess={handleUserCreated} // <--- Aquí conectamos el flujo
        initialValues={addInitialValues}
        getExtraPayload={getUserExtraPayload}
      />

      {/* Nuevo Modal de Asignación de Cliente */}
      <AssignClientModal
        isOpen={showAssignModal}
        setIsOpen={setShowAssignModal}
        predefinedUserId={createdUser?.id}
        predefinedUserName={createdUser?.name}
        // Para roles client_superadmin / client_contract_admin, fijamos el cliente del token
        defaultClientId={
          !isGlobalAdmin && isClientScopedRole && currentClientId
            ? currentClientId
            : undefined
        }
        lockClient={
          !isGlobalAdmin && isClientScopedRole && currentClientId != null
        }
        onSuccess={() => {
          console.log("Relación usuario-cliente creada");
        }}
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