import { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { customChartColors, pieChartColors } from "../../../config/chartColors";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const SLA_STATES = [
    { value: 0, label: "Inactivo" },
    { value: 1, label: "Activo" },
];

const SLA_PRIORITIES = [
    { value: 0, label: "Diario" },
    { value: 1, label: "Semanal" },
    { value: 2, label: "Mensual" },
    { value: 3, label: "Trimestral" }
];

function SlaChart({ sla }) {
    const [totalSla, setTotalSla] = useState(0);
    const [activeSla, setActiveSla] = useState(0);
    const [inactiveSla, setInactiveSla] = useState(0);
    const [stateChartData, setStateChartData] = useState({ labels: [], datasets: [] });
    const [priorityChartData, setPriorityChartData] = useState({ labels: [], datasets: [] });
    const [monthlyChartData, setMonthlyChartData] = useState({ labels: [], datasets: [] });
    const [totalServiceValue, setTotalServiceValue] = useState(0);

    useEffect(() => {
        if (!Array.isArray(sla) || sla.length === 0) {
            setTotalSla(0);
            setActiveSla(0);
            setInactiveSla(0);
            setStateChartData({ labels: [], datasets: [] });
            setPriorityChartData({ labels: [], datasets: [] });
            setMonthlyChartData({ labels: [], datasets: [] });
            setTotalServiceValue(0);
            return;
        }

        let total = 0, active = 0, inactive = 0;
        const countsByState = {}, priorityCounts = {}, monthlyCounts = {};
        let serviceValueSum = 0;
        sla.forEach((item) => {
            total++;
            const stateId = parseInt(item.sla_active);
            if (!isNaN(stateId)) {
                const statusLabel = SLA_STATES.find(s => s.value === stateId)?.label || "Desconocido";
                countsByState[statusLabel] = (countsByState[statusLabel] || 0) + 1;
                if (stateId === 1) active++;
                else if (stateId === 0) inactive++;
            }
            const priorityId = parseInt(item.sla_active);
            if (!isNaN(priorityId)) {
                const prLabel = SLA_PRIORITIES.find(p => p.value === priorityId)?.label || "Desconocido";
                priorityCounts[prLabel] = (priorityCounts[prLabel] || 0) + 1;
            }
            const dueDate = item.due_date;
            if (dueDate) {
                const date = new Date(dueDate);
                if (!isNaN(date)) {
                    const month = date.toLocaleString("es", { month: "short" });
                    const year = date.getFullYear();
                    const label = `${month} ${year}`;
                    monthlyCounts[label] = (monthlyCounts[label] || 0) + 1;
                }
            }
            // Sumar el valor del servicio SOLO si el SLA está activo
            if (stateId === 1 && item.service_value && !isNaN(Number(item.service_value))) {
                serviceValueSum += Number(item.service_value);
            }
        });
        setTotalSla(total);
        setActiveSla(active);
        setInactiveSla(inactive);
        setTotalServiceValue(serviceValueSum);

        const stateLabels = SLA_STATES.map(s => s.label);
        const stateData = stateLabels.map(l => countsByState[l] || 0);
        setStateChartData({
            labels: stateLabels,
            datasets: [{
                label: 'Número de SLAs',
                data: stateData,
                backgroundColor: customChartColors.slice(0, stateLabels.length),
                borderColor: customChartColors.slice(0, stateLabels.length),
                borderWidth: 1,
            }],
        });


        const priorityLabels = SLA_PRIORITIES.map(p => p.label);
        const priorityData = priorityLabels.map(l => priorityCounts[l] || 0);
        setPriorityChartData({
            labels: priorityLabels,
            datasets: [{
                label: 'Número de SLAs',
                data: priorityData,
                backgroundColor: pieChartColors.slice(0, priorityLabels.length),
                borderColor: pieChartColors.slice(0, priorityLabels.length),
                borderWidth: 1,
            }],
        });

        const sortedLabels = Object.keys(monthlyCounts).sort((a, b) => new Date(a) - new Date(b));
        setMonthlyChartData({
            labels: sortedLabels,
            datasets: [{
                label: 'SLAs que vencen por mes',
                data: sortedLabels.map(l => monthlyCounts[l]),
                backgroundColor: customChartColors.slice(0, stateLabels.length),
            }]
        });
    }, [sla]);

    const commonOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } }
    };
    return (
        <div className="p-4 bg-white shadow rounded-lg">
            {/* --- TARJETA DE VALOR TOTAL DE SERVICIOS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-40 md:gap-1 mb-8">
                <div
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border-l-4 xl:w-60 lg:w-45 xl:h-35 lg:h-30"
                    style={{ borderColor: "#0C1F5B" }}
                >
                    <span className="material-symbols-outlined text-4xl mb-2" style={{ color: "#0C1F5B" }}>
                        paid
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700">
                        Valor Total de Servicios
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#0C1F5B" }}>
                        {totalServiceValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </p>
                </div>

                {/* Cuadro: Total de SLAs */}
                <div
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border-l-4 xl:w-60 lg:w-45 xl:h-35 lg:h-30"
                    style={{ borderColor: "rgba(12, 31, 91, 1)" }}
                >
                    <span
                        className="material-symbols-outlined text-4xl mb-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        fact_check
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700">
                        Total SLAs
                    </h3>
                    <p
                        className="text-4xl font-bold mt-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        {totalSla}
                    </p>
                </div>

                {/* Cuadro: SLAs Activos */}
                <div
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border-l-4 xl:w-60 lg:w-45 xl:h-35 lg:h-30"
                    style={{ borderColor: "rgba(12, 31, 91, 1)" }}
                >
                    <span
                        className="material-symbols-outlined text-4xl mb-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        task_alt
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700">
                        SLAs Activos
                    </h3>
                    <p
                        className="text-4xl font-bold mt-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        {activeSla}
                    </p>
                </div>

                {/* Cuadro: SLAs Inactivos */}
                <div
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border-l-4 xl:w-60 lg:w-45 xl:h-35 lg:h-30"
                    style={{ borderColor: "rgba(12, 31, 91, 1)" }}
                >
                    <span
                        className="material-symbols-outlined text-4xl mb-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        block
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700">
                        SLAs Inactivos
                    </h3>
                    <p
                        className="text-4xl font-bold mt-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        {inactiveSla}
                    </p>
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center text-titleBlue">
                Análisis de SLAs
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    <Bar data={stateChartData} options={{ ...commonOpts, title: { display: true, text: 'Distribución por Estado' } }} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    <Pie data={priorityChartData} options={{ ...commonOpts, title: { display: true, text: 'Distribución por Prioridad' } }} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    <Bar data={monthlyChartData} options={{ ...commonOpts, scales: { x: { type: 'category' }, y: { beginAtZero: true } }, title: { display: true, text: 'SLAs por Mes' } }} />
                </div>
            </div>
        </div>
    );
}

export default SlaChart;