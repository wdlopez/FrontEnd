import React, { useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { chartColors } from "../../config/colorPalette";
import { useAuth } from "../../context/AuthContext";
import { useSelectedClient } from "../../context/ClientSelectionContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const calculateDays = (a, b) =>
  Math.floor((b - a) / (1000 * 60 * 60 * 24));

const formatMoney = (n) =>
  n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

const classifySLA = (p, min, exp) => {
  const pct = Number(p);
  const m = Number(min);
  const e = Number(exp);
  if (Number.isNaN(pct) || Number.isNaN(m) || Number.isNaN(e)) return null;
  if (pct < m) return "red";
  if (pct < e) return "yellow";
  return "green";
};

const statusOptions = [
  { value: 1, label: "Activo" },
  { value: 0, label: "Cancelado" },
  { value: 2, label: "Vencido" },
  { value: 3, label: "En Negociación" },
];

function DashBContratoAdmin({ contracts = [], slas = [] }) {
  const { currentKeyClient } = useAuth();
  const { selectedClient } = useSelectedClient();

  const primaryContract = contracts[0] || null;
  const assignedClientFromContract =
    primaryContract?.client?.client_name || "Sin cliente definido";
  const assignedProvider =
    primaryContract?.provider?.prov_name || "Sin proveedor definido";

  const clientDisplayName =
    selectedClient?.name ||
    (Array.isArray(currentKeyClient) ? currentKeyClient[0] : currentKeyClient) ||
    assignedClientFromContract;

  // SLAs por servicio (torre)
  const portfolioData = useMemo(() => {
    const counts = {};

    slas.forEach((sl) => {
      const tower =
        sl.servicelevels?.services?.service_tower || "Desconocido";
      counts[tower] = (counts[tower] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = labels.map((label) => counts[label]);

    return {
      labels,
      datasets: [
        {
          label: "Número de SLAs por Servicio",
          data,
          backgroundColor: labels.map(
            (_, idx) =>
              chartColors.status[idx % chartColors.status.length],
          ),
        },
      ],
    };
  }, [slas]);

  // KPIs de contratos (cálculo directo; poco costoso para el tamaño esperado)
  const now = new Date();
  let totalValue = 0;
  let totalAnnual = 0;
  let expiredAnnual = 0;
  let expired90Value = 0;

  contracts.forEach((c) => {
    if (!c.start_date || !c.end_date) return;

    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    const value = Number(c.total_value) || 0;

    const durationDays = calculateDays(start, end);
    const durationYears = durationDays / 365;
    const annualValue = durationYears > 0 ? value / durationYears : value;

    totalValue += value;
    totalAnnual += annualValue;

    if (end < now) {
      expiredAnnual += annualValue;
      if (calculateDays(end, now) <= 90) {
        expired90Value += value;
      }
    }
  });

  const kpis = [
    {
      label: "Suma del Total del valor de los contratos",
      value: formatMoney(totalValue),
    },
    {
      label: "Suma del valor anual de los contratos",
      value: formatMoney(totalAnnual),
    },
    {
      label: "Valor anual de contratos expirados",
      value: formatMoney(expiredAnnual),
    },
    {
      label: "Valor de contratos expirados (últimos 90 días)",
      value: formatMoney(expired90Value),
    },
  ];

  // Gastos por proveedor
  const supplierData = useMemo(() => {
    const agg = contracts.reduce((acc, contract) => {
      const name = contract.provider?.prov_name || "Desconocido";
      const val = Number(contract.total_value) || 0;
      acc[name] = (acc[name] || 0) + val;
      return acc;
    }, {});

    const labels = Object.keys(agg);
    const data = labels.map((name) => agg[name]);

    return {
      labels,
      datasets: [
        {
          label: "Gastos por Proveedor",
          data,
          backgroundColor: labels.map(
            (_, idx) =>
              chartColors.status[idx % chartColors.status.length],
          ),
        },
      ],
    };
  }, [contracts]);

  // Cumplimiento contractual por estado
  const complianceData = useMemo(() => {
    const countByStatus = statusOptions.reduce((acc, opt) => {
      acc[opt.value] = 0;
      return acc;
    }, {});

    contracts.forEach((contract) => {
      if (Object.prototype.hasOwnProperty.call(countByStatus, contract.status)) {
        countByStatus[contract.status] += 1;
      }
    });

    const labels = statusOptions.map((opt) => opt.label);
    const data = statusOptions.map((opt) => countByStatus[opt.value]);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: chartColors.status.slice(0, labels.length),
        },
      ],
    };
  }, [contracts]);

  // Clasificación SLA por proveedor
  const slaData = useMemo(() => {
    const tally = {};

    const providerByContract = Object.fromEntries(
      contracts.map((c) => [
        Number(c.cont_id),
        c.provider?.prov_name || "Desconocido",
      ]),
    );

    slas.forEach((sl) => {
      const contId = Number(sl.servicelevels?.cont_id);
      const prov = providerByContract[contId] || "Desconocido";
      if (!tally[prov]) {
        tally[prov] = { green: 0, yellow: 0, red: 0 };
      }

      if (Array.isArray(sl.sla_credit_pachieve)) {
        sl.sla_credit_pachieve.forEach((p) => {
          const cat = classifySLA(
            p,
            sl.servicelevels?.sla_minimun_target,
            sl.servicelevels?.sla_expect_target,
          );
          if (cat && tally[prov][cat] !== undefined) {
            tally[prov][cat] += 1;
          }
        });
      }
    });

    const providers = Object.keys(tally);

    return {
      labels: providers,
      datasets: [
        {
          label: "Supera Objetivo",
          data: providers.map((p) => tally[p].green),
          backgroundColor: chartColors.sla.green,
        },
        {
          label: "Mínimo Requerido",
          data: providers.map((p) => tally[p].yellow),
          backgroundColor: chartColors.sla.yellow,
        },
        {
          label: "Incumplido",
          data: providers.map((p) => tally[p].red),
          backgroundColor: chartColors.sla.red,
        },
      ],
    };
  }, [slas, contracts]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Cliente / Proveedor asignado</h3>
        <p className="text-gray-700 text-sm mt-1">
          Cliente: <span className="font-medium">{clientDisplayName}</span>
          {" · "}
          Proveedor:{" "}
          <span className="font-medium">{assignedProvider}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-5 border border-gray-100"
          >
            <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
              {kpi.label}
            </h4>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Número de SLAs por Servicio</h4>
          <div className="h-64">
            <Bar data={portfolioData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Gasto por Proveedor</h4>
          <div className="h-64">
            <Bar
              data={supplierData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Rendimiento SLA</h4>
          <div className="h-64">
            <Bar
              data={slaData}
              options={{
                indexAxis: "y",
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Cumplimiento Contractual</h4>
          <div className="h-64">
            <Pie
              data={complianceData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBContratoAdmin;
