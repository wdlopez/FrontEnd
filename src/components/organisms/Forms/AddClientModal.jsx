import React from 'react';
import Modal from '../../molecules/Modal';
import Form from './Form';
import ClientService from '../../../services/Clients/client.service';
import Swal from 'sweetalert2';
import InfoTooltip from '../../atoms/InfoToolTip';
import { getText } from '../../../utils/text';

// Lista de industrias
const INDUSTRIES = [
  { value: "Tecnologia", label: "Tecnología" },
  { value: "Salud", label: "Salud" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Educacion", label: "Educación" },
  { value: "Manufactura", label: "Manufactura" },
  { value: "Comercio", label: "Comercio" },
  { value: "Agroindustria", label: "Agroindustria" },
  { value: "Energía", label: "Energía" },
  { value: "Construccion", label: "Construcción" },
  { value: "Transporte", label: "Transporte" },
  { value: "Turismo", label: "Turismo" },
  { value: "Servicios profesionales", label: "Servicios profesionales" },
  { value: "Bienes raices", label: "Bienes raíces" },
  { value: "Telecomunicaciones", label: "Telecomunicaciones" },
  { value: "Alimentos y bebidas", label: "Alimentos y bebidas" }
];

const AddClientModal = ({ isOpen, setIsOpen, onSuccess }) => {
  // Definición de campos del Formulario
  const clientFields = [
    {
      name: 'name',
      label: 'Nombre del Cliente',
      type: 'text',
      required: true,
      placeholder: 'Ej: Acme Corp'
    },
    {
      name: 'document',
      label: 'Identificación Tributaria (NIT)',
      type: 'text',
      required: true,
      placeholder: 'Ej: 900.123.456'
    },
    {
      name: 'contactPerson',
      label: 'Persona de Contacto',
      type: 'text',
      required: true,
      placeholder: 'Nombre completo'
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: INDUSTRIES,
      placeholder: 'Seleccione una categoría'
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'contacto@empresa.com'
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
      required: true,
      placeholder: '+57 300 123 4567'
    },
    {
      name: 'address',
      label: 'Dirección Física',
      type: 'text',
      required: true,
      placeholder: 'Calle 123 # 45-67'
    }
  ];

  // Manejo del Submit
  const handleCreateClient = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        contact_person: formData.contactPerson,
        category: formData.category,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        document_file: formData.document
      };

      await ClientService.createClient(payload);
      
      Swal.fire('Creado!', 'El cliente ha sido creado exitosamente.', 'success');
      setIsOpen(false);
      if (onSuccess) onSuccess(); // Recargar tabla padre

    } catch (error) {
      console.error('Error creando cliente:', error);
      const errorMsg = error.response?.data?.message || 'Error al crear el cliente';
      Swal.fire('Error', errorMsg, 'error');
    }
  };

  return (
    <Modal 
      open={isOpen} 
      setOpen={setIsOpen}
      size="lg"
    >
      <div>
        <div className="flex gap-2 items-center mb-4">
            <InfoTooltip size="sm" message={getText("formClient")} sticky={true}>
                <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h2 className="text-xl font-bold text-gray-800">Agregar Nuevo Cliente</h2>
        </div>
        <Form 
          fields={clientFields} 
          onSubmit={handleCreateClient} 
          sendMessage="Crear Cliente" 
          onCancel={() => setIsOpen(false)}
          gridLayout={true}
        />
      </div>
    </Modal>
  );
};

export default AddClientModal;