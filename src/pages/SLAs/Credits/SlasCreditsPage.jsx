import React, { useEffect, useState } from 'react';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddSlasCreditModal from '../../../components/organisms/Forms/AddSlasCreditModal';
import Alerts from '../../../components/molecules/Alerts';
import SlasCreditService from '../../../services/Slas/Credits/slas-credit.service';
import { normalizeList } from '../../../utils/api-helpers';

const SlasCreditsPage = () => {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const response = await SlasCreditService.getAllCredits();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, index) => {
        // Formateo del estado
        let statusBadge = item.status;
        if (item.status === 'pending') statusBadge = '⏳ Pendiente';
        if (item.status === 'applied') statusBadge = '✅ Aplicado';
        if (item.status === 'rejected') statusBadge = '❌ Rechazado';

        return {
          ...item,
          index: index + 1,
          amount_display: `$${Number(item.credit_amount).toFixed(2)}`,
          date_display: new Date(item.credit_date).toLocaleDateString(),
          status_display: statusBadge,
          invoice_display: item.applied_to_invoice ? `#${item.applied_to_invoice}` : 'N/A'
        };
      });

      setCredits(formatted);
    } catch (error) {
      console.error("Error cargando créditos SLA:", error);
      setAlert({ open: true, message: "Error al cargar los créditos SLA.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCredits(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Fecha': 'date_display',
    'Monto': 'amount_display',
    'Estado': 'status_display',
    'Factura': 'invoice_display'
  };

  return (
    <div className="p-6 space-y-6">
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Créditos SLA</h1>
          <p className="text-gray-500 text-sm">Gestión de penalizaciones financieras aplicadas por incumplimientos de métricas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">Cargando créditos...</div>
        ) : (
          <InteractiveTable 
            data={credits}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await SlasCreditService.deleteCredit(row.id);
                fetchCredits();
              } catch (e) {
                console.error("Error eliminando crédito:", e);
                setAlert({ open: true, message: "No se pudo eliminar el crédito.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Registrar Crédito"
                onRefresh={fetchCredits}
              />
            }
          />
        )}
      </div>

      <AddSlasCreditModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchCredits} 
      />
    </div>
  );
};

export default SlasCreditsPage;