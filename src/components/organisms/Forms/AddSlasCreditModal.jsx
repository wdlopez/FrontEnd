import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import SlasCreditService from "../../../services/Slas/Credits/slas-credit.service";
import MeasurementWindowService from "../../../services/Slas/MeasurementWindows/window.service";
import SlasService from "../../../services/Slas/slas.service";
import MeasurementService from "../../../services/Slas/Measurement/measurement.service"; // Nuevo servicio
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const AddSlasCreditModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [slaOptions, setSlaOptions] = useState([]);
  const [mWindowOptions, setMWindowOptions] = useState([]);
  const [measurementOptions, setMeasurementOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        try {
          // 1. Cargamos los SLAs
          const slaRes = await SlasService.getAllSlas();
          const slasList = normalizeList(slaRes);
          setSlaOptions(slasList.map(sla => ({ value: sla.id, label: sla.name || sla.id })));

          // 2. Cargamos las Ventanas de Medición
          const mWindowRes = await MeasurementWindowService.getAllWindows();
          const mWindowList = normalizeList(mWindowRes);
          setMWindowOptions(mWindowList.map(mw => ({ value: mw.id, label: mw.name || mw.id })));

          // 3. Cargamos las Mediciones (para el ID faltante)
          const measurementRes = await MeasurementService.getAllMeasurements();
          const measurementList = normalizeList(measurementRes);
          // Mostramos fecha y valor para que el usuario sepa cuál elegir
          setMeasurementOptions(measurementList.map(m => ({ 
            value: m.id, 
            label: `Medición: ${new Date(m.measurement_date).toLocaleDateString()} - Valor: ${m.actual_value}` 
          })));

        } catch (error) {
          console.error("Error cargando dependencias:", error);
          Swal.fire("Aviso", "No se pudieron cargar los datos necesarios para el crédito.", "warning");
        }
      };
      fetchDependencies();
    }
  }, [isOpen]);

  const formFields = [
    {
      name: "sla_id",
      type: "select",
      label: "Acuerdo SLA *",
      options: slaOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "mwindow_id",
      type: "select",
      label: "Ventana de Medición *",
      options: mWindowOptions,
      required: true,
      fullWidth: true
    },
    {
      // AHORA ES UN SELECT: Mucho más seguro para el usuario
      name: "measurement_id",
      type: "select",
      label: "Medición de Referencia *",
      options: measurementOptions,
      required: true,
      fullWidth: true
    },
    {
      name: "credit_amount",
      type: "number",
      label: "Monto del Crédito *",
      placeholder: "Ej: 15.50",
      required: true,
      step: "0.01"
    },
    {
      name: "credit_date",
      type: "date",
      label: "Fecha de Emisión *",
      required: true,
    },
    {
      name: "applied_to_invoice",
      type: "number",
      label: "Aplicado a Factura (N°)",
      placeholder: "Ej: 12345",
      required: false,
    }
  ];

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        credit_amount: parseFloat(formData.credit_amount),
        // Tu backend pide measurement_date como ISOString usualmente
        credit_date: new Date(formData.credit_date).toISOString(),
      };

      if (formData.applied_to_invoice) {
        payload.applied_to_invoice = parseInt(formData.applied_to_invoice, 10);
      } else {
        delete payload.applied_to_invoice;
      }

      await SlasCreditService.createCredit(payload);
      Swal.fire("¡Creado!", "El crédito SLA ha sido registrado correctamente.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al crear:", error);
      const msg = error.response?.data?.message || "Error al guardar el registro.";
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
          message={getText("slaCreditInfo") || "Asocia una medición fallida con un crédito financiero a favor del cliente."}
        >
          <span className="material-symbols-outlined text-green-600">payments</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Crédito SLA</h2>
      </div>

      <Form
        fields={formFields}
        onSubmit={handleCreate}
        loading={loading}
        sendMessage="Registrar Crédito"
        gridLayout={true}
      />
    </Modal>
  );
};

export default AddSlasCreditModal;