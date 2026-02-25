import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import InvoiceService from "../../../services/Invoices/invoice.service";
import ContractService from "../../../services/Contracts/contract.service";
import ProviderService from "../../../services/Providers/provider.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - Dólar Estadounidense" },
  { value: "COP", label: "COP - Peso Colombiano" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Peso Mexicano" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagada" },
  { value: "overdue", label: "Vencida" },
  { value: "canceled", label: "Cancelada" },
];

const AddInvoicesModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({ contracts: [], providers: [] });

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        setLoadingOptions(true);
        try {
          const [resContracts, resProviders] = await Promise.all([
            ContractService.getAllContracts(),
            ProviderService.getAllProviders() // Asegúrate de tener este servicio
          ]);

          setOptions({
            // Ajusta "contract_number" y "name" según las propiedades exactas de tus entidades
            contracts: normalizeList(resContracts).map(c => ({ value: c.id, label: c.contract_number || `Contrato ${c.id.slice(0,6)}` })),
            providers: normalizeList(resProviders).map(p => ({ value: p.id, label: p.legal_name || p.business_name || 'Proveedor Desconocido' }))
          });
        } catch (error) {
          console.error("Error cargando dependencias de facturas:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchDependencies();
    }
  }, [isOpen]);

  const invoiceFields = [
    { name: "invoice_number", type: "text", label: "Número de Factura *", placeholder: "INV-2025-001", required: true },
    { name: "provider_id", type: "select", label: "Proveedor *", options: options.providers, required: true },
    { name: "contract_id", type: "select", label: "Contrato *", options: options.contracts, required: true },
    { name: "issue_date", type: "date", label: "Fecha de Emisión *", required: true },
    { name: "due_date", type: "date", label: "Fecha de Vencimiento *", required: true },
    { name: "amount", type: "number", label: "Monto Total *", placeholder: "2500.50", required: true },
    { name: "currency", type: "select", label: "Moneda", options: CURRENCY_OPTIONS, defaultValue: "USD" },
    { name: "status", type: "select", label: "Estado", options: STATUS_OPTIONS, defaultValue: "pending" },
  ];

  const handleCreateInvoice = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        // Las fechas se convierten al estándar ISO que espera el backend
        issue_date: new Date(formData.issue_date).toISOString(),
        due_date: new Date(formData.due_date).toISOString(),
      };

      await InvoiceService.createInvoice(payload);
      
      Swal.fire("¡Éxito!", "Factura registrada correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || "Ocurrió un error al registrar la factura.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("modals.formInvoiceInfo") || "Registra los detalles de facturación asociados a los contratos y proveedores"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Registrar Factura</h2>
      </div>

      {loadingOptions ? (
        <div className="py-10 text-center text-gray-500">Cargando contratos y proveedores...</div>
      ) : (
        <Form
          fields={invoiceFields}
          onSubmit={handleCreateInvoice}
          loading={loading}
          sendMessage="Guardar Factura"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddInvoicesModal;