import React, { useState, useEffect } from "react";
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

const EditClientModal = ({ isOpen, setIsOpen, clientId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [clientData, setClientData] = useState(null);

  // Campos del formulario
  const clientFields = [
    {
      name: "name",
      label: "Nombre del Cliente",
      type: "text",
      required: true,
      placeholder: "Ej: Acme Corp",
    },
    {
      name: "document_file",
      label: "Identificación Tributaria (NIT)",
      type: "text",
      required: true,
      placeholder: "Ej: 900.123.456",
    },
    {
      name: "contact_person",
      label: "Persona de Contacto",
      type: "text",
      required: true,
      placeholder: "Nombre completo",
    },
    {
      name: "category",
      label: "Categoría",
      type: "select",
      required: true,
      options: INDUSTRIES,
      placeholder: "Seleccione una categoría",
    },
    {
      name: "email",
      label: "Correo Electrónico",
      type: "email",
      required: true,
      placeholder: "contacto@empresa.com",
    },
    {
      name: "phone",
      label: "Teléfono",
      type: "text",
      required: true,
      placeholder: "+57 300 123 4567",
    },
    {
      name: "address",
      label: "Dirección Física",
      type: "text",
      required: true,
      placeholder: "Calle 123 # 45-67",
    },
  ];

  // Cargar datos del cliente al abrir el modal
  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientData();
    }
  }, [isOpen, clientId]);

  const fetchClientData = async () => {
    setDataLoading(true);
    try {
      const data = await ClientService.getClientById(clientId);
      console.log("📦 Client Data for Edit:", data);

      // Normalizar la respuesta
      let client = {};
      if (data?.data) {
        client = data.data;
      } else if (data?.ClientEntity || data?.client) {
        client = data.ClientEntity || data.client;
      } else {
        client = data;
      }

      setClientData(client);
    } catch (error) {
      console.error("Error cargando datos del cliente:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos del cliente",
        "error"
      );
      setIsOpen(false);
    } finally {
      setDataLoading(false);
    }
  };

  // Manejo del Submit
  const handleUpdateClient = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        contact_person: formData.contact_person,
        category: formData.category,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        document_file: formData.document_file,
      };

      await ClientService.updateClient(clientId, payload);

      Swal.fire(
        "Actualizado!",
        "El cliente ha sido actualizado exitosamente.",
        "success"
      );
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      const msg = error.response?.data?.message;
      const errorDisplay = Array.isArray(msg)
        ? msg.join(", ")
        : msg || "Error al actualizar el cliente";

      Swal.fire("Error", errorDisplay, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
        open={isOpen} 
        setOpen={setIsOpen}
        size="lg"
    >
        <div className="p-1">
            <div className="flex gap-2 items-center mb-6">
                <InfoTooltip size="sm" message={getText("formClient") || "Formulario para edición de clientes"} sticky={true}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h2 className="text-xl font-bold text-gray-800">Editar Cliente</h2>
            </div>

            {dataLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">refresh</span>
                    <p className="font-medium">Cargando información del cliente...</p>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">refresh</span>
                    <p className="font-medium">Guardando cambios...</p>
                </div>
            ) : clientData ? (
                <Form 
                    fields={clientFields} 
                    onSubmit={handleUpdateClient} 
                    sendMessage="Actualizar Cliente" 
                    onCancel={() => setIsOpen(false)}
                    gridLayout={true}
                    initialValues={clientData}
                />
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>No se pudieron cargar los datos del cliente</p>
                </div>
            )}
        </div>
    </Modal>
  );
};

export default EditClientModal;
