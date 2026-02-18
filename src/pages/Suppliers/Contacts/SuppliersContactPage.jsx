import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddSupplierContactModal from '../../../components/organisms/Forms/AddSupplierContactModal';
import Alerts from '../../../components/molecules/Alerts';
import ProviderContactService from '../../../services/Providers/Contacts/provider-contact.service';
import { normalizeList } from '../../../utils/api-helpers';

const SupplierContactPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Proveedores", url: "/providers" },
    { name: "Contactos", url: null }
  ];

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await ProviderContactService.getAllProviders(); // Nota: el servicio dice getAllProviders pero apunta a /provider-contact
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, index) => ({
        ...item,
        index: index + 1,
        full_name: `${item.first_name} ${item.last_name}`,
        primary_badge: item.is_primary ? (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold uppercase">⭐ Principal</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
      }));

      setContacts(formatted);
    } catch (error) {
        console.error("Error al cargar contactos:", error);
      setAlert({ open: true, message: "Error al cargar la lista de contactos.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Nombre Completo': 'full_name',
    'Cargo': 'position',
    'Email': 'email',
    'Teléfono': 'phone',
    'Tipo': 'primary_badge'
  };

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contactos de Proveedores</h1>
          <p className="text-gray-500 text-sm">Directorio de enlaces técnicos y comerciales de sus proveedores.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando contactos...</div>
        ) : (
          <InteractiveTable 
            data={contacts}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await ProviderContactService.deleteProviderContact(row.id);
                fetchContacts();
              } catch (e) {
                console.error("Error al eliminar contacto:", e);
                setAlert({ open: true, message: "Error al eliminar el contacto.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nuevo Contacto"
                onRefresh={fetchContacts}
              />
            }
          />
        )}
      </div>

      <AddSupplierContactModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchContacts} 
      />
    </div>
  );
};

export default SupplierContactPage;