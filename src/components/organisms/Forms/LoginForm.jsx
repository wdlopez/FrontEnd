import { useForm } from 'react-hook-form';
import Button from '../../atoms/Button';
import FormField from '../../molecules/FormField';

const LoginForm = ({ onSubmit, isLoading }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="w-full max-w-sm flex flex-col gap-4" // Flex y gap para separación vertical
    >
      {/* Campo Usuario */}
      <div className="w-full">
        <FormField 
          label="Usuario" 
          placeholder="Ingrese su usuario" 
          // Aquí conectamos react-hook-form
          {...register("username", { 
            required: "El usuario es obligatorio" 
          })}
        />
        {/* Mensaje de error */}
        {errors.username && (
          <span className="text-red-500 text-xs italic mt-1 ml-1">
            {errors.username.message}
          </span>
        )}
      </div>

      {/* Campo Contraseña */}
      <div className="w-full">
        <FormField 
          label="Contraseña" 
          type="password" 
          placeholder="Ingrese su contraseña" 
          {...register("password", { 
            required: "La contraseña es obligatoria",
            minLength: {
              value: 6,
              message: "Debe tener al menos 6 caracteres"
            }
          })}
        />
        {errors.password && (
          <span className="text-red-500 text-xs italic mt-1 ml-1">
            {errors.password.message}
          </span>
        )}
      </div>
      
      <div className="mt-6">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Cargando...' : 'Acceder'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;