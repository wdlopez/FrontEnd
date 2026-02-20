import React, { useState } from "react";
import Modal from "../../molecules/Modal";
import Form from "./Form";
import ClientService from "../../../services/Clients/client.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { CLIENT_CONFIG } from "../../../config/entities/client.config";
import { generateFormFields } from "../../../utils/entityMapper";

const AddClientModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const clientFields = generateFormFields(CLIENT_CONFIG);

  const handleCreateClient = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim()
      };

      await ClientService.create(payload);

      Swal.fire("¡Creado!", "El cliente ha sido registrado con éxito.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message;
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} setOpen={setIsOpen} size="lg">
      <div className="p-1">
        <div className="flex gap-2 items-center mb-6">
          <InfoTooltip size="sm" message={getText("formClient") || "Registro"} sticky={true}>
            <span className="material-symbols-outlined text-gray-400">info</span>
          </InfoTooltip>
          <h2 className="text-xl font-bold text-gray-800">Agregar Nuevo {CLIENT_CONFIG.name}</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">refresh</span>
          </div>
        ) : (
          <Form 
            fields={clientFields} 
            onSubmit={handleCreateClient} 
            sendMessage="Crear Cliente" 
            onCancel={() => setIsOpen(false)}
            gridLayout={true}
          />
        )}
      </div>
    </Modal>
  );
};

export default AddClientModal;