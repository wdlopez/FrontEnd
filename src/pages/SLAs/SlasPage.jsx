import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import Tabs from '../../components/molecules/Tabs';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddSlasModal from '../../components/organisms/Forms/AddSlasModal';
import Alerts from '../../components/molecules/Alerts';
import SlasService from '../../services/Slas/slas.service';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';
import { normalizeList } from '../../utils/api-helpers';
import MeasurementPage from './Measurement/MeasurementsPage';
import MeasurementWindowsPage from './MeasurementWindows/MeasurementWindowsPage';
import SlasCreditsPage from './Credits/SlasCreditsPage';

const SlasPage = () => {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });
  const NAV_ITEMS = [
    { key: 'slas', label: 'SLAs' },
    { key: 'measurement', label: 'Mediciones' },
    { key: 'measurement-windows', label: 'Ventanas de medición' },
    { key: 'slas-credits', label: 'Créditos SLA' }
  ];
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Ventanas de medición", url: "/contract/sla/measurement-windows" },
    { name: "SLAs", url: null },
  ];

  const fetchSlas = async () => {
    setLoading(true);
    try {
      const response = await SlasService.getAllSlas();
      const rawList = normalizeList(response);

      const formatted = rawList.map((s, i) => ({
        ...s,
        index: i + 1,
        // Concatenar valor con su unidad (ej: 99.9%)
        target_display: `${s.expect_target}${s.expect_limit}`,
        min_display: `${s.minimun_target}${s.expect_limit}`,
        status_display: s.active === 1 ? '🟢 Activo' : '🔴 Inactivo',
        period_display: `${s.report_period} días`,
        date_range: `${new Date(s.start_d).toLocaleDateString()} - ${new Date(s.end_d).toLocaleDateString()}`
      }));

      setSlas(formatted);
    } catch (error) {
        console.error("Error cargando SLAs:", error);
      setAlert({ open: true, message: "Error al cargar los SLAs.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlas(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Nombre': 'name',
    'Referencia': 'reference',
    'Objetivo': 'target_display',
    'Mínimo': 'min_display',
    'Periodo': 'period_display',
    'Vigencia': 'date_range',
    'Estado': 'status_display'
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
        message={alert.message} 
        type={alert.type} 
      />

      {activeTab === 'slas' ? (
        <>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <InfoTooltip size="sm" message={getText("slasIntro") || "Gestione los Acuerdos de Nivel de Servicio y sus métricas de cumplimiento"}>
                <span className="material-symbols-outlined text-gray-400">info</span>
              </InfoTooltip>
              <h1 className="text-2xl font-bold text-gray-800">Service Level Agreements (SLA)</h1>
            </div>
            <p className="text-gray-500 text-sm">Configuración de métricas de rendimiento y calidad por servicio.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Cargando SLAs...</div>
          ) : (
            <InteractiveTable 
              data={slas}
              columnMapping={columnMapping}
              actions={true}
              onEdit={(row) => console.log("Editar SLA", row.id)}
              onDelete={(row) => console.log("Eliminar SLA", row.id)}
              headerButtons={
                <HeaderActions 
                  onAdd={() => setIsModalOpen(true)}
                  addButtonLabel="Nuevo SLA"
                  onRefresh={fetchSlas}
                />
              }
            />
          )}
        </div>

        <AddSlasModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchSlas} />
        </>
      ) : activeTab === 'measurement' ? (
        <MeasurementPage />
      ) : activeTab === 'measurement-windows' ? (
        <MeasurementWindowsPage />
      ) : activeTab === 'slas-credits' ? (
        <SlasCreditsPage />
      ) : null}
    </div>
  );
};

export default SlasPage;