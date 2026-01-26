import { Bar, Pie, Doughnut } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function DashbReportes() {
  const cumplimientoData = {
    labels: ["Aceptados", "Próximos a vencer", "Vencidos"],
    datasets: [
      {
        data: [131, 116, 83],
        backgroundColor: ["#6366F1", "#3B82F6", "#F87171"],
      },
    ],
  };

  const rendimientoSLAData = {
    labels: ["INFOSYS", "TELSTRA", "IBM"],
    datasets: [
      {
        label: "Entre esperado y mínimo",
        data: [150, 120, 30],
        backgroundColor: "#FBBF24",
      },
      {
        label: "Cumple o supera objetivo",
        data: [90, 80, 60],
        backgroundColor: "#10B981",
      },
      {
        label: "Por debajo del mínimo",
        data: [50, 60, 90],
        backgroundColor: "#EF4444",
      },
    ],
  };

  const cambiosContratoData = {
    labels: ["IBM", "INFOSYS", "ACCENTURE", "TELSTRA"],
    datasets: [
      {
        label: "Cambios realizados",
        data: [8, 10, 4, 2],
        backgroundColor: "#60A5FA",
      },
    ],
  };

  const financierosData = {
    labels: ["TELSTRA", "INFOSYS", "IBM", "OTROS"],
    datasets: [
      {
        data: [297255, 350693, 890000, 1109337],
        backgroundColor: ["#3B82F6", "#10B981", "#6366F1", "#F59E0B"],
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Resumen de Reportes</h2>

      {/* Cumplimiento Contractual */}
      <div className="bg-white shadow rounded-lg p-4 h-80">
        <h4 className="text-lg mb-4">Cumplimiento Contractual</h4>
        <Doughnut data={cumplimientoData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Rendimiento SLA */}
      <div className="bg-white shadow rounded-lg p-4 h-80">
        <h4 className="text-lg mb-4">Desempeño SLA por Proveedor</h4>
        <Bar
          data={rendimientoSLAData}
          options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }}
        />
      </div>

      {/* Cambios en Contratos */}
      <div className="bg-white shadow rounded-lg p-4 h-80">
        <h4 className="text-lg mb-4">Solicitudes de Cambio por Proveedor</h4>
        <Bar data={cambiosContratoData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Estado Financiero */}
      <div className="bg-white shadow rounded-lg p-4 h-80">
        <h4 className="text-lg mb-4">Distribución Financiera de Órdenes de Trabajo</h4>
        <Pie data={financierosData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}

export default DashbReportes;
