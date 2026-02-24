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
      header: "Torre",
      backendKey: "tower",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9\s-]{1,50}$/,
      validationMessage: "Máx 50 caracteres",
    },
    {
      header: "Grupo",
      backendKey: "group",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9\s-]{1,50}$/,
      validationMessage: "Máx 50 caracteres",
    },
    {
      header: "Unidad",
      backendKey: "resource_u",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9\s-]{1,50}$/,
      validationMessage: "Máx 50 caracteres",
    },
    {
      header: "Modelo",
      backendKey: "charges_model",
      type: "select",
      options: [
        { value: 1, label: "Fee" },
        { value: 0, label: "No-Fee" },
      ],
      editable: true,
      required: true,
      mapFrom: (item) => (item.charges_model === 1 ? "Fee" : "No-Fee"),
    },
    {
      header: "Baseline",
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
      header: "Total",
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
      mapFrom: (item) => (item.active === true ? "Activo" : "Inactivo"),
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
  ],
};
