import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddClauseModal from '../../../components/organisms/Forms/AddClauseModal';
import Alerts from '../../../components/molecules/Alerts';
import ClauseService from '../../../services/Contracts/Clauses/clause.service';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import { getText } from '../../../utils/text';
import { normalizeList } from '../../../utils/api-helpers';

const ClausesPage = () => {
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Cláusulas", url: null }
  ];

  const fetchClauses = async () => {
    setLoading(true);
    try {
      const response = await ClauseService.getAllClauses();
      const rawList = normalizeList(response);

      const formatted = rawList.map((c, i) => ({
        ...c,
        index: i + 1,
        // Badge visual para cláusulas críticas
        critical_display: c.is_critical ? '⚠️ Crítica' : 'Estándar',
        // Formateo del estado de cumplimiento
        status_display: formatCompliance(c.compliance_status),
        // Truncar contenido largo para la tabla
        content_preview: c.content?.length > 50 ? `${c.content.substring(0, 50)}...` : c.content
      }));

      setClauses(formatted);
    } catch (error) {
      console.error("Error cargando cláusulas:", error);
      setAlert({ open: true, message: "Error al cargar las cláusulas.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatCompliance = (status) => {
    const map = {
      compliant: '✅ Cumple',
      non_compliant: '❌ No Cumple',
      under_review: '🔍 En Revisión'
    };
    return map[status] || status;
  };

  useEffect(() => { fetchClauses(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Cláusula': 'clause_number',
    'Título': 'title',
    'Severidad': 'critical_display',
    'Cumplimiento': 'status_display',
    'Contenido': 'content_preview'
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

      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("clausesIntro") || "Administre las cláusulas legales y su nivel de cumplimiento"}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Cláusulas Contractuales</h1>
          </div>
          <p className="text-gray-500 text-sm">Control de obligaciones y estados críticos por contrato.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><p>Cargando cláusulas...</p></div>
        ) : (
          <InteractiveTable 
            data={clauses}
            columnMapping={columnMapping}
            actions={true}
            onEdit={(row) => console.log("Editar", row.id)}
            onDelete={(row) => console.log("Eliminar", row.id)}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nueva Cláusula"
                onRefresh={fetchClauses}
              />
            }
          />
        )}
      </div>

      <AddClauseModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchClauses} />
    </div>
  );
};

export default ClausesPage;