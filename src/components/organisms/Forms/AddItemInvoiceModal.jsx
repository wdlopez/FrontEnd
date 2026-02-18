import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import InvoiceService from "../../../services/Invoices/invoice.service";
import DeliverableService from "../../../services/Deliverables/deliverable.service";
import ItemInvoiceService from "../../../services/Invoices/Items/invoice-item.service";
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddItemInvoiceModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [deliverableOptions, setDeliverableOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          // Cargamos Facturas para el select
          const invoicesRes = await InvoiceService.getAllInvoices();
          const invoicesList = normalizeList(invoicesRes);
          setInvoiceOptions(invoicesList.map(i => ({ value: i.id, label: i.invoice_number || i.id })));

          // Cargamos Entregables para el select (opcional)
          const deliverablesRes = await DeliverableService.getAllDeliverables();
          const deliverablesList = normalizeList(deliverablesRes);
          setDeliverableOptions(deliverablesList.map(d => ({ value: d.id, label: d.name || d.id })));
        } catch (error) {
          console.error("Error al cargar dependencias de ítems:", error);
          Swal.fire("Aviso", "No se pudieron cargar las facturas o entregables.", "warning");
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const formFields = [
    {
      name: "invoice_id",
      type: "select",
      label: "Factura Relacionada *",
      options: invoiceOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción del Ítem",
      placeholder: "Ej: Consultoría técnica especializada...",
      required: false,
      fullWidth: true
    },
    {
      name: "quantity",
      type: "number",
      label: "Cantidad *",
      placeholder: "0.00",
      required: true,
      step: "0.01"
    },
    {
      name: "unit_price",
      type: "number",
      label: "Precio Unitario *",
      placeholder: "0.00",
      required: true,
      step: "0.01"
    },
    {
      name: "deliverable_id",
      type: "select",
      label: "Entregable Asociado (Opcional)",
      options: deliverableOptions,
      required: false,
      fullWidth: true
    }
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
      };

      // Si no hay entregable seleccionado, eliminamos la propiedad para evitar enviar string vacío
      if (!payload.deliverable_id) delete payload.deliverable_id;

      await ItemInvoiceService.createItemInvoice(payload);
      Swal.fire("¡Agregado!", "El ítem ha sido añadido a la factura.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear ítem:", error);
      const msg = error.response?.data?.message || "Error al guardar el ítem.";
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip
          size="sm"
          message={getText("invoiceItemInfo") || "Agregue conceptos, productos o servicios al detalle de la factura."}
        >
          <span className="material-symbols-outlined text-amber-600">receipt_long</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Ítem de Factura</h2>
      </div>

      <Form
        fields={formFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Agregar Ítem"
        gridLayout={true}
      />
    </Modal>
  );
};

export default AddItemInvoiceModal;