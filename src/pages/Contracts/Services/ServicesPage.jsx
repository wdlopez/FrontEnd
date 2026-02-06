import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddServiceModal from '../../../components/organisms/Forms/AddServiceModal';
import Alerts from '../../../components/molecules/Alerts';
import ServiceService from '../../../services/Contracts/Services/service.service';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import { getText } from '../../../utils/text';
import { normalizeList } from '../../../utils/api-helpers';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Servicios", url: null }
  ];

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await ServiceService.getAllServices();
      const rawList = normalizeList(response);

      console.log('📦 Services API response:', rawList);

      const formattedServices = rawList.map((s, i) => ({
        ...s,
        index: i + 1,
        // Formateo de Fechas
        start_date_display: new Date(s.start_d).toLocaleDateString(),
        end_date_display: s.end_d ? new Date(s.end_d).toLocaleDateString() : 'Indefinido',
        
        // Formateo de Moneda/Números
        baseline_display: s.baseline,
        value_display: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(s.value),
        total_display: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(s.sum_total),
        
        // Etiquetas lógicas
        model_display: s.charges_model === 1 ? 'Fee' : 'No-Fee',
        status_label: (s.active === true || s.active === 1) ? 'Activo' : 'Inactivo'
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error("Error cargando servicios:", error);
      setAlert({ 
        open: true, 
        message: "Error al cargar la lista de servicios.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const columnMapping = {
    'Torre': 'tower',
    'Grupo': 'group',
    'Unidad': 'resource_u',
    'Baseline': 'baseline_display',
    'Valor': 'value_display',
    'Total': 'total_display',
    'Modelo': 'model_display',
    'Inicio': 'start_date_display',
    'Estado': 'status_label'
  };

  return (
      <div className="p-6 space-y-6">
        <BreadCrumb paths={breadcrumbPaths} />
        <Alerts 
          open={alert.open} 
          setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
          message={alert.message} 
          type={alert.type} 
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex gap-2 items-center">
                <InfoTooltip size="sm" message={getText("servicesIntro") || "Gestión de servicios contratados por torre y grupo"}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h1 className="text-2xl font-bold text-gray-800">Servicios Contratados</h1>
            </div>
            <p className="text-gray-500 text-sm">Detalle operativo de los servicios asociados a contratos.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
               <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-blue-600">progress_activity</span>
               <p>Cargando servicios...</p>
            </div>
          ) : (
            <InteractiveTable 
              data={services}
              columnMapping={columnMapping}
              actions={true} 
              onEdit={(row) => console.log("Editar servicio", row.id)}
              onDelete={(row) => console.log("Eliminar servicio", row.id)}
              rowsPerPage={10}
              headerButtons={
                <HeaderActions 
                  onAdd={() => setIsModalOpen(true)}
                  addButtonLabel="Nuevo Servicio"
                  showExport={true} 
                  onRefresh={fetchServices}
                />
              }
            />
          )}
        </div>

        <AddServiceModal 
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onSuccess={fetchServices}
        />
      </div>
  );
};

export default ServicesPage;