import React, { useState, useEffect } from 'react';
import Modal from '../../molecules/Modal';
import Form from './Form';
import UserService from '../../../services/User/user.service';
import RoleService from '../../../services/Role/role.service';
import ClientService from '../../../services/Clients/client.service';
import ProviderService from '../../../services/Providers/provider.service';
import Swal from 'sweetalert2'; 
import InfoTooltip from '../../atoms/InfoToolTip';
import { getText } from '../../../utils/text';

const DEFAULT_PASSWORD = "Password2026!";
const AddUserModal = ({ open, setOpen, onSuccess }) => {
  const [loadingLists, setLoadingLists] = useState(false);
  
  // Listas para los selects
  const [rolesList, setRolesList] = useState([]);
  const [entitiesList, setEntitiesList] = useState([]);
  const [providerList, setProviderList] = useState([]); 

  // Cargar listas al abrir el modal
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingLists(true);
        try {
          const [rolesRes, clientsRes, providerRes] = await Promise.allSettled([
            RoleService.getRoles(),
            ClientService.getAllClients(),
            ProviderService.getAllProviders()
          ]);

          // 1. Procesar Roles
          let rolesData = [];
          if (rolesRes.status === 'fulfilled') {
            const val = rolesRes.value;
            console.log("📦 Roles Response:", val);
            
            if (Array.isArray(val)) {
              rolesData = val;
            } else if (val?.data?.data && Array.isArray(val.data.data)) {
              rolesData = val.data.data;
            } else if (val?.data && Array.isArray(val.data)) {
              rolesData = val.data;
            } else if (val?.items && Array.isArray(val.items)) {
              rolesData = val.items;
            }
          }

          // Asegurar que rolesData es siempre un array antes de usar .map()
          if (!Array.isArray(rolesData)) {
            console.warn("⚠️ rolesData no es un array:", rolesData);
            rolesData = [];
          }

          setRolesList(rolesData.map(r => ({ 
            value: r.id, 
            label: r.name || r.description || 'Sin nombre' 
          })));

          // 2. Procesar Clientes para la lista de Entidades
          let clientsData = [];
          if (clientsRes.status === 'fulfilled') {
            const val = clientsRes.value;
            console.log("📦 Clients Response:", val);
            
            if (Array.isArray(val)) {
              clientsData = val;
            } else if (val?.data?.data && Array.isArray(val.data.data)) {
              clientsData = val.data.data;
            } else if (val?.data && Array.isArray(val.data)) {
              clientsData = val.data;
            } else if (val?.items && Array.isArray(val.items)) {
              clientsData = val.items;
            }
          }

          // Asegurar que clientsData es siempre un array
          if (!Array.isArray(clientsData)) {
            console.warn("⚠️ clientsData no es un array:", clientsData);
            clientsData = [];
          }

          const clientOpts = clientsData.map(c => ({ 
            value: `c_${c.id}`, 
            label: `Cliente: ${c.name || c.contactPerson || 'Sin nombre'}` 
          }));

          setEntitiesList([...clientOpts]);

          // 3. Procesar Proveedores
          let providersData = [];
          if (providerRes.status === 'fulfilled') {
            const val = providerRes.value;
            console.log("📦 Providers Response:", val);
            
            if (Array.isArray(val)) {
              providersData = val;
            } else if (val?.data?.data && Array.isArray(val.data.data)) {
              providersData = val.data.data;
            } else if (val?.data && Array.isArray(val.data)) {
              providersData = val.data;
            } else if (val?.items && Array.isArray(val.items)) {
              providersData = val.items;
            }
          }

          // Asegurar que providersData es siempre un array antes de usar .map()
          if (!Array.isArray(providersData)) {
            console.warn("⚠️ providersData no es un array:", providersData);
            providersData = [];
          }

          setProviderList(providersData.map(p => ({ 
            value: `p_${p.id}`, 
            label: `Proveedor: ${p.legalName || p.name || 'Sin nombre'}` 
          })));

        } catch (error) {
          console.error("Error crítico cargando listas", error);
          Swal.fire('Error', 'No se pudieron cargar las listas de roles/clientes', 'warning');
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
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password || DEFAULT_PASSWORD,
        roleId: formData.role_id,
        isActive: true
      };

      // --- LÓGICA DE ENTIDAD (CLIENTE vs PROVEEDOR) ---
      // Si el usuario selecciona una entidad desde el select de entityId
      if (formData.entityId) {
        const [type, id] = formData.entityId.split('_');
        
        if (type === 'c') {
          payload.clientId = id;
        } else if (type === 'p') {
          payload.providerId = id;
        }
      }

      // Si el usuario selecciona directamente un proveedor desde el campo providerId
      if (formData.providerId) {
        payload.providerId = formData.providerId;
      }

      console.log("📤 Payload Enviado:", payload); 

      await UserService.createUser(payload);
      
      Swal.fire('Creado!', 'El usuario ha sido creado exitosamente.', 'success');
      setOpen(false);
      if (onSuccess) onSuccess(); 

    } catch (error) {
      console.error('Error creando usuario:', error);
      const msg = error.response?.data?.message 
        ? (Array.isArray(error.response.data.message) 
            ? error.response.data.message.join(', ') 
            : error.response.data.message)
        : 'No se pudo crear el usuario';
        
      Swal.fire('Error', msg, 'error');
    }
  };

  // Definición de campos del Formulario
  const userFields = [
    {
      name: 'firstName',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Ej: Juan'
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
      required: true,
      placeholder: 'Ej: Pérez'
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'ejemplo@correo.com'
    },
    {
      name: 'role_id',
      label: 'Rol Asignado',
      type: 'select',
      required: true,
      options: rolesList,
      placeholder: 'Seleccione un rol'
    },
    {
      name: 'entityId',
      label: 'Asociar a Organización (Opcional)',
      type: 'select',
      required: false,
      options: entitiesList,
      placeholder: 'Seleccione Cliente (si aplica)'
    },
    {
      name: 'providerId',
      label: 'Asociar a Proveedor (Opcional)',
      type: 'select',
      required: false,
      options: providerList,
      placeholder: 'Seleccione Proveedor (si aplica)'
    }

  ];

  return (
    <Modal open={open} setOpen={setOpen}>
        <div className="flex gap-2 items-center mb-4 px-1 pt-2">
            <InfoTooltip size="sm" message={getText("formUser")} sticky={true}>
                <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h2 className="text-xl font-bold text-gray-800">Agregar Nuevo Usuario</h2>
        </div>
      <div className="pt-2">
        {loadingLists ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-500">
             <span className="material-symbols-outlined animate-spin text-3xl mb-2">refresh</span>
             <p>Cargando roles y clientes...</p>
          </div>
        ) : (
          <Form 
            fields={userFields} 
            onSubmit={handleCreateUser} 
            sendMessage="Crear Usuario" 
            onCancel={() => setOpen(false)}
            gridLayout={true} // Si tu componente Form soporta gridLayout
          />
        )}
      </div>
    </Modal>
  );
};

export default AddUserModal;