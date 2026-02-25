import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import DocumentTemplateService from "../../../services/Others/DocumentTemplate/document-template.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const TEMPLATE_TYPES = [
  { value: "legal", label: "Legal" },
  { value: "administrative", label: "Administrativo" },
  { value: "technical", label: "Técnico" },
  { value: "hr", label: "Recursos Humanos" },
  { value: "other", label: "Otro" },
];

const AddDocumentTemplateModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const templateFields = [
    {
      name: "template_name",
      type: "text",
      label: "Nombre de la Plantilla *",
      placeholder: "Ej: Contrato de Prestación de Servicios",
      required: true,
    },
    {
      name: "template_type",
      type: "select",
      label: "Tipo de Documento *",
      options: TEMPLATE_TYPES,
      required: true,
    },
    {
      name: "file_path",
      type: "text",
      label: "Ruta o URL del Archivo *",
      placeholder: "Ej: /templates/legal/contrato_base.docx",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      placeholder: "Explica brevemente para qué sirve esta plantilla...",
      fullWidth: true,
      required: false,
    },
  ];

  const handleCreateTemplate = async (formData) => {
    setLoading(true);
    try {
      // Aunque el DTO no pide explícitamente el usuario, 
      // es buena práctica tener el payload limpio
      await DocumentTemplateService.createDocument(formData);

      Swal.fire("¡Éxito!", "Plantilla creada correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear plantilla:", error);
      const msg = error.response?.data?.message || "Error al procesar la solicitud.";
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
          message={getText("modals.docTemplateInfo") || "Gestiona los formatos base para la generación automática de documentos."}
        >
          <span className="material-symbols-outlined text-blue-500">description</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Plantilla</h2>
      </div>

      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-xs text-gray-600">
        <span className="material-symbols-outlined text-sm">info</span>
        <span>Asegúrese de que la ruta del archivo sea accesible por el sistema de generación.</span>
      </div>

      <Form
        fields={templateFields}
        onSubmit={handleCreateTemplate}
        loading={loading}
        sendMessage="Registrar Plantilla"
        gridLayout={true}
      />
    </Modal>
  );
};

export default AddDocumentTemplateModal;