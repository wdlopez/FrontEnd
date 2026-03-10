import WelcomeWidget from "./components/WelcomeWidget";

function WelcomeProv({ count = 0 }) {
  // Mantener estilo de tarjeta homogéneo con Clientes y Usuarios
  return (
    <WelcomeWidget
      title="Proveedores"
      message={
        count > 0
          ? "Administra y consulta tus proveedores."
          : "Registra y gestiona tus proveedores."
      }
      buttonText="Ir a Proveedores"
      linkTo="/suppliers"
      count={count}
      variant="summary"
      icon="handshake"
    />
  );
}

export default WelcomeProv;