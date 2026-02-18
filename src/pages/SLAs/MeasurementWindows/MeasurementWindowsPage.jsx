import React, { useEffect, useState } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddMeasurementWindowModal from '../../../components/organisms/Forms/AddMeasurementWindowsModal';
import Alerts from '../../../components/molecules/Alerts';
import MeasurementWindowService from '../../../services/Slas/MeasurementWindows/window.service';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import { getText } from '../../../utils/text';
import { normalizeList } from '../../../utils/api-helpers';

const MeasurementWindowsPage = () => {
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const fetchWindows = async () => {
    setLoading(true);
    try {
      const response = await MeasurementWindowService.getAllWindows();
      const rawList = normalizeList(response);

      const formatted = rawList.map((w, i) => ({
        ...w,
        index: i + 1,
        type_display: w.type_window?.toUpperCase(),
        status_display: w.active === 1 ? '✅ Activa' : '❌ Inactiva',
        period_display: w.period ? (w.period.charAt(0).toUpperCase() + w.period.slice(1)) : 'N/A',
        // Formateo de fechas para visualización rápida
        range_display: w.start_d ? `${new Date(w.start_d).toLocaleDateString()} - ${new Date(w.end_d).toLocaleDateString()}` : 'Indefinido'
      }));

      setWindows(formatted);
    } catch (error) {
        console.error("Error cargando ventanas de medición:", error);
      setAlert({ open: true, message: "Error al cargar las ventanas de medición.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWindows(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Tipo': 'type_display',
    'Definición': 'definition',
    'Periodo': 'period_display',
    'Rango': 'range_display',
    'Estado': 'status_display'
  };

  const handleDelete = async (row) => {
    // Implementar confirmación con Swal si se prefiere
    try {
      await MeasurementWindowService.deleteWindow(row.id);
      setAlert({ open: true, message: "Ventana eliminada con éxito", type: "success" });
      fetchWindows();
    } catch (error) {
        console.error("Error eliminando ventana:", error);
      setAlert({ open: true, message: "No se pudo eliminar el registro", type: "error" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Alerts 
        open={alert.open} 
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("mwindowIntro") || "Gestione los horarios y periodos de medición para los cálculos de disponibilidad"}>
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
            actions={true}
            onEdit={(row) => console.log("Editar Ventana", row.id)}
            onDelete={handleDelete}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nueva Ventana"
                onRefresh={fetchWindows}
              />
            }
          />
        )}
      </div>

      <AddMeasurementWindowModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchWindows} />
    </div>
  );
};

export default MeasurementWindowsPage;