import React, { useEffect, useState, useRef } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddClientModal from '../../components/organisms/Forms/AddClientModal';
import DesactiveClientModal from '../../components/organisms/Forms/DesactiveClientModal';
import Alerts from '../../components/molecules/Alerts';
import ClientService from '../../services/Clients/client.service';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';

const ClientsPage = () => {
  
  // --- Estados ---
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDesactiveModalOpen, setIsDesactiveModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });
  const [setIsSaving] = useState(false);

  // Configuración Breadcrumb
  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Clientes", url: null } // Actual
  ];

  // Ref para evitar doble fetch en StrictMode
  const hasInitialized = useRef(false);

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
        'NOMBRE': c.name || c.client_name || c.ClientEntity_name || c.nombre || '',
        'IDENTIFICACIÓN TRIBUTARIA': c.document || c.document_file || c.ClientEntity_document_file || c.nit || '',
        'CONTACTO DEL CLIENTE': c.contactPerson || c.contact_person || c.ClientEntity_contact_person || c.contacto || '',
        'INDUSTRIA DEL CLIENTE': c.category || c.ClientEntity_category || c.categoria || '',
        'CORREO': c.email || c.ClientEntity_email || '',
        'CODIGO PAIS Y TELEFONO': c.phone || c.ClientEntity_phone || '',
        'DIRECCIÓN': c.address || c.ClientEntity_address || '',
        'ESTADO': (c.active ?? c.isActive ?? c.ClientEntity_active) ? 'Activo' : 'Inactivo',
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
    // Prevenir doble fetch en React StrictMode (desarrollo)
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchClients();
    }
  }, []);

  // --- Funciones de Edición y Eliminación ---
  const handleEdit = async (editData) => {
    // editData contiene: row, column, newValue, realColumn
    const { row, newValue, realColumn } = editData;
    
    if (!row?.id) {
      console.error("No ID found for client");
      return;
    }

    setIsSaving(true);
    try {
      // Crear payload solo con el campo que se cambió
      const payload = {
        [realColumn]: newValue
      };

      await ClientService.updateClient(row.id, payload);

      // Actualizar el cliente en la tabla localmente
      setClients(clients.map(c => 
        c.id === row.id 
          ? { ...c, [editData.column]: newValue }
          : c
      ));

      setAlert({
        open: true,
        message: 'Cliente actualizado exitosamente',
        type: 'success'
      });
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      const msg = error.response?.data?.message;
      const errorDisplay = Array.isArray(msg)
        ? msg.join(', ')
        : msg || 'Error al actualizar el cliente';

      setAlert({
        open: true,
        message: errorDisplay,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    if (row && row.id) {
      setSelectedClient({
        id: row.id,
        name: row['Nombre'] || 'Sin nombre',
        state: true, // true = eliminar
      });
      setIsDesactiveModalOpen(true);
    }
  };

  const handleConfirmDelete = async (data) => {
    setDeletingLoading(true);
    try {
      await ClientService.deleteClient(data.id);
      
      setAlert({
        open: true,
        message: 'Cliente eliminado exitosamente',
        type: 'success'
      });

      // Remover el cliente de la tabla sin recargar
      setClients(clients.filter(c => c.id !== data.id));
      setIsDesactiveModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      const msg = error.response?.data?.message;
      const errorDisplay = Array.isArray(msg)
        ? msg.join(', ')
        : msg || 'Error al eliminar el cliente';

      setAlert({
        open: true,
        message: errorDisplay,
        type: 'error'
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  // --- Configuración de Tabla ---
  // Mapeamos las columnas visuales a las propiedades del objeto que viene del backend
  const columnMapping = {
    'NOMBRE': 'name',
    'IDENTIFICACIÓN TRIBUTARIA': 'document_file',
    'CONTACTO DEL CLIENTE': 'contact_person',
    'INDUSTRIA DEL CLIENTE': 'category',
    'CORREO': 'email',
    'CODIGO PAIS Y TELEFONO': 'phone',
    'DIRECCIÓN': 'address',
    'ESTADO': 'active'
  };

  // Campos que NO se pueden editar inline
  const nonEditableColumns = ['N°', 'ESTADO'];

  // Path para ver detalles del cliente
  const clientDetailsPath = '/client/';

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
            <div className="flex gap-2 items-center">
                <InfoTooltip size="sm" message={getText("clientsIntro")} sticky={true}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
            </div>
            <p className="text-gray-500 text-sm">Administra la base de datos de tus clientes.</p>
          </div>
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
              nonEditableColumns={nonEditableColumns}
              path={clientDetailsPath}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              rowsPerPage={10}
              headerButtons={
                <HeaderActions 
                  onAdd={() => setIsModalOpen(true)}
                  addButtonLabel="Nuevo Cliente"
                  showExport={true} 
                  onRefresh={fetchClients}
                />
              }
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

        <DesactiveClientModal 
          isOpen={isDesactiveModalOpen}
          setIsOpen={setIsDesactiveModalOpen}
          data={selectedClient}
          onConfirm={handleConfirmDelete}
          loading={deletingLoading}
        />

      </div>
  );
};

export default ClientsPage;