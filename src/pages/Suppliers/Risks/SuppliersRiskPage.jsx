import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddSupplierRiskModal from '../../../components/organisms/Forms/AddSupplierRiskModal';
import Alerts from '../../../components/molecules/Alerts';
import ProviderRiskService from '../../../services/Providers/Risks/provider-risk.service';
import { normalizeList } from '../../../utils/api-helpers';

const SuppliersRiskPage = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Proveedores", url: "/providers" },
    { name: "Matriz de Riesgos", url: null }
  ];

  const getImpactBadge = (impact) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-green-100 text-green-700',
      critical: 'bg-purple-100 text-purple-700'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${colors[impact.toLowerCase()] || 'bg-gray-100'}`}>
        {impact}
      </span>
    );
  };

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const response = await ProviderRiskService.getAllProvidersRisk();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, index) => ({
        ...item,
        index: index + 1,
        impact_display: getImpactBadge(item.impact),
        date_display: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A',
        status_display: (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {item.status}
          </span>
        )
      }));

      setRisks(formatted);
    } catch (error) {
        console.error("Error cargando riesgos:", error);
      setAlert({ open: true, message: "Error al cargar la matriz de riesgos.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRisks(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Título': 'title',
    'Impacto': 'impact_display',
    'Probabilidad': 'probability',
    'Estado': 'status_display',
    'Fecha Límite': 'date_display'
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
          <h1 className="text-2xl font-bold text-gray-800">Matriz de Riesgos</h1>
          <p className="text-gray-500 text-sm">Monitoreo y control de riesgos identificados en la cadena de suministro.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando riesgos...</div>
        ) : (
          <InteractiveTable 
            data={risks}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await ProviderRiskService.deleteProviderRisk(row.id);
                fetchRisks();
              } catch (e) {
                console.error("Error eliminando riesgo:", e);
                setAlert({ open: true, message: "No se pudo eliminar el registro.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Identificar Riesgo"
                onRefresh={fetchRisks}
              />
            }
          />
        )}
      </div>

      <AddSupplierRiskModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchRisks} 
      />
    </div>
  );
};

export default SuppliersRiskPage;