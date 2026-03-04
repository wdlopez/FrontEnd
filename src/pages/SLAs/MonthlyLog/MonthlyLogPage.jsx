import React, { useEffect, useState, useCallback } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import Alerts from '../../../components/molecules/Alerts';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import GenericAddModal from '../../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../../components/organisms/Forms/ConfirmActionModal';

import { getText } from '../../../utils/text';
import SlaMonthlyLogService from '../../../services/Slas/MonthlyLog/sla-monthly-log.service';
import SlaService from '../../../services/Slas/sla.service';
import { SLA_MONTHLY_LOG_CONFIG } from '../../../config/entities/sla-monthly-log.config';
import { normalizeList } from '../../../utils/api-helpers';
import { mapBackendToTable } from '../../../utils/entityMapper';

const MonthlyLogPage = ({ embedded = false }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(SLA_MONTHLY_LOG_CONFIG);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info', title: '' });

  const showAlert = (type, message, title = "") => {
    setAlert({ open: true, message, type, title });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const logsRes = await SlaMonthlyLogService.getAll();
      const [slasRes] = await Promise.allSettled([SlaService.getAll()]);

      const newConfig = {
        ...SLA_MONTHLY_LOG_CONFIG,
        columns: SLA_MONTHLY_LOG_CONFIG.columns.map((c) => ({ ...c })),
      };

      let slasList = [];
      if (slasRes.status === 'fulfilled') {
        slasList = normalizeList(slasRes.value);
        const slaCol = newConfig.columns.find((c) => c.backendKey === 'sla_id');
        if (slaCol) {
          slaCol.options = slasList.map((sla) => ({
            value: sla.id,
            label: sla.name || sla.reference || `SLA ${sla.id}`,
          }));
        }
      }

      if (logsRes) {
        const rawList = normalizeList(logsRes);
        const enrichedList = rawList.map((log) => {
          const sla = slasList.find((s) => s.id === log.sla_id);
          return {
            ...log,
            sla_name: sla ? sla.name || sla.reference || `SLA ${sla.id}` : null,
          };
        });

        setLogs(mapBackendToTable(enrichedList, newConfig));
      }

      setDynamicConfig(newConfig);
    } catch (error) {
      console.error('Error cargando registros mensuales de SLA:', error);
      showAlert(
        'error',
        'Error al cargar los registros mensuales de SLA.',
        'Error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach((col) => {
    if (col.backendKey && !col.hiddenInTable && !col.hideInTable) {
      columnMapping[col.header] = col.backendKey;
    }
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setIsEditOpen(true);
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await SlaMonthlyLogService.update(row.id, { [realColumn]: newValue });
      setLogs((prev) =>
        prev.map((l) => (l.id === row.id ? { ...l, [column]: newValue } : l)),
      );
      setAlert({ open: true, message: 'Campo actualizado correctamente', type: 'success' });
    } catch (error) {
      console.error('Error actualizando campo:', error);
      showAlert('error', 'No se pudo actualizar el campo', 'Error');
    }
  };

  const handleDeleteReq = (row) => {
    setSelectedRow({
      id: row.id,
      name: row['SLA'] || 'Registro mensual',
      state: true,
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await SlaMonthlyLogService.delete(data.id);
      setAlert({
        open: true,
        message: 'Registro mensual eliminado correctamente',
        type: 'success',
      });
      setLogs((prev) => prev.filter((l) => l.id !== data.id));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Error eliminando registro mensual:', error);
      showAlert(
        'error',
        'No se pudo eliminar el registro mensual',
        'Error'
      );
    } finally {
      setDeletingLoading(false);
    }
  };

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className={embedded ? 'space-y-4' : 'p-4 space-y-4'}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <InfoTooltip
                size="sm"
                message={
                  getText('intros.slaMonthlyLog') ||
                  'Registre los valores mensuales de cumplimiento para cada SLA.'
                }
                sticky={true}
              >
                <span className="material-symbols-outlined text-gray-400">info</span>
              </InfoTooltip>
              <h1 className="text-2xl font-bold text-gray-800">Registro mensual de SLA</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Lleve un histórico mensual del cumplimiento porcentual de cada SLA.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Alerts
          open={alert.open}
          setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })}
          message={alert.message}
          type={alert.type}
          title={alert.title}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 italic">
              Cargando registros mensuales...
            </div>
          ) : (
            <InteractiveTable
              data={logs}
              columnMapping={columnMapping}
              selectColumns={selectColumns}
              nonEditableColumns={nonEditableColumns}
              onEdit={handleEdit}
              onSubmit={handleInlineEdit}
              onDelete={handleDeleteReq}
              onAdd={() => setIsAddOpen(true)}
              path="/contract/sla/monthly-log/"
              rowsPerPage={10}
              headerButtons={
                <HeaderActions
                  AddComponent={
                    <button
                      onClick={() => setIsAddOpen(true)}
                      className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                      <span>Nuevo registro mensual</span>
                    </button>
                  }
                  showExport={true}
                  onRefresh={fetchData}
                />
              }
            />
          )}
        </div>

        <GenericAddModal
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          service={SlaMonthlyLogService}
          config={dynamicConfig}
          onSuccess={fetchData}
          initialValues={{
            month: currentMonth,
            percentage_value: 100,
          }}
          onNotify={showAlert}
        />

        <GenericEditModal
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          entityId={selectedId}
          service={SlaMonthlyLogService}
          config={dynamicConfig}
          onSuccess={fetchData}
          onNotify={showAlert}
        />

        <ConfirmActionModal
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          data={selectedRow}
          onConfirm={handleConfirmDelete}
          loading={deletingLoading}
          entityName={SLA_MONTHLY_LOG_CONFIG.name}
        />
      </div>
    </div>
  );
};

export default MonthlyLogPage;

