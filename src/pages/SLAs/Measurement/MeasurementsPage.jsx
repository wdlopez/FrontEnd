import React, { useEffect, useState } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddMeasurementModal from '../../../components/organisms/Forms/AddMeasurementModal';
import Alerts from '../../../components/molecules/Alerts';
import MeasurementService from '../../../services/Slas/Measurement/measurement.service';
import { normalizeList } from '../../../utils/api-helpers';

const MeasurementPage = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const fetchMeasurements = async () => {
    setLoading(true);
    try {
      const response = await MeasurementService.getAllMeasurements();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, index) => {
        // Formateo de fecha (evitando problemas de timezone si el backend manda ISO puro)
        const dateObj = new Date(item.measurement_date);
        
        // Acortamos el UUID para no saturar la tabla si no viene el objeto SLA populado
        const shortSlaId = item.sla_id ? `${item.sla_id.substring(0, 8)}...` : 'N/A';

        return {
          ...item,
          index: index + 1,
          date_display: dateObj.toLocaleDateString(),
          value_display: Number(item.actual_value).toFixed(2), // Mostramos con 2 decimales siempre
          compliant_display: item.is_compliant ? '✅ Cumple' : '❌ No Cumple',
          sla_display: shortSlaId
        };
      });

      setMeasurements(formatted);
    } catch (error) {
      console.error("Error cargando mediciones:", error);
      setAlert({ open: true, message: "Error al cargar las mediciones de SLA.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeasurements(); }, []);

  const columnMapping = {
    'N°': 'index',
    'ID SLA': 'sla_display',
    'Fecha': 'date_display',
    'Valor Real': 'value_display',
    'Estado': 'compliant_display',
  };

  return (
    <div className="p-6 space-y-6">
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mediciones de SLA</h1>
          <p className="text-gray-500 text-sm">Registre y evalúe los valores reales obtenidos contra los Acuerdos de Nivel de Servicio.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando mediciones...</div>
        ) : (
          <InteractiveTable 
            data={measurements}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await MeasurementService.deleteMeasurement(row.id);
                fetchMeasurements();
              } catch (e) {
                console.error("Error eliminando medición:", e);
                setAlert({ open: true, message: "No se pudo eliminar la medición.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Registrar Medición"
                onRefresh={fetchMeasurements}
              />
            }
          />
        )}
      </div>

      <AddMeasurementModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchMeasurements} 
      />
    </div>
  );
};

export default MeasurementPage;