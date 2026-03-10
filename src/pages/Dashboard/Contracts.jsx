import WelcomeWidget from "./components/WelcomeWidget";

function WelcomeContract({ count = 0 }) {
  // Tarjeta resumida para acceso a contratos, consistente con otros widgets
  return (
    <WelcomeWidget
      title="Contratos"
      message={
        count > 0
          ? "Consulta y administra los contratos globales."
          : "Configura tu primer contrato para habilitar los dashboards."
      }
      buttonText="Ir a Contratos"
      linkTo="/contract/general"
      count={count}
      variant="summary"
      icon="description"
    />
  );
}

export default WelcomeContract;