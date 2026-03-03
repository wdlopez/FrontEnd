export const SLA_MONTHLY_LOG_CONFIG = {
  name: "Registro mensual SLA",
  endpoint: "/sla-monthly-log",
  columns: [
    {
      header: "N°",
      key: "index",
      editable: false,
      mapFrom: (item, index) => index + 1,
    },
    {
      header: "SLA",
      backendKey: "sla_id",
      type: "select",
      editable: true,
      required: true,
      options: [],
      mapFrom: (item) =>
        item.sla_name ||
        (item.sla_id ? `${String(item.sla_id).substring(0, 8)}...` : "N/A"),
    },
    {
      header: "Mes",
      backendKey: "month",
      type: "number",
      editable: true,
      required: true,
      placeholder: "Ej: 11",
      validation: /^(?:[1-9]|1[0-2])$/,
      validationMessage: "El mes debe ser un valor entre 1 y 12",
    },
    {
      header: "Porcentaje",
      backendKey: "percentage_value",
      type: "number",
      editable: true,
      required: true,
      placeholder: "Ej: 99.95",
      validation: /^(100(?:\.0{1,2})?|\d{1,2}(?:\.\d{1,2})?)$/,
      validationMessage: "El porcentaje debe estar entre 0 y 100 con hasta 2 decimales",
    },
  ],
};

