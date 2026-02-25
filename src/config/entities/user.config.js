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
      hideInForm: true
    },
    {
      header: 'Rol',
      backendKey: 'roleId',
      type: 'select',
      hideInTable: true,
      required: false,
      options: [],
      placeholder: 'Selecciona un rol...',
      mapFrom: (item) => item.role?.name || 'Sin Rol',
      getValue: (item) => item.role?.name || 'Sin Rol'
    },
    {
      header: 'Asociar a cliente',
      backendKey: 'entityId',
      type: 'select',
      required: false,
      options: [],
      placeholder: 'Seleccione un cliente (opcional)',
      hideInTable: true,
      hideInForm: true
    },
    {
      header: 'Asociar a proveedor',
      backendKey: 'providerId', 
      type: 'select',
      required: false,
      options: [],
      placeholder: 'Seleccione un proveedor (opcional)',
      hideInTable: true,
      hideInForm: true
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