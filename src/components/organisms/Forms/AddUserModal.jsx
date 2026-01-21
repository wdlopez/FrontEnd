import React, { useState, useEffect } from 'react';
import Modal from '../../molecules/Modal';
import Form from './Form';
import UserService from '../../../services/User/user.service';
import RoleService from '../../../services/Role/role.service';
import ClientService from '../../../services/Clients/client.service'; 
import Swal from 'sweetalert2'; 

const AddUserModal = ({ open, setOpen, onSuccess }) => {
  const [loadingLists, setLoadingLists] = useState(false);
  
  // Listas para los selects
  const [rolesList, setRolesList] = useState([]);
  const [entitiesList, setEntitiesList] = useState([]); 

  // Cargar listas al abrir el modal
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingLists(true);
        try {
    const [rolesRes, clientsRes, providersRes] = await Promise.allSettled([
      RoleService.getRoles(),
      ClientService.getAll(),
    ]);

    // Validar Roles (usando Promise.allSettled para que si uno falla, los otros sigan)
    const roles = rolesRes.status === 'fulfilled' ? rolesRes.value : [];
    setRolesList(roles.map(r => ({ value: r.id, label: r.name })));

    // Validar Clientes y Proveedores
    const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value?.data || clientsRes.value || []) : [];

    const clientOpts = clients.map(c => ({ value: `c_${c.id}`, label: `Cliente: ${c.name}` }));

    setEntitiesList([...clientOpts]);

  } catch (error) {
    console.error("Error crítico cargando listas", error);
  } finally {
    setLoadingLists(false);
  }
};
      fetchData();
    }
  }, [open]);

  // Manejo del Submit
  const handleCreateUser = async (formData) => {
    try {
      // LOGICA DE ADAPTACIÓN DE DATOS (Reciclando tu lógica anterior)
      const payload = { ...formData };
      
      // Separar lógica de entidad (Cliente o Proveedor)
      if (payload.entityId) {
        if (payload.entityId.startsWith('c_')) {
          payload.client_id = parseInt(payload.entityId.split('_')[1]);
        } else if (payload.entityId.startsWith('p_')) {
          payload.provider_id = parseInt(payload.entityId.split('_')[1]);
        }
        delete payload.entityId; // Limpiamos el campo auxiliar
      }

      await UserService.createUser(payload);
      
      Swal.fire('Creado!', 'El usuario ha sido creado.', 'success');
      setOpen(false);
      if (onSuccess) onSuccess(); // Recargar tabla padre

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo crear el usuario', 'error');
    }
  };

  // Definición de campos del Formulario
  const userFields = [
    {
      name: 'firstName',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Nombre del usuario'
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
      required: true,
      placeholder: 'Apellido'
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'ejemplo@correo.com'
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
      required: true,
      placeholder: '+57 300...'
    },
    {
      name: 'username',
      label: 'Nickname (Usuario)',
      type: 'text',
      required: true,
      placeholder: 'jperez'
    },
    {
      name: 'password', // Asumiendo que creas la pass inicial aquí
      label: 'Contraseña Inicial',
      type: 'password',
      required: true
    },
    {
      name: 'role_id',
      label: 'Rol',
      type: 'select',
      required: true,
      options: rolesList
    },
    {
      name: 'entityId',
      label: 'Asignar a Entidad (Opcional)',
      type: 'select',
      required: false,
      options: entitiesList,
      placeholder: 'Seleccione Cliente o Proveedor'
    }
  ];

  return (
    <Modal open={open} setOpen={setOpen} title="Agregar Nuevo Usuario">
      {loadingLists ? (
        <div className="p-10 text-center text-blue-600">Cargando listas...</div>
      ) : (
        <Form 
          fields={userFields} 
          onSubmit={handleCreateUser} 
          sendMessage="Crear Usuario" 
          onCancel={() => setOpen(false)}
        />
      )}
    </Modal>
  );
};

export default AddUserModal;