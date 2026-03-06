export const USER_CONFIG = {
  name: 'Usuario',
  endpoint: 'users',
  columns: [
    {
      header: 'N°',
      key: 'index',
      editable: false,
      mapFrom: (item, index) => index + 1
    },
    {
      header: 'Nombre',
      backendKey: 'firstName',
      required: true,
      type: 'text',
      placeholder: 'Ej: Juan',
      validation: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]{1,50}$/,
      validationMessage: 'El nombre solo puede contener letras, espacios, apóstrofes y guiones (máx. 50)',
      allowedChars: /[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]/
    },
    {
      header: 'Apellido',
      backendKey: 'lastName',
      required: true,
      type: 'text',
      placeholder: 'Ej: Pérez',
      validation: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]{1,50}$/,
      validationMessage: 'El apellido solo puede contener letras, espacios, apóstrofes y guiones (máx. 50)',
      allowedChars: /[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]/
    },
    {
      header: 'Correo electrónico',
      backendKey: 'email',
      required: true,
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      validationMessage: 'Por favor proporciona una dirección de correo válida'
    },
    {
      header: 'Contraseña',
      backendKey: 'password',
      required: false,
      type: 'password',
      placeholder: '********',
      validation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,128}$/,
      validationMessage: 'Mínimo 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un símbolo (#$@!%&*?)',
      hideInTable: true,
      hideInForm: true,
      hideInView: true
    },
    {
      header: 'Rol',
      backendKey: 'roleId',
      type: 'select',
      hideInTable: false,
      required: false,
      options: [],
      placeholder: 'Selecciona un rol...',
      mapFrom: (item) => {
        if (Array.isArray(item.roles) && item.roles.length > 0) {
          return item.roles.map(r => r.name).join(', ');
        }
        if (item.role?.name) {
          return item.role.name;
        }
        return 'Sin Rol';
      },
      getValue: (item) => {
        if (Array.isArray(item.roles) && item.roles.length > 0) {
          return item.roles.map(r => r.name).join(', ');
        }
        if (item.role?.name) {
          return item.role.name;
        }
        return 'Sin Rol';
      },
      viewValueFrom: (item) => {
        if (Array.isArray(item.roles) && item.roles.length > 0) {
          return item.roles.map(r => r.name).join(', ');
        }
        if (item.role?.name) {
          return item.role.name;
        }
        return 'Sin Rol';
      }
    },
    {
      header: 'Asociar a cliente',
      backendKey: 'entityId',
      type: 'select',
      required: false,
      options: [],
      placeholder: 'Seleccione un cliente (opcional)',
      hideInTable: true,
      hideInForm: true,
      hideInView: true
    },
    {
      header: 'Cliente asignado',
      backendKey: 'clientAssignedView',
      editable: false,
      hideInForm: true,
      mapFrom: (item) => {
        // Soporta item.clients (nueva estructura) o item.clientId + lookup
        if (Array.isArray(item.clients) && item.clients.length > 0) {
          const primary = item.clients.find(c => c.isPrimary === true || c.isPrimary === 1) || item.clients[0];
          return primary.clientName || primary.client_name || 'Sin Cliente';
        }
        return 'Sin Cliente';
      },
      getValue: (item) => {
        if (Array.isArray(item.clients) && item.clients.length > 0) {
          const primary = item.clients.find(c => c.isPrimary === true || c.isPrimary === 1) || item.clients[0];
          return primary.clientName || primary.client_name || 'Sin Cliente';
        }
        return 'Sin Cliente';
      },
      viewValueFrom: (item) => {
        if (Array.isArray(item.clients) && item.clients.length > 0) {
          const primary = item.clients.find(c => c.isPrimary === true || c.isPrimary === 1) || item.clients[0];
          return primary.clientName || primary.client_name || 'Sin Cliente';
        }
        return 'Sin Cliente';
      }
    },
    {
      header: 'Asociar a proveedor',
      backendKey: 'providerId', 
      type: 'select',
      required: false,
      options: [],
      placeholder: 'Seleccione un proveedor (opcional)',
      hideInTable: true,
      hideInForm: true,
      hideInView: true
    },
    {
      header: 'Estado',
      backendKey: 'isActive',
      type: 'boolean',
      editable: false,
      mapFrom: (item) => (item.isActive ? 'Activo' : 'Inactivo'),
      getValue: (item) => (item.isActive ? 'Activo' : 'Inactivo')
    },
    {
      header: 'Fecha de creación',
      backendKey: 'createdAt',
      editable: false,
      type: 'date',
      mapFrom: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
    }
  ]
};