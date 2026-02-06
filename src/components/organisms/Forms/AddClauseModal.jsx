import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import ClauseService from "../../../services/Contracts/Clauses/clause.service";
import ContractService from "../../../services/Contracts/contract.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const COMPLIANCE_OPTIONS = [
  { value: "compliant", label: "Cumple (Compliant)" },
  { value: "non_compliant", label: "No Cumple (Non-Compliant)" },
  { value: "under_review", label: "En Revisión" },
];

const AddClauseModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractsList, setContractsList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchContracts = async () => {
        setLoadingContracts(true);
        try {
          const response = await ContractService.getAllContracts();
          const data = normalizeList(response);
          setContractsList(
            data.map((c) => ({
              value: c.id,
              label: `${c.contract_number} - ${c.keyName || 'Contrato'}`,
            }))
          );
        } catch (error) {
          console.error("Error cargando contratos:", error);
        } finally {
          setLoadingContracts(false);
        }
      };
      fetchContracts();
    }
  }, [isOpen]);

  const clauseFields = [
    {
      name: "contract_id",
      type: "select",
      label: "Contrato Vinculado *",
      options: contractsList,
      required: true,
    },
    {
      name: "clause_number",
      type: "text",
      label: "N° de Cláusula *",
      placeholder: "Ej: 1.1 o SEC-01",
      required: true,
    },
    {
      name: "title",
      type: "text",
      label: "Título de la Cláusula *",
      placeholder: "Ej: Confidencialidad",
      required: true,
    },
    {
      name: "compliance_status",
      type: "select",
      label: "Estado de Cumplimiento",
      options: COMPLIANCE_OPTIONS,
      defaultValue: "compliant",
    },
    {
      name: "is_critical",
      type: "checkbox",
      label: "Es una cláusula crítica",
      defaultValue: false,
    },
    {
      name: "content",
      type: "textarea",
      label: "Contenido Completo *",
      placeholder: "Escriba aquí el texto legal de la cláusula...",
      required: true,
      fullWidth: true, // Para que ocupe toda la fila
    },
  ];

  const handleCreateClause = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        is_critical: !!formData.is_critical,
        // Si no se selecciona estado, mandamos el default del DTO
        compliance_status: formData.compliance_status || "compliant",
      };

      await ClauseService.createClause(payload);

      Swal.fire("¡Creada!", "La cláusula ha sido registrada.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message;
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formClause") || "Definición de términos y condiciones legales del contrato"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Cláusula Contractual</h2>
      </div>

      {loadingContracts ? (
        <div className="py-20 text-center text-gray-500 italic">Cargando contratos...</div>
      ) : loading ? (
        <div className="py-20 text-center italic font-bold">Guardando cláusula...</div>
      ) : (
        <Form
          fields={clauseFields}
          onSubmit={handleCreateClause}
          initialValues={{ compliance_status: "compliant", is_critical: false }}
          sendMessage="Guardar Cláusula"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddClauseModal;