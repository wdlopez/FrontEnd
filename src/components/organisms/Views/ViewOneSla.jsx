import React, { useState, useEffect } from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import SlaService from "../../../services/Slas/sla.service";
import ContractService from "../../../services/Contracts/contract.service";
import ServiceService from "../../../services/Contracts/Services/service.service";
import { SLA_CONFIG } from "../../../config/entities/sla.config";
import { normalizeList } from "../../../utils/api-helpers";

const ViewOneSla = () => {
  const [enrichedConfig, setEnrichedConfig] = useState(SLA_CONFIG);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [contractsRes, servicesRes] = await Promise.allSettled([
          ContractService.getAll(),
          ServiceService.getAll(),
        ]);

        const newConfig = {
          ...SLA_CONFIG,
          columns: SLA_CONFIG.columns.map((c) => ({ ...c })),
        };

        if (contractsRes.status === "fulfilled") {
          const contracts = normalizeList(contractsRes.value);
          const contractCol = newConfig.columns.find((c) => c.backendKey === "contract_id");
          if (contractCol) {
            contractCol.options = contracts.map((c) => ({
              value: c.id,
              label: c.contract_number || c.name || `Contrato ${c.id}`,
            }));
          }
        }

        if (servicesRes.status === "fulfilled") {
          const services = normalizeList(servicesRes.value);
          const serviceCol = newConfig.columns.find((c) => c.backendKey === "service_id");
          if (serviceCol) {
            serviceCol.options = services.map((s) => ({
              value: s.id,
              label: s.tower ? `${s.tower} - ${s.group}` : (s.name || `Servicio ${s.id}`),
            }));
          }
        }

        setEnrichedConfig(newConfig);
      } catch (error) {
        console.error("Error cargando catálogos para vista de SLA:", error);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <GenericViewPage
      service={SlaService}
      config={enrichedConfig}
      entityName="SLA"
      basePath="/contract/sla/"
      titleKey="name"
    />
  );
};

export default ViewOneSla;
