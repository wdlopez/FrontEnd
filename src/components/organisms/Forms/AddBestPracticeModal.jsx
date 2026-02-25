import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import BestPracticesService from "../../../services/Others/BestPractices/best-practice.service";
import { useAuth } from "../../../context/AuthContext"; // Importación del contexto
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const CATEGORY_OPTIONS = [
  { value: "arquitectura", label: "Arquitectura" },
  { value: "desarrollo", label: "Desarrollo" },
  { value: "seguridad", label: "Seguridad" },
  { value: "despliegue", label: "Despliegue" },
  { value: "documentacion", label: "Documentación" },
];

const AddBestPracticeModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const { user } = useAuth(); // Obtenemos el usuario logueado
  const [loading, setLoading] = useState(false);

  // Ya no necesitamos useEffect para cargar la lista de usuarios
  // porque el autor siempre será el usuario en sesión.

  const practiceFields = [
    {
      name: "title",
      type: "text",
      label: "Título de la Buena Práctica *",
      placeholder: "Ej: Estándares de Codificación API",
      required: true,
    },
    {
      name: "category",
      type: "select",
      label: "Categoría *",
      options: CATEGORY_OPTIONS,
      required: true,
    },
    {
      name: "content",
      type: "textarea",
      label: "Contenido Detallado *",
      placeholder: "Escribe aquí la guía o descripción de la mejor práctica...",
      fullWidth: true,
      required: true,
    },
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      // Construimos el payload inyectando el ID del usuario del contexto
      const payload = {
        ...formData,
        created_by: user?.id, // Asignación automática
      };

      if (!payload.created_by) {
        throw new Error("No se pudo identificar al autor de la sesión.");
      }

      await BestPracticesService.createPractice(payload);

      Swal.fire("¡Guardado!", "La mejor práctica ha sido registrada.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creando mejor práctica:", error);
      const msg = error.response?.data?.message || error.message || "Error al crear el registro.";
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
          message={getText("modals.bestPracticeInfo") || "Registra estándares y conocimientos clave para el equipo."}
        >
          <span className="material-symbols-outlined text-green-600">verified_user</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Mejor Práctica</h2>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-500 text-sm">person</span>
        <p className="text-xs text-blue-700">
          Registrando como: <strong>{user?.name || user?.email || "Usuario Actual"}</strong>
        </p>
      </div>

      <Form
        fields={practiceFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Publicar Práctica"
        gridLayout={true}
      />
    </Modal>
  );
};

export default AddBestPracticeModal;