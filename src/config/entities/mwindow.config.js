export const MWINDOW_CONFIG = {
  name: "Ventana de Medición",
  endpoint: "/measurement-window",
  columns: [
    {
      header: "N°",
      key: "index",
      editable: false,
      mapFrom: (item, index) => index + 1,
    },
    {
      header: "Tipo",
      backendKey: "type_window",
      type: "select",
      options: [
        { value: "standard", label: "Estándar" },
        { value: "business_hours", label: "Horario Hábil" },
        { value: "24_7", label: "24/7" },
        { value: "maintenance", label: "Mantenimiento" },
      ],
      editable: true,
      required: true,
    },
    {
      header: "Definición",
      backendKey: "definition",
      editable: true,
      required: true,
      type: "textarea",
    },
    {
      header: "Inicio",
      backendKey: "start_d",
      type: "datetime-local",
      editable: true,
      required: false,
      mapFrom: (item) =>
        item.start_d
          ? new Date(item.start_d).toLocaleString("es-CO", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
    },
    {
      header: "Fin",
      backendKey: "end_d",
      type: "datetime-local",
      editable: true,
      required: false,
      mapFrom: (item) =>
        item.end_d
          ? new Date(item.end_d).toLocaleString("es-CO", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
    },
    {
      header: "Periodo",
      backendKey: "period",
      type: "select",
      options: [
        { value: "daily", label: "Diario" },
        { value: "weekly", label: "Semanal" },
        { value: "monthly", label: "Mensual" },
        { value: "annual", label: "Anual" },
      ],
      editable: true,
      required: false,
    },
    {
      header: "Estado",
      backendKey: "active",
      type: "select",
      options: [
        { value: 1, label: "Activa" },
        { value: 0, label: "Inactiva" },
      ],
      editable: true,
      required: false,
      mapFrom: (item) => (item.active === 1 ? "Activa" : "Inactiva"),
    },
    {
      header: "Exclusiones",
      backendKey: "exclusions",
      type: "textarea",
      editable: true,
      required: false,
      hiddenInTable: true,
      mapFrom: (item) =>
        item.exclusions ? JSON.stringify(item.exclusions, null, 2) : "",
    },
    {
      header: "Inclusiones",
      backendKey: "inclusions",
      type: "textarea",
      editable: true,
      required: false,
      hiddenInTable: true,
      mapFrom: (item) =>
        item.inclusions ? JSON.stringify(item.inclusions, null, 2) : "",
    },
  ],
};
