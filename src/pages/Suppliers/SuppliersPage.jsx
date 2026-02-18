import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddSuppliersModal from '../../components/organisms/Forms/AddSuppliersModal';
import Alerts from '../../components/molecules/Alerts';
import ProviderService from '../../services/Providers/provider.service';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';
import { normalizeList } from '../../utils/api-helpers'; // Usamos la utilidad de limpieza

const SuppliersPage = () => {
  // --- Estados ---
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  // Configuración Breadcrumb
  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Contacto de Proveedores", url: "/suppliers/contacts" },
    { name: "Matriz de Riesgos", url: "/suppliers/risks" },
    { name: "Proveedores", url: "/suppliers" }
  ];

  // --- Funciones de Carga ---
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await ProviderService.getAllProviders();
      
      // 1. Normalizar la respuesta usando nuestra utilidad (soporta .data, .items, array directo)
      const rawList = normalizeList(response);

      console.log('📦 Providers API response:', rawList);

      // 2. Formatear datos para la tabla (Calculamos valores visuales aquí)
      const formattedProviders = rawList.map((p, i) => ({
        ...p, // Mantenemos las propiedades originales (id, etc)
        index: i + 1,
        // Aseguramos que legal_name tenga fallback
        legal_name: p.legal_name || p.name || 'Sin Nombre',
        // Formateo visual del riesgo
        risk_display: formatRiskLevel(p.risk_level), 
        // Formateo visual del estado (1 = Activo, 0 = Inactivo)
        status_label: p.status === 1 ? 'Activo' : 'Inactivo',
        // Capitalizar el tipo
        type_display: p.provider_type ? p.provider_type.charAt(0).toUpperCase() + p.provider_type.slice(1) : 'N/A'
      }));

      setProviders(formattedProviders);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setAlert({ 
        open: true, 
        message: "No se pudieron cargar los proveedores. Verifique su conexión.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper para traducir el nivel de riesgo
  const formatRiskLevel = (level) => {
    const map = {
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto'
    };
    return map[level] || level || 'Medio';
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // --- Configuración de Tabla ---
  // Mapeamos: 'Encabezado Visible' : 'Clave en el objeto formattedProviders'
  const columnMapping = {
    'N°': 'index',
    'Razón Social': 'legal_name',
    'ID Tributario': 'tax_id',
    'Tipo': 'type_display',
    'Riesgo': 'risk_display', 
    'Estado': 'status_label'
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
            <div className="flex gap-2 items-center">
                <InfoTooltip size="sm" message={getText("suppliersIntro") || "Gestione sus proveedores y niveles de riesgo"} sticky={true}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Proveedores</h1>
            </div>
            <p className="text-gray-500 text-sm">Administra la base de datos de tus aliados estratégicos.</p>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
               <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-blue-600">progress_activity</span>
               <p>Cargando lista de proveedores...</p>
            </div>
          ) : (
            <InteractiveTable 
              data={providers}
              columnMapping={columnMapping}
              actions={true} 
              onEdit={(row) => console.log("Editar proveedor", row.id)}
              onDelete={(row) => console.log("Eliminar proveedor", row.id)}
              rowsPerPage={10}
              headerButtons={
                <HeaderActions 
                  onAdd={() => setIsModalOpen(true)}
                  addButtonLabel="Nuevo Proveedor"
                  showExport={true} 
                  onRefresh={fetchProviders}
                />
              }
            />
          )}
        </div>

        {/* Modal de Creación */}
        <AddSuppliersModal 
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onSuccess={fetchProviders} // Recarga la tabla al crear exitosamente
        />

      </div>
  );
};

export default SuppliersPage;