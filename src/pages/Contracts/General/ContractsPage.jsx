import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useContracts } from "../../../hooks/useContracts";
import Tabs from "../../../components/tabs";
import Breadcrumb from "../../../components/breadCrumb";
import InteractiveTable from "../../../components/interactiveTable";
import HeaderActions from "../../../components/HeaderActions";
import Alert from "../../../components/alerts";
import AddContractModal from "../../../components/organisms/Forms/AddContractModal"; 
import InfoTooltip from "../../../components/atoms/InfoToolTip"; // Importamos el componente de ayuda
import { getText } from "../../../utils/text"; // Función auxiliar para textos
import ServicePage from "../Services/ServicesPage";
import ClausesPage from "../Clauses/ClausesPage";
// Componentes de sub-pestañas (Descomentar según uso)
// import ServiceIndex from "../SLAServices";
// import SLAsIndex from "../../SLAs/SLA";
// import Deliverables from "../../Deliverables";


const NAV_ITEMS = [
    { key: "contract", label: "Contratos" },
    { key: "services", label: "Servicios" },
    { key: "clauses", label: "Clausulas" }
];

function ContractPage() {
    const { id_client } = useParams();
    const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
    const [isActiveToggle, setIsActiveToggle] = useState(false);
    
    // Estado para controlar el Modal (Igual que en Clientes)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", type: "" });

    // Hook de datos
    const { loading, data, refresh } = useContracts(id_client, isActiveToggle);

    // Mapeo de datos para la tabla
   const tableData = Array.isArray(data?.contracts) 
    ? data.contracts.map(d => ({
        id: d.id, 
        "#": d.contract_number,
        "Nombre Clave": d.keyName || 'N/A',
        "Cliente": d.client?.name || d.client_id || '...', 
        "Proveedor": d.provider?.name || d.provider_id || '...',
        "Inicio": d.start_date,
        "Fin": d.end_date,
        "Estado": d.status,
        "Moneda": d.currency,
        "Valor": d.total_value
    }))
    : [];

    // Configuración de Breadcrumb (puedes dinamizarlo con el nombre del cliente si el hook lo da)
    const breadcrumbPaths = [
        { name: "Inicio", url: "/dashboard" },
        { name: "Contratos", url: null }
    ];

    return (
        <div className="p-4">
            <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />

            {activeTab === 'contract' && (
                <div className="mt-4 space-y-4">
                    <Breadcrumb paths={breadcrumbPaths} />
                    
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <InfoTooltip size="sm" message={getText("contractsIntro") || "Gestión de contratos"} sticky={true}>
                                <span className="material-symbols-outlined text-gray-400">info</span>
                            </InfoTooltip>
                            <h1 className="text-2xl font-bold text-titleBlue">Gestión De Contratos</h1>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <InteractiveTable
                            data={tableData}
                            loading={loading}
                            // Definimos columnas explícitamente si tu tabla lo soporta, 
                            // sino usará las keys del objeto tableData
                            headerButtons={
                                <HeaderActions
                                    isActive={isActiveToggle}
                                    onToggle={() => setIsActiveToggle(!isActiveToggle)}
                                    onAdd={() => setIsModalOpen(true)}
                                    addButtonLabel="Nuevo Contrato"
                                    showExport={true}
                                    onRefresh={refresh}
                                />
                            }
                        />
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <ServicePage id_client={id_client} />
            )}

            {activeTab === 'clauses' && (
                <ClausesPage id_client={id_client} />
            )}

            {/* MODAL: Usa el componente que creamos en el paso anterior */}
            <AddContractModal 
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                clientSelectedId={id_client} // Pre-seleccionamos el cliente si estamos en su vista
                onSuccess={() => {
                    refresh(); // Recargamos la tabla al crear
                    setAlert({ open: true, message: "Contrato creado con éxito", type: "success" });
                }}
            />

            <Alert 
                open={alert.open} 
                message={alert.message} 
                type={alert.type} 
                setOpen={(o) => setAlert({...alert, open: o})} 
            />
        </div>
    );
}

export default ContractPage;