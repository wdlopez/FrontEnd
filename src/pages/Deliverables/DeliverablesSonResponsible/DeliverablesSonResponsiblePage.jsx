import React, { useEffect, useState } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddDeliverableSonResponsibleModal from '../../../components/organisms/Forms/AddDeliverablesSonResponsibleModal';
import Alerts from '../../../components/molecules/Alerts';
// Asume que creaste este servicio basándote en la estructura de los anteriores
import DeliverableSonResponsibleService from '../../../services/Deliverables/DeliverablesSonResponsible/deliverables-son-responsible.service';
import { normalizeList } from '../../../utils/api-helpers';

const DeliverablesSonResponsiblePage = () => {
  const [responsibles, setResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const fetchResponsibles = async () => {
    setLoading(true);
    try {
      const response = await DeliverableSonResponsibleService.getAllDeliverablesSonResponsible();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, index) => {
        // Lógica visual para saber qué ID mostrar en la tabla sin llenar todo de UUIDs largos
        let assignedId = 'N/A';
        if (item.responsible_type === 'internal') assignedId = item.user_id || 'Sin asignar';
        if (item.responsible_type === 'provider') assignedId = item.provider_contact_id || 'Sin asignar';
        if (item.responsible_type === 'client') assignedId = item.client_contact_id || 'Sin asignar';

        // Acortamos el UUID del sub-entregable para que la tabla no sea inmensa
        const shortSubDeliverableId = item.deliverableSon_id 
            ? `${item.deliverableSon_id.substring(0, 8)}...` 
            : 'Desconocido';

        return {
          ...item,
          index: index + 1,
          type_display: item.responsible_type.toUpperCase(),
          sub_deliverable_short: shortSubDeliverableId,
          assigned_to: assignedId
        };
      });

      setResponsibles(formatted);
    } catch (error) {
        console.error("Error al cargar responsables de sub-entregables:", error);
      setAlert({ open: true, message: "Error al cargar la lista de responsables.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResponsibles(); }, []);

  const columnMapping = {
    'N°': 'index',
    'ID Sub-Entregable': 'sub_deliverable_short',
    'Tipo Asignación': 'type_display',
    'ID del Responsable': 'assigned_to',
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
          <h1 className="text-2xl font-bold text-gray-800">Responsables de Sub-Entregables</h1>
          <p className="text-gray-500 text-sm">Gestiona qué usuario interno, cliente o proveedor está a cargo de cada tarea o hito.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando asignaciones...</div>
        ) : (
          <InteractiveTable 
            data={responsibles}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await DeliverableSonResponsibleService.deleteDeliverableSonResponsible(row.id);
                fetchResponsibles();
              } catch (e) {
                console.error("Error al eliminar asignación:", e);
                setAlert({ open: true, message: "No se pudo eliminar la asignación.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Asignar Responsable"
                onRefresh={fetchResponsibles}
              />
            }
          />
        )}
      </div>

      <AddDeliverableSonResponsibleModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchResponsibles} 
      />
    </div>
  );
};

export default DeliverablesSonResponsiblePage;