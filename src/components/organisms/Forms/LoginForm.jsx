import { useState } from 'react';
import Button from '../../atoms/Button'; // Usando el que ya tienes
import FormField from '../../molecules/FormField';

const LoginForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    user_nickname: '', // Asegúrate que coincida con el DTO del backend
    user_pss: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <FormField 
        label="Usuario" 
        name="user_nickname" 
        placeholder="Ingrese su usuario" 
        onChange={handleChange} 
      />
      <FormField 
        label="Contraseña" 
        name="user_pss" 
        type="password" 
        placeholder="Ingrese su contraseña" 
        onChange={handleChange} 
      />
      
      <div className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Acceder'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;