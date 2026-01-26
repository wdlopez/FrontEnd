import AddClient from "../Clients/addClients";
import { useEffect, useState } from "react";
//import getClientService from '../../services/clients-service/getClientA';
import { Link } from "react-router-dom";

function WelcomeClient({ setMsg, setOpenAlert, setAlert }) {
    const [anyClient, /**setAnyClient**/] = useState(0);
    const fetchClient = async () => {
        try {
            //const clients = await getClientService.getClientA();

            //const data = clients.data;
            //console.log(data.length);
            //setAnyClient(data.length);
        } catch (error) {
            if (error.response) {
                setMsg(`${error.response.data.error || "Error"}: ${error.response.data.message || "Intente de nuevo"}`);
            } else {
                setMsg("Error inesperado. Verifique la conexión con el servidor.");
            }
            setAlert("error"); // Cambia el tipo de alerta a error
            setOpenAlert(true);
        }
    }

    useEffect(() => {
        fetchClient();
    }, [])
    return (
        <>
            {anyClient !== 0 ?
                <Link to={'/client'}>
                    <button className="btn btn-primary">
                        Ir a Clientes
                    </button>
                </Link>
                :
                <AddClient setAlert={setAlert} setMsg={setMsg} setOpenAlert={setOpenAlert} welcome={true}/>
            }
        </>
    );
}

export default WelcomeClient;