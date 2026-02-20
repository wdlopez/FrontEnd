import React from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import ClientService from "../../../services/Clients/client.service";
import { CLIENT_CONFIG } from "../../../config/entities/client.config";

const ViewOneClient = () => {
  return (
    <GenericViewPage 
      service={ClientService}
      config={CLIENT_CONFIG}
      entityName="Cliente"
      basePath="/client"
      titleKey="name" // El campo que quieres que salga en grande arriba
    />
  );
};

export default ViewOneClient;