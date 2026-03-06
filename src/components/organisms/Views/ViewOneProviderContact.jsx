import React, { useEffect, useState } from "react";
import GenericViewPage from "../../organisms/Forms/GenericViewPage";
import ProviderContactService from "../../../services/Providers/Contacts/provider-contact.service";
import ProviderService from "../../../services/Providers/provider.service";
import { PROVIDER_CONTACT_CONFIG } from "../../../config/entities/provider-contact.config";
import { normalizeList } from "../../../utils/api-helpers";

const ViewOneProviderContact = () => {
  const [enrichedConfig, setEnrichedConfig] = useState(PROVIDER_CONTACT_CONFIG);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const providersRes = await ProviderService.getAll();
        const providersList = normalizeList(providersRes);

        const newConfig = {
          ...PROVIDER_CONTACT_CONFIG,
          columns: PROVIDER_CONTACT_CONFIG.columns.map((c) => ({ ...c })),
        };

        const providerCol = newConfig.columns.find((c) => c.backendKey === "provider_id");
        if (providerCol) {
          providerCol.options = providersList.map((p) => ({
            value: p.id,
            label: p.name || p.legal_name || p.company_name || `Proveedor ${p.id}`,
          }));
        }

        setEnrichedConfig(newConfig);
      } catch (error) {
        console.error("Error cargando catálogos para vista de contacto:", error);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <GenericViewPage
      service={ProviderContactService}
      config={enrichedConfig}
      entityName="Contacto de proveedor"
      basePath="/suppliers/contacts"
      titleKey="first_name"
      deleteButtonLabel="Desactivar"
    />
  );
};

export default ViewOneProviderContact;

