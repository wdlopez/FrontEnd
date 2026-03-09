import React, { useEffect, useState, useRef, useCallback } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import GenericAddModal from '../../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../../components/organisms/Forms/ConfirmActionModal';
import Alerts from '../../../components/molecules/Alerts';
import ClauseService from '../../../services/Contracts/Clauses/clause.service';
import ContractService from '../../../services/Contracts/contract.service';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import { CLAUSE_CONFIG } from '../../../config/entities/clause.config';
import { mapBackendToTable } from '../../../utils/entityMapper';
import { normalizeList } from '../../../utils/api-helpers';
import { getText } from '../../../utils/text';

const ClausesPage = ({ id_client, embedded = false }) => {
  const [clauses, setClauses] = useState([]);
  const [rawClauses, setRawClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(CLAUSE_CONFIG);
  
  // Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info', title: '' });
  const [showInactive, setShowInactive] = useState(false);
  const [selectedAction, setSelectedAction] = useState("delete");

  const showAlert = (type, message, title = "") => {
    setAlert({ open: true, message, type, title });
  };

  const hasInitialized = useRef(false);

  const fetchData = useCallback(async (showDeleted = showInactive) => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      
      const contractsParams = id_client ? { client_id: id_client, limit: 100 } : { limit: 100 };

      const [clausesRes, contractsRes] = await Promise.allSettled([
        showDeleted ? ClauseService.getAllDeleted(params) : ClauseService.getAll(params),
        ContractService.getAll(contractsParams)
      ]);

      if (clausesRes.status === 'fulfilled') {
        const dataList = normalizeList(clausesRes.value);
        setRawClauses(dataList);
        setClauses(mapBackendToTable(dataList, CLAUSE_CONFIG));
      }

      const newConfig = { ...CLAUSE_CONFIG };
      
      if (contractsRes.status === 'fulfilled') {
        const contracts = normalizeList(contractsRes.value);
        const contractCol = newConfig.columns.find(c => c.backendKey === 'contract_id');
        
        if (contractCol) {
          contractCol.options = contracts.map(c => ({
            value: c.id,
            label: `${c.contract_number} - ${c.keyName || 'Sin Alias'}`
          }));
        }
      }
      
      setDynamicConfig(newConfig);

    } catch (error) {
      console.error("Error cargando cláusulas:", error);
      showAlert("error", "Error al cargar las cláusulas.", "Error");
    } finally {
      setLoading(false);
    }
  }, [id_client, showInactive]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchData(showInactive);
    }
  }, [fetchData, showInactive]);

  useEffect(() => {
    if (hasInitialized.current) {
      fetchData(showInactive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  // Mapeo automático para InteractiveTable
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
      await ClauseService.update(row.id, { [realColumn]: newValue });
      setClauses(prev => prev.map(c =>
        c.id === row.id ? { ...c, [column]: newValue } : c
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
      name: row["Título de la cláusula"] || row["Título"] || row["title"] || "Cláusula"
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRow?.id) return;
    setDeletingLoading(true);
    try {
      if (selectedAction === "restore") {
        await ClauseService.restore(selectedRow.id);
        setAlert({ open: true, message: "Cláusula restaurada correctamente", type: "success" });
      } else {
        await ClauseService.delete(selectedRow.id);
        setAlert({ open: true, message: "Cláusula desactivada correctamente", type: "success" });
      }
      await fetchData(showInactive);
      setIsDeleteOpen(false);
    } catch (e) {
      console.error("Error al procesar cláusula:", e);
      showAlert(
        "error",
        selectedAction === "restore"
          ? "Error al restaurar la cláusula"
          : "Error al desactivar la cláusula",
        "Error"
      );
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className={`${embedded ? 'pt-0 px-4 pb-4' : 'p-4'} space-y-4`}>
      {/* Breadcrumb sobre el fondo gris general (solo en página independiente) */}
      <div className="space-y-1">
        {!id_client && (
          <BreadCrumb paths={[{ name: "Inicio", url: "/dashboard" }, { name: "Cláusulas", url: null }]} />
        )}

        {/* Solo el bloque del título tiene fondo blanco horizontal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
          <div className="flex justify-between items-center gap-4">
            <div>
              <div className="flex gap-2 items-center">
                <InfoTooltip size="sm" message={getText("intros.clauses") || "Administre las cláusulas legales"} sticky={true}>
                  <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h1 className="text-2xl font-bold text-gray-800">Listado de {CLAUSE_CONFIG.name}s Contractuales</h1>
              </div>
              <p className="text-gray-500 text-sm">Control de obligaciones y estados críticos.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type}
        title={alert.title}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            <p className="mt-2">Cargando cláusulas...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={clauses}
            originData={rawClauses}
            parameterId="id"
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={handleEdit}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteReq}
            onAdd={() => setIsAddOpen(true)}
            path="/contract/clauses/"
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
                    <span>Nueva {CLAUSE_CONFIG.name}</span>
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
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        service={ClauseService}
        config={dynamicConfig}
        onSuccess={() => fetchData(showInactive)}
        getExtraPayload={() => ({ is_critical: false, compliance_status: "compliant" })}
        onNotify={showAlert}
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={ClauseService} 
        config={dynamicConfig} 
        onSuccess={() => fetchData(showInactive)}
        onNotify={showAlert}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmAction}
        loading={deletingLoading}
        title={
          selectedAction === "restore"
            ? "Confirmar restauración"
            : "Confirmar desactivación"
        }
        message={
          selectedAction === "restore"
            ? `¿Estás seguro de que deseas restaurar la ${CLAUSE_CONFIG.name.toLowerCase()} "${
                selectedRow?.name || "sin nombre"
              }"?`
            : `¿Estás seguro de que deseas desactivar la ${CLAUSE_CONFIG.name.toLowerCase()} "${
                selectedRow?.name || "sin nombre"
              }"?`
        }
        isDangerous={selectedAction !== "restore"}
        confirmLabel={selectedAction === "restore" ? "Restaurar" : "Desactivar"}
      />
    </div>
  );
};

export default ClausesPage;
