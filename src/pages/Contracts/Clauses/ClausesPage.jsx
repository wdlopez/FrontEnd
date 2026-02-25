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

const ClausesPage = ({ id_client }) => {
  const [clauses, setClauses] = useState([]);
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
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const hasInitialized = useRef(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      
      // Si tenemos id_client, podríamos filtrar contratos de ese cliente
      // Pero para las cláusulas, necesitamos la lista de contratos para el select
      const contractsParams = id_client ? { client_id: id_client, limit: 100 } : { limit: 100 };

      const [clausesRes, contractsRes] = await Promise.allSettled([
        ClauseService.getAll(params),
        ContractService.getAll(contractsParams)
      ]);

      if (clausesRes.status === 'fulfilled') {
        const dataList = normalizeList(clausesRes.value);
        setClauses(mapBackendToTable(dataList, CLAUSE_CONFIG));
      }

      // Configurar dinámicamente el select de contratos
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
      setAlert({ open: true, message: "Error al cargar las cláusulas.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id_client]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchData();
    }
  }, [fetchData]);

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

  const handleDeleteReq = (row) => {
    setSelectedRow({
      id: row.id,
      name: row["Título"] || row["title"] || "Cláusula",
      state: true
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await ClauseService.delete(data.id);
      setAlert({ open: true, message: "Cláusula eliminada", type: "success" });
      setClauses(prev => prev.filter(c => c.id !== data.id));
      setIsDeleteOpen(false);
    } catch (e) {
      console.error("Error al eliminar cláusula:", e);
      setAlert({ open: true, message: "Error al eliminar", type: "error" });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Si es página independiente, mostrar breadcrumb. Si es tab, quizás no. */}
      {!id_client && (
        <BreadCrumb paths={[{ name: "Inicio", url: "/dashboard" }, { name: "Cláusulas", url: null }]} />
      )}
      
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center gap-4">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("intros.clauses") || "Administre las cláusulas legales"} sticky={true}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de {CLAUSE_CONFIG.name}s</h1>
          </div>
          <p className="text-gray-500 text-sm">Control de obligaciones y estados críticos.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            <p className="mt-2">Cargando cláusulas...</p>
          </div>
        ) : (
          <InteractiveTable 
            data={clauses}
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={handleEdit}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteReq}
            onAdd={() => setIsAddOpen(true)}
            path="/contract/clauses/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsAddOpen(true)}
                addButtonLabel={`Nueva ${CLAUSE_CONFIG.name}`}
                showExport={true}
                onRefresh={fetchData}
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
        onSuccess={fetchData}
        // Si estuviéramos dentro de un contrato, aquí pasaríamos { contract_id: id }
        initialValues={{
          is_critical: false,
          compliance_status: "pending"
        }} 
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={ClauseService} 
        config={dynamicConfig} 
        onSuccess={fetchData}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        setIsOpen={setIsDeleteOpen} 
        data={selectedRow} 
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={CLAUSE_CONFIG.name}
      />
    </div>
  );
};

export default ClausesPage;