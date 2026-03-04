import React, { useEffect, useState, useCallback } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import Alerts from '../../../components/molecules/Alerts';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import GenericAddModal from '../../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../../components/organisms/Forms/ConfirmActionModal';

import MeasurementService from '../../../services/Slas/Measurement/measurement.service';
import SlaService from '../../../services/Slas/sla.service';
import { MEASUREMENT_CONFIG } from '../../../config/entities/measurement.config';
import { mapBackendToTable } from '../../../utils/entityMapper';
import { normalizeList } from '../../../utils/api-helpers';
import { getText } from '../../../utils/text';

const MeasurementPage = ({ embedded = false }) => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(MEASUREMENT_CONFIG);

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección y Alertas
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
      const measurementsRes = await MeasurementService.getAll();
      const [slasRes] = await Promise.allSettled([SlaService.getAll()]);

      const newConfig = {
        ...MEASUREMENT_CONFIG,
        columns: MEASUREMENT_CONFIG.columns.map((c) => ({ ...c })),
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

      if (measurementsRes) {
        const rawList = normalizeList(measurementsRes);
        const enrichedList = rawList.map((m) => {
          const sla = slasList.find((s) => s.id === m.sla_id);
          return {
            ...m,
            sla_name: sla ? sla.name || sla.reference || `SLA ${sla.id}` : null,
          };
        });

        setMeasurements(mapBackendToTable(enrichedList, newConfig));
      }

      setDynamicConfig(newConfig);
    } catch (error) {
      console.error('Error cargando mediciones:', error);
      showAlert('error', 'Error al cargar las mediciones de SLA.', 'Error');
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
      await MeasurementService.update(row.id, { [realColumn]: newValue });
      setMeasurements((prev) =>
        prev.map((m) => (m.id === row.id ? { ...m, [column]: newValue } : m)),
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
      name: row['SLA'] || 'Medición',
      state: true,
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await MeasurementService.delete(data.id);
      setAlert({
        open: true,
        message: 'Medición eliminada correctamente',
        type: 'success',
      });
      setMeasurements((prev) => prev.filter((m) => m.id !== data.id));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Error eliminando medición:', error);
      showAlert('error', 'No se pudo eliminar la medición', 'Error');
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className={embedded ? "space-y-4" : "p-4 space-y-4"}>
      {/* Encabezado con fondo blanco horizontal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <InfoTooltip
                size="sm"
                message={
                  getText('intros.measurements') ||
                  'Registre y evalúe los valores reales obtenidos contra los Acuerdos de Nivel de Servicio.'
                }
                sticky={true}
              >
               <span className="material-symbols-outlined text-gray-400">info</span>
              </InfoTooltip>
              <h1 className="text-2xl font-bold text-gray-800">Mediciones de SLA</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Registre las mediciones periódicas para analizar el cumplimiento de los niveles
              de servicio.
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
              Cargando mediciones...
            </div>
          ) : (
            <InteractiveTable
              data={measurements}
              columnMapping={columnMapping}
              selectColumns={selectColumns}
              nonEditableColumns={nonEditableColumns}
              onEdit={handleEdit}
              onSubmit={handleInlineEdit}
              onDelete={handleDeleteReq}
              onAdd={() => setIsAddOpen(true)}
              path="/contract/sla/measurement/"
              rowsPerPage={10}
              headerButtons={
                <HeaderActions
                  AddComponent={
                    <button
                      onClick={() => setIsAddOpen(true)}
                      className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                      <span>Registrar medición</span>
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
          service={MeasurementService}
          config={dynamicConfig}
          onSuccess={fetchData}
          initialValues={{
            is_compliant: true,
            measurement_date: new Date().toISOString().split('T')[0],
          }}
          onNotify={showAlert}
        />

        <GenericEditModal
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          entityId={selectedId}
          service={MeasurementService}
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
          entityName={MEASUREMENT_CONFIG.name}
        />
      </div>
    </div>
  );
};

export default MeasurementPage;