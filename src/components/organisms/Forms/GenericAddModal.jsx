import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "./Form";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { generateFormFields } from "../../../utils/entityMapper";

const GenericAddModal = ({ 
  isOpen, 
  setIsOpen, 
  service,
  config,
  onSuccess,
  initialValues = {},
  getExtraPayload,
}) => {
  const [loading, setLoading] = useState(false);
  const formFields = generateFormFields(config);

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      const payload = {};
      Object.keys(formData).forEach(key => {
        let value = formData[key];
        const field = formFields.find(f => f.name === key);
        if (field?.type === 'number') {
          const parsed = parseFloat(value);
          payload[key] = Number.isNaN(parsed) ? value : parsed;
          return;
        }
        if (typeof value === 'string') {
          value = value.trim();
          if (key.includes('email') || key === 'mail') {
            value = value.toLowerCase();
          }
        }
        payload[key] = value;
      });

      const extra = getExtraPayload?.() ?? {};
      Object.assign(payload, extra);

      const response = await service.create(payload);

      Swal.fire(
        "¡Creado!", 
        `El ${config.name} ha sido registrado con éxito.`, 
        "success"
      );
      
      setIsOpen(false);
      
      if (onSuccess) onSuccess(response); 
      
    } catch (error) {
      console.error(`Error creando ${config.name}:`, error);
      const msg = error.response?.data?.message;
      const errorDisplay = Array.isArray(msg) ? msg.join(", ") : msg || "Error al procesar la solicitud";
      Swal.fire("Error", errorDisplay, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} setOpen={setIsOpen} size="lg">
      <div className="p-1">
        <div className="flex gap-2 items-center mb-6">
          <InfoTooltip 
            size="sm" 
            message={getText(`form${config.name}`) || `Complete los campos para registrar un nuevo ${config.name.toLowerCase()}`} 
            sticky={true}
          >
            <span className="material-symbols-outlined text-gray-400">info</span>
          </InfoTooltip>
          <h2 className="text-xl font-bold text-gray-800">
            Agregar Nuevo {config.name}
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">
              refresh
            </span>
            <p className="font-medium">Procesando registro...</p>
          </div>
        ) : (
          <Form 
            fields={formFields} 
            onSubmit={handleCreate} 
            sendMessage={`Crear ${config.name}`} 
            onCancel={() => setIsOpen(false)}
            gridLayout={true}
            initialValues={initialValues}
          />
        )}
      </div>
    </Modal>
  );
};

export default GenericAddModal;