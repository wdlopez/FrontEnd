import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Form from "../Forms/Form";
import SlasService from "../../../services/Slas/slas.service";
import ContractService from "../../../services/Contracts/contract.service";
import ServiceService from "../../../services/Contracts/Services/service.service";
import MeasurementWindowService from "../../../services/Slas/MeasurementWindows/window.service"; 
import Swal from "sweetalert2";
import InfoTooltip from "../../atoms/InfoToolTip";
import { getText } from "../../../utils/text";
import { normalizeList } from "../../../utils/api-helpers";

const SLA_TYPES = [
  { value: 1, label: "Disponibilidad (Availability)" },
  { value: 2, label: "Latencia (Latency)" },
  { value: 3, label: "Rendimiento (Throughput)" },
  { value: 4, label: "Calidad (Quality)" },
  { value: 5, label: "Soporte (Support)" },
];

const LIMIT_UNITS = [
  { value: "%", label: "Porcentaje (%)" },
  { value: "ms", label: "Milisegundos (ms)" },
  { value: "s", label: "Segundos (s)" },
  { value: "min", label: "Minutos (min)" },
  { value: "h", label: "Horas (h)" },
];

const AddSlasModal = ({ isOpen, setIsOpen, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({ contracts: [], services: [], mwindows: [] });

  useEffect(() => {
    if (isOpen) {
      const fetchDependencies = async () => {
        setLoadingOptions(true);
        try {
          const [resContracts, resServices, resMWindows] = await Promise.all([
            ContractService.getAllContracts(),
            ServiceService.getAllServices(),
            MeasurementWindowService.getAllWindows()
          ]);

          setOptions({
            contracts: normalizeList(resContracts).map(c => ({ value: c.id, label: c.contract_number })),
            services: normalizeList(resServices).map(s => ({ value: s.id, label: s.tower })),
            mwindows: normalizeList(resMWindows).map(mw => ({ value: mw.id, label: mw.definition}))
          });
        } catch (error) {
          console.error("Error cargando dependencias de SLA:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchDependencies();
    }
  }, [isOpen]);

  const slaFields = [
    { name: "name", type: "text", label: "Nombre del SLA *", placeholder: "Ej: Uptime mensual", required: true },
    { name: "reference", type: "text", label: "Referencia Externa *", placeholder: "REF-001", required: true },
    { name: "contract_id", type: "select", label: "Contrato *", options: options.contracts, required: true },
    { name: "service_id", type: "select", label: "Servicio *", options: options.services, required: true },
    { name: "mwindow_id", type: "select", label: "Ventana de Mantenimiento *", options: options.mwindows, required: true },
    { name: "type", type: "select", label: "Tipo de SLA *", options: SLA_TYPES, required: true },
    { name: "expect_limit", type: "select", label: "Unidad de Medida *", options: LIMIT_UNITS, required: true },
    { name: "expect_target", type: "number", label: "Objetivo Esperado *", placeholder: "99.9", required: true },
    { name: "minimun_target", type: "number", label: "Mínimo Aceptable *", placeholder: "95.0", required: true },
    { name: "algorithm", type: "text", label: "Algoritmo / Cálculo *", placeholder: "Ej: average_uptime", required: true },
    { name: "tool", type: "text", label: "Herramienta de Medición *", placeholder: "Ej: Prometheus", required: true },
    { name: "report_period", type: "number", label: "Periodo Reporte (Días) *", placeholder: "30", required: true },
    { name: "improvement", type: "number", label: "% Mejora", defaultValue: 0 },
    { name: "risk", type: "number", label: "% Riesgo", defaultValue: 10 },
    { name: "risk_pool", type: "number", label: "Risk Pool (Valor)", placeholder: "1000", required: true },
    { name: "start_d", type: "date", label: "Fecha Inicio *", required: true },
    { name: "end_d", type: "date", label: "Fecha Fin *", required: true },
    { name: "description", type: "textarea", label: "Descripción *", fullWidth: true, required: true },
  ];

  const handleCreateSla = async (formData) => {
    setLoading(true);
    try {
      // Formatear datos numéricos que vienen del form como string
      const payload = {
        ...formData,
        expect_target: parseFloat(formData.expect_target),
        minimun_target: parseFloat(formData.minimun_target),
        report_period: parseInt(formData.report_period),
        improvement: parseFloat(formData.improvement || 0),
        risk: parseFloat(formData.risk || 10),
        risk_pool: parseFloat(formData.risk_pool),
        type: parseInt(formData.type)
      };

      await SlasService.createSlas(payload);
      Swal.fire("¡Éxito!", "Acuerdo de nivel de servicio creado.", "success");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message;
      Swal.fire("Error", Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="xl" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6">
        <InfoTooltip size="sm" message={getText("formSlaInfo") || "Define los niveles de servicio y penalizaciones asociadas"}>
          <span className="material-symbols-outlined text-gray-400">info</span>
        </InfoTooltip>
        <h2 className="text-xl font-bold text-gray-800">Nuevo SLA</h2>
      </div>

      {loadingOptions ? (
        <div className="py-10 text-center">Cargando configuraciones...</div>
      ) : (
        <Form
          fields={slaFields}
          onSubmit={handleCreateSla}
          loading={loading}
          sendMessage="Guardar SLA"
          gridLayout={true}
        />
      )}
    </Modal>
  );
};

export default AddSlasModal;