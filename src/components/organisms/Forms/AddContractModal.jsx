import React, { useState, useEffect } from "react";
import Modal from "../../modal";
import Form from "../../form";
import InfoTooltip from "../../infoToolTip";
import { getText } from "../../../utils/text";
//import createContractService from "../../../services/contract-service/createContract";
//import getProviderService from "../../../services/suppliers-service/getSupplier";
//import getValuesService from "../../../services/valueType-service/getTypes";
//import getClientservice from "../../../services/clients-service/getClients";
//import getUserService from "../../../services/user-services/getUsers";
//import getFilteredUserService from "../../../services/clients-service/filteredUsersbyClient";
import Swal from 'sweetalert2';

const AddContractModal = ({ isOpen, setIsOpen, onSuccess, clientSelectedId}) => {
    // --- Estados ---
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [catalogs, setCatalogs] = useState({
        providers: [],
        types: [],
        clients: [],
        users: []
    });
    /** 
    // --- Carga de Catálogos (Selects) ---
    const loadInitialData = async () => {
        setLoadingUsers(true);
        try {
            const [providersRes, typesRes, clientsRes, usersRes] = await Promise.all([
                getProviderService.getSupplier(),
                getValuesService.getValueType(),
                getClientservice.getClients(),
                getUserService.getUsers()
            ]);

            setCatalogs({
                providers: providersRes.data
                    .filter(p => p.prov_status === 1)
                    .map(p => ({ value: p.prov_id, label: p.prov_name })),
                types: typesRes.map(t => ({ 
                    value: t.typev_id, 
                    label: `${t.typev_name} ${t.typev_simbol}` 
                })),
                clients: clientsRes.data
                    .filter(c => c.client_status === 1)
                    .map(c => ({ value: c.client_id, label: c.client_name })),
                users: usersRes.data
                    .filter(u => u.user_status === true)
                    .map(u => ({ value: u.user_id, label: u.user_nickname }))
            });
        } catch (error) {
            console.error("Error al cargar datos del formulario:", error);
            Swal.fire('Error', 'No se pudieron cargar los catálogos', 'error');
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadInitialData();
    }, [isOpen]);

    // --- Lógica de Filtrado de Usuarios por Cliente ---
    const handleClientChange = async (clientId) => {
        if (!clientId) return;
        setLoadingUsers(true);
        try {
            const response = await getFilteredUserService.getFilteredUserbyClient(clientId);
            const filteredUsers = response.users || [];
            setCatalogs(prev => ({
                ...prev,
                users: filteredUsers.map(u => ({
                    value: u.user_id,
                    label: `${u.user_nickname} (${u.role?.rol_name || 'Sin Rol'})`
                }))
            }));
        } catch (error) {
            console.error("Error filtrando usuarios:", error);
        } finally {
            setLoadingUsers(false);
        }
    };
    */
    // --- Definición de Campos (Lo que antes estaba en ContractForm) ---
    const contractFields = [
        {
            name: 'contract_key_name',
            type: 'text',
            label: 'Nombre Clave',
            placeholder: 'Ej: CON-2024-ACME',
            required: true
        },
        {
            name: 'cont_description',
            type: 'textarea',
            label: 'Descripción',
            placeholder: 'Breve descripción del contrato...',
            required: true
        },
        {
            name: 'start_date',
            type: 'date',
            label: 'Fecha Inicio',
            required: true,
            group: 'Vigencia'
        },
        {
            name: 'end_date',
            type: 'date',
            label: 'Fecha Fin',
            required: true,
            group: 'Vigencia'
        },
        {
            name: 'total_value',
            type: 'number',
            label: 'Valor Total',
            placeholder: '0.00',
            required: true,
        },
        {
            name: 'typev_id',
            type: 'select',
            label: 'Moneda',
            options: catalogs.types,
            required: true
        },
        {
            name: 'provider_id',
            type: 'select',
            label: 'Proveedor',
            options: catalogs.providers,
            required: true
        },
        {
            name: 'client_id',
            type: 'select',
            label: 'Cliente',
            customSelect: true,
            options: catalogs.clients.length > 0 ? catalogs.clients : [{ value: 0, label: 'Cargando...' }],
            required: true,
        },
        {
            name: 'user_id',
            type: 'select',
            label: 'Responsable',
            options: loadingUsers ? [{ value: 0, label: "Cargando..." }] : catalogs.users,
            required: true
        }
    ];
    /** 
    // --- Envío del Formulario ---
    const handleCreateContract = async (formData) => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                user_id: parseInt(formData.user_id),
                provider_id: parseInt(formData.provider_id),
                client_id: parseInt(formData.client_id),
                typev_id: parseInt(formData.typev_id),
                status: 1,
                cont_active: 1
            };

            await createContractService.createContract(payload);
            
            Swal.fire('¡Creado!', 'El contrato ha sido registrado con éxito.', 'success');
            setIsOpen(false);
            if (onSuccess) onSuccess(); 
        } catch (error) {
            console.error('Error creando contrato:', error);
            Swal.fire('Error', 'Hubo un problema al crear el contrato.', 'error');
        } finally {
            setLoading(false);
        }
    };
    */
    return (
        <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
            <div className="flex gap-2 items-center mb-6">
                <InfoTooltip size="sm" message={getText("formCont")} sticky={true}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h2 className="text-xl font-bold text-gray-800">Agregar Nuevo Contrato</h2>
            </div>

            {loading ? (
                <div className="flex flex-col items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-titleBlue"></div>
                    <p className="mt-4 text-gray-500">Guardando contrato...</p>
                </div>
            ) : (
                <Form 
                    fields={contractFields} 
                    //onSubmit={handleCreateContract} 
                    //onSelectChange={handleClientChange}
                    initialValues={clientSelectedId ? { client_id: Number(clientSelectedId) } : {}}
                    sendMessage="Crear Contrato"
                />
            )}
        </Modal>
    );
};

export default AddContractModal;