import React, { useState, useEffect } from "react";
import Modal from "../../molecules/Modal"; 
import Form from "../Forms/Form"; 
import InfoTooltip from "../../atoms/InfoToolTip"; 
import { getText } from "../../../utils/text";
import ClientService from '../../../services/Clients/client.service';
import ProviderService from '../../../services/Providers/provider.service';
import ContractService from "../../../services/Contracts/contract.service";
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';

const AddContractModal = ({ isOpen, setIsOpen, onSuccess, clientSelectedId }) => {
    const { user } = useAuth(); 
    const [loading, setLoading] = useState(false);
    const [catalogs, setCatalogs] = useState({
        providers: [],
        clients: []
    });

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    // Cargar Clientes y Proveedores
                    const [clientsRes, providersRes] = await Promise.all([
                        ClientService.getAllClients(),
                        ProviderService.getAllProviders()
                    ]);

                    // Normalizar respuestas (Array vs Object.data)
                    const cData = Array.isArray(clientsRes) ? clientsRes : (clientsRes.data || []);
                    const pData = Array.isArray(providersRes) ? providersRes : (providersRes.data || []);

                    setCatalogs({
                        clients: cData.map(c => ({ 
                            value: c.id, 
                            label: c.name 
                        })),
                        providers: pData.map(p => ({ 
                            value: p.id, 
                            label: p.name // Asegúrate que el back devuelva 'name' o ajusta a 'prov_name'
                        }))
                    });
                } catch (error) {
                    console.error("Error loading catalogs:", error);
                    Swal.fire('Error', 'Error al cargar listas de clientes/proveedores', 'error');
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // --- Campos del Formulario (Mapeado exacto al DTO) ---
    const contractFields = [
        {
            name: 'contract_number',
            type: 'text',
            label: 'Número de Contrato *',
            placeholder: 'Ej: CR-2026-001',
            required: true
        },
        {
            name: 'version',
            type: 'text',
            label: 'Versión',
            placeholder: '1',
            required: false // DTO: Optional
        },
        {
            name: 'keyName',
            type: 'text',
            label: 'Nombre Clave (Alias)',
            placeholder: 'Ej: Contrato Marco IT',
            required: false // DTO: Optional
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Descripción',
            placeholder: 'Detalles del contrato...',
            required: false // DTO: Optional
        },
        {
            name: 'client_id',
            type: 'select',
            label: 'Cliente *',
            options: catalogs.clients,
            required: true,
            defaultValue: clientSelectedId || ''
        },
        {
            name: 'provider_id',
            type: 'select',
            label: 'Proveedor *',
            options: catalogs.providers,
            required: true
        },
        {
            name: 'start_date',
            type: 'date',
            label: 'Fecha Inicio *',
            required: true,
            group: 'Vigencia'
        },
        {
            name: 'end_date',
            type: 'date',
            label: 'Fecha Fin *',
            required: true,
            group: 'Vigencia'
        },
        {
            name: 'total_value',
            type: 'number',
            label: 'Valor Total *',
            placeholder: '0.00',
            required: true,
            group: 'Financiero'
        },
        {
            name: 'currency',
            type: 'select',
            label: 'Moneda',
            options: [
                { value: 'USD', label: 'Dólares (USD)' },
                { value: 'COP', label: 'Pesos Col (COP)' },
                { value: 'EUR', label: 'Euros (EUR)' }
            ],
            required: false, // DTO says Optional, but good to have
            defaultValue: 'USD',
            group: 'Financiero'
        },
        {
            name: 'country',
            type: 'text', 
            label: 'País *',
            placeholder: 'Colombia',
            required: true,
            group: 'Ubicación'
        },
        {
            name: 'language',
            type: 'select',
            label: 'Idioma *',
            options: [
                { value: 'es', label: 'Español' },
                { value: 'en', label: 'Inglés' },
                { value: 'pt', label: 'Portugués' }
            ],
            required: true,
            defaultValue: 'es',
            group: 'Ubicación'
        }
    ];

    // --- Submit ---
    const handleCreateContract = async (formData) => {
        setLoading(true);
        try {
            const cleanData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [
                key, 
                value === "" ? undefined : value 
            ])
        );
            // 2. Construir Payload (CreateContractRequestDto)
            const payload = {
                ...cleanData,
                total_value: parseFloat(formData.total_value),
                status: 'draft', // Default del DTO
                created_by: user?.id,
                //approved_by: user?.id
            };

            // Validar que tengamos created_by antes de enviar
            if (!payload.created_by) {
                throw new Error("No se pudo identificar al usuario creador (created_by missing).");
            }

            // 3. Enviar al servicio (Payload + Schema para Header)
            await ContractService.createContract(payload);
            
            Swal.fire('¡Éxito!', 'Contrato creado correctamente.', 'success');
            setIsOpen(false);
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error creando contrato:', error);
            const msg = error.response?.data?.message || error.message || 'Error desconocido';
            // NestJS suele devolver un array de mensajes si falla el class-validator
            const displayMsg = Array.isArray(msg) ? msg.join(', ') : msg;
            
            Swal.fire('Error', displayMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
            <div className="flex gap-2 items-center mb-6">
                <InfoTooltip size="sm" message={getText("formCont") || "Nuevo Contrato"} sticky={true}>
                    <span className="material-symbols-outlined text-gray-400">info</span>
                </InfoTooltip>
                <h2 className="text-xl font-bold text-gray-800">Registrar Contrato</h2>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
                    <p className="mt-4 text-gray-600 font-medium">Procesando solicitud...</p>
                </div>
            ) : (
                <Form 
                    fields={contractFields} 
                    onSubmit={handleCreateContract} 
                    initialValues={{
                        currency: 'USD',
                        language: 'es',
                        client_id: clientSelectedId || ''
                    }}
                    sendMessage="Guardar Contrato"
                    gridLayout={true} 
                />
            )}
        </Modal>
    );
};

export default AddContractModal;