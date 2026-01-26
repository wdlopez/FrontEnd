import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function DashbRiesgos({ user }) {
  const kpis = [
    { label: 'Riesgos Totales', value: '74' },
    { label: 'Riesgos Críticos', value: '9' },
    { label: 'Mitigados', value: '43' },
    { label: 'Activos', value: '31' },
    { label: 'Mitigación (%)', value: '58%' },
  ];

  const categoriaData = {
    labels: ['Financieros', 'Operativos', 'Legales', 'Técnicos', 'Contractuales'],
    datasets: [
      {
        label: 'Riesgos por Categoría',
        data: [15, 20, 10, 18, 11],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const severidadData = {
    labels: ['Bajo', 'Medio', 'Alto', 'Crítico'],
    datasets: [
      {
        data: [20, 25, 20, 9],
        backgroundColor: ['#10B981', '#FBBF24', '#F97316', '#EF4444'],
      },
    ],
  };

  const mitigacionData = {
    labels: ['Mitigado', 'En Proceso', 'No Mitigado'],
    datasets: [
      {
        label: 'Estado de Mitigación',
        data: [43, 18, 13],
        backgroundColor: ['#10B981', '#FBBF24', '#EF4444'],
      },
    ],
  };

  const tendenciaData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
    datasets: [
      {
        label: 'Nuevos Riesgos',
        data: [4, 8, 6, 10, 7],
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Usuario: {user.name}</h3>
        <p className="text-gray-600">Responsable de Riesgos</p>
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

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Riesgos por Categoría</h4>
          <Bar data={categoriaData} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Nivel de Severidad</h4>
          <Pie data={severidadData} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Mitigación de Riesgos</h4>
          <Bar
            data={mitigacionData}
            options={{ indexAxis: 'y', maintainAspectRatio: false }}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Tendencia de Riesgos</h4>
          <Line data={tendenciaData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

export default DashbRiesgos;
