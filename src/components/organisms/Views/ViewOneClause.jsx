import React from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import ClauseService from "../../../services/Contracts/Clauses/clause.service";
import { CLAUSE_CONFIG } from "../../../config/entities/clause.config";

const ViewOneSupplier = () => {
  return (
    <GenericViewPage 
      service={ClauseService}
      config={CLAUSE_CONFIG}
      entityName="Cláusula"
      basePath="/contract/clauses/"
      titleKey="clause_number"
    />
  );
};

export default ViewOneSupplier;