import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import MeasurementService from "../../../services/Slas/Measurement/measurement.service";
import SlasService from "../../../services/Slas/sla.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddMeasurementModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [slaOptions, setSlaOptions] = useState([]);

  // Cargar los SLAs disponibles al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchSlas = async () => {
        try {
          const response = await SlasService.getAllSlas();
          const slasList = normalizeList(response);
          setSlaOptions(slasList.map(sla => ({ value: sla.id, label: sla.name || sla.id })));
        } catch (error) {
          console.error("Error cargando SLAs:", error);
          Swal.fire("Aviso", "No se pudieron cargar los acuerdos SLA.", "warning");
        }
      };
      fetchSlas();
    }
  }, [isOpen]);

  const formFields = [
    {
      name: "sla_id",
      type: "select",
      label: "Acuerdo SLA *",
      options: slaOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "measurement_date",
      type: "date",
      label: "Fecha de Medición *",
      required: true,
    },
    {
      name: "actual_value",
      type: "number",
      label: "Valor Real Medido *",
      placeholder: "Ej: 99.85",
      required: true,
      step: "0.01" // Permite decimales para el SLA
    },
    {
      name: "is_compliant",
      type: "select",
      label: "¿Cumple con el SLA? *",
      options: [
        { value: "true", label: "Sí, cumple" },
        { value: "false", label: "No cumple" }
      ],
      required: true,
    },
    {
      name: "comments",
      type: "textarea",
      label: "Comentarios",
      placeholder: "Observaciones adicionales sobre esta medición...",
      required: false,
      fullWidth: true
    }
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      // Transformación de datos para cumplir estrictamente con el DTO del backend
      const payload = {
        ...formData,
        actual_value: parseFloat(formData.actual_value),
        is_compliant: formData.is_compliant === "true", // Conversión de string a boolean
        measurement_date: new Date(formData.measurement_date).toISOString() // Conversión a ISO 8601
      };

      await MeasurementService.createMeasurement(payload);
      Swal.fire("¡Registrado!", "La medición del SLA se ha guardado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear medición:", error);
      const msg = error.response?.data?.message || "Error al guardar el registro.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip
          size="sm"
          message={getText("modals.slaMeasurementInfo") || "Registra el valor real obtenido para evaluar el cumplimiento de un SLA."}
        >
          <span className="material-symbols-outlined text-blue-600">query_stats</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Medición de SLA</h2>
      </div>

      <Form
        fields={formFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Registrar Medición"
        gridLayout={true}
        initialValues={{ is_compliant: "true" }} // Por defecto lo marcamos como que sí cumple
      />
    </Modal>
  );
};

export default AddMeasurementModal;