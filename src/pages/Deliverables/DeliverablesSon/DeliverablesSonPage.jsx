import React, { useEffect, useState } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddDeliverableSonModal from '../../../components/organisms/Forms/AddDeliverableSonModal';
import Alerts from '../../../components/molecules/Alerts';
import DeliverableSonService from '../../../services/Deliverables/DeliverablesSon/deliverables-son.service';
import { normalizeList } from '../../../utils/api-helpers';

const DeliverablesSonPage = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });



  const fetchDeliverablesSon = async () => {
    setLoading(true);
    try {
      const response = await DeliverableSonService.getAllDeliverablesSon();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, index) => ({
        ...item,
        index: index + 1,
        type_display: item.type.toUpperCase(),
        priority_display: item.priority === 'high' ? '🔴 Alta' : item.priority === 'medium' ? '🟡 Media' : '🟢 Baja',
        status_display: item.status.toUpperCase(),
        due_date_display: new Date(item.due_date).toLocaleDateString()
      }));

      setDeliverables(formatted);
    } catch (error) {
        console.error("Error fetching sub-deliverables:", error);
      setAlert({ open: true, message: "Error al cargar la lista de sub-entregables.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliverablesSon(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Nombre': 'name',
    'Tipo': 'type_display',
    'Prioridad': 'priority_display',
    'Estado': 'status_display',
    'Fecha Límite': 'due_date_display'
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
          <h1 className="text-2xl font-bold text-gray-800">Sub-Entregables (Hijos)</h1>
          <p className="text-gray-500 text-sm">Gestione las tareas, hitos y actividades asociadas a los entregables principales.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando sub-entregables...</div>
        ) : (
          <InteractiveTable 
            data={deliverables}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await DeliverableSonService.deleteDeliverableSon(row.id);
                fetchDeliverablesSon();
              } catch (e) {
                console.error("Error al eliminar:", e);
                setAlert({ open: true, message: "No se pudo eliminar el registro.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nuevo Sub-Entregable"
                onRefresh={fetchDeliverablesSon}
              />
            }
          />
        )}
      </div>

      <AddDeliverableSonModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchDeliverablesSon} 
      />
    </div>
  );
};

export default DeliverablesSonPage;