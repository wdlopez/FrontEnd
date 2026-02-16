import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import SchemaNotificationService from "../../../services/Notifications/Schemas/schema.notification.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const AddSchemaNotificationModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const initialValues = {
    client_key: "",
    schema_name: "",
    description: "",
    version: "v1.0"
  };

  const schemaFields = [
    {
      name: "client_key",
      type: "text",
      label: "Client Key (Identificador único) *",
      placeholder: "ej: acme_corp",
      required: true,
      // Validación visual para el usuario
      helperText: "Solo letras, números y guiones bajos (_). Sin espacios.",
      maxLength: 100
    },
    {
      name: "schema_name",
      type: "text",
      label: "Nombre del Esquema",
      placeholder: "ej: client_acme_prod",
      required: false,
      maxLength: 150,
      helperText: "Si se deja vacío, se generará automáticamente."
    },
    {
      name: "version",
      type: "text",
      label: "Versión Inicial",
      placeholder: "v1.0",
      required: false,
      maxLength: 50,
      group: "Detalles"
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      placeholder: "Propósito de este esquema...",
      required: false,
      maxLength: 500,
      fullWidth: true
    }
  ];

  const handleCreateSchema = async (formData) => {
    // Validación manual del regex antes de enviar
    const keyRegex = /^[a-zA-Z0-9_]+$/;
    if (!keyRegex.test(formData.client_key)) {
      Swal.fire("Formato Inválido", "El Client Key solo puede contener letras, números y guiones bajos.", "warning");
      return;
    }

    setLoading(true);
    try {
      await SchemaNotificationService.createSchema(formData);
      
      Swal.fire("¡Creado!", "El esquema de base de datos ha sido registrado.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating schema:", error);
      // Manejo específico del error 409 (Duplicado) definido en tu controlador
      if (error.response && error.response.status === 409) {
        Swal.fire("Error", "Ya existe un esquema con ese Client Key.", "error");
      } else {
        const msg = error.response?.data?.message || "Error al crear el esquema.";
        Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="md" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formSchemaInfo") || "Gestión de esquemas multitenant de base de datos"}>
          <span className="material-symbols-outlined text-gray-400">dns</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Esquema de Base de Datos</h2>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center text-blue-600">
          <span className="material-symbols-outlined animate-spin text-3xl mb-2">settings_suggest</span>
          <p>Provisionando esquema...</p>
        </div>
      ) : (
        <Form
          fields={schemaFields}
          onSubmit={handleCreateSchema}
          initialValues={initialValues}
          sendMessage="Crear Esquema"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddSchemaNotificationModal;