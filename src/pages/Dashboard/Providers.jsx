import { useEffect,useState } from "react";
//import getProvAc from "../../services/suppliers-service/getProvAc";
//import AddSupplier from "../Suppliers/addSuppliers";
import { Link } from "react-router-dom";

function WelcomeProv({ setMsg, setOpenAlert, setAlert }) {
    const [anyProv, /**setAnyProv*/] = useState(0);
    const fetchProv = async () => {
        try {
            /** 
             const providers = await getProvAc.getSupplierAc();
             console.log(providers.data.length);
             setAnyProv(providers.data.length);
             */
            } catch (error) {
            if (error.response) {
                setMsg(`${error.response.data.error || "Error"}: ${error.response.data.message || "Intente de nuevo"}`);
            } else {
                setMsg("Error inesperado. Verifique la conexión con el servidor.");
            }
            setAlert("error"); // Cambia el tipo de alerta a error
            setOpenAlert(true);
            console.log(error);
        }
    }
    useEffect(() => {
        fetchProv();
    }, [])
    return (<>
        {anyProv !== 0 ?
            <Link to={'/suppliers'}>
                <button className="btn btn-primary">
                    Ir a Proveedores
                </button>
            </Link>
            :
            <AddSupplier setAlert={setAlert} setMsg={setMsg} setOpenAlert={setOpenAlert} welcome={true} />
        }
    </>)
}

export default WelcomeProv;