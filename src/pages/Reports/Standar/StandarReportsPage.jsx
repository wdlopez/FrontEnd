import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddStandarReportModal from '../../../components/organisms/Forms/AddStandarReportModal';
import Alerts from '../../../components/molecules/Alerts';
import StandarReportService from '../../../services/Reports/Standar/standar-report.service';
import { normalizeList } from '../../../utils/api-helpers';

const StandarReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Reportes", url: null },
    { name: "Estándar", url: null }
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await StandarReportService.getAllStandarReports();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, i) => ({
        ...item,
        index: i + 1,
        format_display: item.output_format?.toUpperCase(),
        description_display: item.description || 'Sin descripción',
        date_display: new Date(item.created_at).toLocaleDateString()
      }));

      setReports(formatted);
    } catch (error) {
        console.error("Error al cargar reportes estándar:", error);
      setAlert({ open: true, message: "Error al cargar reportes estándar.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Nombre del Reporte': 'report_name',
    'Descripción': 'description_display',
    'Formato': 'format_display',
    'Fecha Creación': 'date_display'
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
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca de Reportes Estándar</h1>
          <p className="text-gray-500 text-sm">Reportes oficiales pre-configurados por el sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Consultando biblioteca...</div>
        ) : (
          <InteractiveTable 
            data={reports}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              await StandarReportService.deleteStandarReport(row.id);
              fetchReports();
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nuevo Estándar"
                onRefresh={fetchReports}
              />
            }
          />
        )}
      </div>

      <AddStandarReportModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchReports} 
      />
    </div>
  );
};

export default StandarReportsPage;