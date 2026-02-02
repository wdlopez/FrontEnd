import ClientsPage from "../Clients/ClientsPage";
import { Link } from "react-router-dom";
import WelcomeWidget from "./components/WelcomeWidget";

function WelcomeClient({ setMsg, setOpenAlert, setAlert, count = 0 }) {
    // SIEMPRE mostrar el Widget tipo tarjeta en el Dashboard principal si estamos en modo "resumen"
    // El renderizado de la tabla completa (ClientsPage) solo debería ocurrir si NO hay datos y se quiere mostrar la pantalla de "Bienvenida para crear el primero"
    // Pero si el usuario ya está en el Dashboard viendo widgets, NO queremos que un widget se expanda a toda la tabla.
    
    // Ajuste: Si count > 0, mostramos tarjeta. Si count === 0, mostramos tarjeta de "Empty State" (que WelcomeWidget ya maneja).
    // Solo mostramos ClientsPage si explicitamente se desea la vista completa incrustada (que parece ser lo que rompía el estilo)
    
    // Para mantener consistencia con la imagen solicitada (tarjetas), usaremos siempre WelcomeWidget aquí.
    // La lógica de "ir a crear" se maneja dentro del botón del widget.
    
    return (
        <WelcomeWidget
            title="Clientes"
            message={count > 0 ? "Ver y gestionar clientes." : "Registra y gestiona todos tus clientes."}
            buttonText="Ir a Clientes"
            linkTo="/client"
            count={count}
            icon="domain"
        />
    );
}

export default WelcomeClient;