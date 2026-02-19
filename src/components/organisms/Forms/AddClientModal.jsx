import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "./Form";
import ClientService from "../../../services/Clients/client.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

// Lista de industrias
const INDUSTRIES = [
  { value: "Tecnologia", label: "Tecnología" },
  { value: "Salud", label: "Salud" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Educacion", label: "Educación" },
  { value: "Manufactura", label: "Manufactura" },
  { value: "Comercio", label: "Comercio" },
  { value: "Agroindustria", label: "Agroindustria" },
  { value: "Energia", label: "Energía" },
  { value: "Construccion", label: "Construcción" },
  { value: "Transporte", label: "Transporte" },
  { value: "Turismo", label: "Turismo" },
  { value: "Servicios profesionales", label: "Servicios profesionales" },
  { value: "Bienes raices", label: "Bienes raíces" },
  { value: "Telecomunicaciones", label: "Telecomunicaciones" },
  { value: "Alimentos y bebidas", label: "Alimentos y bebidas" },
];

const AddClientModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const clientFields = [
    {
      name: "name",
      label: "Nombre del cliente",
      type: "text",
      required: true,
      placeholder: "Ej: H&M S.A.",
      // Permitir letras, números, espacios y &, ., -
      onInput: (e) => { 
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s&.\-]/g, ''); 
      }
    },
    {
      name: "document",
      label: "Identificación tributaria (NIT)",
      type: "text",
      required: true,
      placeholder: "999.999.999-9",
      // Solo números y guion
      onInput: (e) => { 
        e.target.value = e.target.value.replace(/[^0-9\-]/g, ''); 
      }
    },
    {
      name: "contactPerson",
      label: "Nombre contacto del cliente",
      type: "text",
      required: true,
      placeholder: "Solo letras y espacios",
      // Solo letras y espacios (incluye tildes y ñ)
      onInput: (e) => { 
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); 
      }
    },
    {
      name: "category",
      label: "Categoría de cliente",
      type: "select",
      required: true,
      options: INDUSTRIES,
    },
    {
      name: "email",
      label: "Correo del cliente",
      type: "email",
      required: true,
      placeholder: "correo@ejemplo.com",
      // Validación Regex estándar
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Formato de correo inválido"
      }
    },
    {
      name: "phone",
      label: "Código país y teléfono",
      type: "text",
      required: true,
      placeholder: "Ej: +57 3001234567",
      // Solo números y el signo +
      onInput: (e) => { 
        e.target.value = e.target.value.replace(/[^0-9+]/g, ''); 
      }
    },
    {
      name: "address",
      label: "Dirección",
      type: "text",
      required: true,
      placeholder: "Calle 123 # 45-67",
      // Campo flexible: letras, números, #, -, .
      onInput: (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s#.\-]/g, '');
      }
    },
  ];

  const handleCreateClient = async (formData) => {
    setLoading(true);
    try {
      // Aplicamos recomendaciones de limpieza (Trim y Lowercase)
      const payload = {
        name: formData.name.trim(),
        contact_person: formData.contactPerson.trim(),
        category: formData.category,
        address: formData.address.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        document_file: formData.document.trim(),
      };

      await ClientService.createClient(payload);

      Swal.fire("¡Creado!", "El cliente ha sido registrado con éxito.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message;
      const errorDisplay = Array.isArray(msg) ? msg.join(", ") : msg || "Error al crear el cliente";
      Swal.fire("Error", errorDisplay, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} setOpen={setIsOpen} size="lg">
      <div className="p-1">
        <div className="flex gap-2 items-center mb-6">
          <InfoTooltip size="sm" message={getText("formClient") || "Formulario para registro de clientes"} sticky={true}>
            <span className="material-symbols-outlined text-gray-400">info</span>
          </InfoTooltip>
          <h2 className="text-xl font-bold text-gray-800">Agregar Nuevo Cliente</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">refresh</span>
            <p className="font-medium">Guardando información...</p>
          </div>
        ) : (
          <Form 
            fields={clientFields} 
            onSubmit={handleCreateClient} 
            sendMessage="Crear Cliente" 
            onCancel={() => setIsOpen(false)}
            gridLayout={true}
          />
        )}
      </div>
    </Modal>
  );
};

export default AddClientModal;