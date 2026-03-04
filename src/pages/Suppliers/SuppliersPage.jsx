import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import ConfirmActionModal from '../../components/organisms/Forms/ConfirmActionModal';
import GenericEditModal from '../../components/organisms/Forms/GenericEditModal';
import GenericAddModal from '../../components/organisms/Forms/GenericAddModal';
import Alerts from '../../components/molecules/Alerts';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import Tabs from '../../components/molecules/Tabs';
import ProviderService from '../../services/Providers/provider.service';
import { useAuth } from "../../context/AuthContext";
import { useSelectedClient } from "../../context/ClientSelectionContext";
import { PROVIDER_CONFIG } from '../../config/entities/provider.config';
import { mapBackendToTable } from '../../utils/entityMapper';
import { normalizeList } from '../../utils/api-helpers';
import { getText } from '../../utils/text';
import SupplierContactPage from './Contacts/SuppliersContactPage';

const NAV_ITEMS = [
  { key: 'suppliers', label: 'Proveedores' },
  { key: 'contacts', label: 'Contactos' },
];

const SuppliersPage = () => {
  const [providers, setProviders] = useState([]);
  const [rawProviders, setRawProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estados de selección
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [editProviderId, setEditProviderId] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState("delete"); // 'delete' | 'restore'
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info', title: '' });
  const [showInactive, setShowInactive] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedClient } = useSelectedClient();

  const isContactsRoute = location.pathname.startsWith('/suppliers/contacts');
  const activeTab = isContactsRoute ? 'contacts' : 'suppliers';

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Gestión Integral", url: "/suppliers" },
    { name: "Proveedores", url: null }
  ];

  // Cargar datos
  const fetchData = async (showDeleted = showInactive) => {
    setLoading(true);
    try {
      const response = showDeleted
        ? await ProviderService.getAllDeleted()
        : await ProviderService.getAll();
      const dataList = normalizeList(response);

      const role = user?.role || null;
      const isSuperAdmin =
        role === "super_admin" || role === 1 || role === "1";

      let filteredList = dataList;
      if (isSuperAdmin && selectedClient?.id) {
        const clientIdStr = String(selectedClient.id);
        filteredList = dataList.filter((p) => {
          const providerClientId =
            p.client_id || p.clientId || p.client?.id || null;
          return (
            providerClientId != null &&
            String(providerClientId) === clientIdStr
          );
        });
      }

      setRawProviders(filteredList);
      const formattedProviders = mapBackendToTable(filteredList, PROVIDER_CONFIG);
      setProviders(formattedProviders);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      // Si es 401, el interceptor ya habrá intentado refrescar token y, si falla, redirige al login.
      // No mostramos alerta genérica para no confundir al usuario cuando la sesión ha expirado.
      if (error?.response?.status === 401) {
        return;
      }
      setAlert({ open: true, message: "Error al cargar los proveedores", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargamos proveedores solo cuando estamos en la pestaña principal
    if (!isContactsRoute) {
      fetchData(showInactive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContactsRoute, showInactive]);

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

  const handleDeleteRequest = (row, { isDeleted } = {}) => {
    if (row?.id) {
      const action = isDeleted ? "restore" : "delete";
      setSelectedAction(action);
      setSelectedProvider({
        id: row.id,
        // Usamos el header exacto de la tabla ("Razón social") y caemos a otras variantes
        name:
          row["Razón social"] ||
          row["Razón Social"] ||
          row["legal_name"] ||
          "Proveedor",
      });
      setIsDeleteModalOpen(true);
    }
  };

  const showAlert = (type, message, title = "") => {
    setAlert({ open: true, message, type, title });
  };

  const handleConfirmAction = async () => {
    if (!selectedProvider?.id) return;
    setDeletingLoading(true);
    try {
      if (selectedAction === "restore") {
        await ProviderService.restore(selectedProvider.id);
        showAlert("success", "Proveedor restaurado correctamente", "¡Actualizado!");
      } else {
        await ProviderService.delete(selectedProvider.id);
        showAlert("success", "Proveedor desactivado correctamente", "¡Actualizado!");
      }
      await fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error ejecutando acción sobre proveedor:", error);
      showAlert(
        "error",
        selectedAction === "restore"
          ? "No se pudo restaurar el proveedor"
          : "No se pudo desactivar el proveedor",
        "Error"
      );
    } finally {
      setDeletingLoading(false);
    }
  };

  // Mapeos automáticos para InteractiveTable desde PROVIDER_CONFIG
  const columnMapping = {};
  PROVIDER_CONFIG.columns.forEach(col => {
    if (col.backendKey) columnMapping[col.header] = col.backendKey;
  });

  const handleTabChange = (key) => {
    if (key === 'contacts') {
      navigate('/suppliers/contacts');
    } else if (key === 'suppliers') {
      navigate('/suppliers');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb sobre el fondo gris general */}
      <div className="space-y-1">
        <Tabs items={NAV_ITEMS} activeKey={activeTab} onChange={handleTabChange} />
        <BreadCrumb paths={breadcrumbPaths} />

        {/* Solo el bloque del título tiene fondo blanco horizontal en la pestaña de proveedores */}
        {activeTab === 'suppliers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
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
          </div>
        )}
      </div>
      
      {activeTab === 'suppliers' ? (
        <>
          <Alerts 
            open={alert.open} 
            setOpen={(val) => setAlert(prev => ({ ...prev, open: val }))} 
            message={alert.message} 
            type={alert.type}
            title={alert.title}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-500">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
                <p className="mt-2">Cargando proveedores...</p>
              </div>
            ) : (
              <InteractiveTable 
                data={providers}
                originData={rawProviders}
                parameterId="id"
                config={PROVIDER_CONFIG}
                columnMapping={columnMapping}
                onEdit={openEditModal}
                onSubmit={handleInlineEdit}
                onDelete={handleDeleteRequest}
                onAdd={() => setIsAddModalOpen(true)}
                path="/suppliers/"
                rowsPerPage={10}
                nonEditableColumns={["Estado"]}
                hiddenColumns={showInactive ? ["Estado"] : []}
                rowActionsRenderer={
                  showInactive
                    ? (row) => (
                        <div className="flex items-center gap-1">
                          {/* Restaurar (solo en vista de inactivos) */}
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
                    AddComponent={
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Nuevo {PROVIDER_CONFIG.name}</span>
                      </button>
                    }
                    isActive={!showInactive}
                    onToggle={() => setShowInactive((prev) => !prev)}
                    showExport={true}
                    onRefresh={() => fetchData(showInactive)}
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
            onSuccess={() => fetchData(showInactive)}
            getExtraPayload={() => ({ risk_level: "medium" })}
            onNotify={showAlert}
          />

          <GenericEditModal 
            isOpen={isEditModalOpen}
            setIsOpen={setIsEditModalOpen}
            entityId={editProviderId}
            service={ProviderService}
            config={PROVIDER_CONFIG}
            onSuccess={() => fetchData(showInactive)}
            onNotify={showAlert}
          />

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
                ? `¿Estás seguro de que deseas restaurar el ${PROVIDER_CONFIG.name.toLowerCase()} "${selectedProvider?.name || "sin nombre"}"?`
                : `¿Estás seguro de que deseas desactivar el ${PROVIDER_CONFIG.name.toLowerCase()} "${selectedProvider?.name || "sin nombre"}"?`
            }
            isDangerous={selectedAction !== "restore"}
            confirmLabel={selectedAction === "restore" ? "Restaurar" : "Desactivar"}
            loading={deletingLoading}
          />
        </>
      ) : (
        <SupplierContactPage embedded />
      )}
    </div>
  );
};

export default SuppliersPage;