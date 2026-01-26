import React, { useMemo } from "react";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { chartColors } from '../../config/colorPalette';

// Registrar los componentes de ChartJS **después** de los imports
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const calculateDays = (a, b) => Math.floor((b - a) / (1000 * 60 * 60 * 24));

const formatMoney = n => n.toLocaleString('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0
});


const classifySLA = (p, min, exp) => {
  const pct = Number(p), m = Number(min), e = Number(exp);
  if (isNaN(pct) || isNaN(m) || isNaN(e)) return null;
  if (pct < m) return 'red';
  if (pct < e) return 'yellow';
  return 'green';
};

const statusOptions = [
  { value: 1, label: 'Activo' },
  { value: 0, label: 'Cancelado' },
  { value: 2, label: 'Vencido' },
  { value: 3, label: 'En Negociación' },
];

const STATIC_CLIENTS = [
  { id: 1, name: 'Acme Corp', email: 'contact@acme.com', phone: '555-1234' },
  { id: 2, name: 'Globex Inc', email: 'info@globex.com', phone: '555-5678' },
  { id: 3, name: 'Umbrella LLC', email: 'sales@umbrella.com', phone: '555-9012' },
];


function DashBSuperAdmin({contracts = [], slas = [] }) {
 
  const kpis = useMemo(() => {
    const referenceDate = new Date(); 
    let totalValue = 0, totalAnnual = 0, expiredAnnual = 0, expired90Value = 0;

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
      { label: 'Total Contratos', value: formatMoney(totalValue) },
      { label: 'Valor Anual Total', value: formatMoney(totalAnnual) },
      { label: 'Expirados (Anual)', value: formatMoney(expiredAnnual) },
      { label: 'Expirados (90 días)', value: formatMoney(expired90Value) },
    ];
  }, [contracts]);

  const portfolioData = useMemo(() => {
    const counts = {};
    slas.forEach(sl => {
      const tower = sl.servicelevels?.services?.service_tower || 'Desconocido';
      counts[tower] = (counts[tower] || 0) + 1;
    });
    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [{
        label: 'SLA por Servicio',
        data: labels.map(l => counts[l]),
        backgroundColor: labels.map(() => chartColors.primary),
      }]
    };
  }, [slas]);


  const supplierData = useMemo(() => {
    const agg = contracts.reduce((acc, c) => {
      const name = c.provider?.prov_name || 'Desconocido';
      acc[name] = (acc[name] || 0) + (Number(c.total_value) || 0);
      return acc;
    }, {});
    const labels = Object.keys(agg);
    return {
      labels,
      datasets: [{
        label: 'Gasto por Proveedor',
        data: labels.map(n => agg[n]),
        backgroundColor: labels.map(() => chartColors.secondary),
      }]
    };
  }, [contracts]);


  const complianceData = useMemo(() => {
    const counts = {};
    statusOptions.forEach(opt => { counts[opt.value] = 0; });
    contracts.forEach(c => { 
      if (Object.prototype.hasOwnProperty.call(counts, c.status)) {
        counts[c.status]++;
      }
    });
    
    return {
      labels: statusOptions.map(o => o.label),
      datasets: [{
        data: statusOptions.map(o => counts[o.value]),
        backgroundColor: chartColors.status,
      }]
    };
  }, [contracts]);


  const slaData = useMemo(() => {
    const tally = {};
    const providerByContract = Object.fromEntries(
      contracts.map(c => [Number(c.cont_id), c.provider?.prov_name || 'Desconocido'])
    );

    slas.forEach(sl => {
      const prov = providerByContract[sl.servicelevels?.cont_id] || 'Desconocido';
      tally[prov] = tally[prov] || { green: 0, yellow: 0, red: 0 };
      sl.sla_credit_pachieve.forEach(p => {
        const cat = classifySLA(p, sl.servicelevels.sla_minimun_target, sl.servicelevels.sla_expect_target);
        if (cat) tally[prov][cat]++;
      });
    });

    const providers = Object.keys(tally);
    return {
      labels: providers,
      datasets: [
        { label: 'Supera Objetivo', data: providers.map(p => tally[p].green), backgroundColor: chartColors.sla.green },
        { label: 'Mínimo Requerido', data: providers.map(p => tally[p].yellow), backgroundColor: chartColors.sla.yellow },
        { label: 'Incumplido', data: providers.map(p => tally[p].red), backgroundColor: chartColors.sla.red },
      ],
    };
  }, [slas, contracts]);
 
  return (
    <div className="p-6 space-y-6">
     {/* Panel Superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel General</h2>
          <p className="text-gray-500">Visión global de la operación</p>
        </div>
        <div className="flex gap-3">
             {/* Aquí podrías poner botones de acción rápida */}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-5 border border-gray-100">
            <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">{kpi.label}</h4>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla Clientes (Simplificada) */}
      <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
        <h4 className="text-lg font-bold text-gray-700 mb-4">Clientes Recientes</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {STATIC_CLIENTS.map((client) => (
                <tr key={client.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4">{client.email}</td>
                  <td className="px-6 py-4">{client.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Número de SLAs por Servicio</h4>
          <div className='h-64'>
            <Bar data={portfolioData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Gasto del proveedor (dinámico) */}
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Gasto por proveedor</h4>
          <div className='h-64'>
            <Bar data={supplierData} options={{ maintainAspectRatio: false }} height={300} width={700} />
          </div>


        </div>
        {/* Rendimiento de SLA dinámico */}
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Rendimiento de SLA</h4>
          <div className="h-64">
            <Bar
              data={slaData}
              options={{
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                }
              }}
            />
          </div>
        </div>

        {/* Cumplimiento del contrato */}
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Cumplimiento del contrato (por estado)</h4>
          <div className='h-64'>
            <Pie data={complianceData} options={{ maintainAspectRatio: false }} height={260} width={700} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBSuperAdmin;
