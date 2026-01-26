import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function DashbRelacionamiento() {
  const reunionesPorTipoData = {
    labels: ['Seguimiento SLA', 'Revisión Financiera', 'Planeación Estratégica', 'Gestión de Riesgos'],
    datasets: [
      {
        label: 'Número de Reuniones',
        data: [10, 5, 6, 3],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const acuerdosData = {
    labels: ['Cumplidos', 'En seguimiento', 'Vencidos'],
    datasets: [
      {
        data: [26, 9, 3],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      },
    ],
  };

  const participacionData = {
    labels: ['Responsables Cliente', 'Responsables Proveedor', 'Finanzas', 'Legal', 'TI'],
    datasets: [
      {
        label: 'Participación por Rol',
        data: [15, 14, 6, 2, 1],
        backgroundColor: '#6366F1',
      },
    ],
  };

  const duracionReunionesData = {
    labels: ['Reunión 1', 'Reunión 2', 'Reunión 3', 'Reunión 4', 'Reunión 5'],
    datasets: [
      {
        label: 'Duración (min)',
        data: [75, 80, 70, 90, 85],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Resumen General</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h4 className="text-sm text-gray-500">Total Reuniones</h4>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h4 className="text-sm text-gray-500">Pendientes</h4>
            <p className="text-2xl font-bold">6</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h4 className="text-sm text-gray-500">Realizadas</h4>
            <p className="text-2xl font-bold">18</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h4 className="text-sm text-gray-500">Participación Prom.</h4>
            <p className="text-2xl font-bold">4.2</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h4 className="text-sm text-gray-500">Reuniones con Acuerdos</h4>
            <p className="text-2xl font-bold">15</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Reuniones por Tipo</h4>
          <Bar data={reunionesPorTipoData} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Cumplimiento de Acuerdos</h4>
          <Pie data={acuerdosData} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Participación por Rol</h4>
          <Bar data={participacionData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow rounded-lg p-4 h-80">
          <h4 className="text-lg mb-4">Duración de Reuniones</h4>
          <Line data={duracionReunionesData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

export default DashbRelacionamiento;
