/**
 * Normaliza las respuestas inconsistentes del backend.
 * Extrae siempre un array sin importar si viene en .data.data, .items o .data.
 */
export const normalizeList = (response) => {
    if (!response) return [];
    
    // Si la respuesta ya es un array
    if (Array.isArray(response)) return response;
    
    const root = response.data || response;
    
    if (Array.isArray(root)) return root;
    if (Array.isArray(root.data)) return root.data;
    if (Array.isArray(root.items)) return root.items;
    
    return [];
};