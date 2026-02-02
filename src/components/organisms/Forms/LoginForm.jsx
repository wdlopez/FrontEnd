import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../atoms/Button';
import FormField from '../../molecules/FormField';
import Captcha from '../../atoms/Captcha';

const LoginForm = ({ onSubmit, isLoading, hasError }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  // Estado local para el token del captcha
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const [captchaError, setCaptchaError] = useState(null);


  useEffect(() => {
    if (hasError && captchaRef.current) {
        captchaRef.current.reset();
    }
  }, [hasError]);

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (token) setCaptchaError(null);
  };

  const onFormSubmit = (data) => {
    if (!captchaToken) {
        setCaptchaError("Por favor, completa el captcha.");
        return;
    }
    
    // Enviamos todo junto
    onSubmit(data);
    setCaptchaToken(null);
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

      {/* Integración del Captcha */}
      <div className="flex flex-col items-center">
        <Captcha ref={captchaRef} onChange={onCaptchaChange} />
        {captchaError && (
            <span className="text-red-500 text-xs font-bold">{captchaError}</span>
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