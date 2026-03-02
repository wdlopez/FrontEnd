import React, { useEffect, useState } from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import MeasurementService from "../../../services/Slas/Measurement/measurement.service";
import SlaService from "../../../services/Slas/sla.service";
import { MEASUREMENT_CONFIG } from "../../../config/entities/measurement.config";
import { normalizeList } from "../../../utils/api-helpers";

const ViewOneMeasurement = () => {
  const [enrichedConfig, setEnrichedConfig] = useState(MEASUREMENT_CONFIG);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const slasRes = await SlaService.getAll();
        const slasList = normalizeList(slasRes);

        const newConfig = {
          ...MEASUREMENT_CONFIG,
          columns: MEASUREMENT_CONFIG.columns.map((c) => ({ ...c })),
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
        console.error("Error cargando catálogos para vista de medición:", error);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <GenericViewPage
      service={MeasurementService}
      config={enrichedConfig}
      entityName="Medición SLA"
      basePath="/contract/sla"
      titleKey="measurement_date"
      useEntityNameAsTitle={true}
      showMetaDates={false}
    />
  );
};

export default ViewOneMeasurement;

