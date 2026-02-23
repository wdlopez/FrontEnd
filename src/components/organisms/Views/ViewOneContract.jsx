import React from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import ContractService from "../../../services/Contracts/contract.service";
import { CONTRACT_CONFIG } from "../../../config/entities/contract.config";

const ViewOneSupplier = () => {
  return (
    <GenericViewPage 
      service={ContractService}
      config={CONTRACT_CONFIG}
      entityName="Contrato"
      basePath="/contract/general/"
      titleKey="contract_number"
    />
  );
};

export default ViewOneSupplier;