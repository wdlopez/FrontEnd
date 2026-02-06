import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import ClientService from "../../../services/Clients/client.service";
import ProviderService from "../../../services/Providers/provider.service";
import ContractService from "../../../services/Contracts/contract.service";
import { useAuth } from "../../../context/AuthContext";
import { normalizeList } from "../../../utils/api-helpers";
import Swal from "sweetalert2";

const AddContractModal = ({
  isOpen,
  setIsOpen,
  onSuccess,
  clientSelectedId,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [catalogs, setCatalogs] = useState({
    providers: [],
    clients: [],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingLists(true);
        try {
          const [clientsRes, providersRes] = await Promise.allSettled([
            ClientService.getAllClients(),
            ProviderService.getAllProviders(),
          ]);

          const cData = clientsRes.status === 'fulfilled' ? normalizeList(clientsRes.value) : [];
          const pData = providersRes.status === 'fulfilled' ? normalizeList(providersRes.value) : [];

          setCatalogs({
            clients: cData.map((c) => ({
              value: c.id,
              label: c.name || "Cliente sin nombre",
            })),
            providers: pData.map((p) => ({
              value: p.id,
              label: p.legal_name || p.name || "Proveedor sin nombre",
            })),
          });
        } catch (error) {
          console.error("Error loading catalogs:", error);
          Swal.fire("Error", "No se pudieron cargar los catálogos", "warning");
        } finally {
          setLoadingLists(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const contractFields = [
    {
      name: "contract_number",
      type: "text",
      label: "Número de Contrato *",
      placeholder: "Ej: CR-2026-001",
      required: true,
    },
    {
      name: "version",
      type: "text",
      label: "Versión",
      placeholder: "1",
      required: false,
    },
    {
      name: "keyName",
      type: "text",
      label: "Nombre Clave (Alias)",
      placeholder: "Ej: Contrato Marco IT",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
      placeholder: "Detalles del contrato...",
      required: false,
    },
    {
      name: "client_id",
      type: "select",
      label: "Cliente *",
      options: catalogs.clients,
      required: true,
      defaultValue: clientSelectedId || "",
    },
    {
      name: "provider_id",
      type: "select",
      label: "Proveedor *",
      options: catalogs.providers,
      required: true,
    },
    {
      name: "start_date",
      type: "date",
      label: "Fecha Inicio *",
      required: true,
      group: "Vigencia",
    },
    {
      name: "end_date",
      type: "date",
      label: "Fecha Fin *",
      required: true,
      group: "Vigencia",
    },
    {
      name: "total_value",
      type: "number",
      label: "Valor Total *",
      placeholder: "0.00",
      required: true,
      group: "Financiero",
    },
    {
      name: "currency",
      type: "select",
      label: "Moneda",
      options: [
        { value: "USD", label: "Dólares (USD)" },
        { value: "COP", label: "Pesos Col (COP)" },
        { value: "EUR", label: "Euros (EUR)" },
      ],
      required: false,
      defaultValue: "USD",
      group: "Financiero",
    },
    {
      name: "country",
      type: "text",
      label: "País *",
      placeholder: "Colombia",
      required: true,
      group: "Ubicación",
    },
    {
      name: "language",
      type: "select",
      label: "Idioma *",
      options: [
        { value: "es", label: "Español" },
        { value: "en", label: "Inglés" },
        { value: "pt", label: "Portugués" },
      ],
      required: true,
      defaultValue: "es",
      group: "Ubicación",
    },
  ];

  const handleCreateContract = async (formData) => {
    setLoading(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      );

      const payload = {
        ...cleanData,
        total_value: parseFloat(formData.total_value),
        status: "draft",
        created_by: user?.id,
        //approved_by: user?.id
      };

      if (!payload.created_by) {
        throw new Error(
          "No se pudo identificar al usuario creador (created_by missing).",
        );
      }

      await ContractService.createContract(payload);

      Swal.fire("¡Éxito!", "Contrato creado correctamente.", "success");
      setIsOpen(false);

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error creando contrato:", error);
      const msg = error.response?.data?.message || error.message;
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      Swal.fire("Error", displayMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formCont") || "Nuevo Contrato"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Registrar Contrato</h2>
      </div>

      {loadingLists ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 mb-2">refresh</span>
          <p className="text-gray-500 italic">Cargando catálogos...</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          <p className="mt-4 text-gray-600 font-medium text-center">
            Guardando contrato... <br /> <span className="text-xs font-normal">Esto puede tardar unos segundos</span>
          </p>
        </div>
      ) : (
        <Form
          fields={contractFields}
          onSubmit={handleCreateContract}
          initialValues={{
            currency: "USD",
            language: "es",
            client_id: clientSelectedId || "",
          }}
          sendMessage="Guardar Contrato"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddContractModal;