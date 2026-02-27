import React, { useEffect, useState } from "react";
import { chartColors } from "../../config/colorPalette";
import { normalizeList } from "../../utils/api-helpers";
import { useAuth } from "../../context/AuthContext";
import ContractService from "../../services/Contracts/contract.service";
import SlaService from "../../services/Slas/sla.service";
import DeliverableService from "../../services/Deliverables/deliverable.service";
import InvoiceService from "../../services/Invoices/invoice.service";
import WorkOrderService from "../../services/Contracts/WorkOrders/orders.service";
import DeliverablesChart from "../../components/organisms/Charts/DeliverablesChart";
import SlaChart from "../../components/organisms/Charts/SlaChart";
import KpiCard from "../../components/molecules/KpiCard";
import WelcomeWidget from "./components/WelcomeWidget";

const formatMoney = (n) =>
  n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

function DashBContratoAdmin({ user: userFromProps }) {
  const { user: authUser, currentUserClientId } = useAuth();
  const effectiveUser = authUser || userFromProps;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [contracts, setContracts] = useState([]);
  const [slasRaw, setSlasRaw] = useState([]);
  const [deliverablesRaw, setDeliverablesRaw] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const [delStateList, setDelStateList] = useState([]);
  const [delPriorityList, setDelPriorityList] = useState([]);

  // Secciones DAC: 1.1 Entregables, 1.2 SLAs, 1.3 Finanzas, 1.4 Gobierno
  const [activeSection, setActiveSection] = useState("dac11");

  const clientId = currentUserClientId;

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) {
        setLoading(false);
        setError(
          "No se encontró un cliente asociado al usuario. Contacta al administrador."
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // El backend del Administrador de Contratos obtiene el cliente del JWT;
        // no enviar client_id en query (el API rechaza ese param por whitelist).
        const query = {};

        const [
          contractsRes,
          slasRes,
          deliverablesRes,
          invoicesRes,
          workOrdersRes,
        ] = await Promise.allSettled([
          ContractService.getAll(query),
          SlaService.getAll(query),
          DeliverableService.getAll(query),
          InvoiceService.getAllInvoices(query),
          WorkOrderService.getAllOrders(query),
        ]);

        if (contractsRes.status === "fulfilled") {
          setContracts(normalizeList(contractsRes.value));
        } else {
          setContracts([]);
        }

        if (slasRes.status === "fulfilled") {
          setSlasRaw(normalizeList(slasRes.value));
        } else {
          setSlasRaw([]);
        }

        if (deliverablesRes.status === "fulfilled") {
          setDeliverablesRaw(normalizeList(deliverablesRes.value));
        } else {
          setDeliverablesRaw([]);
        }

        if (invoicesRes.status === "fulfilled") {
          setInvoices(normalizeList(invoicesRes.value));
        } else {
          setInvoices([]);
        }

        if (workOrdersRes.status === "fulfilled") {
          setWorkOrders(normalizeList(workOrdersRes.value));
        } else {
          setWorkOrders([]);
        }
      } catch (err) {
        console.error("Error cargando dashboard de contratos:", err);
        setError("No se pudo cargar el resumen del Administrador de Contratos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  // Listas dinámicas de estados y prioridades de entregables (para DeliverablesChart)
  useEffect(() => {
    if (!Array.isArray(deliverablesRaw) || deliverablesRaw.length === 0) {
      setDelStateList([]);
      setDelPriorityList([]);
      return;
    }

    const stateValues = new Set();
    const priorityValues = new Set();

    deliverablesRaw.forEach((d) => {
      if (d.del_state !== undefined && d.del_state !== null) {
        stateValues.add(d.del_state);
      }
      if (d.del_priority !== undefined && d.del_priority !== null) {
        priorityValues.add(d.del_priority);
      }
    });

    setDelStateList(
      Array.from(stateValues).map((value) => ({
        value,
        label: String(value),
      })),
    );

    setDelPriorityList(
      Array.from(priorityValues).map((value) => ({
        value,
        label: String(value),
      })),
    );
  }, [deliverablesRaw]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando panel de Administrador de Contratos...
      </div>
    );
  }

  // Estado vacío: sin contratos aún -> CTA Crear primer contrato
  if (!loading && contracts.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold">
            Bienvenido, {effectiveUser?.firstName || "Administrador"}
          </h3>
          <p className="text-gray-500 font-medium">
            Aún no tienes contratos configurados para tu cliente.
          </p>
        </div>

        <WelcomeWidget
          title="Contratos"
          message="Configura tu primer contrato para habilitar los dashboards ejecutivos, financieros y de gobierno del servicio."
          linkTo="/contract/general?action=create_first"
          buttonText="Comenzar: Crear mi primer contrato"
          count={0}
          icon="description"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h3 className="text-lg font-semibold">
          Bienvenido, {effectiveUser?.firstName || "Administrador"}
        </h3>
        <p className="text-gray-500 font-medium">
          Administrador de Contratos – Vista DAC
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs DAC */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-4 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveSection("dac11")}
            className={`pb-2 border-b-2 ${
              activeSection === "dac11"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            DAC 1.1 Entregables
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("dac12")}
            className={`pb-2 border-b-2 ${
              activeSection === "dac12"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            DAC 1.2 SLAs
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("finanzas")}
            className={`pb-2 border-b-2 ${
              activeSection === "finanzas"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            DAC 1.3 Finanzas
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("gobierno")}
            className={`pb-2 border-b-2 ${
              activeSection === "gobierno"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            DAC 1.4 Gobierno
          </button>
        </nav>
      </div>

      {/* DAC 1.1 – Resumen de Entregables */}
      {activeSection === "dac11" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Vista ejecutiva de cumplimiento de Entregables (DAC 1.1) para el
            cliente asignado.
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <DeliverablesChart
              deliverables={deliverablesRaw}
              delStateList={delStateList}
              delPriority={delPriorityList}
            />
          </div>
        </div>
      )}

      {/* DAC 1.2 – Resumen de SLAs */}
      {activeSection === "dac12" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Vista ejecutiva del desempeño de los SLAs (DAC 1.2) para el cliente
            asignado.
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <SlaChart sla={slasRaw} />
          </div>
        </div>
      )}

      {/* Sección Finanzas */}
      {activeSection === "finanzas" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Resumen de facturación asociada a los contratos del cliente (DAC
            1.3).
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-800">
                Facturas recientes
              </h4>
              <span className="text-xs text-gray-500">
                Muestra hasta 5 facturas filtradas por tu cliente
              </span>
            </div>
            <div className="overflow-x-auto">
              {invoices.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">
                  No hay facturas registradas para este cliente.
                </p>
              ) : (
                <table className="min-w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Factura</th>
                      <th className="px-4 py-2">Monto</th>
                      <th className="px-4 py-2">Emisión</th>
                      <th className="px-4 py-2">Vencimiento</th>
                      <th className="px-4 py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map((inv) => (
                      <tr
                        key={inv.id || inv.invoice_id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">
                          {inv.invoice_number || inv.code || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {formatMoney(Number(inv.amount) || 0)}
                        </td>
                        <td className="px-4 py-2">
                          {inv.issue_date
                            ? new Date(inv.issue_date).toLocaleDateString(
                                "es-CO",
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {inv.due_date
                            ? new Date(inv.due_date).toLocaleDateString("es-CO")
                            : "-"}
                        </td>
                        <td className="px-4 py-2 capitalize">
                          {inv.status || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sección Gobierno */}
      {activeSection === "gobierno" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Gobierno operativo de contratos: seguimiento de órdenes de trabajo
            (Work Orders) asociadas (DAC 1.4).
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-800">
                Work Orders pendientes
              </h4>
              <span className="text-xs text-gray-500">
                Muestra hasta 5 órdenes abiertas o en progreso
              </span>
            </div>
            <div>
              {workOrders.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">
                  No hay órdenes de trabajo registradas para este cliente.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {workOrders
                    .filter(
                      (wo) =>
                        wo.status === "open" || wo.status === "in_progress",
                    )
                    .slice(0, 5)
                    .map((wo) => (
                      <li key={wo.id} className="px-4 py-3 flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {wo.title || `Orden ${wo.id}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Vence:{" "}
                            {wo.due_date
                              ? new Date(wo.due_date).toLocaleDateString(
                                  "es-CO",
                                )
                              : "Sin fecha definida"}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start">
                          {wo.status === "open"
                            ? "Abierta"
                            : wo.status === "in_progress"
                              ? "En progreso"
                              : wo.status || "Estado"}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashBContratoAdmin;
