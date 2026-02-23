export const PROVIDER_CONFIG = {
    name: "Proveedor",
    endpoint: "/providers",
    columns: [
      {
        header: "N°",
        backendKey: "index",
        hideInForm: true,
        editable: false,
        mapFrom: (item, index) => index + 1,
      },
      {
        header: "Razón Social",
        backendKey: "legal_name", // Snake_case como el DTO
        type: "text",
        required: true,
        placeholder: "Ej: Tech Solutions S.A.S",
        validation: {
          pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_.]+$/,
          message: "Solo letras, números, espacios, guiones y puntos",
          minLength: 1,
          maxLength: 200
        }
      },
      {
        header: "ID Tributario",
        backendKey: "tax_id",
        type: "text",
        required: true,
        placeholder: "Ej: 900123456-1",
        validation: {
          pattern: /^[a-zA-Z0-9\s\-_.]+$/,
          message: "ID no válido (letras, números y guiones permitidos)",
          maxLength: 50
        }
      },
      {
        header: "Tipo",
        backendKey: "provider_type",
        type: "text",
        required: true,
        placeholder: "Ej: hardware",
        validation: {
          pattern: /^[a-zA-Z\s]+$/, // Como el DTO del backend
          message: "Solo se permiten letras y espacios",
          maxLength: 20
        }
      },
      {
        header: "Riesgo",
        backendKey: "risk_level",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "Bajo" },
          { value: "medium", label: "Medio" },
          { value: "high", label: "Alto" },
        ],
        defaultValue: "medium"
      },
      {
        header: "Estado",
        backendKey: "status",
        type: "select",
        options: [
          { value: 1, label: "Activo" },
          { value: 0, label: "Inactivo" },
        ],
        hideInForm: true, // Se suele manejar por defecto en creación
        editable: true
      }
    ]
  };