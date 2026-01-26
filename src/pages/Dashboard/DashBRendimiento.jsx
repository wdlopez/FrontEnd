import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function DashbRendimiento() {
  // Datos para la gráfica de logro general SLA
  const donutData = {
    labels: ["Menor al objetivo mínimo", "Mayor o igual al objetivo esperado"],
    datasets: [
      {
        data: [4, 2],
        backgroundColor: ["#E74C3C", "#27AE60"],
        borderWidth: 1,
      },
    ],
  };

  const donutOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    cutout: "70%",
  };

  // Datos para la gráfica de desempeño SLA
  const barData = {
    labels: ["IBM", "TELSTRA"],
    datasets: [
      {
        label: "Mayor o igual al objetivo esperado",
        data: [1, 1],
        backgroundColor: "#27AE60",
      },
      {
        label: "Menor al objetivo mínimo",
        data: [2, 2],
        backgroundColor: "#E74C3C",
      },
      {
        label: "Sin datos reportables",
        data: [2, 1],
        backgroundColor: "#9B59B6",
      },
    ],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          "Rango",
          "Tipo de Métrica",
          "Estado",
          "Frecuencia de Reporte",
          "Categoría de Desempeño",
          "Proveedor",
        ].map((label) => (
          <div key={label} className="flex flex-col">
            <label className="text-sm font-medium">{label}</label>
            <select className="mt-1 p-2 border rounded">
              <option>Todos</option>
            </select>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total</h3>
          <p className="text-2xl font-bold">9</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">En progreso</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Aprobado</h3>
          <p className="text-2xl font-bold">1</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut SLA */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Logro General de SLA</h2>
          <Doughnut data={donutData} options={donutOptions} />
        </div>

        {/* Barras Apiladas SLA */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Desempeño SLA por Proveedor</h2>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}

export default DashbRendimiento;