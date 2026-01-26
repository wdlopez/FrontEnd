import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddClientModal from '../../components/organisms/Forms/AddClientModal';
import Alerts from '../../components/molecules/Alerts';
import ClientService from '../../services/Clients/client.service';

const ClientsPage = () => {
  // --- Estados ---
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  // Configuración Breadcrumb
  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Gestión Integral", url: "/clients" },
    { name: "Clientes", url: null } // Actual
  ];

  // --- Funciones de Carga ---
  const fetchClients = async () => {
    setLoading(true);
    try {
      // Asumimos que el backend devuelve { data: [...], meta: {...} } o un array directo
      // Ajusta según la respuesta real de tu DTO "ApiResponseDto"
      const response = await ClientService.getAllClients();

      // Normalizar las posibles formas de respuesta de la API y siempre obtener un array
      let dataList = [];
      if (Array.isArray(response)) {
        dataList = response;
      } else if (Array.isArray(response?.data)) {
        dataList = response.data;
      } else if (Array.isArray(response?.items)) {
        dataList = response.items;
      } else if (Array.isArray(response?.data?.data)) {
        dataList = response.data.data;
      } else if (Array.isArray(response?.data?.items)) {
        dataList = response.data.items;
      } else {
        // Fall back seguro: si la respuesta es un objeto con keys pero no contiene el array esperado,
        // dejar dataList como array vacío para que InteractiveTable muestre 'Sin registros' en vez de romper.
        dataList = [];
      }

      console.log('📦 Clients API response:', response);

      // Mapear la respuesta a la forma que espera la tabla (cabeceras legibles)
      const formattedClients = dataList.map((c, i) => ({
        'N°': i + 1,
        'Nombre': c.name || c.client_name || c.ClientEntity_name || c.nombre || '',
        'NIT / Documento': c.document || c.document_file || c.ClientEntity_document_file || c.nit || '',
        'Contacto': c.contactPerson || c.contact_person || c.ClientEntity_contact_person || c.contacto || '',
        'Industria': c.category || c.ClientEntity_category || c.categoria || '',
        'Email': c.email || c.ClientEntity_email || '',
        'Phone': c.phone || c.ClientEntity_phone || '',
        'Estado': (c.active ?? c.isActive ?? c.ClientEntity_active) ? 'Activo' : 'Inactivo',
        id: c.id || c.ClientEntity_id || c.uuid || null,
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setAlert({ 
        open: true, 
        message: "No se pudieron cargar los clientes. Verifique su conexión.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // --- Configuración de Tabla ---
  // Mapeamos las columnas visuales a las propiedades del objeto que viene del backend
  const columnMapping = {
    'Nombre': 'name', // o 'client_name' si tu backend lo devuelve así
    'NIT / Documento': 'document',
    'Contacto': 'contactPerson',
    'Industria': 'category',
    'Email': 'email',
    'Phone': 'phone',
    'Estado': 'status' // Asumiendo que el backend devuelve un status
  };

  return (
      <div className="p-6 space-y-6">
        
        {/* Navegación y Alertas */}
        <BreadCrumb paths={breadcrumbPaths} />
        
        <Alerts 
          open={alert.open} 
          setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
          message={alert.message} 
          type={alert.type} 
        />

        {/* Encabezado con Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
            <p className="text-gray-500 text-sm">Administra la base de datos de tus clientes.</p>
          </div>
          
          <HeaderActions 
            onAdd={() => setIsModalOpen(true)}
            addButtonLabel="Nuevo Cliente"
            showExport={true} // Si quieres mostrar botón de exportar
            onRefresh={fetchClients}
          />
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
             // Un esqueleto simple o spinner mientras carga
            <div className="p-10 text-center text-gray-500">
               <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
               <p>Cargando clientes...</p>
            </div>
          ) : (
            <InteractiveTable 
              data={clients}
              columnMapping={columnMapping}
              actions={true} // Habilitar columna de acciones (editar/eliminar)
              onEdit={(row) => console.log("Editar", row)}
              onDelete={(row) => console.log("Eliminar", row)}
              rowsPerPage={10}
            />
          )}
        </div>

        {/* Modales */}
        <AddClientModal 
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onSuccess={fetchClients} // Recarga la tabla al crear
          setAlert={setAlert}
        />

      </div>
  );
};

export default ClientsPage;