import React, { useState, useEffect } from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import ContractService from "../../../services/Contracts/contract.service";
import ClientService from "../../../services/Clients/client.service";
import ProviderService from "../../../services/Providers/provider.service";
import { CONTRACT_CONFIG } from "../../../config/entities/contract.config";
import { normalizeList } from "../../../utils/api-helpers";

const ViewOneContract = () => {
  const [enrichedConfig, setEnrichedConfig] = useState(CONTRACT_CONFIG);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [clientsRes, providersRes] = await Promise.allSettled([
          ClientService.getAll({ page: 1, limit: 100 }),
          ProviderService.getAll({ page: 1, limit: 100 }),
        ]);

        const newConfig = {
          ...CONTRACT_CONFIG,
          columns: CONTRACT_CONFIG.columns.map((c) => ({ ...c })),
        };

        if (clientsRes.status === "fulfilled") {
          const clients = normalizeList(clientsRes.value);
          const clientCol = newConfig.columns.find((c) => c.backendKey === "client_id");
          if (clientCol) {
            clientCol.options = clients.map((c) => ({
              value: c.id,
              label: c.name,
            }));
          }
        }

        if (providersRes.status === "fulfilled") {
          const providers = normalizeList(providersRes.value);
          const providerCol = newConfig.columns.find((c) => c.backendKey === "provider_id");
          if (providerCol) {
            providerCol.options = providers.map((p) => ({
              value: p.id,
              label: p.legal_name || p.name,
            }));
          }
        }

        setEnrichedConfig(newConfig);
      } catch (error) {
        console.error("Error cargando catálogos para vista de contrato:", error);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <GenericViewPage
      service={ContractService}
      config={enrichedConfig}
      entityName="Contrato"
      basePath="/contract/general/"
      titleKey="contract_number"
    />
  );
};

export default ViewOneContract;
