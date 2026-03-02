import React, { useEffect, useState, useCallback } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import Alerts from '../../../components/molecules/Alerts';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import GenericAddModal from '../../../components/organisms/Forms/GenericAddModal';
import GenericEditModal from '../../../components/organisms/Forms/GenericEditModal';
import ConfirmActionModal from '../../../components/organisms/Forms/ConfirmActionModal';

import ProviderContactService from '../../../services/Providers/Contacts/provider-contact.service';
import ProviderService from '../../../services/Providers/provider.service';
import { PROVIDER_CONTACT_CONFIG } from '../../../config/entities/provider-contact.config';
import { normalizeList } from '../../../utils/api-helpers';
import { mapBackendToTable } from '../../../utils/entityMapper';
import { getText } from '../../../utils/text';

const SupplierContactPage = ({ embedded = false }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicConfig, setDynamicConfig] = useState(PROVIDER_CONTACT_CONFIG);

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selección y Alertas
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Contactos", url: null }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const contactsRes = await ProviderContactService.getAll();
      const [providersRes] = await Promise.allSettled([
        ProviderService.getAll(),
      ]);

      const newConfig = {
        ...PROVIDER_CONTACT_CONFIG,
        columns: PROVIDER_CONTACT_CONFIG.columns.map((c) => ({ ...c })),
      };

      let providersList = [];
      if (providersRes.status === 'fulfilled') {
        providersList = normalizeList(providersRes.value);
        const providerCol = newConfig.columns.find((c) => c.backendKey === 'provider_id');
        if (providerCol) {
          providerCol.options = providersList.map((p) => ({
            value: p.id,
            label: p.name || p.legal_name || p.company_name || `Proveedor ${p.id}`,
          }));
        }
      }

      if (contactsRes) {
        const rawList = normalizeList(contactsRes);
        const enrichedList = rawList.map((c) => {
          const provider = providersList.find((p) => p.id === c.provider_id);
          return {
            ...c,
            provider_name: provider
              ? provider.name || provider.legal_name || provider.company_name
              : null,
          };
        });

        setContacts(mapBackendToTable(enrichedList, newConfig));
      }

      setDynamicConfig(newConfig);
    } catch (error) {
      console.error("Error al cargar contactos:", error);
      setAlert({
        open: true,
        message: "Error al cargar la lista de contactos.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mapeo de columnas para InteractiveTable
  const columnMapping = {};
  const selectColumns = {};
  const nonEditableColumns = [];

  dynamicConfig.columns.forEach((col) => {
    if (col.backendKey && !col.hiddenInTable) columnMapping[col.header] = col.backendKey;
    if (col.options) selectColumns[col.header] = col.options;
    if (col.editable === false) nonEditableColumns.push(col.header);
  });

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setIsEditOpen(true);
  };

  const handleInlineEdit = async ({ row, column, realColumn, newValue }) => {
    try {
      await ProviderContactService.update(row.id, { [realColumn]: newValue });
      setContacts((prev) =>
        prev.map((c) => (c.id === row.id ? { ...c, [column]: newValue } : c)),
      );
      setAlert({ open: true, message: 'Campo actualizado correctamente', type: 'success' });
    } catch (error) {
      console.error('Error actualizando campo:', error);
      setAlert({ open: true, message: 'No se pudo actualizar el campo', type: 'error' });
    }
  };

  const handleDeleteReq = (row) => {
    setSelectedRow({
      id: row.id,
      name: row["Nombre"] || "Contacto",
      state: true,
    });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await ProviderContactService.delete(data.id);
      setAlert({
        open: true,
        message: 'Contacto eliminado correctamente',
        type: 'success',
      });
      setContacts((prev) => prev.filter((c) => c.id !== data.id));
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      setAlert({
        open: true,
        message: 'No se pudo eliminar el contacto',
        type: 'error',
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className={embedded ? "space-y-6" : "p-6 space-y-6"}>
      {!embedded && <BreadCrumb paths={breadcrumbPaths} />}

      {/* Encabezado con fondo blanco horizontal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <InfoTooltip
                size="sm"
                message={
                  getText("intros.providerContacts") ||
                  "Directorio de enlaces técnicos y comerciales de sus proveedores."
                }
                sticky={true}
              >
                <span className="material-symbols-outlined text-gray-400">info</span>
              </InfoTooltip>
              <h1 className="text-2xl font-bold text-gray-800">Contactos de Proveedores</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Administre los puntos de contacto clave para cada proveedor.
            </p>
          </div>
        </div>
      </div>

      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando contactos...</div>
        ) : (
          <InteractiveTable 
            data={contacts}
            columnMapping={columnMapping}
            selectColumns={selectColumns}
            nonEditableColumns={nonEditableColumns}
            onEdit={handleEdit}
            onSubmit={handleInlineEdit}
            onDelete={handleDeleteReq}
            onAdd={() => setIsAddOpen(true)}
            path="/suppliers/contacts/"
            rowsPerPage={10}
            headerButtons={
              <HeaderActions 
                AddComponent={
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="btn btn-primary flex items-center gap-2 px-4 h-[38px] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Nuevo contacto</span>
                  </button>
                }
                showExport={true}
                onRefresh={fetchData}
              />
            }
          />
        )}
      </div>

      {/* MODALES */}
      <GenericAddModal 
        isOpen={isAddOpen} 
        setIsOpen={setIsAddOpen} 
        service={ProviderContactService}
        config={dynamicConfig}
        onSuccess={fetchData}
        initialValues={{
          is_primary: false,
        }}
      />

      <GenericEditModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        entityId={selectedId} 
        service={ProviderContactService} 
        config={dynamicConfig} 
        onSuccess={fetchData}
      />

      <ConfirmActionModal 
        isOpen={isDeleteOpen} 
        setIsOpen={setIsDeleteOpen} 
        data={selectedRow} 
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        entityName={PROVIDER_CONTACT_CONFIG.name}
      />
    </div>
  );
};

export default SupplierContactPage;