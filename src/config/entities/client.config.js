export const CLIENT_CONFIG = {
  name: 'Cliente',
  endpoint: 'client',
  columns: [
    {
      header: 'N°',
      key: 'index',
      editable: false,
      mapFrom: (item, index) => index + 1
    },
    {
      header: 'NOMBRE',
      backendKey: 'name',
      possibleKeys: ['name', 'ClientEntity_name'],
      required: true,
      type: 'text',
      placeholder: 'Ej: Microsoft',
      validation: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s&.\-_]*$/,
      validationMessage: 'Solo se permiten letras, números, espacios, &, punto, guión y guión bajo',
      allowedChars: /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s&.\-_]/
    },
    {
      header: 'IDENTIFICACIÓN TRIBUTARIA',
      backendKey: 'document_file',
      possibleKeys: ['document_file', 'document'],
      type: 'text',
      placeholder: '999.999.999-9',
      validation: /^[a-zA-Z0-9\s\-_.]*$/,
      validationMessage: 'Solo se permiten letras, números, espacios, guión, guión bajo y punto',
      allowedChars: /[a-zA-Z0-9\s\-_.]/ 
    },
    {
      header: 'CONTACTO DEL CLIENTE',
      backendKey: 'contact_person',
      possibleKeys: ['contact_person', 'contacto'],
      required: true,
      type: 'text',
      placeholder: 'Nombre del contacto',
      validation: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
      validationMessage: 'Solo se permiten letras y espacios',
      allowedChars: /[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/
    },
    {
      header: 'INDUSTRIA DEL CLIENTE',
      backendKey: 'category',
      possibleKeys: ['category'],
      required: true,
      type: 'select',
      options: [
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
      ]
    },
    {
      header: 'CORREO',
      backendKey: 'email',
      possibleKeys: ['email'],
      required: true,
      type: 'email',
      placeholder: 'correo@ejemplo.com'
    },
    {
      header: 'CÓDIGO PAÍS Y TELÉFONO',
      backendKey: 'phone',
      possibleKeys: ['phone'],
      required: true,
      type: 'text',
      placeholder: '+57 3001234567',
      validation: /^[0-9\s+]*$/,
      validationMessage: 'Solo se permiten números, espacios y signo +',
      allowedChars: /[0-9\s+]/
    },
    {
      header: 'DIRECCIÓN',
      backendKey: 'address',
      possibleKeys: ['address'],
      required: true,
      type: 'text',
      placeholder: 'Calle 123 # 45-67',
      validation: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-ºª°_/]*$/,
      validationMessage: 'Solo se permiten letras, números, espacios, punto, coma, # y guión',
      allowedChars: /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-ºª°_/]/
    },
    {
      header: 'ESTADO',
      backendKey: 'active',
      possibleKeys: ['active'],
      editable: false,
      mapFrom: (item) => (Number(item.active) === 1 ? 'Activo' : 'Inactivo')
    }
  ]
};