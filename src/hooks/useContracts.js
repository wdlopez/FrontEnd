import { useState, useEffect, useCallback } from "react";
import ContractService from "../services/Contracts/contract.service";

export const useContracts = (id_client) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ contracts: [], origin: [] });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // El backend ya sabe qué schema usar por el JWT
            const response = await ContractService.getAllContracts({ 
                client_id: id_client 
            });

            const contractsList = response?.data?.items || [];

            setData({
                origin: contractsList,
                contracts: contractsList
            });
        } catch (error) {
            console.error("Error loading contracts:", error);
            setData({ contracts: [], origin: [] });
        } finally {
            setLoading(false);
        }
    }, [id_client]); // Quitamos isActive si el backend no lo filtra por query todavía

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { loading, data, refresh: loadData };
};