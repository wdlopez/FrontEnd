import React, { useEffect, useState, useCallback } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import Alerts from '../../../components/molecules/Alerts';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import Tabs from '../../../components/molecules/Tabs';
import GenericAddModal from '../../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../../components/organisms/Forms/ConfirmActionModal';

import { getText } from '../../../utils/text';
import SlasCreditService from '../../../services/Slas/Credits/slas-credit.service';
import SlaService from '../../../services/Slas/sla.service';
import MWindowService from '../../../services/Slas/MeasurementWindows/mwindow.service';
import MeasurementService from '../../../services/Slas/Measurement/measurement.service';
import { SLACREDIT_CONFIG } from '../../../config/entities/slacredit.config';
import { normalizeList } from '../../../utils/api-helpers';
import { mapBackendToTable } from '../../../utils/entityMapper';
import MonthlyLogPage from '../MonthlyLog/MonthlyLogPage';

const NAV_ITEMS = [
  { key: 'monthly-tracking', label: 'Seguimiento mensual' },
  { key: 'credits-register', label: 'Registro de penalidades' },
];

const SlasCreditsPage = ({ embedded = false }) => {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(SLACREDIT_CONFIG);

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('credits-register');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const creditsRes = await SlasCreditService.getAll();

      const [slasRes, mWindowRes, measurementRes] = await Promise.allSettled([
        SlaService.getAll(),
        MWindowService.getAll(),
        MeasurementService.getAll(),
      ]);

      const newConfig = {
        ...SLACREDIT_CONFIG,
        columns: SLACREDIT_CONFIG.columns.map((c) => ({ ...c })),
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

      let mWindowsList = [];
      if (mWindowRes.status === 'fulfilled') {
        mWindowsList = normalizeList(mWindowRes.value);
        const mWindowCol = newConfig.columns.find((c) => c.backendKey === 'mwindow_id');
        if (mWindowCol) {
          mWindowCol.options = mWindowsList.map((mw) => ({
            value: mw.id,
            label: mw.definition || mw.name || `Ventana ${mw.id}`,
          }));
        }
      }

      let measurementsList = [];
      if (measurementRes.status === 'fulfilled') {
        measurementsList = normalizeList(measurementRes.value);
        const measurementCol = newConfig.columns.find((c) => c.backendKey === 'measurement_id');
        if (measurementCol) {
          measurementCol.options = measurementsList.map((m) => ({
            value: m.id,
            label: `Medición: ${new Date(m.measurement_date).toLocaleDateString()} - Valor: ${
              m.actual_value
            }`,
          }));
        }
      }

      if (creditsRes) {
        const rawList = normalizeList(creditsRes);
        const enrichedList = rawList.map((c) => {
          const sla = slasList.find((s) => s.id === c.sla_id);
          const mWindow = mWindowsList.find((w) => w.id === c.mwindow_id);
          const measurement = measurementsList.find((m) => m.id === c.measurement_id);

          return {
            ...c,
            sla_name: sla ? sla.name || sla.reference || `SLA ${sla.id}` : null,
            mwindow_name: mWindow ? mWindow.definition || mWindow.name : null,
            measurement_display: measurement
              ? `Medición: ${new Date(measurement.measurement_date).toLocaleDateString()} - Valor: ${
                  measurement.actual_value
                }`
              : null,
          };
        });

        setCredits(mapBackendToTable(enrichedList, newConfig));
      }

      setDynamicConfig(newConfig);
    } catch (error) {
      console.error('Error cargando créditos SLA:', error);
      setAlert({
        open: true,
        message: 'Error al cargar los créditos SLA.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mapeo de columnas para InteractiveTable
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach((col) => {
    if (col.backendKey && !col.hiddenInTable) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setIsEditOpen(true);
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await SlasCreditService.update(row.id, { [realColumn]: newValue });
      setCredits((prev) =>
        prev.map((c) => (c.id === row.id ? { ...c, [column]: newValue } : c)),
      );
      setAlert({ open: true, message: 'Campo actualizado correctamente', type: 'success' });
    } catch (error) {
      console.error('Error actualizando campo:', error);
      setAlert({ open: true, message: 'No se pudo actualizar el campo', type: 'error' });
    }
  };

  const handleDeleteReq = (row) => {
    setSelectedRow({
      id: row.id,
      name: row['SLA'] || 'Crédito SLA',
      state: true,
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await SlasCreditService.delete(data.id);
      setAlert({
        open: true,
        message: 'Crédito eliminado correctamente',
        type: 'success',
      });
      setCredits((prev) => prev.filter((c) => c.id !== data.id));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Error eliminando crédito:', error);
      setAlert({
        open: true,
        message: 'No se pudo eliminar el crédito',
        type: 'error',
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className={embedded ? 'space-y-6' : 'p-6 space-y-6'}>
      {/* Encabezado con fondo blanco horizontal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <InfoTooltip
                size="sm"
                message={
                  getText('intros.slaCredits') ||
                  'Gestione los créditos y penalizaciones asociados al incumplimiento de los SLAs.'
                }
                sticky={true}
              >
                <span className="material-symbols-outlined text-gray-400">info</span>
              </InfoTooltip>
              <h1 className="text-2xl font-bold text-gray-800">Créditos SLA</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Gestión de penalizaciones financieras aplicadas por incumplimientos de métricas.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de diseño heredado: Seguimiento mensual / Registro de penalidades */}
      <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />

      <div className="space-y-6">
        {/* Contenido principal: registro de penalidades */}
        {activeTab === 'credits-register' && (
          <>
            <Alerts
              open={alert.open}
              setOpen={(val) => setAlert({ ...alert, open: val })}
              message={alert.message}
              type={alert.type}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-gray-500 italic">Cargando créditos...</div>
              ) : (
                <InteractiveTable
                  data={credits}
                  columnMapping={columnMapping}
                  selectColumns={selectColumns}
                  nonEditableColumns={nonEditableColumns}
                  onEdit={handleEdit}
                  onSubmit={handleInlineEdit}
                  onDelete={handleDeleteReq}
                  onAdd={() => setIsAddOpen(true)}
                  path="/contract/sla/credits/"
                  rowsPerPage={10}
                  headerButtons={
                    <HeaderActions
                      AddComponent={
                        <button
                          onClick={() => setIsAddOpen(true)}
                          className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[20px]">add</span>
                          <span>Registrar crédito</span>
                        </button>
                      }
                      showExport={true}
                      onRefresh={fetchData}
                    />
                  }
                />
              )}
            </div>

            {/* MODALES */}
            <GenericAddModal
              isOpen={isAddOpen}
              setIsOpen={setIsAddOpen}
              service={SlasCreditService}
              config={dynamicConfig}
              onSuccess={fetchData}
              initialValues={{
                credit_date: new Date().toISOString().split('T')[0],
              }}
            />

            <GenericEditModal
              isOpen={isEditOpen}
              setIsOpen={setIsEditOpen}
              entityId={selectedId}
              service={SlasCreditService}
              config={dynamicConfig}
              onSuccess={fetchData}
            />

            <ConfirmActionModal
              isOpen={isDeleteOpen}
              setIsOpen={setIsDeleteOpen}
              data={selectedRow}
              onConfirm={handleConfirmDelete}
              loading={deletingLoading}
              entityName={SLACREDIT_CONFIG.name}
            />
          </>
        )}

        {activeTab === 'monthly-tracking' && <MonthlyLogPage embedded />}
      </div>
    </div>
  );
};

export default SlasCreditsPage;