import UsersPage from "../Users/UsersPage";
import { Link } from "react-router-dom";
import WelcomeWidget from "./components/WelcomeWidget";

function WelcomeUser({ setMsg, setOpenAlert, setAlert,rol,client,provider, count = 0 }) {
    // SIEMPRE mostrar el Widget tipo tarjeta en el Dashboard principal para mantener consistencia
    return (
        <WelcomeWidget
            title="Usuarios"
            message={count > 0 ? "Invita y gestiona usuarios del sistema." : "Comienza creando usuarios."}
            buttonText="Ir a Usuarios"
            linkTo="/settings/userNroles"
            count={count}
            icon="people"
        />
    );
}

export default WelcomeUser;