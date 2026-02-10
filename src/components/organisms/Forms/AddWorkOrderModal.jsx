import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import WorkOrderService from "../../../services/Contracts/WorkOrders/orders.service";
import ContractService from "../../../services/Contracts/contract.service";
import ClauseService from "../../../services/Contracts/Clauses/clause.service";
import UserService from "../../../services/User/user.service";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddWorkOrderModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Estados para las listas
  const [contractsList, setContractsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allClauses, setAllClauses] = useState([]);
  const [filteredClauses, setFilteredClauses] = useState([]);

  // Control del contrato seleccionado
  const [selectedContractId, setSelectedContractId] = useState(null);

  const initialValues = React.useMemo(() => ({ 
  request_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  compliance_status: "compliant",
  is_critical: false
}), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          // Cargamos todo en paralelo
          const [contractsRes, clausesRes, usersRes] = await Promise.all([
            ContractService.getAllContracts(),
            ClauseService.getAllClauses(),
            UserService.getAllUsers()
          ]);

          // 1. Procesar Contratos (Usando normalizeList)
          const contractsNorm = normalizeList(contractsRes);
          setContractsList(contractsNorm.map(c => ({
            value: c.id,
            label: `${c.contract_number} - ${c.keyName || 'Sin Alias'}`
          })));

          // 2. Procesar Cláusulas (Usando normalizeList - ¡Mucho más limpio!)
          const clausesArray = normalizeList(clausesRes);
          setAllClauses(clausesArray);

          // 3. Procesar Usuarios (Usando normalizeList)
          const usersArray = normalizeList(usersRes);
          setUsersList(usersArray.map(u => ({
            value: u.id,
            label: `${u.firstName} ${u.lastName} (${u.email || 'Sin email'})`
          })));

        } catch (error) {
          console.error("Error cargando dependencias:", error);
          Swal.fire("Error", "No se pudieron cargar los datos necesarios", "error");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Filtrado de cláusulas (se mantiene igual)
  useEffect(() => {
    // Agregamos un log para depurar (puedes borrarlo después)
    console.log("Contrato seleccionado:", selectedContractId);
    console.log("Total cláusulas disponibles:", allClauses.length);

    if (selectedContractId && allClauses.length > 0) {
      const associated = allClauses
        .filter(clause => {
          // Verificamos que la cláusula tenga contrato y comparamos ignorando espacios
          return clause.contract_id && 
                 String(clause.contract_id).trim() === String(selectedContractId).trim();
        })
        .map(c => ({
          value: c.id,
          label: `${c.clause_number} - ${c.title}`
        }));
      
      console.log("Cláusulas encontradas para este contrato:", associated.length);
      setFilteredClauses(associated);
    } else {
      setFilteredClauses([]);
    }
  }, [selectedContractId, allClauses]);

  const workOrderFields = [
    {
      name: "contract_id",
      type: "select",
      label: "Contrato *",
      options: contractsList,
      required: true,
      customSelect: true,
      onChange: (value) => {
        const id = value?.target ? value.target.value : value;
        console.log("Seteando ID de contrato:", id);
        setSelectedContractId(id);
      }
    },
    {
      name: "title",
      type: "text",
      label: "Título de la Orden *",
      placeholder: "Ej: Implementación de API",
      required: true,
      maxLength: 200,
    },
    {
      name: "linked_clause_id",
      type: "select",
      label: "Cláusula Vinculada",
      options: filteredClauses,
      placeholder: selectedContractId 
        ? (filteredClauses.length > 0 ? "Seleccione una cláusula" : "Este contrato no tiene cláusulas") 
        : "Seleccione un contrato primero",
      disabled: !selectedContractId || filteredClauses.length === 0,
      required: false,
    },
    {
      name: "request_date",
      type: "date",
      label: "Fecha de Solicitud *",
      required: true,
      group: "Fechas",
    },
    {
      name: "due_date",
      type: "date",
      label: "Fecha de Vencimiento *",
      required: true,
      group: "Fechas",
    },
    {
      name: "assigned_to",
      type: "select",
      label: "Asignar a",
      options: usersList,
      placeholder: "Seleccione un responsable",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción Detallada",
      placeholder: "Detalles técnicos y requerimientos...",
      required: false,
      fullWidth: true,
    },
  ];

  const handleCreateOrder = async (formData) => {
    if (!user || !user.id) {
        Swal.fire("Error de sesión", "No se pudo identificar al usuario actual.", "error");
        return;
    }

    setLoading(true);
    try {
      const payload = {
        contract_id: formData.contract_id,
        title: formData.title,
        description: formData.description || undefined,
        linked_clause_id: formData.linked_clause_id || undefined,
        request_date: formData.request_date,
        due_date: formData.due_date,
        assigned_to: formData.assigned_to || undefined,
        created_by: user.id
      };

      await WorkOrderService.createOrder(payload);

      Swal.fire("¡Éxito!", "Orden de trabajo creada correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creando orden:", error);
      const msg = error.response?.data?.message || "Error desconocido";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formWorkOrder") || "Creación de órdenes técnicas vinculadas a contratos"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nueva Orden de Trabajo</h2>
      </div>

      {loadingData ? (
        <div className="py-20 flex flex-col items-center text-gray-500">
           <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
           <p>Cargando datos maestros...</p>
        </div>
      ) : loading ? (
        <div className="py-20 text-center font-medium text-blue-600">
           Procesando solicitud...
        </div>
      ) : (
        <Form
          fields={workOrderFields}
          onSubmit={handleCreateOrder}
          initialValues={initialValues}
          sendMessage="Crear Orden"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddWorkOrderModal;