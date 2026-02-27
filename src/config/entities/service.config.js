export const SERVICE_CONFIG = {
  name: "Servicio",
  endpoint: "/service-contract",
  columns: [
    {
      header: "N°",
      key: "index",
      editable: false,
      mapFrom: (item, index) => index + 1,
    },
    {
      header: "Contrato",
      backendKey: "contract_id",
      type: "select",
      editable: true,
      required: true,
      hiddenInTable: false,
      options: [], // Se llenará dinámicamente
      mapFrom: (item) => item.contract_name || item.contract_id,
    },
    {
      header: "Torre de servicio",
      backendKey: "tower",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9\s-]{1,50}$/,
      validationMessage: "Máx 50 caracteres",
    },
    {
      header: "Categoría de servicio",
      backendKey: "group",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9\s-]{1,50}$/,
      validationMessage: "Máx 50 caracteres",
    },
    {
      header: "Unidad de recurso",
      backendKey: "resource_u",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9\s-]{1,50}$/,
      validationMessage: "Máx 50 caracteres",
    },
    {
      header: "Mecanismos de cargos",
      backendKey: "charges_model",
      type: "select",
      options: [
        { value: 1, label: "ACR/RRC" },
        { value: 0, label: "PxQ" },
      ],
      editable: true,
      required: true,
      mapFrom: (item) => (item.charges_model === 1 ? "ACR/RRC" : "PxQ"),
    },
    {
      header: "Linea base",
      backendKey: "baseline",
      type: "number",
      editable: true,
      required: true,
    },
    {
      header: "Valor Unitario",
      backendKey: "value",
      type: "number",
      editable: true,
      required: true,
      mapFrom: (item) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(item.value),
    },
    {
      header: "Valor total del servicio",
      backendKey: "sum_total",
      type: "number",
      editable: true, // Requerido por el backend
      required: true,
      mapFrom: (item) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(item.sum_total),
    },
    {
      header: "Fecha Inicio",
      backendKey: "start_d",
      type: "date",
      editable: true,
      required: true,
      mapFrom: (item) =>
        item.start_d ? new Date(item.start_d).toLocaleDateString("es-CO") : "",
    },
    {
      header: "Fecha Fin",
      backendKey: "end_d",
      type: "date",
      editable: true,
      required: false,
      mapFrom: (item) =>
        item.end_d ? new Date(item.end_d).toLocaleDateString("es-CO") : "Indefinido",
    },
    {
      header: "Estado",
      backendKey: "active",
      type: "select",
      options: [
        { value: true, label: "Activo" },
        { value: false, label: "Inactivo" },
      ],
      editable: true,
      required: true,
      hideInForm: true, // No mostrar en modal crear/editar; por defecto se envía true (activo) al crear
      mapFrom: (item) => (item.active === true ? "Activo" : "Inactivo"),
    },
  ],
};
