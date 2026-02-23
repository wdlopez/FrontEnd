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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(CONTRACT_CONFIG);
  const hasInitialized = useRef(false);

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", type: "info" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Si venimos de la ruta de un cliente, filtramos por su ID
      const params = id_client ? { client_id: id_client } : {};

      const [contractsRes, clientsRes, providersRes] = await Promise.allSettled([
        ContractService.getAll(params),
        ClientService.getAll({ page: 1, limit: 100 }),
        ProviderService.getAll({ page: 1, limit: 100 }),
      ]);

      if (contractsRes.status === "fulfilled") {
        const response = contractsRes.value;
        const dataList = normalizeList(response);
        setContracts(mapBackendToTable(dataList, CONTRACT_CONFIG));
      }

      // Clonamos config para no mutar la constante importada
      const newConfig = {
        ...CONTRACT_CONFIG,
        columns: CONTRACT_CONFIG.columns.map((c) => ({ ...c })),
      };

      if (clientsRes.status === "fulfilled") {
        const clients = normalizeList(clientsRes.value);
        const clientCol = newConfig.columns.find((c) => c.backendKey === "client_id");
        if (clientCol) {
          clientCol.options = (clients || []).map((c) => ({
            value: c.id,
            label: c.name,
          }));
        }
      }

      if (providersRes.status === "fulfilled") {
        const providers = normalizeList(providersRes.value);
        const providerCol = newConfig.columns.find((c) => c.backendKey === "provider_id");
        if (providerCol) {
          providerCol.options = (providers || []).map((p) => ({
            value: p.id,
            label: p.legal_name || p.name,
          }));
        }
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
    <div className="p-6 space-y-6">
      <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />
      
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
                <InfoTooltip message={getText("contractsIntro")}>
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
                onDelete={handleDeleteReq}
                onAdd={() => setIsAddOpen(true)}
                path="/contract/general/"
                rowsPerPage={10}
                headerButtons={
                  <HeaderActions
                    onAdd={() => setIsAddOpen(true)}
                    addButtonLabel={`Nuevo ${dynamicConfig.name}`}
                    showExport={true}
                    onRefresh={fetchData}
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
          ...(id_client ? { client_id: id_client } : {}),
          currency: "USD",
          language: "es",
          country: "Colombia",
          status: "draft",
        }}
        getExtraPayload={() => (user?.id ? { created_by: user.id } : {})}
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