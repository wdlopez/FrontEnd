import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Tabs from "../../../components/tabs";
import BreadCrumb from "../../../components/molecules/BreadCrumb";
import InteractiveTable from "../../../components/organisms/Tables/InteractiveTable";
import HeaderActions from "../../../components/organisms/Navigation/HeaderActions";
import Alerts from "../../../components/molecules/Alerts";
import InfoTooltip from "../../../components/atoms/InfoToolTip";
import GenericAddModal from "../../../components/organisms/Forms/GenericAddModal";
import GenericEditModal from "../../../components/organisms/Forms/GenericEditModal";
import ConfirmActionModal from "../../../components/organisms/Forms/ConfirmActionModal";
import { useAuth } from "../../../context/AuthContext";
import ContractService from "../../../services/Contracts/contract.service";
import ClientService from "../../../services/Clients/client.service";
import ProviderService from "../../../services/Providers/provider.service";
import { CONTRACT_CONFIG } from "../../../config/entities/contract.config";
import { PROVIDER_CONFIG } from "../../../config/entities/provider.config";
import { mapBackendToTable } from "../../../utils/entityMapper";
import { normalizeList } from "../../../utils/api-helpers";
import { getText } from "../../../utils/text";

import ServicePage from "../Services/ServicesPage";
import ClausesPage from "../Clauses/ClausesPage";

const NAV_ITEMS = [
  { key: "contract", label: "Contratos" },
  { key: "services", label: "Servicios" },
  { key: "clauses", label: "Cláusulas" }
];

function ContractPage() {
  const { id_client } = useParams();
  const { user, currentUserClientId, currentClientId, isGlobalAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(CONTRACT_CONFIG);
  const hasInitialized = useRef(false);

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", type: "info" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // IMPORTANTE:
      // El backend de contratos obtiene el cliente desde el JWT + esquema (x-target-schema)
      // y NO acepta el parámetro client_id en query (lo rechaza con 400).
      // Por eso siempre llamamos sin filtros en query y aislamos por cliente en frontend.
      const params = {};

      const [contractsRes, clientsRes, providersRes] = await Promise.allSettled([
        ContractService.getAll(params),
        ClientService.getAll({ page: 1, limit: 100 }),
        ProviderService.getAll({ page: 1, limit: 100 }),
      ]);

      if (contractsRes.status === "fulfilled") {
        // Ya filtraremos tras construir la config dinámica
      }

      // Clonamos config para no mutar la constante importada
      const newConfig = {
        ...CONTRACT_CONFIG,
        columns: CONTRACT_CONFIG.columns.map((c) => ({ ...c })),
      };

      let clients = [];
      if (clientsRes.status === "fulfilled") {
        clients = normalizeList(clientsRes.value);
        const clientCol = newConfig.columns.find((c) => c.backendKey === "client_id");
        if (clientCol) {
          clientCol.options = (clients || []).map((c) => ({
            value: c.id,
            label: c.name,
          }));
          // Mapeo para mostrar nombre en la tabla
          clientCol.mapFrom = (item) => {
             const client = clients.find(c => c.id === item.client_id);
             return client ? client.name : item.client_id;
          };

          // Si hay cliente por defecto (ruta o token), el campo queda visible pero no editable
          if (id_client || currentUserClientId) {
            clientCol.disabled = true;
          }
        }
      }

      let providers = [];
      if (providersRes.status === "fulfilled") {
        providers = normalizeList(providersRes.value);
        const providerCol = newConfig.columns.find((c) => c.backendKey === "provider_id");
        if (providerCol) {
          const providerOptions = (providers || []).map((p) => ({
            value: p.id,
            label: p.legal_name || p.name,
          }));
          providerCol.options = [
            ...providerOptions,
            { value: "__create_provider__", label: "+ Crear proveedor" },
          ];
          // Mapeo para mostrar nombre en la tabla
          providerCol.mapFrom = (item) => {
             const provider = providers.find(p => p.id === item.provider_id);
             return provider ? (provider.legal_name || provider.name) : item.provider_id;
          };
        }
      }

      // Formateo de fechas
      const dateCols = newConfig.columns.filter(c => c.type === 'date');
      dateCols.forEach(col => {
          col.mapFrom = (item) => {
              const val = item[col.backendKey];
              if (!val) return "";
              // Formato legible (ej: 24/02/2026)
              return new Date(val).toLocaleDateString("es-CO"); 
          };
      });

      // Ahora sí mapeamos los datos con la nueva configuración enriquecida
      if (contractsRes.status === "fulfilled") {
        const response = contractsRes.value;
        const dataList = normalizeList(response);

        // Aislamiento por cliente en frontend:
        // 1) Si la ruta incluye :id_client, siempre filtramos por ese cliente.
        // 2) Si no hay id_client en la ruta, pero el usuario es client_*,
        //    filtramos por el cliente asociado al token (currentClientId).
        const role = user?.role || null;
        const isClientScoped =
          role === "client_superadmin" || role === "client_contract_admin";

        let filteredList = dataList;

        if (id_client) {
          const routeClientId = String(id_client);
          filteredList = dataList.filter((c) => {
            const contractClientId =
              c.client_id || c.clientId || c.client?.id || null;
            return (
              contractClientId != null &&
              String(contractClientId) === routeClientId
            );
          });
        } else if (!isGlobalAdmin && isClientScoped && currentClientId) {
          const effectiveClientId = String(currentClientId);
          filteredList = dataList.filter((c) => {
            const contractClientId =
              c.client_id || c.clientId || c.client?.id || null;
            return (
              contractClientId != null &&
              String(contractClientId) === effectiveClientId
            );
          });
        }

        if (import.meta.env.DEV) {
          console.debug(
            "[ContractsPage] role:",
            role,
            "currentClientId:",
            currentClientId,
            "id_client (ruta):",
            id_client,
            "contratos totales:",
            dataList.length,
            "contratos filtrados:",
            filteredList.length
          );
        }

        setContracts(mapBackendToTable(filteredList, newConfig));
      } else {
        // Si la llamada a contratos falla, limpiamos la tabla
        setContracts([]);
      }

      setDynamicConfig(newConfig);
    } catch (error) {
      console.error("Error al cargar contratos:", error);
      setAlert({ open: true, message: "Error al cargar contratos", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id_client]);

  useEffect(() => {
    if (activeTab === "contract" && !hasInitialized.current) {
      fetchData();
      // Solo marcamos como inicializado si no hay id_client o si ya cargó una vez
      if (!id_client) hasInitialized.current = true; 
    }
  }, [activeTab, id_client, fetchData]);

  // Lógica de Mapeo para la InteractiveTable (Igual que en Clientes)
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach(col => {
    if (col.backendKey) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setIsEditOpen(true);
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await ContractService.update(row.id, { [realColumn]: newValue });
      setContracts(prev => prev.map(c =>
        c.id === row.id ? { ...c, [column]: newValue } : c
      ));
    } catch (error) {
      console.error("Error actualizando campo:", error);
    }
  };

  const handleDeleteReq = (row) => {
    setSelectedRow({ 
        id: row.id, 
        name: row["Número de Contrato"] || row["#"] || "Contrato", 
        state: true 
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await ContractService.delete(data.id);
      setAlert({ open: true, message: "Contrato eliminado", type: "success" });
      setContracts(prev => prev.filter(c => c.id !== data.id));
      setIsDeleteOpen(false);
    } catch (e) {
      console.error("Error al eliminar contrato:", e);
      setAlert({ open: true, message: "Error al eliminar", type: "error" });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />
      </div>

      <Alerts
        open={alert.open} 
        setOpen={(val) => setAlert({...alert, open: val})} 
        message={alert.message} 
        type={alert.type} 
      />

      {activeTab === 'contract' && (
        <>
          <BreadCrumb paths={[{ name: "Inicio", url: "/dashboard" }, { name: "Contratos", url: null }]} />
          
          <div className="flex justify-between items-center gap-4">
            <div>
              <div className="flex gap-2 items-center">
                <InfoTooltip size="sm" message={getText("intros.contracts")} sticky={true}>
                  <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de {CONTRACT_CONFIG.name}s</h1>
              </div>
              <p className="text-gray-500 text-sm">Administra los acuerdos legales y términos comerciales.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-500">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
                <p className="mt-2">Cargando contratos...</p>
              </div>
            ) : (
              <InteractiveTable
                data={contracts}
                columnMapping={columnMapping}
                selectColumns={selectColumns}
                nonEditableColumns={nonEditableColumns}
                onEdit={handleEdit}
                onSubmit={handleInlineEdit}
                onDelete={handleDeleteReq}
                onAdd={() => setIsAddOpen(true)}
                path="/contract/general/"
                rowsPerPage={10}
                headerButtons={
                  <HeaderActions
                    AddComponent={
                      <button
                        onClick={() => setIsAddOpen(true)}
                        className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Nuevo {dynamicConfig.name}</span>
                      </button>
                    }
                    onRefresh={fetchData}
                    showExport={true}
                  />
                }
              />
            )}
          </div>
        </>
      )}

      {activeTab === 'services' && <ServicePage id_client={id_client} />}
      {activeTab === 'clauses' && <ClausesPage id_client={id_client} />}

      {/* MODALES */}
      <GenericAddModal 
        isOpen={isAddOpen} 
        setIsOpen={setIsAddOpen} 
        service={ContractService}
        config={dynamicConfig}
        onSuccess={fetchData}
        initialValues={{
          // Cliente por defecto: ruta (ej. super admin desde un cliente) o cliente del token (ej. admin de contratos / usuario con cliente asociado)
          ...((id_client || currentUserClientId)
            ? { client_id: id_client || currentUserClientId }
            : {}),
          currency: "USD",
          language: "es",
          country: "Colombia",
          status: "draft",
        }}
        getExtraPayload={() => {
          const basePayload = user?.id ? { created_by: user.id } : {};
          const defaultClientId = id_client || currentUserClientId;
          if (defaultClientId) {
            return { ...basePayload, client_id: defaultClientId };
          }
          return basePayload;
        }}
        fieldSpecialOption={{
          field: "provider_id",
          value: "__create_provider__",
          onTrigger: () => setIsAddProviderOpen(true),
        }}
      />

      <GenericAddModal
        isOpen={isAddProviderOpen}
        setIsOpen={setIsAddProviderOpen}
        service={ProviderService}
        config={PROVIDER_CONFIG}
        onSuccess={() => {
          fetchData();
          setIsAddProviderOpen(false);
        }}
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={ContractService} 
        config={dynamicConfig} 
        onSuccess={fetchData}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        setIsOpen={setIsDeleteOpen} 
        data={selectedRow} 
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={CONTRACT_CONFIG.name}
      />
    </div>
  );
}

export default ContractPage;