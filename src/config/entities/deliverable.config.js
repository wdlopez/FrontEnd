export const DELIVERABLE_CONFIG = {
  name: "Entregable",
  endpoint: "/deliverable",
  columns: [
    {
      header: "N°",
      key: "index",
      editable: false,
      mapFrom: (item, index) => index + 1,
    },
    {
      header: "Código entregable",
      backendKey: "deliverable_number",
      type: "text",
      placeholder: "Ej: DE-1234567890",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9-]{1,50}$/,
      validationMessage: "Máx 50 caracteres, alfanumérico y guiones", 
    },
    {
      header: "Nombre del entregable",
      backendKey: "name",
      type: "text",
      placeholder: "Ej: Entrega de servicio",
      editable: true,
      required: true,
      validation: /^.{1,100}$/,
      validationMessage: "Máx 100 caracteres",
    },
    {
      header: "Descripción del entregable",
      placeholder: "Ej: Entrega de servicio",
      backendKey: "description",
      editable: true,
      type: "textarea",
      required: false,
    },
    {
      header: "Comentarios",
      backendKey: "comments",
      editable: true,
      type: "textarea",
      required: false, // En frontend es opcional, pero backend exige string
    },
    {
      header: "Tipo del entregable",
      backendKey: "type",
      type: "select",
      options: [
        { value: "unico", label: "Único" },
        { value: "recurrente", label: "Recurrente" },
      ],
      editable: true,
      required: true,
      placeholder: "Seleccione el tipo de entregable",
    },
    {
      header: "Frecuencia",
      backendKey: "frequency",
      type: "select",
      options: [
        { value: "daily", label: "Diario" },
        { value: "weekly", label: "Semanal" },
        { value: "monthly", label: "Mensual" },
        { value: "quarterly", label: "Trimestral" },
        { value: "yearly", label: "Anual" },
      ],
      editable: true,
      required: true,
    },
    {
      header: "Prioridad",
      backendKey: "priority",
      type: "select",
      options: [
        { value: "low", label: "Baja" },
        { value: "medium", label: "Media" },
        { value: "high", label: "Alta" },
        { value: "critical", label: "Crítica" },
      ],
      editable: true,
      required: true,
      mapFrom: (item) => {
        const map = {
          low: "🔵 Baja",
          medium: "🟡 Media",
          high: "🟠 Alta",
          critical: "🔴 Crítica",
        };
        return map[item.priority] || item.priority;
      },
    },
    {
      header: "Fecha inicio",
      backendKey: "start_date",
      type: "date",
      editable: true,
      required: true,
      mapFrom: (item) =>
        item.start_date ? new Date(item.start_date).toLocaleDateString("es-CO") : "",
    },
    {
      header: "Fecha fin",
      backendKey: "end_date",
      type: "date",
      editable: true,
      required: true,
      mapFrom: (item) =>
        item.end_date ? new Date(item.end_date).toLocaleDateString("es-CO") : "",
    },
    {
      header: "Fecha límite",
      backendKey: "due_date",
      type: "date",
      editable: true,
      required: true,
      mapFrom: (item) =>
        item.due_date ? new Date(item.due_date).toLocaleDateString("es-CO") : "S/F",
    },
    {
      header: "Estado",
      backendKey: "status",
      type: "select",
      options: [
        { value: "pending", label: "Pendiente" },
        { value: "in_progress", label: "En Progreso" },
        { value: "completed", label: "Completado" },
        { value: "rejected", label: "Rechazado" },
      ],
      editable: true,
      required: true,
      mapFrom: (item) => {
        const map = {
          pending: "⏳ Pendiente",
          in_progress: "🔨 En Progreso",
          completed: "✅ Completado",
          rejected: "❌ Rechazado",
        };
        return map[item.status] || item.status;
      },
    },
    {
      header: "Puntualidad",
      backendKey: "punctuality",
      type: "select",
      options: [
        { value: "A tiempo", label: "A tiempo" },
        { value: "Tardío", label: "Tardío" },
      ],
      editable: true,
      required: true,
    },
    {
      header: "Aplica penalización",
      backendKey: "penalty",
      type: "select",
      options: [
        { value: true, label: "Sí" },
        { value: false, label: "No" },
      ],
      editable: true,
      required: true,
      mapFrom: (item) => (item.penalty ? "Sí" : "No"),
    },
    {
      header: "Monto de penalización",
      backendKey: "value_penalty",
      type: "number",
      editable: true,
      required: true,
      placeholder: "Ej: 100000",
      mapFrom: (item) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(item.value_penalty),
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
      header: "Servicio",
      backendKey: "service_id",
      type: "select",
      editable: true,
      required: true,
      hiddenInTable: false,
      options: [], // Se llenará dinámicamente
      mapFrom: (item) => item.service_name || item.service_id,
    },
    {
      header: "Activo",
      backendKey: "active",
      type: "select",
      options: [
        { value: true, label: "Sí" },
        { value: false, label: "No" },
      ],
      editable: true,
      required: true,
      hiddenInTable: true,
      mapFrom: (item) => (item.active ? "Sí" : "No"),
    },
  ],
};
