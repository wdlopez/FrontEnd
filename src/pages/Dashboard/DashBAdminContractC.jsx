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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

// --- UTILIDADES Y CONSTANTES FUERA DEL COMPONENTE ---

const calculateDays = (a, b) => Math.floor((b - a) / (1000 * 60 * 60 * 24));

const formatMoney = (n) =>
  n.toLocaleString("es-CO", {
    style: "currency",

    currency: "COP",

    minimumFractionDigits: 0,
  });

const classifySLA = (p, min, exp) => {
  const pct = Number(p),
    m = Number(min),
    e = Number(exp);

  if (isNaN(pct) || isNaN(m) || isNaN(e)) return null;

  if (pct < m) return "red";

  if (pct < e) return "yellow";

  return "green";
};

const STATUS_OPTIONS = [
  { value: 1, label: "Activo" },

  { value: 0, label: "Cancelado" },

  { value: 2, label: "Vencido" },

  { value: 3, label: "En Negociación" },
];

// --- COMPONENTE PRINCIPAL ---

function DashBContratoAdmin({ user, contracts = [], slas = [] }) {
  // 1. Datos de SLAs por Servicio

  const portfolioData = useMemo(() => {
    const counts = {};

    slas.forEach((sl) => {
      const tower = sl.servicelevels?.services?.service_tower || "Desconocido";

      counts[tower] = (counts[tower] || 0) + 1;
    });

    const labels = Object.keys(counts);

    return {
      labels,

      datasets: [
        {
          label: "Número de SLAs por Servicio",

          data: labels.map((label) => counts[label]),

          backgroundColor: labels.map(
            (_, idx) => chartColors.status[idx % chartColors.status.length],
          ),
        },
      ],
    };
  }, [slas]);

  // 2. KPIs de contrato (Lógica de fechas corregida para el compilador)

  const kpis = useMemo(() => {
    // Definimos una fecha de referencia estable para este ciclo de renderizado

    const referenceDate = new Date();

    let totalValue = 0,
      totalAnnual = 0,
      expiredAnnual = 0,
      expired90Value = 0;

    // Usamos un bucle for...of que es más fácil de analizar para el compilador que forEach

    for (const c of contracts) {
      const start = new Date(c.start_date);

      const end = new Date(c.end_date);

      const value = Number(c.total_value) || 0;

      const durationDays = calculateDays(start, end);

      const durationYears = durationDays / 365;

      const annualValue = durationYears > 0 ? value / durationYears : value;

      totalValue += value;

      totalAnnual += annualValue;

      if (end < referenceDate) {
        expiredAnnual += annualValue;

        if (calculateDays(end, referenceDate) <= 90) {
          expired90Value += value;
        }
      }
    }

    return [
      { label: "Suma Total Contratos", value: formatMoney(totalValue) },

      { label: "Valor Anual Contratos", value: formatMoney(totalAnnual) },

      { label: "Anual Expirados", value: formatMoney(expiredAnnual) },

      { label: "Expirados (90 días)", value: formatMoney(expired90Value) },
    ];
  }, [contracts]);

  // 3. Gastos por proveedor

  const supplierData = useMemo(() => {
    const agg = contracts.reduce((acc, contract) => {
      const name = contract.provider?.prov_name || "Desconocido";

      acc[name] = (acc[name] || 0) + (Number(contract.total_value) || 0);

      return acc;
    }, {});

    const labels = Object.keys(agg);

    return {
      labels,

      datasets: [
        {
          label: "Gastos por Proveedor",

          data: labels.map((name) => agg[name]),

          backgroundColor: labels.map(
            (_, idx) => chartColors.status[idx % chartColors.status.length],
          ),
        },
      ],
    };
  }, [contracts]);

  // 4. Datos de cumplimiento contractual

  const complianceData = useMemo(() => {
    const countByStatus = {};

    STATUS_OPTIONS.forEach((opt) => {
      countByStatus[opt.value] = 0;
    });

    contracts.forEach((contract) => {
      if (
        Object.prototype.hasOwnProperty.call(countByStatus, contract.status)
      ) {
        countByStatus[contract.status]++;
      }
    });

    return {
      labels: STATUS_OPTIONS.map((opt) => opt.label),

      datasets: [
        {
          data: STATUS_OPTIONS.map((opt) => countByStatus[opt.value]),

          backgroundColor: chartColors.status.slice(0, STATUS_OPTIONS.length),
        },
      ],
    };
  }, [contracts]);

  // 5. Clasificación SLA

  const slaData = useMemo(() => {
    const tally = {};

    const providerByContract = Object.fromEntries(
      contracts.map((c) => [
        Number(c.cont_id),
        c.provider?.prov_name || "Desconocido",
      ]),
    );

    slas.forEach((sl) => {
      const prov = providerByContract[sl.servicelevels?.cont_id] || 'Desconocido';

      tally[prov] = tally[prov] || { green: 0, yellow: 0, red: 0 };

      sl.sla_credit_pachieve?.forEach((p) => {
        const cat = classifySLA(
          p,
          sl.servicelevels.sla_minimun_target,
          sl.servicelevels.sla_expect_target,
        );

        if (cat) tally[prov][cat]++;
      });
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
        <h3 className="text-lg font-semibold">Bienvenido, {user.firstName}</h3>
        <p className="text-gray-500 font-medium">Administrador de Contratos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white shadow rounded-lg p-4 text-center"
          >
            <h4 className="text-sm uppercase text-gray-500 mb-1">
              {kpi.label}
            </h4>

            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Número de SLAs por Servicio</h4>

          <div className="h-64">
            <Bar
              data={portfolioData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Gasto por Proveedor</h4>

          <div className="h-64">
            <Bar data={supplierData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Rendimiento SLA</h4>

          <div className="h-64">
            <Bar
              data={slaData}
              options={{ indexAxis: "y", maintainAspectRatio: false }}
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
