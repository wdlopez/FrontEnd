import { Bar, Pie, Doughnut } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function DashbFinanzas({ user }) {
  const kpis = [
    { label: 'Suma del Total del valor de los contratos', value: '39,000,000' },
    { label: 'Suma del Total del valor anual de los contratos', value: '11,860,000' },
    { label: 'Valor anual de los contratos a vencer', value: '6,096,329' },
    { label: 'Ahorros Acumulados', value: '1,684,284' },
    { label: 'Contratos por Vencer (90 días)', value: '290' },
  ];

  const portfolioData = {
    labels: ['ADM', 'Infraestructura', 'Servicios Telecom', 'Consultoría', 'BPO'],
    datasets: [
      {
        label: 'Gasto por Cartera',
        data: [6000000, 4000000, 1500000, 1000000, 200000],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const supplierData = {
    labels: ['Accenture', 'IBM', 'Infosys', 'Telstra'],
    datasets: [
      {
        label: 'Gasto por Proveedor',
        data: [3000000, 2500000, 1500000, 800000],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      },
    ],
  };

  const slaData = {
    labels: ['Infosys', 'Telstra', 'IBM'],
    datasets: [
      {
        label: 'Entre esperado y mínimo',
        data: [100, 90, 50],
        backgroundColor: '#FBBF24',
      },
      {
        label: 'Mayor o igual al esperado',
        data: [130, 110, 40],
        backgroundColor: '#10B981',
      },
      {
        label: 'Debajo del mínimo',
        data: [50, 30, 70],
        backgroundColor: '#EF4444',
      },
    ],
  };

  const cumplimientoData = {
    labels: ['Aceptado', 'Próximo a vencer', 'Vencido'],
    datasets: [
      {
        data: [131, 116, 83],
        backgroundColor: ['#6366F1', '#3B82F6', '#F87171'],
      },
    ],
  };

  const cambiosData = {
    labels: ['IBM', 'Infosys', 'Accenture', 'Telstra'],
    datasets: [
      {
        label: 'Solicitudes de Cambio',
        data: [12, 9, 6, 4],
        backgroundColor: '#60A5FA',
      },
    ],
  };

  const ordenesFinancieras = {
    labels: ['Infosys', 'Telstra'],
    datasets: [
      {
        data: [350693, 297295],
        backgroundColor: ['#8B5CF6', '#F59E0B'],
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Finanzas del Cliente/Proveedor:</h3>
        <p>{user.assignedClientName}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white shadow rounded-lg p-4 text-center">
            <h4 className="text-sm uppercase text-gray-500 mb-1">{kpi.label}</h4>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Gasto por Cartera</h4>
           <div className='h-64'>
          <Bar data={portfolioData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Gasto por Proveedor</h4>
          <div className='h-64'>
          <Bar data={supplierData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Desempeño SLA</h4>
          <div className='h-64'>
          <Bar data={slaData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Cumplimiento Contractual</h4>
          <div className='h-64'>
          <Doughnut data={cumplimientoData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Solicitudes de Cambio</h4>
          <Bar data={cambiosData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Órdenes de Compra Financieras</h4>
          <Pie data={ordenesFinancieras} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

export default DashbFinanzas;