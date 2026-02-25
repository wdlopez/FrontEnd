import React from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import MWindowService from "../../../services/Slas/MeasurementWindows/mwindow.service";
import { MWINDOW_CONFIG } from "../../../config/entities/mwindow.config";

const ViewOneMWindow = () => {
  return (
    <GenericViewPage
      service={MWindowService}
      config={MWINDOW_CONFIG}
      entityName="Ventana de Medición"
      basePath="/contract/sla/measurement-windows/"
      titleKey="definition"
    />
  );
};

export default ViewOneMWindow;
