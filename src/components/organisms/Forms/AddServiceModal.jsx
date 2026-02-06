import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import ServiceService from "../../../services/Contracts/Services/service.service";
import ContractService from "../../../services/Contracts/contract.service"; // Necesario para el select
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const CHARGES_MODEL_OPTIONS = [
  { value: 1, label: "Fee (Con tarifa)" },
  { value: 0, label: "No-Fee (Sin tarifa)" },
];

const AddServiceModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractsList, setContractsList] = useState([]);

  // Cargar contratos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const fetchContracts = async () => {
        setLoadingContracts(true);
        try {
          const response = await ContractService.getAllContracts(); // Asumiendo este método existe
          const data = normalizeList(response);
          
          setContractsList(
            data.map((c) => ({
              value: c.id,
              // Mostramos el número de contrato o el alias como etiqueta
              label: `${c.contract_number} - ${c.keyName || c.description || 'Sin Alias'}`, 
            }))
          );
        } catch (error) {
          console.error("Error loading contracts:", error);
          Swal.fire("Advertencia", "No se pudo cargar la lista de contratos", "warning");
        } finally {
          setLoadingContracts(false);
        }
      };
      fetchContracts();
    }
  }, [isOpen]);

  const serviceFields = [
    {
      name: "contract_id",
      type: "select",
      label: "Contrato Asociado *",
      options: contractsList,
      required: true,
      placeholder: "Seleccione un contrato...",
    },
    {
      name: "tower",
      type: "text",
      label: "Torre *",
      placeholder: "Ej: Infraestructura",
      required: true,
    },
    {
      name: "group",
      type: "text",
      label: "Grupo *",
      placeholder: "Ej: Servidores Linux",
      required: true,
    },
    {
      name: "resource_u",
      type: "text",
      label: "Unidad Recurso *",
      placeholder: "Ej: Horas, Licencias",
      required: true,
    },
    {
      name: "charges_model",
      type: "select",
      label: "Modelo de Cobro *",
      options: CHARGES_MODEL_OPTIONS,
      required: true,
      defaultValue: 1,
      group: "Financiero",
    },
    {
      name: "baseline",
      type: "number",
      label: "Línea Base (Baseline) *",
      placeholder: "0",
      required: true,
      group: "Financiero",
    },
    {
      name: "value",
      type: "number",
      label: "Valor Unitario *",
      placeholder: "0",
      required: true,
      group: "Financiero",
    },
    {
      name: "sum_total",
      type: "number",
      label: "Suma Total *",
      placeholder: "0",
      required: true,
      group: "Financiero",
    },
    {
      name: "start_d",
      type: "date",
      label: "Fecha Inicio *",
      required: true,
      group: "Vigencia",
    },
    {
      name: "end_d",
      type: "date",
      label: "Fecha Fin",
      required: false,
      group: "Vigencia",
    },
    {
      name: "active",
      type: "checkbox",
      label: "Servicio Activo",
      defaultValue: true,
    },
  ];

  const handleCreateService = async (formData) => {
    setLoading(true);
    try {
      // 1. Limpieza y conversión de tipos (DTO estricto con Ints)
      const payload = {
        contract_id: formData.contract_id,
        tower: formData.tower,
        group: formData.group,
        resource_u: formData.resource_u,
        
        // Conversión a enteros
        baseline: parseInt(formData.baseline, 10),
        value: parseInt(formData.value, 10),
        sum_total: parseInt(formData.sum_total, 10),
        charges_model: parseInt(formData.charges_model, 10),
        
        // Fechas y Booleanos
        start_d: formData.start_d,
        end_d: formData.end_d || undefined, // Evitar string vacío
        active: !!formData.active, // Asegurar booleano
      };

      await ServiceService.createService(payload);

      Swal.fire("¡Éxito!", "Servicio registrado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creando servicio:", error);
      const msg = error.response?.data?.message || error.message;
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      Swal.fire("Error", displayMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formService") || "Detalle de Servicios Contratados"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Agregar Servicio</h2>
      </div>

      {loadingContracts ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 mb-2">refresh</span>
          <p className="text-gray-500 italic">Cargando lista de contratos...</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          <p className="mt-4 text-gray-600 font-medium">Guardando servicio...</p>
        </div>
      ) : (
        <Form
          fields={serviceFields}
          onSubmit={handleCreateService}
          initialValues={{ 
            active: true, 
            charges_model: 1,
            contract_id: "" 
          }}
          sendMessage="Guardar Servicio"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddServiceModal;