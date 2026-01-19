import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { customChartColors } from "../../../config/chartColors";

// Importaciones de Chart.js
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

// Mapeo de nombres de meses abreviados en español a números de mes
const monthMap = {
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'sep': 8, 'sept': 8,
    'oct': 9, 'nov': 10, 'dic': 11
};

const SERVICE_STATES = [
    {value: 1, label: "Activo"},
    {value: 0, label: "Inactivo"},
];

function ServiceChart({ services }) { // Solo recibe los servicios ya filtrados
    // Los estados para los datos de los gráficos se mantienen
    const [totalServices, setTotalServices] = useState(0);
    const [activeServices, setActiveServices] = useState(0);
    const [inactiveServices, setInactiveServices] = useState(0);
    const [stateChartData, setStateChartData] = useState({labels: [], datasets: []});
    const [monthlyChartData, setMonthlyChartData] = useState({labels: [], datasets: []});
    const [totalServiceValue, setTotalServiceValue] = useState(0);
    const [serviceTowerChartData, setServiceTowerChartData] = useState({labels: [], datasets: []});

    // El useEffect ahora es mucho más simple. Solo depende de 'services'.
    useEffect(() => {
        // Si no hay servicios, resetea todo y termina.
        if (!Array.isArray(services) || services.length === 0) {
            console.log("ServiceChart: No hay servicios para mostrar.");
            setTotalServices(0);
            setActiveServices(0);
            setInactiveServices(0);
            setStateChartData({labels: [], datasets: []});
            setMonthlyChartData({labels: [], datasets: []});
            setTotalServiceValue(0);
            setServiceTowerChartData({labels: [], datasets: []});
            return;
        }

        console.log(`ServiceChart: Procesando ${services.length} servicios recibidos.`);


        // --- 4. Calcular contadores y datos para gráficos con los servicios filtrados ---
       let total = 0, active = 0, inactive = 0;
        const countsByState = {}, monthlyCounts = {};
        const towerCounts = {};
        let serviceValue = 0;

        services.forEach((item) => {
            total++;
            const stateId = parseInt(item.service_active);
            if (!isNaN(stateId)) {
                const stateLabel = SERVICE_STATES.find(s => s.value === stateId)?.label || 'Desconocido';
                countsByState[stateLabel] = (countsByState[stateLabel] || 0) + 1;
                if (stateId === 1) active++;
                else if (stateId === 0) inactive++;
            }

            const dueDate = item.service_end_d;
            if (dueDate) {
                const date = new Date(dueDate);
                if (!isNaN(date)){
                    const month = date.toLocaleString("es", { month: "short"}).toLowerCase();
                    const year = date.getFullYear();
                    const label = `${month} ${year}`;
                    monthlyCounts[label] = (monthlyCounts[label] || 0) + 1;
                }
            }

            const towerLabel = item.service_tower || 'Desconocido';
            if (towerLabel !== "Desconocido") {
                towerCounts[towerLabel] = (towerCounts[towerLabel] || 0) + 1;
            }

            if (stateId === 1 && item.service_value && !isNaN(Number(item.service_value))) {
                serviceValue += Number(item.service_value);
            }
        });

        // Actualización de estados (sin cambios en esta parte)
        setTotalServices(total);
        setActiveServices(active);
        setInactiveServices(inactive);
        setTotalServiceValue(serviceValue);

        const stateLabels = SERVICE_STATES.map(s => s.label);
        const stateData = stateLabels.map(l => countsByState[l] || 0);
        setStateChartData({
            labels: stateLabels,
            datasets: [{
                label: 'Número de Servicios',
                data: stateData,
                backgroundColor: customChartColors.slice(0, stateLabels.length),
                borderColor: customChartColors.slice(0, stateLabels.length),
                borderWidth: 1,
            }],
        });

        const sortedLabels = Object.keys(monthlyCounts).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(yearA, monthMap[monthA]);
            const dateB = new Date(yearB, monthMap[monthB]);
            return dateA - dateB;
        });

        setMonthlyChartData({
            labels: sortedLabels,
            datasets: [{
                label: 'Servicios que vencen por Mes',
                data: sortedLabels.map(l => monthlyCounts[l] || 0),
                backgroundColor: customChartColors.slice(0, sortedLabels.length),
                borderColor: customChartColors.slice(0, sortedLabels.length),
                borderWidth: 1,
            }],
        });

        setServiceTowerChartData({
            labels: Object.keys(towerCounts),
            datasets: [{
                label: 'Número de Servicios por Torre', data: Object.values(towerCounts), backgroundColor: customChartColors.slice(0, Object.keys(towerCounts).length),
            }],
        });

    }, [services]);

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded-lg">
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
                        Total Servicios
                    </h3>
                    <p
                        className="text-4xl font-bold mt-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        {totalServices}
                    </p>
                </div>

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
                        Servicios Activos
                    </h3>
                    <p
                        className="text-4xl font-bold mt-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        {activeServices}
                    </p>
                </div>

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
                        Servicios Inactivos
                    </h3>
                    <p
                        className="text-4xl font-bold mt-2"
                        style={{ color: "rgba(12, 31, 91, 1)" }}
                    >
                        {inactiveServices}
                    </p>
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center text-titleBlue">
                Análisis de Servicios
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Distribución por Estado (Activo/Inactivo) */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Distribución por Estado</h3>
                    <Bar data={stateChartData} options={{ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: 'Distribución por Estado' } } }} />
                </div>

                {/* Gráfico de Servicios que vencen por Mes */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Servicios que vencen por Mes</h3>
                    <Bar data={monthlyChartData} options={{ ...commonChartOptions, scales: { x: { type: 'category' }, y: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { ...commonChartOptions.plugins, title: { display: true, text: 'Servicios que vencen por Mes' } } }} />
                </div>

                {/* Nuevo Gráfico de Distribución por Service Tower */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Distribución por Torre de Servicio</h3>
                    <Bar data={serviceTowerChartData} options={{ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: 'Número de Servicios por Torre' } } }} />
                </div>
            </div>
        </div>
    );
}

export default ServiceChart;