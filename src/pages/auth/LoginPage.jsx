import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Asegúrate de instalar react-router-dom
import LoginForm from '../../components/organisms/Forms/LoginForm';
import { useAuth } from '../../context/AuthContext'; // Importamos el hook
// Importa tus imágenes aquí desde ../assets/images/

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Usamos la función del contexto
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const success = await login(credentials); // Delegamos al Contexto
      
      if (success) {
        navigate('/home'); // O a /dashboard
      } else {
        setError("No se pudo iniciar sesión. Verifique sus credenciales.");
      }
    } catch (err) {
      console.error(err);
      // Extraemos el mensaje de error del backend si existe
      const msg = err.response?.data?.message || "Credenciales inválidas o error de conexión";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Sección Izquierda (Imagen/Branding) */}
      <div className="hidden md:flex flex-col flex-1 bg-blue-900 justify-center px-10 text-white">
        <h1 className="font-bold text-5xl pb-6">CONTRACTX</h1>
        <hr className="border-t-2 border-white w-20 mb-4" />
        <p className="text-xl">Gestión inteligente de contratos.</p>
      </div>

      {/* Sección Derecha (Formulario) */}
      <div className="flex flex-1 justify-center items-center bg-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Ingreso al sistema</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={loading} />
          
          <div className="mt-4 text-center">
            <button onClick={() => console.log("Abrir modal")} className="text-blue-500 text-sm hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;