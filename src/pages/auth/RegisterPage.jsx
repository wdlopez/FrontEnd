import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SignUpForm from '../../components/organisms/Forms/SignUpForm';
import AuthService from '../../services/auth/auth.service';
import Swal from 'sweetalert2';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState(false);

  const handleRegister = async (data) => {
    setLoading(true);
    setRegisterError(false)
    try {
        const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      termsAccepted: true
    };
      // El payload debe coincidir con SignUpRequestDto del backend
      const response = await AuthService.register(payload);
      
      if (response) {
        await Swal.fire('¡Éxito!', 'Usuario registrado correctamente. Ahora puedes iniciar sesión.', 'success');
        navigate('/login');
      }
    } catch (err) {
      setRegisterError(true);
      const errorMsg = err.response?.data?.message || "Error al registrar usuario";
      Swal.fire('Error', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Registro de Usuario</h2>
        
        <SignUpForm onSubmit={handleRegister} isLoading={loading} hasError={registerError} />
        
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;