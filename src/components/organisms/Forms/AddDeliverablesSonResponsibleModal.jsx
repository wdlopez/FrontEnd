import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import DeliverableSonResponsibleService from "../../../services/Deliverables/DeliverablesSonResponsible/deliverables-son-responsible.service"; 
import DeliverableSonService from "../../../services/Deliverables/DeliverablesSon/deliverables-son.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddDeliverableSonResponsibleModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [subDeliverableOptions, setSubDeliverableOptions] = useState([]);

  // Cargar los Sub-Entregables al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchSubDeliverables = async () => {
        try {
          const response = await DeliverableSonService.getAllDeliverablesSon();
          const subDeliverables = normalizeList(response);
          // Transformamos para el formato de opciones del select
          const options = subDeliverables.map(sd => ({ value: sd.id, label: sd.name || sd.id }));
          setSubDeliverableOptions(options);
        } catch (error) {
          console.error("Error cargando sub-entregables:", error);
          Swal.fire("Aviso", "No se pudieron cargar los sub-entregables.", "warning");
        }
      };
      fetchSubDeliverables();
    }
  }, [isOpen]);

  // Definición de los campos del formulario
  const formFields = [
    {
      name: "deliverableSon_id",
      type: "select",
      label: "Sub-Entregable (Tarea/Hito) *",
      options: subDeliverableOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "responsible_type",
      type: "select",
      label: "Tipo de Responsable *",
      options: [
        { value: "internal", label: "Usuario Interno" },
        { value: "provider", label: "Contacto de Proveedor" },
        { value: "client", label: "Contacto de Cliente" }
      ],
      required: true,
      fullWidth: true
    },
    // NOTA: Para hacer este formulario dinámico (que user_id solo aparezca si type es internal), 
    // tu componente 'Form' necesitaría soportar renderizado condicional.
    // Asumiremos que por ahora se muestran los 3 campos de ID como texto, pero lo ideal 
    // sería convertirlos en selects que carguen usuarios/contactos desde la API.
    {
      name: "user_id",
      type: "text",
      label: "ID del Usuario Interno",
      placeholder: "Ej: d1e2f3g4...",
      required: false,
    },
    {
      name: "provider_contact_id",
      type: "text",
      label: "ID del Contacto del Proveedor",
      placeholder: "Ej: e1f2g3h4...",
      required: false,
    },
    {
      name: "client_contact_id",
      type: "text",
      label: "ID del Contacto del Cliente",
      placeholder: "Ej: f1g2h3h4...",
      required: false,
    }
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      // Limpiamos los campos vacíos antes de enviarlos (ya que el backend espera UUIDs o nulos, no strings vacíos "")
      const payload = { ...formData };
      if (!payload.user_id) delete payload.user_id;
      if (!payload.provider_contact_id) delete payload.provider_contact_id;
      if (!payload.client_contact_id) delete payload.client_contact_id;

      await DeliverableSonResponsibleService.createDeliverableSonResponsible(payload);
      Swal.fire("¡Asignado!", "El responsable ha sido asignado correctamente al sub-entregable.", "success");
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
          message={getText("modals.deliverableSonRespInfo") || "Asigna un usuario, cliente o proveedor como responsable de este sub-entregable."}
        >
          <span className="material-symbols-outlined text-purple-500">assignment_ind</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Asignar Responsable</h2>
      </div>

      <Form
        fields={formFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Asignar Responsable"
        gridLayout={true}
        initialValues={{ responsible_type: "internal" }}
      />
    </Modal>
  );
};

export default AddDeliverableSonResponsibleModal;