import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import ProviderService from "../../../services/Providers/provider.service";
import ProviderRiskService from "../../../services/Providers/Risks/provider-risk.service";
import { useAuth } from "../../../context/AuthContext"; // Importamos tu hook
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddSupplierRiskModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const { user } = useAuth(); // Extraemos el usuario logueado
  const [loading, setLoading] = useState(false);
  const [providerOptions, setProviderOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchProviders = async () => {
        try {
          const response = await ProviderService.getAllProviders();
          const list = normalizeList(response);
          setProviderOptions(list.map(p => ({ 
            value: p.id, 
            label: p.legal_name || p.name || "Proveedor sin nombre" 
          })));
        } catch (error) {
          console.error("Error al cargar proveedores:", error);
        }
      };
      fetchProviders();
    }
  }, [isOpen]);

  const formFields = [
    {
      name: "provider_id",
      type: "select",
      label: "Proveedor *",
      options: providerOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "title",
      type: "text",
      label: "Título del Riesgo *",
      placeholder: "Ej: Riesgo de ciberseguridad en infraestructura",
      required: true,
      fullWidth: true
    },
    {
      name: "impact",
      type: "select",
      label: "Impacto *",
      options: [
        { value: "low", label: "Bajo" },
        { value: "medium", label: "Medio" },
        { value: "high", label: "Alto" }
      ],
      required: true,
    },
    {
      name: "probability",
      type: "select",
      label: "Probabilidad *",
      options: [
        { value: "low", label: "Baja" },
        { value: "medium", label: "Media" },
        { value: "high", label: "Alta" }
      ],
      required: true,
    },
    {
      name: "due_date",
      type: "date",
      label: "Fecha Límite de Mitigación",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      required: false,
      fullWidth: true
    },
    {
      name: "mitigation_plan",
      type: "textarea",
      label: "Plan de Acción / Mitigación",
      required: false,
      fullWidth: true
    }
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      // Estructuramos el payload igual que en contratos
      const payload = {
        ...formData,
        created_by: user?.id, // Asignamos el ID del usuario del contexto
        status: "identified", // Estado inicial según backend
      };

      // Validación de seguridad por si el contexto falla
      if (!payload.created_by) {
        throw new Error("No se pudo identificar al usuario activo. Por favor, reincie sesión.");
      }

      // Limpiamos campos vacíos para evitar errores de validación UUID o Fecha
      if (!payload.due_date) delete payload.due_date;
      else payload.due_date = new Date(payload.due_date).toISOString();

      await ProviderRiskService.createProviderRisk(payload);
      
      Swal.fire("¡Registrado!", "Riesgo de proveedor creado con éxito.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear riesgo:", error);
      const msg = error.response?.data?.message || error.message;
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("riskInfo") || "Gestión de Riesgos"}>
          <span className="material-symbols-outlined text-red-500">gpp_maybe</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Identificar Riesgo</h2>
      </div>

      <Form
        fields={formFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Guardar Riesgo"
        gridLayout={true}
      />
    </Modal>
  );
};

export default AddSupplierRiskModal;