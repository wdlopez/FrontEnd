export const CONTRACT_CONFIG = {
  name: "Contrato",
  endpoint: "/contracts",
  columns: [
    {
      header: "N°",
      key: "index",
      editable: false,
      mapFrom: (item, index) => index + 1,
    },
    {
      header: "Número de Contrato",
      backendKey: "contract_number",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9-]{1,50}$/,
      validationMessage:
        "Formato inválido (máx 50 caracteres, alfanumérico y guiones)",
    },
    {
      header: "Nombre Clave",
      backendKey: "keyName",
      editable: true,
    },
    {
      header: "Descripción",
      backendKey: "description",
      editable: true,
      type: "textarea",
      required: false,
    },
    {
      header: "Cliente",
      backendKey: "client_id", // El modal genérico usará esto para el POST
      type: "select",
      options: [], // Se llenarán dinámicamente si tu Form lo soporta o mediante el service
      required: true,
    },
    {
      header: "Proveedor",
      backendKey: "provider_id",
      type: "select",
      options: [],
      required: true,
    },
    {
      header: "Fecha Inicio",
      backendKey: "start_date",
      type: "date",
      editable: true,
      required: true,
    },
    {
      header: "Fecha Fin",
      backendKey: "end_date",
      type: "date",
      editable: true,
      required: true,
    },
    {
      header: "Valor Total",
      backendKey: "total_value",
      type: "number",
      editable: true,
      required: true,
    },
    {
      header: "Moneda",
      backendKey: "currency",
      type: "select",
      options: [
        { value: "USD", label: "Dólares (USD)" },
        { value: "COP", label: "Pesos Col (COP)" },
        { value: "EUR", label: "Euros (EUR)" },
      ],
      editable: true,
      placeholder: "USD, COP, etc.",
    },
    {
      header: "País",
      backendKey: "country",
      type: "select",
      options: [
        { value: "Colombia", label: "Colombia" },
        { value: "México", label: "México" },
        { value: "Estados Unidos", label: "Estados Unidos" },
        { value: "España", label: "España" },
      ],
      editable: true,
    },
    {
      header: "Idioma",
      backendKey: "language",
      type: "select",
      options: [
        { value: "es", label: "Español" },
        { value: "en", label: "Inglés" },
        { value: "pt", label: "Portugués" },
      ],
      editable: true,
    },
    {
      header: "Estado",
      backendKey: "status",
      type: "select",
      options: [
        { label: "Borrador", value: "draft" },
        { label: "Activo", value: "active" },
        { label: "Terminado", value: "terminated" },
      ],
      editable: true,
      hideInForm: true, // No mostrar en modal crear/editar; por defecto se envía "draft" al crear
    },
  ],
};
