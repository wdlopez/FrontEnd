import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "./Form";
import MeasurementWindowService from "../../../services/Slas/MeasurementWindows/window.service"; // Ajustar ruta según corresponda
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const WINDOW_TYPE_OPTIONS = [
  { value: "standard", label: "Estándar" },
  { value: "business_hours", label: "Horario Hábil" },
  { value: "24_7", label: "24/7" },
  { value: "maintenance", label: "Mantenimiento" },
];

const PERIOD_OPTIONS = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "annual", label: "Anual" },
];

const AddMeasurementWindowModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const mWindowFields = [
    {
      name: "type_window",
      type: "select",
      label: "Tipo de Ventana *",
      options: WINDOW_TYPE_OPTIONS,
      required: true,
    },
    {
      name: "definition",
      type: "text",
      label: "Definición / Nombre *",
      placeholder: "Ej: Horario de Oficina Bogotá",
      required: true,
    },
    {
      name: "period",
      type: "select",
      label: "Periodicidad",
      options: PERIOD_OPTIONS,
      defaultValue: "daily",
    },
    {
      name: "active",
      type: "select",
      label: "Estado",
      options: [
        { value: 1, label: "Activa" },
        { value: 0, label: "Inactiva" }
      ],
      defaultValue: 1,
    },
    {
      name: "start_d",
      type: "datetime-local",
      label: "Fecha/Hora Inicio",
      required: false,
    },
    {
      name: "end_d",
      type: "datetime-local",
      label: "Fecha/Hora Fin",
      required: false,
    },
    {
      name: "exclusions",
      type: "textarea",
      label: "Exclusiones (JSON)",
      placeholder: 'Ej: { "holidays": ["2026-01-01"] }',
      fullWidth: true,
    },
    {
      name: "inclusions",
      type: "textarea",
      label: "Inclusiones (JSON)",
      placeholder: 'Ej: { "weekends": ["sat"] }',
      fullWidth: true,
    },
  ];

  const handleCreateMWindow = async (formData) => {
    setLoading(true);
    try {
      // Procesar JSON de exclusiones/inclusiones si existen
      const payload = {
        ...formData,
        active: Number(formData.active),
        exclusions: formData.exclusions ? JSON.parse(formData.exclusions) : {},
        inclusions: formData.inclusions ? JSON.parse(formData.inclusions) : {},
        // Asegurar que las fechas se envíen en formato ISO si están presentes
        start_d: formData.start_d ? new Date(formData.start_d).toISOString() : undefined,
        end_d: formData.end_d ? new Date(formData.end_d).toISOString() : undefined,
      };

      await MeasurementWindowService.createWindow(payload);

      Swal.fire("¡Éxito!", "Ventana de medición creada correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      let errorMsg = "Error al procesar el formulario.";
      if (error instanceof SyntaxError) {
        errorMsg = "El formato JSON de exclusiones o inclusiones no es válido.";
      } else {
        const backendMsg = error.response?.data?.message;
        errorMsg = Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg || errorMsg;
      }
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("mwindowFormInfo") || "Define los rangos de tiempo donde se aplicarán las métricas del SLA"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Ventana de Medición</h2>
      </div>

      <Form
        fields={mWindowFields}
        onSubmit={handleCreateMWindow}
        loading={loading}
        sendMessage="Registrar Ventana"
        gridLayout={true}
      />
    </Modal>
  );
};

export default AddMeasurementWindowModal;