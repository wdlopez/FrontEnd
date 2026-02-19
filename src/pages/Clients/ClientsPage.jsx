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
  const [isSaving, setIsSaving] = useState(false);

  // Lista de industrias para el select
  const INDUSTRIES = [
    { value: "Tecnologia", label: "Tecnología" },
    { value: "Salud", label: "Salud" },
    { value: "Finanzas", label: "Finanzas" },
    { value: "Educacion", label: "Educación" },
    { value: "Manufactura", label: "Manufactura" },
    { value: "Comercio", label: "Comercio" },
    { value: "Agroindustria", label: "Agroindustria" },
    { value: "Energia", label: "Energía" },
    { value: "Construccion", label: "Construcción" },
    { value: "Transporte", label: "Transporte" },
    { value: "Turismo", label: "Turismo" },
    { value: "Servicios profesionales", label: "Servicios profesionales" },
    { value: "Bienes raices", label: "Bienes raíces" },
    { value: "Telecomunicaciones", label: "Telecomunicaciones" },
    { value: "Alimentos y bebidas", label: "Alimentos y bebidas" },
  ];

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
        'Nombre': c.name || c.client_name || c.ClientEntity_name || c.nombre || '',
        'NIT / Documento': c.document || c.document_file || c.ClientEntity_document_file || c.nit || '',
        'Contacto': c.contactPerson || c.contact_person || c.ClientEntity_contact_person || c.contacto || '',
        'Industria': c.category || c.ClientEntity_category || c.categoria || '',
        'Email': c.email || c.ClientEntity_email || '',
        'Phone': c.phone || c.ClientEntity_phone || '',
        'Direccion': c.address || c.ClientEntity_address || '',
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
    // Prevenir doble fetch en React StrictMode (desarrollo)
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchClients();
    }
  }, []);

  // --- Funciones de Edición y Eliminación ---
  const handleEdit = async (editData) => {
    // Detectar el formato de editData (puede venir de onEdit o onSubmit)
    let row, newValue, realColumn, columName;
    
    if (editData.realColumn) {
      // Formato de onEdit
      row = editData.row;
      newValue = editData.newValue;
      realColumn = editData.realColumn;
      columName = editData.column;
    } else {
      // Formato de onSubmit (object con propiedades del row)
      row = editData;
      
      // Encontrar qué campo de la tabla cambió
      const originalRow = clients.find(c => c.id === row.id);
      let changedField = null;
      let changedValue = null;
      
      for (const key in row) {
        if (key !== 'id' && originalRow && originalRow[key] !== row[key]) {
          changedField = key;
          changedValue = row[key];
          break;
        }
      }
      
      if (!changedField) {
        console.log('Sin cambios detectados');
        return;
      }
      
      columName = changedField;
      newValue = changedValue;
      realColumn = columnMapping[changedField] || changedField;
    }
    
    console.log('🔧 Editando:', { columName, realColumn, newValue, rowId: row.id });
    
    if (!row?.id) {
      console.error("No ID found for client");
      return;
    }

    setIsSaving(true);
    try {
      // Aplicar las mismas recomendaciones de limpieza que en AddClientModal
      let cleanedValue = newValue;
      
      if (realColumn === 'name') {
        cleanedValue = newValue.toString().trim();
      } else if (realColumn === 'email') {
        cleanedValue = newValue.toString().toLowerCase().trim();
      } else if (realColumn === 'phone') {
        cleanedValue = newValue.toString().trim();
      } else if (realColumn === 'contact_person') {
        cleanedValue = newValue.toString().trim();
      } else if (realColumn === 'document_file') {
        cleanedValue = newValue.toString().trim();
      } else if (realColumn === 'address') {
        cleanedValue = newValue.toString().trim();
      }

      // Crear payload con el cliente completo y el campo actualizado
      const payload = {
        name: row['Nombre']?.toString().trim() || '',
        contact_person: row['Contacto']?.toString().trim() || '',
        email: row['Email']?.toString().toLowerCase().trim() || '',
        phone: row['Phone']?.toString().trim() || '',
        category: row['Industria'] || '',
        document_file: row['NIT / Documento']?.toString().trim() || '',
        address: row['Direccion']?.toString().trim() || '',
        // Actualizar el campo específico que se editó
        [realColumn]: cleanedValue
      };
      
      console.log('📤 Payload enviado:', payload);

      await ClientService.updateClient(row.id, payload);

      // Refrescar la lista de clientes para asegurar que se reflejen todos los cambios
      await fetchClients();

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
    'Nombre': 'name',
    'NIT / Documento': 'document_file',
    'Contacto': 'contact_person',
    'Industria': 'category',
    'Email': 'email',
    'Phone': 'phone',
    'Direccion': 'address',
    'Estado': 'active'
  };

  // Columnas que son select con opciones
  const selectColumns = {
    'Industria': INDUSTRIES
  };

  // Campos que NO se pueden editar inline
  const nonEditableColumns = ['N°', 'Estado'];

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
              selectColumns={selectColumns}
              nonEditableColumns={nonEditableColumns}
              path={clientDetailsPath}
              onEdit={handleEdit}
              onSubmit={handleEdit}
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