import MainLayout from 'components/templates/MainLayout';
import Button from 'components/atoms/Button';

const HomePage = () => {
  return (
    <MainLayout>
      <h2 className="text-2xl font-bold mb-4">Bienvenido al Dashboard</h2>
      <p className="mb-4">Este proyecto ha sido construido con Atomic Design.</p>
      <Button type="secondary">Ver más detalles</Button>
    </MainLayout>
  );
};
export default HomePage;
