import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form"; // Ajusta la ruta si es './Form' o '../Forms/Form'
import ProviderService from "../../../services/Providers/provider.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const RISK_LEVELS = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
];

const AddSuppliersModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Definición de campos (CamelCase para el form, luego lo mapeamos)
  const supplierFields = [
    {
      name: "legalName",
      label: "Razón Social",
      type: "text",
      required: true,
      placeholder: "Ej: Tech Solutions S.A.S",
    },
    {
      name: "taxId",
      label: "ID Tributario / NIT",
      type: "text",
      required: true,
      placeholder: "Ej: 900123456-1",
    },
    {
      name: "providerType",
      label: "Tipo de Proveedor",
      type: "text",
      required: true,
      placeholder: "Ej: Hardware, Servicios, Consultoría",
      // Nota: El backend valida /^[a-zA-Z\s]+$/ (solo letras y espacios)
    },
    {
      name: "riskLevel",
      label: "Nivel de Riesgo",
      type: "select",
      required: true,
      options: RISK_LEVELS,
      defaultValue: "medium",
    },
  ];

  const handleCreateProvider = async (formData) => {
    setLoading(true);
    try {
      // Mapeo de CamelCase (Front) a SnakeCase (Back - DTO)
      const payload = {
        legal_name: formData.legalName,
        tax_id: formData.taxId,
        provider_type: formData.providerType,
        risk_level: formData.riskLevel || "medium",
      };

      await ProviderService.createProvider(payload);

      Swal.fire(
        "¡Creado!",
        "El proveedor ha sido registrado exitosamente.",
        "success"
      );
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creando proveedor:", error);
      // Lógica de error estandarizada
      const msg = error.response?.data?.message;
      const errorDisplay = Array.isArray(msg)
        ? msg.join(", ")
        : msg || "Error al crear el proveedor";

      Swal.fire("Error", errorDisplay, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} setOpen={setIsOpen} size="lg">
      <div className="p-1">
        <div className="flex gap-2 items-center mb-6">
          <InfoTooltip
            size="sm"
            message={getText("formSupplier") || "Registro de nuevos proveedores"}
            sticky={true}
          >
            <span className="material-symbols-outlined text-gray-400">info</span>
          </InfoTooltip>
          <h2 className="text-xl font-bold text-gray-800">
            Agregar Nuevo Proveedor
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">
              refresh
            </span>
            <p className="font-medium">Guardando proveedor...</p>
          </div>
        ) : (
          <Form
            fields={supplierFields}
            onSubmit={handleCreateProvider}
            initialValues={{ riskLevel: "medium" }}
            sendMessage="Crear Proveedor"
            onCancel={() => setIsOpen(false)}
            gridLayout={true}
          />
        )}
      </div>
    </Modal>
  );
};

export default AddSuppliersModal;