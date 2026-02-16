import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import ReportService from "../../../services/Reports/report-ad-hoc.service";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const AddReportAdHocModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const reportFields = [
    {
      name: "report_name",
      type: "text",
      label: "Nombre del Reporte *",
      placeholder: "Ej: Resumen Mensual de Ventas",
      required: true,
    },
    {
      name: "report_definition",
      type: "textarea",
      label: "Definición del Reporte / Parámetros *",
      placeholder: "Describa los filtros o la lógica de la consulta aquí...",
      fullWidth: true,
      required: true,
    },
  ];

  const handleCreateReport = async (formData) => {
    setLoading(true);
    try {
      // Inyectamos el user_id desde el AuthContext
      const payload = {
        ...formData,
        user_id: user?.id,
      };

      if (!payload.user_id) {
        throw new Error("No se pudo identificar la sesión del usuario.");
      }

      await ReportService.createReport(payload);

      Swal.fire("¡Éxito!", "Reporte guardado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear reporte:", error);
      const msg = error.response?.data?.message || error.message || "Error al procesar el reporte.";
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
          message={getText("reportAdHocInfo") || "Crea una configuración de reporte personalizada para ejecutarla posteriormente."}
        >
          <span className="material-symbols-outlined text-orange-500">analytics</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Reporte Ad Hoc</h2>
      </div>

      <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-600 text-sm">person_outline</span>
          <span className="text-xs text-orange-800">
            Autor: <strong>{user?.name || user?.email}</strong>
          </span>
        </div>
      </div>

      <Form
        fields={reportFields}
        onSubmit={handleCreateReport}
        loading={loading}
        sendMessage="Guardar Configuración"
        gridLayout={true}
      />
    </Modal>
  );
};

export default AddReportAdHocModal;