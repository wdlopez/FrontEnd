export const CLAUSE_CONFIG = {
  name: "Cláusula",
  endpoint: "/clause",
  columns: [
    {
      header: "N°",
      key: "index",
      editable: false,
      mapFrom: (item, index) => index + 1,
    },
    {
      header: "Contract ID",
      backendKey: "contract_id",
      type: "select",
      required: true,
      options: [], // Se llena dinámicamente
      hideInTable: true,
      editable: true,
      placeholder: "Seleccione un contrato",
    },
    {
      header: "Número de cláusula",
      backendKey: "clause_number",
      type: "text",
      editable: true,
      required: true,
      validation: /^[a-zA-Z0-9\.\-]{1,20}$/,
      validationMessage: "Máx 20 caracteres (letras, números, puntos, guiones)",
      placeholder: "Ej: 2.1",
    },
    {
      header: "Título de la cláusula",
      backendKey: "title",
      type: "text",
      editable: true,
      required: true,
      validation: /^.{1,200}$/,
      validationMessage: "El título debe tener entre 1 y 200 caracteres",
      placeholder: "Ej: Obligaciones de las partes",
    },
    {
      header: "Descripción de la cláusula",
      backendKey: "content",
      type: "textarea",
      editable: true,
      required: true,
      placeholder: "Escriba el contenido de la cláusula...",
    },
    {
      header: "Crítica",
      backendKey: "is_critical",
      type: "select",
      options: [
        { value: true, label: "Sí" },
        { value: false, label: "No" },
      ],
      editable: true,
      required: false,
      hideInForm: true, // No mostrar en modal crear/editar; por defecto false al crear
      mapFrom: (item) => (item.is_critical ? "Sí" : "No"),
    },
    {
      header: "Estado Cumplimiento",
      backendKey: "compliance_status",
      type: "select",
      options: [
        { value: "compliant", label: "Cumple" },
        { value: "non-compliant", label: "No Cumple" },
        { value: "pending", label: "Pendiente" },
      ],
      editable: true,
      required: false,
      hideInForm: true, // No mostrar en modal crear/editar; por defecto "compliant" al crear
    },
  ],
};
