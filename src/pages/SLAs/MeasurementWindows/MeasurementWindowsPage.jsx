import React, { useEffect, useState, useCallback } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import Alerts from '../../../components/molecules/Alerts';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import GenericAddModal from '../../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../../components/organisms/Forms/ConfirmActionModal';

import MWindowService from '../../../services/Slas/MeasurementWindows/mwindow.service';
import { MWINDOW_CONFIG } from '../../../config/entities/mwindow.config';
import { mapBackendToTable } from '../../../utils/entityMapper';
import { normalizeList } from '../../../utils/api-helpers';
import { getText } from '../../../utils/text';

const MeasurementWindowsPage = () => {
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(MWINDOW_CONFIG);

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await MWindowService.getAll();
      const rawList = normalizeList(response);
      setWindows(mapBackendToTable(rawList, MWINDOW_CONFIG));
    } catch (error) {
      console.error("Error cargando ventanas de medición:", error);
      setAlert({ open: true, message: "Error al cargar las ventanas de medición.", type: "error" });
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

  dynamicConfig.columns.forEach(col => {
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
      await MWindowService.update(row.id, { [realColumn]: newValue });
      setWindows(prev => prev.map(w =>
        w.id === row.id ? { ...w, [column]: newValue } : w
      ));
      setAlert({ open: true, message: 'Campo actualizado correctamente', type: 'success' });
    } catch (error) {
      console.error("Error actualizando campo:", error);
      setAlert({ open: true, message: 'No se pudo actualizar el campo', type: 'error' });
    }
  };

  const handleDeleteReq = (row) => {
    setSelectedRow({ 
        id: row.id, 
        name: row["Definición"] || "Ventana", 
        state: true 
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await MWindowService.delete(data.id);
      setAlert({ open: true, message: "Ventana eliminada con éxito", type: "success" });
      setWindows(prev => prev.filter(w => w.id !== data.id));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error eliminando ventana:", error);
      setAlert({ open: true, message: "No se pudo eliminar el registro", type: "error" });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alerts 
        open={alert.open} 
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("intros.measurementWindows") || "Gestione los horarios y periodos de medición para los cálculos de disponibilidad"} sticky={true}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Ventanas de Medición</h1>
          </div>
          <p className="text-gray-500 text-sm">Parámetros temporales y excepciones para el cumplimiento de niveles de servicio.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">Cargando ventanas...</div>
        ) : (
          <InteractiveTable 
            data={windows}
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={handleEdit}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteReq}
            onAdd={() => setIsAddOpen(true)}
            path="/contract/sla/measurement-windows/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsAddOpen(true)}
                addButtonLabel="Nueva Ventana"
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
        service={MWindowService}
        config={dynamicConfig}
        onSuccess={fetchData}
        initialValues={{
          active: 1,
          period: "daily",
          type_window: "standard",
          exclusions: "{}",
          inclusions: "{}"
        }}
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={MWindowService} 
        config={dynamicConfig} 
        onSuccess={fetchData}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        setIsOpen={setIsDeleteOpen} 
        data={selectedRow} 
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={MWINDOW_CONFIG.name}
      />
    </div>
  );
};

export default MeasurementWindowsPage;
