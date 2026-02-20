import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "./Form";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";

const GenericEditModal = ({ 
  isOpen, 
  setIsOpen, 
  entityId, 
  service,
  config,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); 
  const [initialData, setInitialData] = useState(null);

  const formFields = config?.columns
    ?.filter(col => col.backendKey && col.editable !== false && col.backendKey !== 'id' && col.backendKey !== 'active')
    .map(col => {
      const field = {
        name: col.backendKey,
        label: col.header,
        type: col.type || col.input_type || 'text',
        options: col.options || [],
        required: col.required !== false,
        placeholder: col.placeholder || `Ingrese ${col.header.toLowerCase()}`,
        pattern: col.validation,
        patternMessage: col.validationMessage || `${col.header} tiene un formato inválido`
      };

      if (col.allowedChars) {
        field.onInput = (e) => {
          const input = e.target;
          const filtered = input.value
            .split('')
            .filter(char => col.allowedChars.test(char))
            .join('');
          
          if (filtered !== input.value) {
            input.value = filtered;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        };
      }

      return field;
    }) || [];

  useEffect(() => {
    if (isOpen && entityId && service) {
      fetchEntityData();
    }
  }, [isOpen, entityId]);

  const fetchEntityData = async () => {
    setDataLoading(true);
    try {

      const response = await service.getById(entityId);
      
      const data = response.data || response.ClientEntity || response.client || response;
      setInitialData(data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
      setIsOpen(false);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setLoading(true);
    try {
      
      await service.update(entityId, formData);

      Swal.fire("¡Actualizado!", `Exitoso`, "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error actualizando:", error);
      const msg = error.response?.data?.message;
      const errorDisplay = Array.isArray(msg) ? msg.join(", ") : msg || "Error al actualizar";
      Swal.fire("Error", errorDisplay, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} setOpen={setIsOpen} size="lg">
      <div className="p-1">
        <div className="flex gap-2 items-center mb-6">
          <InfoTooltip size="sm" message={getText(`form${config.name}`) || "Edite los detalles del registro"} sticky={true}>
            <span className="material-symbols-outlined text-gray-400">info</span>
          </InfoTooltip>
          <h2 className="text-xl font-bold text-gray-800">Editar {config.name}</h2>
        </div>

        {dataLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">refresh</span>
            <p className="font-medium">Cargando información...</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">save</span>
            <p className="font-medium">Guardando cambios...</p>
          </div>
        ) : initialData ? (
          <Form 
            fields={formFields} 
            onSubmit={handleUpdate} 
            sendMessage={`Actualizar ${config.name}`}
            onCancel={() => setIsOpen(false)}
            gridLayout={true}
            initialValues={initialData}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No se encontraron datos para editar.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GenericEditModal;