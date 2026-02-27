import AddContract from "../Contracts/General/addContract";
import { useEffect, useState } from "react";
//import getContractServiece from "../../services/contract-service/getContractA";
import { Link } from "react-router-dom";
//import getUserContractService from "../../services/contract-service/getUsersC";
//import getContratService from "../../services/contract-service/getFilteredCont";

function WelcomeContract({ setMsg, setOpenAlert, setAlert, rol }) {
    const [anyContract, /**setAnyContract*/] = useState(0);
    const fetchClient = async () => {
        console.log(rol);
        try {
            /** 
            let contracts;
            if (rol == 1) {
                console.log('superadmin')
                contracts = await getContractServiece.getContractA();
            } else if (rol == 2) {
                console.log('admin de contratos')
                contracts = await getContratService.getFilterContract();
            } else {
                console.log('operativo')
                contracts=await getUserContractService.getUserContract();
                console.log(contracts);
            }
            const data = contracts.filter(d => d.cont_active === 1 || d.cont_active === true);
            console.log(data.length);
            setAnyContract(data.length);
            */
        } catch (error) {
            console.log(error.response);
            if (error.response) {
                setMsg(`${error.response.data.error.message || "Intente de nuevo"}`);
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
            {anyContract !== 0 ?
                <Link to={'/contract/general'}>
                    <button className="btn btn-primary">
                        Ir a Contratos
                    </button>
                </Link>
                :
                <AddContract rol={rol} setAlert={setAlert} setMsg={setMsg} setOpenAlert={setOpenAlert} welcome={true} />
            }
        </>
    );
}

export default WelcomeContract;