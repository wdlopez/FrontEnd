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

// Componentes de sub-pestañas (Descomentar según uso)
// import ServiceIndex from "../SLAServices";
// import SLAsIndex from "../../SLAs/SLA";
// import Deliverables from "../../Deliverables";


const NAV_ITEMS = [
    { key: "contract", label: "Contratos" },
    { key: "Service", label: "Servicios" },
    { key: "SLAs", label: "SLAs" },
    { key: "E&O", label: "E&O" },
];

function ContractPage() {
    const { id_client } = useParams();
    const [activeTab, setActiveTab] = useState('contract');
    const [isActiveToggle, setIsActiveToggle] = useState(false);
    
    // Estado para controlar el Modal (Igual que en Clientes)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", type: "" });

    // Hook de datos
    const { loading, data, refresh } = useContracts(id_client, isActiveToggle);

    // Mapeo de datos para la tabla
    const tableData = data.contracts.map(d => ({
        id: d.cont_id,
        "#": d.virtual_id,
        "Nombre Clave": d.contract_key_name,
        "Cliente": d.client?.client_name || d.client,
        "Proveedor": d.provider?.prov_name || d.provider,
        "Fin": d.end_date,
        "Estado": d.status_label,
        state: d.cont_active
    }));

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
                            <InfoTooltip size="sm" message={getText("contractsIntro")} sticky={true}>
                                <span className="material-symbols-outlined text-gray-400">info</span>
                            </InfoTooltip>
                            <h1 className="text-2xl font-bold text-titleBlue">Gestión De Contratos</h1>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <InteractiveTable
                            data={tableData}
                            loading={loading}
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
                            // Aquí puedes añadir onEdit o onDelete siguiendo el patrón de InteractiveTable
                        />
                    </div>
                </div>
            )}

            {/* Sub-vistas de las pestañas */}
            {/* {activeTab === "Service" && <ServiceIndex />}
            {activeTab === "SLAs" && <SLAsIndex />}
            {activeTab === "E&O" && <Deliverables />} */}

            {/* MODAL UNIFICADO: Lógica de formulario y servicios encapsulada */}
            <AddContractModal 
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                clientSelectedId={id_client}
                onSuccess={refresh} // Recarga la tabla al crear con éxito
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