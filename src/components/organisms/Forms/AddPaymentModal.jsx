import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import InvoiceService from "../../../services/Invoices/invoice.service"; // Asegúrate de la ruta correcta
import PaymentService from "../../../services/Invoices/Payments/payment.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Transferencia Bancaria" },
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "cash", label: "Efectivo" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
];

const AddPaymentModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({ invoices: [] });

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        setLoadingOptions(true);
        try {
          // Cargamos las facturas para asociar el pago
          const resInvoices = await InvoiceService.getAllInvoices();
          
          setOptions({
            invoices: normalizeList(resInvoices).map(inv => ({ 
              value: inv.id, 
              // Mostramos el número de factura o el ID truncado si no tiene número
              label: inv.invoice_number || `Factura ${inv.id.substring(0, 8)}` 
            }))
          });
        } catch (error) {
          console.error("Error cargando facturas para el pago:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchDependencies();
    }
  }, [isOpen]);

  const paymentFields = [
    { name: "invoice_id", type: "select", label: "Factura a Pagar *", options: options.invoices, required: true },
    { name: "payment_method", type: "select", label: "Método de Pago *", options: PAYMENT_METHODS, defaultValue: "bank_transfer", required: true },
    { name: "amount", type: "number", label: "Monto del Pago *", placeholder: "Ej: 150.75", required: true },
    { name: "payment_date", type: "datetime-local", label: "Fecha y Hora del Pago *", required: true },
    { name: "reference_number", type: "text", label: "Número de Referencia", placeholder: "Ej: REF-987654321", required: false },
  ];

  const handleCreatePayment = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        // Convertimos la fecha al formato ISO 8601 que requiere el DTO
        payment_date: new Date(formData.payment_date).toISOString(),
      };

      await PaymentService.createPayment(payload);

      Swal.fire("¡Éxito!", "Pago registrado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || "Ocurrió un error al registrar el pago.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formPaymentInfo") || "Registra un nuevo pago y asócialo a una factura existente."}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Registrar Pago</h2>
      </div>

      {loadingOptions ? (
        <div className="py-10 text-center text-gray-500">Cargando facturas pendientes...</div>
      ) : (
        <Form
          fields={paymentFields}
          onSubmit={handleCreatePayment}
          loading={loading}
          sendMessage="Guardar Pago"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddPaymentModal;