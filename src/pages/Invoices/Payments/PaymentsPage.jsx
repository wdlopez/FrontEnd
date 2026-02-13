import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddPaymentModal from '../../../components/organisms/Forms/AddPaymentModal';
import Alerts from '../../../components/molecules/Alerts';
import PaymentService from '../../../services/Invoices/Payments/payment.service';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import { getText } from '../../../utils/text';
import { normalizeList } from '../../../utils/api-helpers';

// Mapa visual para los estados del pago
const STATUS_MAP = {
  'pending': { label: '⏳ Pendiente', color: 'text-yellow-600' },
  'completed': { label: '✅ Completado', color: 'text-green-600' },
  'failed': { label: '❌ Fallido', color: 'text-red-600' },
  'refunded': { label: '↩️ Reembolsado', color: 'text-blue-600' }
};

const METHOD_MAP = {
  'bank_transfer': 'Transferencia',
  'credit_card': 'Tarjeta',
  'cash': 'Efectivo',
  'check': 'Cheque',
  'other': 'Otro'
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Finanzas", url: null },
    { name: "Pagos", url: null }
  ];

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await PaymentService.getAllPayments();
      const rawList = normalizeList(response);

      const formatted = rawList.map((pay, i) => ({
        ...pay,
        index: i + 1,
        // Mostramos un extracto del ID de la factura si no viene poblada la relación
        invoice_display: `Factura ${pay.invoice_id.substring(0, 8)}...`, 
        amount_display: `$${Number(pay.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        date_display: new Date(pay.payment_date).toLocaleString(),
        method_display: METHOD_MAP[pay.payment_method] || pay.payment_method,
        status_display: STATUS_MAP[pay.status]?.label || pay.status,
        ref_display: pay.reference_number || 'N/A'
      }));

      setPayments(formatted);
    } catch (error) {
        console.error("Error fetching payments:", error);
      setAlert({ open: true, message: "Error al cargar el historial de pagos.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Factura (Ref)': 'invoice_display',
    'Fecha': 'date_display',
    'Monto': 'amount_display',
    'Método': 'method_display',
    'Referencia': 'ref_display',
    'Estado': 'status_display'
  };

  const handleDelete = async (row) => {
    try {
      await PaymentService.deletePayment(row.id);
      setAlert({ open: true, message: "Pago eliminado con éxito", type: "success" });
      fetchPayments();
    } catch (error) {
        console.error("Error deleting payment:", error);
      setAlert({ open: true, message: "No se pudo eliminar el pago", type: "error" });
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
            <InfoTooltip size="sm" message={getText("paymentsIntro") || "Administra los pagos recibidos y su asociación con las facturas emitidas."}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Historial de Pagos</h1>
          </div>
          <p className="text-gray-500 text-sm">Registro detallado de transacciones y comprobantes de pago.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando pagos...</div>
        ) : (
          <InteractiveTable 
            data={payments}
            columnMapping={columnMapping}
            actions={true}
            onEdit={(row) => console.log("Editar Pago", row.id)}
            onDelete={handleDelete}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Registrar Pago"
                onRefresh={fetchPayments}
              />
            }
          />
        )}
      </div>

      <AddPaymentModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchPayments} />
    </div>
  );
};

export default PaymentsPage;