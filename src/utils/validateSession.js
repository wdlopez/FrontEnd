import api from "../api/axiosInstance";

const getValidate = async () => { // <-- Agregar "async"
    try {
        const { data } = await api.get(`/validate/session`); // Ya no necesitas baseUrl
        return data;
    } catch (error) {
        throw error;
    }
    // const baseUrl = process.env.REACT_APP_BASE_URL_GATEAWAY;
    // try {
    //     const data  = await axios.get(`${baseUrl}/validate/session`, { // <-- Agregar "await"
    //         withCredentials: true, // Asegura que las cookies se envíen correctamente
    //         headers: {
    //             "Content-Type": "application/json", // Asegura que el servidor reciba JSON
    //         },
    //     });
    //     return data;
    // } catch (error) {
    //     console.error("Error :", error);
    //     throw error;
    // }
};

export default { getValidate };
