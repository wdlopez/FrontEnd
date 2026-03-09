export const MWINDOW_CONFIG = {
  name: "Ventana de Medición",
  gender: "f",
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
      placeholder: "Seleccione el tipo de ventana de medición",
    },
    {
      header: "Definición",
      backendKey: "definition",
      editable: true,
      required: true,
      type: "textarea",
      placeholder: "Ej: Ventana de medición de 8 a 17 horas",
    },
    {
      header: "Fecha inicio",
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
      header: "Fecha fin",
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
        { value: 1, label: "Activo" },
        { value: 0, label: "Inactivo" },
      ],
      editable: true,
      required: false,
      hideInForm: true, // No mostrar en modales de creación/edición; por defecto se envía 1 (activo)
      mapFrom: (item) => (item.active === 1 ? "Activo" : "Inactivo"),
    },
    {
      header: "Fechas de exclusión",
      backendKey: "exclusions",
      type: "multidate",
      editable: true,
      required: false,
      fullWidth: true,
      hiddenInTable: true,
      hideInTable: true,
      hideInForm: true,
      hideInView: true,
      placeholder: "Selecciona las fechas que se deben excluir de la ventana",
      mapFrom: (item) =>
        Array.isArray(item.exclusions?.dates)
          ? item.exclusions.dates.join(", ")
          : "",
    },
    {
      header: "Fechas de inclusión",
      backendKey: "inclusions",
      type: "multidate",
      editable: true,
      required: false,
      fullWidth: true,
      hiddenInTable: true,
      hideInTable: true,
      hideInForm: true,
      hideInView: true,
      placeholder: "Selecciona fechas adicionales que sí se deben medir",
      mapFrom: (item) =>
        Array.isArray(item.inclusions?.dates)
          ? item.inclusions.dates.join(", ")
          : "",
    },
  ],
};
