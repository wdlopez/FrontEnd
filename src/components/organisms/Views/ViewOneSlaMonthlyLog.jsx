import React, { useEffect, useState } from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import SlaMonthlyLogService from "../../../services/Slas/MonthlyLog/sla-monthly-log.service";
import SlaService from "../../../services/Slas/sla.service";
import { SLA_MONTHLY_LOG_CONFIG } from "../../../config/entities/sla-monthly-log.config";
import { normalizeList } from "../../../utils/api-helpers";

const ViewOneSlaMonthlyLog = () => {
  const [enrichedConfig, setEnrichedConfig] = useState(SLA_MONTHLY_LOG_CONFIG);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const slasRes = await SlaService.getAll();
        const slasList = normalizeList(slasRes);

        const newConfig = {
          ...SLA_MONTHLY_LOG_CONFIG,
          columns: SLA_MONTHLY_LOG_CONFIG.columns.map((c) => ({ ...c })),
        };

        const slaCol = newConfig.columns.find((c) => c.backendKey === "sla_id");
        if (slaCol) {
          slaCol.options = slasList.map((sla) => ({
            value: sla.id,
            label: sla.name || sla.reference || `SLA ${sla.id}`,
          }));
        }

        setEnrichedConfig(newConfig);
      } catch (error) {
        console.error("Error cargando catálogos para vista de registro mensual SLA:", error);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <GenericViewPage
      service={SlaMonthlyLogService}
      config={enrichedConfig}
      entityName="Registro mensual SLA"
      basePath="/contract/sla"
      titleKey="month"
      useEntityNameAsTitle={false}
      showMetaDates={true}
    />
  );
};

export default ViewOneSlaMonthlyLog;

