import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddReportAdHocModal from '../../components/organisms/Forms/AddReportAdHocModal';
import Alerts from '../../components/molecules/Alerts';
import ReportService from '../../services/Reports/report-ad-hoc.service';
import { normalizeList } from '../../utils/api-helpers';

const ReportsAdHocPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Reportes", url: null },
    { name: "Ad Hoc", url: null }
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await ReportService.getAllReports();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, i) => ({
        ...item,
        index: i + 1,
        definition_short: item.report_definition?.length > 40 
          ? `${item.report_definition.substring(0, 40)}...` 
          : item.report_definition,
        last_run_display: item.last_run_at 
          ? new Date(item.last_run_at).toLocaleString() 
          : 'Nunca ejecutado',
        created_display: new Date(item.created_at).toLocaleDateString()
      }));

      setReports(formatted);
    } catch (error) {
        console.error("Error fetching reports:", error);
      setAlert({ open: true, message: "No se pudo cargar la lista de reportes.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Nombre del Reporte': 'report_name',
    'Definición': 'definition_short',
    'Última Ejecución': 'last_run_display',
    'Fecha Creación': 'created_display'
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
          <h1 className="text-2xl font-bold text-gray-800">Reportes Guardados (Ad Hoc)</h1>
          <p className="text-gray-500 text-sm">Gestione y ejecute sus consultas personalizadas de inteligencia de negocio.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando reportes...</div>
        ) : (
          <InteractiveTable 
            data={reports}
            columnMapping={columnMapping}
            actions={true}
            // Aquí podrías agregar un botón personalizado de "Ejecutar" en la tabla
            onDelete={async (row) => {
              await ReportService.deleteReport(row.id);
              fetchReports();
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Crear Reporte"
                onRefresh={fetchReports}
              />
            }
          />
        )}
      </div>

      <AddReportAdHocModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchReports} 
      />
    </div>
  );
};

export default ReportsAdHocPage;