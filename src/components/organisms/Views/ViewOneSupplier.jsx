import React from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import ProviderService from "../../../services/Providers/provider.service";
import { PROVIDER_CONFIG } from "../../../config/entities/provider.config";

const ViewOneSupplier = () => {
  return (
    <GenericViewPage 
      service={ProviderService}
      config={PROVIDER_CONFIG}
      entityName="Proveedor"
      basePath="/suppliers/"
      titleKey="legal_name"
    />
  );
};

export default ViewOneSupplier;