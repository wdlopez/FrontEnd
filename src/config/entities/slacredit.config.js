export const SLACREDIT_CONFIG = {
  name: "Crédito SLA",
  endpoint: "/sla-credit",
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
      header: "Ventana de medición",
      backendKey: "mwindow_id",
      type: "select",
      editable: true,
      required: true,
      options: [],
      mapFrom: (item) =>
        item.mwindow_name ||
        (item.mwindow_id
          ? `${String(item.mwindow_id).substring(0, 8)}...`
          : "N/A"),
    },
    {
      header: "Medición de referencia",
      backendKey: "measurement_id",
      type: "select",
      editable: true,
      required: true,
      options: [],
      mapFrom: (item) =>
        item.measurement_display ||
        (item.measurement_id
          ? `${String(item.measurement_id).substring(0, 8)}...`
          : "N/A"),
    },
    {
      header: "Monto",
      backendKey: "credit_amount",
      type: "number",
      editable: true,
      required: true,
      placeholder: "Ej: 15.50",
    },
    {
      header: "Fecha de emisión",
      backendKey: "credit_date",
      type: "date",
      editable: true,
      required: true,
      mapFrom: (item) =>
        item.credit_date
          ? new Date(item.credit_date).toLocaleDateString("es-CO")
          : "",
    },
    {
      header: "Estado",
      editable: false,
      hideInForm: true,
      mapFrom: (item) => {
        if (item.status === "pending") return "Pendiente";
        if (item.status === "applied") return "Aplicado";
        if (item.status === "rejected") return "Rechazado";
        return item.status || "";
      },
    },
    {
      header: "Factura",
      backendKey: "applied_to_invoice",
      type: "number",
      editable: true,
      required: false,
      mapFrom: (item) =>
        item.applied_to_invoice ? `#${item.applied_to_invoice}` : "N/A",
    },
  ],
};

