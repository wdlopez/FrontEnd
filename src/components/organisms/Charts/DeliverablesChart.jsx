import React, { useState, useEffect } from "react";
import { typeDel, delFrequency, delCategory } from "../../../pages/Deliverables/delLists";
import { downloadDeliverableFile } from "../../../services/deliverables-service/getFileDel-service";
import formatSimpleDate from "../../../utils/formatSimpleDate";
// ELIMINADO: Se elimina la importación de ContractStateChart
// import ContractStateChart from "./ContractStateChart";
import { Bar, Pie, Line } from "react-chartjs-2";
import { chartColors } from "../../../config/colorPalette";
import { Link } from "react-router-dom";
import InteractiveTable from "../Tables/interactiveTable";
import { customChartColors, pieChartColors } from "../../../config/chartColors";
import KpiCard from "../../molecules/KpiCard";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import Modal from "../../molecules/modal";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
// Nota: BarElement, Title, Tooltip, Legend ya estaban registrados por ContractStateChart
// No es necesario registrar de nuevo, ChartJS.register maneja duplicados, pero es bueno saberlo.


// ELIMINADO: Ya no necesitamos este helper si no se usa en DeliverablesList
// const formatSpanishDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return '';
//     const day = date.getDate();
//     const year = date.getFullYear();
//     const monthNames = [
//         "enero", "febrero", "marzo", "abril", "mayo", "junio",
//         "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
//     ];
//     const month = monthNames[date.getMonth()];
//     return `${day} ${month}, ${year}`;
// };


function DeliverablesChart({ deliverables, delStateList, delPriority }) {

    console.log("DeliverablesChart - Props recibidas:", { deliverables, delStateList, delPriority });
    const [openModal, SetOpenModal] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [totalDeliverables, setTotalDeliverables] = useState(0);
    const [activeDeliverables, setActiveDeliverables] = useState(0);
    const [inactiveDeliverables, setInactiveDeliverables] = useState(0);
    const [pendingDeliverablesCount, setPendingDeliverablesCount] = useState(0);
    const [completedDeliverables, setCompletedDeliverables] = useState(0);
    const [overdueDeliverables, setOverdueDeliverables] = useState(0);
    const [onTimeDeliverables, setOnTimeDeliverables] = useState(0);
    const [lateDeliverables, setLateDeliverables] = useState(0);

    const [performanceChartData, setPerformanceChartData] = useState({
        labels: [],
        datasets: [],
    });

    // AÑADIDO: Estado para los datos del gráfico de Contrato y Estado
    const [contractStateChartData, setContractStateChartData] = useState({ labels: [], datasets: [] });

    const handleOpenModal = (value) => {
        let filteredArray = [];
        switch (value) {
            case 1: // Activos
                filteredArray = deliverables.filter(d => d.active === 1);
                break;
            case 2: // Inactivos
                filteredArray = deliverables.filter(d => d.active === 0);
                break;
            default:
                filteredArray = [];
                break;
        }
        const safeLabel = (list, val) =>
            list.find((l) => l.value === val)?.label || "No disponible";

        setFilteredData(filteredArray.map(d => ({
            id: d.del_id,
            Nº: d.del_id,
            Nombre: d.del_name,
            Descripción: d.del_description,
            "Documento Asociado": (
                <a className="hover:underline" onClick={() => downloadDeliverableFile(d.del_id, d.del_doc_name)}>
                    {d.del_doc_name}
                </a>
            ),
            "Fecha de Inicio": formatSimpleDate(d.timeline?.start_date),
            "Fecha de Vencimiento": formatSimpleDate(d.timeline?.due_date),
            Tipo: safeLabel(typeDel, d.del_type),
            "Sección del Contrato": d.cont_section,
            "Nivel de Prioridad": safeLabel(delPriority, d.del_priority),
            Categoria: safeLabel(delCategory, d.del_category),
            "Categoria del Servicio": d.del_servcategory,
            "Criterio de Aceptación":
                d.del_acceptcritery === 1 ? "Si tiene" :
                    d.del_acceptcritery === 2 ? "No tiene" : "Sin definir",
            "Descripción de criterio": d.del_accepexpct,
            Revisor: d.reviewer?.reviewer_name || "No definido",
            "Cliente de resvisor": d.reviewer?.reviewer_client_name || "No definido",
            "Persona Responsable": d.responsible?.user_name || "No definido",
            "Correo del Responsable": d.responsible?.user_email || "No definido",
            "Tipo de Responsable": d.responsible_type === 1 ? "interno" : d.responsible_type === 2 ? "externo" : "sin definir",
            "Proveedor de responsable": d.responsible?.prov_name || "no disponible",
            Comentario: d.timeline?.comments || "",
            "Monto de Penalización": d.del_creamount,
            Estado: safeLabel(delStateList, d.del_state),
            Frecuencia: safeLabel(delFrequency, d.del_frequency),
            state: d.active,
        })));
        SetOpenModal(true);
    };

    useEffect(() => {
        console.log("useEffect - Props en DeliverablesChart (dentro del effect):", { deliverables, delStateList, delPriority });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deliverables && deliverables.length > 0) {
            let total = deliverables.length;
            let active = 0;
            let inactive = 0;
            let pending = 0;
            let completed = 0;
            let overdue = 0;
            let onTime = 0;
            let late = 0;

            const PENDING_STATE_VALUE = delStateList.find((s) => s.label === "Pendiente")?.value;
            const COMPLETED_STATE_VALUES = [
                delStateList.find((s) => s.label === "Completado")?.value,
                delStateList.find((s) => s.label === "Cerrado")?.value,
            ].filter(Boolean);

            const ON_TIME_STATE_VALUES = [
                delStateList.find((s) => s.label === "Entregado a Tiempo")?.value,
                delStateList.find((s) => s.label === "Entregado a Tiempo con Observaciones")?.value,
            ].filter(Boolean);

            const LATE_STATE_VALUES = [
                delStateList.find((s) => s.label === "Entregado con Retraso")?.value,
                delStateList.find((s) => s.label === "Entregado con Retraso y Observaciones")?.value,
            ].filter(Boolean);

            const dataByMonthForPerformance = {};
            const contractStateCounts = {}; // AÑADIDO: Para el gráfico de Contrato y Estado

            const monthShortNames = [
                "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
                "jul.", "ago.", "sept.", "oct.", "nov.", "dic."
            ];

            deliverables.forEach((del) => {
                if (del.active === 1) {
                    active++;
                } else if (del.active === 0) {
                    inactive++;
                }

                if (del.del_state === PENDING_STATE_VALUE) {
                    pending++;
                }
                if (COMPLETED_STATE_VALUES.includes(del.del_state)) {
                    completed++;
                }

                if (ON_TIME_STATE_VALUES.includes(del.del_state)) {
                    onTime++;
                }

                if (LATE_STATE_VALUES.includes(del.del_state)) {
                    late++;
                }

                if (
                    !COMPLETED_STATE_VALUES.includes(del.del_state) &&
                    del.timeline &&
                    del.timeline.due_date
                ) {
                    const dueDate = new Date(del.timeline.due_date);
                    dueDate.setHours(0, 0, 0, 0);
                    if (dueDate < today) {
                        overdue++;
                    }
                }

                // Lógica para Performance Chart (Completados a Tiempo y Tarde) - SE MANTIENE
                if (del.timeline && del.timeline.due_date && del.timeline.actual_completion_date) {
                    const dueDate = new Date(del.timeline.due_date);
                    const actualDate = new Date(del.timeline.actual_completion_date);
                    const monthYearKey = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;

                    if (!dataByMonthForPerformance[monthYearKey]) {
                        dataByMonthForPerformance[monthYearKey] = { completedOnTime: 0, completedLate: 0 };
                    }

                    if (actualDate <= dueDate) {
                        dataByMonthForPerformance[monthYearKey].completedOnTime++;
                    } else {
                        dataByMonthForPerformance[monthYearKey].completedLate++;
                    }
                }

                // AÑADIDO: Lógica para el gráfico de Contrato y Estado (del ContractStateChart original)
                const contractName = del.contract?.cont_keyname || "Sin Contrato"; // Usar el nombre de contrato real
                // Asegurarse de que delStateList esté disponible y tenga un label
                const stateLabel = delStateList.find((s) => s.value === del.del_state)?.label || "Desconocido";

                if (!contractStateCounts[contractName]) {
                    contractStateCounts[contractName] = {};
                }
                contractStateCounts[contractName][stateLabel] =
                    (contractStateCounts[contractName][stateLabel] || 0) + 1;
                // FIN AÑADIDO
            });

            setTotalDeliverables(total);
            setActiveDeliverables(active);
            setInactiveDeliverables(inactive);
            setPendingDeliverablesCount(pending);
            setCompletedDeliverables(completed);
            setOverdueDeliverables(overdue);
            setOnTimeDeliverables(onTime);
            setLateDeliverables(late);

            // Preparar datos para Performance Chart - SE MANTIENE
            const sortedPerformanceMonths = Object.keys(dataByMonthForPerformance).sort();
            setPerformanceChartData({
                labels: sortedPerformanceMonths.map(monthKey => {
                    const [year, mon] = monthKey.split('-');
                    return `${monthShortNames[parseInt(mon) - 1]} ${year.substring(2)}`;
                }),
                datasets: [
                    {
                        label: 'Completados a Tiempo',
                        data: sortedPerformanceMonths.map(month => dataByMonthForPerformance[month].completedOnTime),
                        borderColor: chartColors.primary,
                        backgroundColor: chartColors.primary + '33', // 20% alpha
                        tension: 0.1,
                        fill: false,
                    },
                    {
                        label: 'Completados Tarde',
                        data: sortedPerformanceMonths.map(month => dataByMonthForPerformance[month].completedLate),
                        borderColor: chartColors.secondary,
                        backgroundColor: chartColors.secondary + '33',
                        tension: 0.1,
                        fill: false,
                    },
                ],
            });

            // AÑADIDO: Preparar datos para el gráfico de Contrato y Estado
            const contractNames = Object.keys(contractStateCounts).sort();
            // Filtramos "Seleccione opción" y "Desconocido" de los labels de estado a mostrar
            const allStateLabels = delStateList.map(s => s.label).filter(label => label !== "Seleccione opción");

            // Mapeo de estados a índices de color específicos o secuenciales
            // Esto replica la lógica de colores del ContractStateChart original
            const stateColorMap = {
                "No entregado": chartColors.colorError,     // Rojo
                "Entregado a tiempo sin incidencias": chartColors.primary,       // Azul primario
                "Entregado tarde sin incidencias": chartColors.tertiary,      // Amarillo/Oro
                "Entregado a tiempo con incidencias": chartColors.secondary,     // Azul secundario
                "Entregado tarde con incidencias": chartColors.darkBlue,      // Azul más oscuro
                "Entregado en revisión": chartColors.lightBlue,     // Azul muy claro
                "Aceptado y cerrado": chartColors.blueTable,     // Azul vibrante
                "Desconocido": chartColors.customGray1,   // Gris claro fallback
            };

            const contractStateDatasets = allStateLabels.map((stateLabel) => {
                const backgroundColor = stateColorMap[stateLabel] || customChartColors[0];
                const borderColor = backgroundColor;

                return {
                    label: stateLabel,
                    data: contractNames.map(contractName => contractStateCounts[contractName][stateLabel] || 0),
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 1,
                };
            });

            setContractStateChartData({
                labels: contractNames,
                datasets: contractStateDatasets,
            });
            // FIN AÑADIDO: Preparar datos para el gráfico de Contrato y Estado

        } else {
            setTotalDeliverables(0);
            setActiveDeliverables(0);
            setInactiveDeliverables(0);
            setPendingDeliverablesCount(0);
            setCompletedDeliverables(0);
            setOverdueDeliverables(0);
            setOnTimeDeliverables(0);
            setLateDeliverables(0);
            setPerformanceChartData({ labels: [], datasets: [] });
            setContractStateChartData({ labels: [], datasets: [] }); // AÑADIDO: Limpiar datos del gráfico de Contrato y Estado
        }
    }, [deliverables, delStateList, delPriority]); // Añadir delStateList y delPriority a dependencias del useEffect

    // --- Lógica para preparar los datos de la gráfica por ESTADO ---
    const stateCounts = {};
    if (deliverables) {
        deliverables.forEach((del) => {
            const stateId = parseInt(del.del_state);
            if (!isNaN(stateId)) {
                stateCounts[stateId] = (stateCounts[stateId] || 0) + 1;
            }
        });
    }

    const stateLabels = delStateList.map((state) => state.label);
    const stateData = delStateList.map(
        (state) => stateCounts[state.value] || 0
    );

    const stateChartData = {
        labels: stateLabels,
        datasets: [
            {
                label: "Número de Entregables",
                data: stateData,
                backgroundColor: customChartColors.slice(0, stateLabels.length),
                borderColor: customChartColors.slice(0, stateLabels.length),
                borderWidth: 1,
            },
        ],
    };

    const stateChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Distribución de Entregables por Estado",
                font: {
                    size: 24  // <-- aquí indicas el tamaño en píxeles
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || "";
                        if (label) {
                            label += ": ";
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y;
                        }
                        return label;
                    },
                },
            },
        },
    };

    // --- Lógica para preparar los datos de la gráfica por PRIORIDAD ---
    const priorityCounts = {};
    if (deliverables) {
        deliverables.forEach((del) => {
            const priorityId = parseInt(del.del_priority);
            if (!isNaN(priorityId)) {
                priorityCounts[priorityId] = (priorityCounts[priorityId] || 0) + 1;
            }
        });
    }

    const priorityLabels = delPriority.map((p) => p.label);
    const priorityData = delPriority.map((p) => priorityCounts[p.value] || 0);

    const priorityChartData = {
        labels: priorityLabels,
        datasets: [
            {
                label: "Número de Entregables",
                data: priorityData,
                backgroundColor: pieChartColors.slice(0, priorityLabels.length),
                borderColor: pieChartColors.slice(0, priorityLabels.length),
                borderWidth: 1,
            },
        ],
    };

    const priorityChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Distribución de Entregables por Prioridad",
                font: {
                    size: 24  // <-- aquí indicas el tamaño en píxeles
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                    // Para gráficas Pie, el valor numérico está en context.raw
                    const value = context.raw;
                    const label = context.label || '';

                    // Calcula el porcentaje
                    let sum = 0;
                    let dataArr = context.chart.data.datasets[0].data;
                    sum = dataArr.reduce((a, b) => a + b, 0);
                    const percentage = ((value * 100) / sum).toFixed(2); // Formatea a 2 decimales

                    return `${label}: ${value} (${percentage}%)`;
                  },
                },
            },
        },
    };

    // --- Lógica para preparar los datos de la gráfica Mensual ---
    const monthlyCounts = {};
    const monthShortNames = [
        "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
        "jul.", "ago.", "sep.", "oct.", "nov.", "dic."
    ];
    if (deliverables) {
        deliverables.forEach((d) => {
            if (d.timeline?.due_date) {
                try {
                    const date = new Date(d.timeline.due_date);
                    if (!isNaN(date.getTime())) {
                        const month = monthShortNames[date.getMonth()];
                        const year = date.getFullYear();
                        const label = `${month} ${year}`;
                        monthlyCounts[label] = (monthlyCounts[label] || 0) + 1;
                    }
                } catch (e) {
                    console.error(
                        "Error al parsear la fecha de vencimiento:",
                        d.timeline.due_date,
                        e
                    );
                }
            }
        });
    }

    const sortedLabels = Object.keys(monthlyCounts).sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const monthOrder = {
            "ene.": 0, "feb.": 1, "mar.": 2, "abr.": 3, "may.": 4, "jun.": 5,
            "jul.": 6, "ago.": 7, "sep.": 8, "oct.": 9, "nov.": 10, "dic.": 11
        };
        const dateA = new Date(parseInt(yearA), monthOrder[monthA], 1);
        const dateB = new Date(parseInt(yearB), monthOrder[monthB], 1);
        return dateA - dateB;
    });

    const chartDataByMonth = {
        labels: sortedLabels,
        datasets: [
            {
                label: "Entregables que vencen por mes",
                data: sortedLabels.map((label) => monthlyCounts[label]),
                backgroundColor: "rgba(59, 130, 246, 1)",
            },
        ],
    };

    const monthlyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Entregables que vencen por mes",
                font: {
                    size: 24  // <-- aquí indicas el tamaño en píxeles
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || "";
                        if (label) {
                            label += ": ";
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y;
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Mes y Año",
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Número de Entregables",
                },
                ticks: {
                    callback: function (value) {
                        if (value % 1 === 0) {
                            return value;
                        }
                    }
                }
            },
        },
    };

    // Opciones para el Performance Chart (se mantienen)
    const performanceOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Rendimiento de Entregables Completados',
                font: {
                    size: 24  // <-- aquí indicas el tamaño en píxeles
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Número de Entregables',
                },
                ticks: {
                    callback: function (value) {
                        if (value % 1 === 0) {
                            return value;
                        }
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Mes',
                },
            },
        },
    };

    // AÑADIDO: Opciones para el gráfico de Contrato y Estado (del ContractStateChart original)
    const contractStateChartOptions = {
        indexAxis: 'y', // Hace las barras horizontales
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Entregables por Contrato y Estado',
                font: {
                    size: 24  // <-- aquí indicas el tamaño en píxeles
                }
            },
        },
        scales: {
            x: {
                stacked: true, // Apila las barras de estados para cada contrato
                title: {
                    display: true,
                    text: 'Cantidad de Entregables',
                },
                ticks: { // Añadir ticks para que muestre solo números enteros
                    callback: function (value) {
                        if (value % 1 === 0) {
                            return value;
                        }
                    }
                }
            },
            y: {
                stacked: true, // Apila las barras de estados para cada contrato
                title: {
                    display: true,
                    text: 'Contrato',
                },
            },
        },
    };

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <Modal size="lg" setOpen={SetOpenModal} open={openModal}>
                <div className="p-3">
                    <InteractiveTable
                        parameterId={'id'}
                        parameterState={'state'}
                        rowsPerPage={7}
                        data={filteredData}
                    />
                </div>
            </Modal>
            {/* --- CUADROS DE RESUMEN (TARJETAS) - ahora usando KpiCard para estilo consistente con Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
                <Link to={'/Contract/deliverables'}>
                    <KpiCard title="Total Entregables" value={totalDeliverables} icon={<span className="material-symbols-outlined">fact_check</span>} />
                </Link>

                <div onClick={() => handleOpenModal(1)}>
                    <KpiCard title="Entregables Activos" value={activeDeliverables} icon={<span className="material-symbols-outlined">task_alt</span>} />
                </div>

                <div onClick={() => handleOpenModal(2)}>
                    <KpiCard title="Entregables Inactivos" value={inactiveDeliverables} icon={<span className="material-symbols-outlined">block</span>} />
                </div>

                <KpiCard title="Entregables Pendientes" value={pendingDeliverablesCount} icon={<span className="material-symbols-outlined">pending_actions</span>} />

                <KpiCard title="Entregables Completados" value={completedDeliverables} icon={<span className="material-symbols-outlined">done_all</span>} />

                <KpiCard title="Entregables Atrasados" value={overdueDeliverables} icon={<span className="material-symbols-outlined">error</span>} />

                <KpiCard title="Entregados a Tiempo" value={onTimeDeliverables} icon={<span className="material-symbols-outlined">fact_check</span>} />

                <KpiCard title="Entregados Tarde" value={lateDeliverables} icon={<span className="material-symbols-outlined">fact_check</span>} />
            </div>

            <h2 className="text-2xl font-bold mb-6 text-center text-titleBlue">
                Análisis de Entregables
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfica por Estado */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    {stateChartData.labels.length > 0 && stateChartData.datasets[0]?.data?.length > 0 ? (
                        <Bar key={JSON.stringify(stateChartData.labels)} data={stateChartData} options={stateChartOptions} />
                    ) : (
                        <p className="text-gray-500">No hay datos para mostrar.</p>
                    )}
                </div>

                {/* Gráfica por Prioridad */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    {priorityChartData.labels.length > 0 && priorityChartData.datasets[0]?.data?.length > 0 ? (
                        <Pie key={JSON.stringify(priorityChartData.labels)} data={priorityChartData} options={priorityChartOptions} />
                    ) : (
                        <p className="text-gray-500">No hay datos para mostrar.</p>
                    )}
                </div>
                {/* Gráfica Mensual (Entregables que vencen) */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    {chartDataByMonth.labels.length > 0 && chartDataByMonth.datasets[0]?.data?.length > 0 ? (
                        <Bar key={JSON.stringify(chartDataByMonth.labels)} data={chartDataByMonth} options={monthlyChartOptions} />
                    ) : (
                        <p className="text-gray-500">No hay datos para mostrar.</p>
                    )}
                </div>

                {/* Gráfica de Rendimiento de Entregables */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    {performanceChartData.labels.length > 0 && performanceChartData.datasets.some(dataset => dataset.data.some(d => d > 0)) ? (
                        <Line key={JSON.stringify(performanceChartData.labels)} data={performanceChartData} options={performanceOptions} />
                    ) : (
                        <p className="text-gray-500">No hay datos de entregables completados para mostrar el rendimiento.</p>
                    )}
                </div>

                {/* AÑADIDO: Aquí se integra la gráfica de Contrato y Estado directamente */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm h-96">
                    {contractStateChartData.labels.length > 0 && contractStateChartData.datasets.some(dataset => dataset.data.some(d => d > 0)) ? (
                        <Bar key={JSON.stringify(contractStateChartData.labels)} data={contractStateChartData} options={contractStateChartOptions} />
                    ) : (
                        <p className="text-gray-500">Cargando datos del gráfico de Contrato y Estado o no hay datos para mostrar.</p>
                    )}
                </div>
                {/* FIN AÑADIDO: Gráfica de Contrato y Estado */}
            </div>
        </div>
    );
}

export default DeliverablesChart;