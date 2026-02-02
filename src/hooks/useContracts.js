import { useState, useEffect } from "react";

export const useContracts = (id_client, isActive) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ contracts: [], origin: [] });

    const loadData = () => {
        setLoading(true);
        // Simulamos una demora de red de 1 segundo
        setTimeout(() => {
            const fakeContracts = [
                {
                    cont_id: 1,
                    virtual_id: "CON-001",
                    contract_key_name: "Soporte Técnico Acme",
                    client: { client_name: "Acme Corp" },
                    provider: { prov_name: "Tech Solutions" },
                    end_date: "2024-12-31",
                    status_label: "Activo",
                    cont_active: 1
                },
                {
                    cont_id: 2,
                    virtual_id: "CON-002",
                    contract_key_name: "Mantenimiento Preventivo",
                    client: { client_name: "Globex" },
                    provider: { prov_name: "Safe Systems" },
                    end_date: "2025-06-15",
                    status_label: "Pendiente",
                    cont_active: 1
                }
            ];

            setData({
                origin: fakeContracts,
                contracts: fakeContracts
            });
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        loadData();
    }, [id_client, isActive]);

    // Devolvemos objetos vacíos o funciones vacías para los catálogos y el contexto
    return { 
        loading, 
        data, 
        catalogs: {}, 
        userContext: { role: 1 }, 
        refresh: loadData 
    };
};