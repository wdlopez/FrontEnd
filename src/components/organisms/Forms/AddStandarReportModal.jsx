import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import StandarReportService from "../../../services/Reports/Standar/standar-report.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const OUTPUT_FORMATS = [
  { value: "table", label: "Tabla" },
  { value: "chart", label: "Gráfico / Chart" },
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel (XLSX)" },
];

const AddStandarReportModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const reportFields = [
    {
      name: "report_name",
      type: "text",
      label: "Nombre del Reporte Estándar *",
      placeholder: "Ej: Reporte de Ventas Trimestral",
      required: true,
    },
    {
      name: "output_format",
      type: "select",
      label: "Formato de Salida *",
      options: OUTPUT_FORMATS,
      defaultValue: "table",
      required: true,
    },
    {
      name: "default_parameters",
      type: "text",
      label: "Parámetros por Defecto",
      placeholder: "Ej: start_date: 2025-01-01, end_date: 2025-03-31",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción del Reporte",
      placeholder: "Explique brevemente el propósito de este reporte...",
      fullWidth: true,
      required: false,
    },
    {
      name: "query_definition",
      type: "textarea",
      label: "Definición de Consulta (Formato JSON) *",
      placeholder: 'Ej: { "type": "sql", "query": "SELECT * FROM sales" }',
      fullWidth: true,
      required: true,
    },
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      // Validar y convertir query_definition de string a objeto JSON
      let queryObj;
      try {
        queryObj = JSON.parse(formData.query_definition);
      } catch (e) {
        console.error("Error al parsear query_definition:", e);
        throw new Error("La 'Definición de Consulta' debe ser un objeto JSON válido.");
      }

      const payload = {
        ...formData,
        query_definition: queryObj,
      };

      await StandarReportService.createStandarReport(payload);

      Swal.fire("¡Creado!", "El reporte estándar ha sido registrado.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      const msg = error.response?.data?.message || error.message || "Error al crear el reporte.";
      Swal.fire("Error de Validación", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip
          size="sm"
          message={getText("modals.standardReportInfo") || "Define reportes preestablecidos para todos los usuarios."}
        >
          <span className="material-symbols-outlined text-blue-600">assessment</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Reporte Estándar</h2>
      </div>

      <Form
        fields={reportFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Guardar Reporte"
        gridLayout={true}
        initialValues={{ output_format: "table" }}
      />
    </Modal>
  );
};

export default AddStandarReportModal;