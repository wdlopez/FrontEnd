import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import PreferenceService from "../../../services/Notifications/Preferences/preference.service";
import ContractService from "../../../services/Contracts/contract.service"; // Asumiendo que existe
import UserService from "../../../services/User/user.service"; // Asumiendo que existe
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

const AddPreferencesModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({ users: [], contracts: [] });

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        setLoadingOptions(true);
        try {
          const [resUsers, resContracts] = await Promise.all([
            UserService.getAllUsers(),
            ContractService.getAllContracts()
          ]);

          setOptions({
            users: normalizeList(resUsers).map(u => ({ 
              value: u.id, 
              label: u.name || u.email || `Usuario ${u.id.substring(0,8)}` 
            })),
            contracts: normalizeList(resContracts).map(c => ({ 
              value: c.id, 
              label: c.contract_number || `Contrato ${c.id.substring(0,8)}` 
            }))
          });
        } catch (error) {
          console.error("Error cargando dependencias para preferencias:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchDependencies();
    }
  }, [isOpen]);

  const preferenceFields = [
    { name: "user_id", type: "select", label: "Usuario *", options: options.users, required: true },
    { name: "cont_id", type: "select", label: "Contrato Asociado *", options: options.contracts, required: true },
    { name: "advance_days", type: "number", label: "Días de Anticipación", defaultValue: 7, required: true },
    { name: "days_limit", type: "number", label: "Límite de Días", defaultValue: 7, required: true },
    { name: "notify_email", type: "select", label: "Notificar por Correo", options: BOOLEAN_OPTIONS, defaultValue: "false", required: true },
    { name: "notify_platform", type: "select", label: "Notificar en Plataforma", options: BOOLEAN_OPTIONS, defaultValue: "true", required: true },
  ];

  const handleCreatePreference = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        // Convertimos valores a números y booleanos estrictos para cumplir con los DTOs de Class-Validator
        advance_days: parseInt(formData.advance_days, 10),
        days_limit: parseInt(formData.days_limit, 10),
        notify_email: formData.notify_email === "true" || formData.notify_email === true,
        notify_platform: formData.notify_platform === "true" || formData.notify_platform === true,
      };

      await PreferenceService.createPreference(payload);

      Swal.fire("¡Éxito!", "Preferencia configurada correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || "Ocurrió un error al guardar la preferencia.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("modals.formPrefInfo") || "Configura cómo y cuándo se debe notificar a un usuario sobre eventos de un contrato."}>
          <span className="material-symbols-outlined text-gray-400">tune</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Preferencia</h2>
      </div>

      {loadingOptions ? (
        <div className="py-10 text-center text-gray-500">Cargando usuarios y contratos...</div>
      ) : (
        <Form
          fields={preferenceFields}
          onSubmit={handleCreatePreference}
          loading={loading}
          sendMessage="Guardar Preferencia"
          gridLayout={true} // Mostrar a 2 columnas para organizar mejor los inputs
        />
      )}
    </Modal>
  );
};

export default AddPreferencesModal;