import React from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import UserService from "../../../services/User/user.service";
import { USER_CONFIG } from "../../../config/entities/user.config";

const ViewOneUser = () => {
  return (
    <GenericViewPage 
      service={UserService}
      config={USER_CONFIG}
      entityName="Usuario"
      basePath="/settings/userNroles"
      titleKey="firstName"
    />
  );
};

export default ViewOneUser;