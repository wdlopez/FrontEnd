export const MEASUREMENT_CONFIG = {
  name: "Medición SLA",
  gender: "f",
  endpoint: "/sla-measurement",
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
      header: "Fecha de medición",
      backendKey: "measurement_date",
      type: "date",
      editable: true,
      required: true,
      mapFrom: (item) =>
        item.measurement_date
          ? new Date(item.measurement_date).toLocaleDateString("es-CO")
          : "",
    },
    {
      header: "Valor real",
      backendKey: "actual_value",
      type: "number",
      editable: true,
      required: true,
      placeholder: "Ej: 99.85",
    },
    {
      header: "Cumple",
      backendKey: "is_compliant",
      type: "select",
      editable: true,
      required: true,
      options: [
        { value: true, label: "Cumple" },
        { value: false, label: "No cumple" },
      ],
      mapFrom: (item) => (item.is_compliant ? "Cumple" : "No cumple"),
    },
    {
      header: "Comentarios",
      backendKey: "comments",
      type: "textarea",
      editable: true,
      required: false,
      fullWidth: true,
    },
    {
      header: "Fecha de creación",
      backendKey: "createdAt",
      type: "date",
      editable: false,
      // Ocultar completamente en tabla y en mapeos
      hideInTable: true,
      hiddenInTable: true,
      hideInView: true,
      mapFrom: (item) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleString("es-CO")
          : "",
    },
  ],
};

