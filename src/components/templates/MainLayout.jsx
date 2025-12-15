import Navbar from 'components/organisms/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-8">
        {children}
      </main>
    </div>
  );
};
export default MainLayout;