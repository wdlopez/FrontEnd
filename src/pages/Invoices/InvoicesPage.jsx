import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../components/molecules/BreadCrumb';
import HeaderActions from '../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../components/organisms/Tables/InteractiveTable';
import AddInvoicesModal from '../../components/organisms/Forms/AddInvoiceModal';
import Alerts from '../../components/molecules/Alerts';
import InvoiceService from '../../services/Invoices/invoice.service';
import InfoTooltip from '../../components/atoms/InfoToolTip';
import { getText } from '../../utils/text';
import { normalizeList } from '../../utils/api-helpers';

const STATUS_MAP = {
  'pending': { label: '⏳ Pendiente', color: 'text-yellow-600' },
  'paid': { label: '✅ Pagada', color: 'text-green-600' },
  'overdue': { label: '⚠️ Vencida', color: 'text-red-600' },
  'canceled': { label: '❌ Cancelada', color: 'text-gray-500' }
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Finanzas", url: null },
    { name: "Facturas", url: null }
  ];

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await InvoiceService.getAllInvoices();
      const rawList = normalizeList(response);

      const formatted = rawList.map((inv, i) => ({
        ...inv,
        index: i + 1,
        amount_display: `${inv.currency || 'USD'} $${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        issue_date_display: new Date(inv.issue_date).toLocaleDateString(),
        due_date_display: new Date(inv.due_date).toLocaleDateString(),
        status_display: STATUS_MAP[inv.status]?.label || inv.status
      }));

      setInvoices(formatted);
    } catch (error) {
        console.error("Error fetching invoices:", error);
      setAlert({ open: true, message: "Error al cargar las facturas.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Factura': 'invoice_number',
    'Monto': 'amount_display',
    'Emisión': 'issue_date_display',
    'Vencimiento': 'due_date_display',
    'Estado': 'status_display'
  };

  const handleDelete = async (row) => {
    // Si tienes SweetAlert2 global, puedes envolver esto en un diálogo de confirmación
    try {
      await InvoiceService.deleteInvoice(row.id);
      setAlert({ open: true, message: "Factura eliminada con éxito", type: "success" });
      fetchInvoices();
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      setAlert({ open: true, message: "No se pudo eliminar la factura", type: "error" });
    }
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
            <InfoTooltip size="sm" message={getText("invoicesIntro") || "Administra las facturas emitidas por los proveedores asociadas a los contratos."}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Facturas</h1>
          </div>
          <p className="text-gray-500 text-sm">Control de pagos, vencimientos y montos facturados.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando facturas...</div>
        ) : (
          <InteractiveTable 
            data={invoices}
            columnMapping={columnMapping}
            actions={true}
            onEdit={(row) => console.log("Editar Factura", row.id)}
            onDelete={handleDelete}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nueva Factura"
                onRefresh={fetchInvoices}
              />
            }
          />
        )}
      </div>

      <AddInvoicesModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchInvoices} />
    </div>
  );
};

export default InvoicesPage;