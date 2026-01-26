import React, { useState } from 'react';
import Modal from '../../molecules/Modal'; // Asegúrate de que la ruta sea correcta
import Button from '../../atoms/Button';
import Input from '../../atoms/Input'; // O FormField si lo usas para label+input
import ClientService from '../../../services/Clients/client.service';
import { useForm } from '../../../hooks/useForm'; // Usando tu hook personalizado

// Lista de industrias (puedes moverla a un archivo de config)
const INDUSTRIES = [
  { value: "Tecnología", label: "Tecnología" },
  { value: "Salud", label: "Salud" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Educación", label: "Educación" },
  { value: "Manufactura", label: "Manufactura" },
  { value: "Comercio", label: "Comercio" },
  { value: "Agroindustria", label: "Agroindustria" },
  { value: "Energía", label: "Energía" },
  { value: "Construcción", label: "Construcción" },
  { value: "Transporte", label: "Transporte" },
  { value: "Turismo", label: "Turismo" },
  { value: "Servicios profesionales", label: "Servicios profesionales" },
  { value: "Bienes raíces", label: "Bienes raíces" },
  { value: "Telecomunicaciones", label: "Telecomunicaciones" },
  { value: "Alimentos y bebidas", label: "Alimentos y bebidas" }
];

const AddClientModal = ({ isOpen, onClose, onSuccess, setAlert }) => {
  const [loading, setLoading] = useState(false);

  // Estado inicial del formulario
  const initialState = {
    name: '',
    contactPerson: '',
    category: '',
    address: '',
    email: '',
    phone: '',
    document: ''
  };

  const { values, handleInputChange, resetForm } = useForm(initialState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mapeo de datos si tu backend requiere nombres específicos
      // Si tu CreateClientDto espera "name", enviamos "name".
      const payload = {
        name: values.name,
        contactPerson: values.contactPerson,
        category: values.category,
        address: values.address,
        email: values.email,
        phone: values.phone,
        document: values.document // NIT o Identificación
      };

      await ClientService.createClient(payload);
      
      setAlert({ open: true, message: "Cliente creado exitosamente", type: "success" });
      resetForm();
      if (onSuccess) onSuccess(); // Recargar tabla
      onClose(); // Cerrar modal

    } catch (error) {
      console.error("Error creando cliente:", error);
      const errorMsg = error.response?.data?.message || "Error al crear el cliente";
      setAlert({ open: true, message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Agregar Nuevo Cliente"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Cliente"
            name="name"
            value={values.name}
            onChange={handleInputChange}
            placeholder="Ej: Acme Corp"
            required
          />
          <Input
            label="Identificación Tributaria (NIT)"
            name="document"
            value={values.document}
            onChange={handleInputChange}
            placeholder="Ej: 900.123.456"
            required
          />
          <Input
            label="Persona de Contacto"
            name="contactPerson"
            value={values.contactPerson}
            onChange={handleInputChange}
            placeholder="Nombre completo"
            required
          />
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="category"
              value={values.category}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione una categoría</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            value={values.email}
            onChange={handleInputChange}
            placeholder="contacto@empresa.com"
            required
          />
          <Input
            label="Teléfono"
            name="phone"
            value={values.phone}
            onChange={handleInputChange}
            placeholder="+57 300 123 4567"
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Dirección Física"
              name="address"
              value={values.address}
              onChange={handleInputChange}
              placeholder="Calle 123 # 45-67"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Crear Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddClientModal;