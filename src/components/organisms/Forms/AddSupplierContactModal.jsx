import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import ProviderService from "../../../services/Providers/provider.service";
import ProviderContactService from "../../../services/Providers/Contacts/provider-contact.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddSupplierContactModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [providerOptions, setProviderOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchProviders = async () => {
        try {
          const response = await ProviderService.getAllProviders();
          const list = normalizeList(response);
          setProviderOptions(list.map(p => ({ value: p.id, label: p.name || p.company_name })));
        } catch (error) {
          console.error("Error al cargar proveedores:", error);
          Swal.fire("Aviso", "No se pudieron cargar los proveedores.", "warning");
        }
      };
      fetchProviders();
    }
  }, [isOpen]);

  const formFields = [
    {
      name: "provider_id",
      type: "select",
      label: "Empresa / Proveedor *",
      options: providerOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "first_name",
      type: "text",
      label: "Nombre *",
      placeholder: "Ej: Juan",
      required: true,
    },
    {
      name: "last_name",
      type: "text",
      label: "Apellido *",
      placeholder: "Ej: Pérez",
      required: true,
    },
    {
      name: "email",
      type: "email",
      label: "Correo Electrónico *",
      placeholder: "correo@ejemplo.com",
      required: true,
      fullWidth: true
    },
    {
      name: "phone",
      type: "text",
      label: "Teléfono *",
      placeholder: "Ej: +57 3001234567",
      required: true,
    },
    {
      name: "position",
      type: "text",
      label: "Cargo / Puesto *",
      placeholder: "Ej: Gerente de Ventas",
      required: true,
    },
    {
      name: "is_primary",
      type: "select",
      label: "¿Es contacto principal?",
      options: [
        { value: "false", label: "No" },
        { value: "true", label: "Sí" }
      ],
      required: false,
    }
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      // Transformación para el DTO
      const payload = {
        ...formData,
        is_primary: formData.is_primary === "true"
      };

      await ProviderContactService.createProviderContact(payload);
      Swal.fire("¡Éxito!", "El contacto ha sido creado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear contacto:", error);
      const msg = error.response?.data?.message || "Error al guardar el contacto.";
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
          message={getText("providerContactInfo") || "Registre personas de contacto específicas para cada proveedor."}
        >
          <span className="material-symbols-outlined text-indigo-600">contact_phone</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Contacto de Proveedor</h2>
      </div>

      <Form
        fields={formFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Crear Contacto"
        gridLayout={true}
        initialValues={{ is_primary: "false" }}
      />
    </Modal>
  );
};

export default AddSupplierContactModal;