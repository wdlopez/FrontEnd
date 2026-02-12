import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import DeliverableService from "../../../services/Deliverables/deliverable.service";
import ContractService from "../../../services/Contracts/contract.service";
import ServiceService from "../../../services/Contracts/Services/service.service"; 
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

// Opciones estáticas basadas en la lógica de negocio común
const TYPE_OPTIONS = [
  { value: "report", label: "Informe (Report)" },
  { value: "file", label: "Archivo (File)" },
  { value: "presentation", label: "Presentación" },
  { value: "software", label: "Software / Código" },
];

const FREQUENCY_OPTIONS = [
  { value: "one-off", label: "Única vez" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

const AddDeliverableModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [options, setOptions] = useState({ contracts: [], services: [] });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          // 1. Cargar Contratos
          const contractsResponse = await ContractService.getAllContracts();
          const contractsList = normalizeList(contractsResponse);
          
          // 2. Cargar Servicios (Simulado: Reemplaza con tu ServiceService real)
          const servicesResponse = await ServiceService.getAllServices();
          const servicesList = normalizeList(servicesResponse);
          
          

          setOptions({
            contracts: contractsList.map((c) => ({
              value: c.id,
              label: `${c.contract_number} - ${c.name || 'Contrato'}`,
            })),
            services: servicesList.map((s) => ({
              value: s.id,
              label: s.name || 'Servicio',
            })),
          });
        } catch (error) {
          console.error("Error cargando datos dependientes:", error);
          Swal.fire("Aviso", "No se pudieron cargar listas desplegables.", "warning");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const deliverableFields = [
    {
      name: "contract_id",
      type: "select",
      label: "Contrato *",
      options: options.contracts,
      required: true,
    },
    {
      name: "service_id",
      type: "select",
      label: "Servicio Asociado *",
      options: options.services,
      required: true,
    },
    {
      name: "deliverable_number",
      type: "text",
      label: "N° Entregable *",
      placeholder: "Ej: DEL-001",
      required: true,
    },
    {
      name: "name",
      type: "text",
      label: "Nombre del Entregable *",
      placeholder: "Ej: Informe Semanal de KPIs",
      required: true,
    },
    {
      name: "type",
      type: "select",
      label: "Tipo *",
      options: TYPE_OPTIONS,
      required: true,
    },
    {
      name: "frequency",
      type: "select",
      label: "Frecuencia *",
      options: FREQUENCY_OPTIONS,
      required: true,
    },
    {
      name: "due_date",
      type: "date",
      label: "Fecha Límite *",
      required: true,
    },
    {
      name: "priority",
      type: "select",
      label: "Prioridad",
      options: PRIORITY_OPTIONS,
      defaultValue: "medium",
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      placeholder: "Detalles adicionales...",
      required: false,
      fullWidth: true,
    },
  ];

  const handleCreateDeliverable = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        // Valores por defecto definidos en el DTO/Entity si no vienen en el form
        status: "pending", 
        active: true
      };

      await DeliverableService.createDeliverable(payload);

      Swal.fire("¡Creado!", "El entregable ha sido registrado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Error desconocido";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formDeliverable") || "Gestión de los bienes o servicios a entregar"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Entregable</h2>
      </div>

      {loadingData ? (
        <div className="py-20 text-center text-gray-500 italic">Cargando contratos y servicios...</div>
      ) : loading ? (
        <div className="py-20 text-center italic font-bold">Guardando entregable...</div>
      ) : (
        <Form
          fields={deliverableFields}
          onSubmit={handleCreateDeliverable}
          initialValues={{ priority: "medium", type: "report", frequency: "monthly" }}
          sendMessage="Guardar Entregable"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddDeliverableModal;