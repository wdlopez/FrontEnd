import React, { useState, useEffect } from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import ServiceService from "../../../services/Contracts/Services/service.service";
import ContractService from "../../../services/Contracts/contract.service";
import { SERVICE_CONFIG } from "../../../config/entities/service.config";
import { normalizeList } from "../../../utils/api-helpers";

const ViewOneService = () => {
  const [enrichedConfig, setEnrichedConfig] = useState(SERVICE_CONFIG);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const contractsRes = await ContractService.getAll();
        
        const newConfig = {
          ...SERVICE_CONFIG,
          columns: SERVICE_CONFIG.columns.map((c) => ({ ...c })),
        };

        if (contractsRes) {
          const contracts = normalizeList(contractsRes);
          const contractCol = newConfig.columns.find((c) => c.backendKey === "contract_id");
          if (contractCol) {
            contractCol.options = contracts.map((c) => ({
              value: c.id,
              label: c.contract_number || c.keyName || `Contrato ${c.id}`,
            }));
          }
        }

        setEnrichedConfig(newConfig);
      } catch (error) {
        console.error("Error cargando contratos para vista de servicio:", error);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <GenericViewPage 
      service={ServiceService}
      config={enrichedConfig}
      entityName="Servicio"
      basePath="/contract/services/"
      titleKey="tower"
    />
  );
};

export default ViewOneService;
