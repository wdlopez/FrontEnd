import React, { useState, useEffect, useCallback } from "react";
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
import { useAuth, hasClientScopeRole } from "../../../context/AuthContext";
import { useSelectedClient } from "../../../context/ClientSelectionContext";
import ContractService from "../../../services/Contracts/contract.service";
import ClientService from "../../../services/Clients/client.service";
import ProviderService from "../../../services/Providers/provider.service";
import { CONTRACT_CONFIG } from "../../../config/entities/contract.config";
import { PROVIDER_CONFIG } from "../../../config/entities/provider.config";
import { mapBackendToTable } from "../../../utils/entityMapper";
import { normalizeList } from "../../../utils/api-helpers";
import { getText } from "../../../utils/text";
import { filterByPeriod } from "../../../hooks/dateFilter";

import ServicePage from "../Services/ServicesPage";
import ClausesPage from "../Clauses/ClausesPage";

const PERIOD_OPTIONS = ["7D", "MTD", "YTD", "1Y", "ALL"];
const DATE_FIELD_OPTIONS = [
  { value: "end_date", label: "Fecha de Fin" },
  { value: "start_date", label: "Fecha de Inicio" },
];

const NAV_ITEMS = [
  { key: "contract", label: "Contratos" },
  { key: "services", label: "Servicios" },
  { key: "clauses", label: "Cláusulas" }
];

const getClientId = (c) => c?.id ?? c?.ClientEntity_id ?? c?.uuid;
const getClientName = (c) => c?.name ?? c?.ClientEntity_name;

function ContractPage() {
  const { id_client } = useParams();
  const { user, currentClientId: rawCurrentClientId, isGlobalAdmin } = useAuth();
  const { selectedClient } = useSelectedClient();

  // El backend envía role y clientId como arrays, los normalizamos
  const rawRole = user?.role ?? null;
  const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;
  const isClientScoped = hasClientScopeRole(role);
  const effectiveClientId = id_client
    ? String(id_client)
    : (Array.isArray(rawCurrentClientId) ? rawCurrentClientId?.[0] : rawCurrentClientId) ?? null;
  // Usar selectedClient (TopNavbar / ClientSelectionContext) como fuente principal
  const defaultClientId = selectedClient?.id ?? effectiveClientId ?? id_client;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    // Debug: verificar de dónde sale el cliente por defecto
    console.debug("[ContractsPage] selectedClient:", selectedClient);
    console.debug("[ContractsPage] defaultClientId:", defaultClientId);
    console.debug("[ContractsPage] effectiveClientId:", effectiveClientId);
    console.debug("[ContractsPage] rawCurrentClientId:", rawCurrentClientId);
    console.debug("[ContractsPage] role:", role, "isClientScoped:", isClientScoped, "isGlobalAdmin:", isGlobalAdmin);
  }, [selectedClient, defaultClientId, effectiveClientId, rawCurrentClientId, role, isClientScoped, isGlobalAdmin]);

  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
  const [originContracts, setOriginContracts] = useState([]); // lista raw para filtro por período
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(CONTRACT_CONFIG);
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedDateField, setSelectedDateField] = useState("end_date");

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", type: "info", title: "" });
  const [showInactive, setShowInactive] = useState(false);
  const [selectedAction, setSelectedAction] = useState("delete"); // 'delete' | 'restore'

  const showAlert = (type, message, title = "") => {
    setAlert({ open: true, message, type, title });
  };

  const fetchData = useCallback(async (showDeleted = showInactive) => {
    setLoading(true);
    try {
      // IMPORTANTE:
      // El backend de contratos obtiene el cliente desde el JWT + esquema (x-target-schema)
      // y NO acepta el parámetro client_id en query (lo rechaza con 400).
      // Por eso siempre llamamos sin filtros en query y aislamos por cliente en frontend.
      const params = {};

      const [contractsRes, clientsRes, providersRes] = await Promise.allSettled([
        showDeleted ? ContractService.getAllDeleted(params) : ContractService.getAll(params),
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
          // Si hay cliente por defecto (TopNavbar/JWT/ruta), solo mostramos ese cliente
          let clientsForSelect = clients || [];
          if (defaultClientId) {
            clientsForSelect = clientsForSelect.filter(
              (c) => String(getClientId(c)) === String(defaultClientId)
            );
          }

          // Fallback: si el backend no devolvió el cliente pero lo tenemos por token/navbar,
          // añadimos una opción sintética para que el select muestre el valor.
          if (defaultClientId && clientsForSelect.length === 0) {
            clientsForSelect = [
              { id: String(defaultClientId), name: selectedClient?.name || "Cliente" },
            ];
          }

          clientCol.options = clientsForSelect.map((c) => ({
            value: getClientId(c),
            label: getClientName(c) || getClientId(c),
          }));

          if (defaultClientId) {
            clientCol.disabled = true;
          }
          // Mapeo para mostrar nombre en la tabla
          clientCol.mapFrom = (item) => {
            const itemClientId = item?.client_id ?? item?.clientId ?? null;
            const sourceList =
              (clientsForSelect && clientsForSelect.length > 0 ? clientsForSelect : clients) || [];
            const client = sourceList.find(
              (c) => String(getClientId(c)) === String(itemClientId),
            );
            const name = client ? getClientName(client) : null;
            return name || itemClientId || "";
          };
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
        let filteredList = dataList;

        const filterClientId = id_client
          ? String(id_client)
          : (defaultClientId != null ? String(defaultClientId) : null);

        if (filterClientId) {
          filteredList = dataList.filter((c) => {
            const contractClientId =
              c.client_id || c.clientId || c.client?.id || null;
            return contractClientId != null && String(contractClientId) === filterClientId;
          });
        }

        if (import.meta.env.DEV) {
          console.debug(
            "[ContractsPage] role:",
            role,
            "defaultClientId:",
            defaultClientId,
            "id_client (ruta):",
            id_client,
            "contratos totales:",
            dataList.length,
            "contratos filtrados:",
            filteredList.length,
            "showInactive:",
            showDeleted
          );
        }

        setOriginContracts(filteredList);
      } else {
        // Si la llamada a contratos falla, limpiamos la tabla
        setOriginContracts([]);
      }

      setDynamicConfig(newConfig);
    } catch (error) {
      console.error("Error al cargar contratos:", error);
      showAlert("error", "Error al cargar contratos", "Error");
    } finally {
      setLoading(false);
    }
  }, [id_client, defaultClientId, role, selectedClient?.name, showInactive]);

  // Carga inicial y recarga al cambiar cliente/tab
  useEffect(() => {
    if (activeTab === "contract") {
      fetchData(showInactive);
    }
  }, [activeTab, fetchData, showInactive]);

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

  const handleInlineEdit = async ({ row, realColumn, newValue }) => {
    try {
      await ContractService.update(row.id, { [realColumn]: newValue });
      setOriginContracts(prev => prev.map(c =>
        c.id === row.id ? { ...c, [realColumn]: newValue } : c
      ));
    } catch (error) {
      console.error("Error actualizando campo:", error);
    }
  };

  const handleDeleteReq = (row, { isDeleted } = {}) => {
    const action = isDeleted ? "restore" : "delete";
    setSelectedAction(action);
    setSelectedRow({ 
        id: row.id, 
        name: row["Número de contrato"] || row["Número de Contrato"] || row["#"] || "Contrato"
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;
    setDeletingLoading(true);
    try {
      if (selectedAction === "restore") {
        await ContractService.restore(selectedRow.id);
        setAlert({ open: true, message: "Contrato restaurado correctamente", type: "success" });
      } else {
        await ContractService.delete(selectedRow.id);
        setAlert({ open: true, message: "Contrato desactivado correctamente", type: "success" });
      }
      await fetchData(showInactive);
      setIsDeleteOpen(false);
    } catch (e) {
      console.error("Error al procesar contrato:", e);
      showAlert(
        "error",
        selectedAction === "restore"
          ? "Error al restaurar el contrato"
          : "Error al desactivar el contrato",
        "Error"
      );
    } finally {
      setDeletingLoading(false);
    }
  };

  // Filtro por período (7D, MTD, YTD, 1Y, ALL) sobre la lista raw
  const filteredByPeriod = filterByPeriod(originContracts, selectedPeriod, selectedDateField);
  const contractsToShow = mapBackendToTable(filteredByPeriod, dynamicConfig);

  return (
    <div className="p-4">
      {/* Tabs y breadcrumb sobre el fondo gris general */}
      <div className={`space-y-2 ${activeTab === 'contract' ? 'mb-4' : 'mb-2'}`}>
        <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />

        {activeTab === 'contract' && (
          <>
            <BreadCrumb paths={[{ name: "Inicio", url: "/dashboard" }, { name: "Contratos", url: null }]} />

            {/* Solo el bloque del título tiene fondo blanco horizontal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
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
            </div>
          </>
        )}
      </div>

      <Alerts
        open={alert.open} 
        setOpen={(val) => setAlert({...alert, open: val})} 
        message={alert.message} 
        type={alert.type}
        title={alert.title}
      />

      {activeTab === 'contract' && (
        <div className="space-y-4 mt-0">
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filtro por período: centrado, sobre los botones de acción (como en versión 0) */}
            <div className="flex flex-col items-center justify-center gap-2 px-4 pt-3 pb-3 border-b border-gray-100">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtrar por:
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-dark3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedDateField}
                  onChange={(e) => setSelectedDateField(e.target.value)}
                >
                  {DATE_FIELD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap justify-center gap-2">
                {PERIOD_OPTIONS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPeriod(key)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === key
                        ? "bg-[#4178BE] text-white hover:bg-[#3669a8] dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-dark4 dark:text-gray-300 dark:hover:bg-dark3"
                    }`}
                  >
                    {key === "ALL" ? "All" : key}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
                <p className="mt-2">Cargando contratos...</p>
              </div>
            ) : (
              <InteractiveTable
                data={contractsToShow}
                originData={originContracts}
                parameterId="id"
                columnMapping={columnMapping}
                selectColumns={selectColumns}
                nonEditableColumns={nonEditableColumns}
                onEdit={handleEdit}
                onSubmit={handleInlineEdit}
                onDelete={handleDeleteReq}
                onAdd={() => setIsAddOpen(true)}
                path="/contract/general/"
                rowsPerPage={10}
                rowActionsRenderer={
                  showInactive
                    ? (row) => (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteReq(row, { isDeleted: true })}
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
                        onClick={() => setIsAddOpen(true)}
                        className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Nuevo {dynamicConfig.name}</span>
                      </button>
                    }
                    isActive={!showInactive}
                    onToggle={() => setShowInactive((prev) => !prev)}
                    onRefresh={() => fetchData(showInactive)}
                    showExport={true}
                  />
                }
              />
            )}
          </div>
        </>
        </div>
      )}

      {activeTab === 'services' && <ServicePage id_client={id_client} embedded />}
      {activeTab === 'clauses' && <ClausesPage id_client={id_client} embedded />}

      {/* MODALES */}
      <GenericAddModal 
        isOpen={isAddOpen} 
        setIsOpen={setIsAddOpen} 
        service={ContractService}
        config={dynamicConfig}
        onSuccess={() => fetchData(showInactive)}
        initialValues={{
          // Cliente: selectedClient (TopNavbar/JWT) > id_client (ruta) > effectiveClientId
          ...(defaultClientId ? { client_id: String(defaultClientId) } : {}),
          currency: "USD",
          language: "es",
          country: "Colombia",
        }}
        getExtraPayload={() => {
          const basePayload = { status: "draft", ...(user?.id ? { created_by: user.id } : {}) };
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
        onNotify={showAlert}
      />

      <GenericAddModal
        isOpen={isAddProviderOpen}
        setIsOpen={setIsAddProviderOpen}
        service={ProviderService}
        config={PROVIDER_CONFIG}
        onSuccess={() => {
          fetchData(showInactive);
          setIsAddProviderOpen(false);
        }}
        onNotify={showAlert}
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={ContractService} 
        config={dynamicConfig} 
        onSuccess={fetchData}
        onNotify={showAlert}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        title={
          selectedAction === "restore"
            ? "Confirmar restauración"
            : "Confirmar desactivación"
        }
        message={
          selectedAction === "restore"
            ? `¿Estás seguro de que deseas restaurar el ${CONTRACT_CONFIG.name.toLowerCase()} "${
                selectedRow?.name || "sin nombre"
              }"?`
            : `¿Estás seguro de que deseas desactivar el ${CONTRACT_CONFIG.name.toLowerCase()} "${
                selectedRow?.name || "sin nombre"
              }"?`
        }
        isDangerous={selectedAction !== "restore"}
        confirmLabel={selectedAction === "restore" ? "Restaurar" : "Desactivar"}
      />
    </div>
  );
}

export default ContractPage;