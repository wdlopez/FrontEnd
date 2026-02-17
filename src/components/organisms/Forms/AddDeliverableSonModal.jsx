import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import DeliverableSonService from "../../../services/Deliverables/DeliverablesSon/deliverables-son.service"; 
import DeliverableService from "../../../services/Deliverables/deliverable.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddDeliverableSonModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);

  // Cargar los Entregables Padre al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchParents = async () => {
        try {
          const response = await DeliverableService.getAllDeliverables();
          const parents = normalizeList(response);
          // Transformamos para el formato de opciones del select: { value, label }
          const options = parents.map(p => ({ value: p.id, label: p.name || p.id }));
          setParentOptions(options);
        } catch (error) {
          console.error("Error cargando entregables padre:", error);
          Swal.fire("Aviso", "No se pudieron cargar los entregables principales.", "warning");
        }
      };
      fetchParents();
    }
  }, [isOpen]);

  const formFields = [
    {
      name: "deliverable_id",
      type: "select",
      label: "Entregable Padre *",
      options: parentOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "name",
      type: "text",
      label: "Nombre del Sub-Entregable *",
      placeholder: "Ej: Actividad de la Fase 1",
      required: true,
      fullWidth: true
    },
    {
      name: "type",
      type: "select",
      label: "Tipo *",
      options: [
        { value: "task", label: "Tarea" },
        { value: "milestone", label: "Hito (Milestone)" },
        { value: "document", label: "Documento" }
      ],
      required: true,
    },
    {
      name: "frequency",
      type: "select",
      label: "Frecuencia *",
      options: [
        { value: "one-time", label: "Única vez" },
        { value: "daily", label: "Diaria" },
        { value: "weekly", label: "Semanal" },
        { value: "monthly", label: "Mensual" }
      ],
      required: true,
    },
    {
      name: "priority",
      type: "select",
      label: "Prioridad",
      options: [
        { value: "low", label: "Baja" },
        { value: "medium", label: "Media" },
        { value: "high", label: "Alta" }
      ],
    },
    {
      name: "status",
      type: "select",
      label: "Estado Inicial",
      options: [
        { value: "pending", label: "Pendiente" },
        { value: "in-progress", label: "En Progreso" },
        { value: "completed", label: "Completado" }
      ],
    },
    {
      name: "due_date",
      type: "date",
      label: "Fecha Límite *",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      placeholder: "Detalles adicionales de la actividad...",
      required: false,
      fullWidth: true
    }
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      await DeliverableSonService.createDeliverableSon(formData);
      Swal.fire("¡Creado!", "El sub-entregable ha sido registrado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear:", error);
      const msg = error.response?.data?.message || "Error al guardar el registro.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip
          size="sm"
          message={getText("deliverableSonInfo") || "Crea tareas o hitos hijos vinculados a un entregable principal."}
        >
          <span className="material-symbols-outlined text-blue-500">account_tree</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Sub-Entregable</h2>
      </div>

      <Form
        fields={formFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Guardar Sub-Entregable"
        gridLayout={true}
        initialValues={{ priority: "medium", status: "pending", type: "task", frequency: "one-time" }}
      />
    </Modal>
  );
};

export default AddDeliverableSonModal;