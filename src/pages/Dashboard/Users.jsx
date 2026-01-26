import AddContract from "../Contracts/General/addContract";
import AddUser from "../Users/AddUser";
import { useEffect, useState } from "react";
//import  getContractServiece from "../../services/contract-service/getContractA";
//import getUserC from "../../services/contract-service/getUsersC";
//import getUserService from "../../services/clients-service/userByClient";
import { Link } from "react-router-dom";

function WelcomeUser({ setMsg, setOpenAlert, setAlert,rol,client,provider }) {
    const [anyUser, /**setAnyUser**/] = useState(0);
    const fetchClient = async () => {
        try {
            /** 
            const users = await getUserService.getUserbyClient();

            const data = users.filter(u=>u.user_status===1);
            console.log(data);
            setAnyUser(data.length);
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
        fetchClient();
    }, [])
    return (
        <>
            {anyUser!== 0 ?
                <Link to={'/settings/userNroles'}>
                    <button className="btn btn-primary">
                        Ir a Usuarios
                    </button>
                </Link>
                :
                <AddUser setAlert={setAlert} setMsg={setMsg} setOpenAlert={setOpenAlert} welcome={true} rol={rol} client={client} provider={provider} />
            }
        </>
    );
}

export default WelcomeUser;