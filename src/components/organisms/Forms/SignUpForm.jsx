import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../atoms/Button";
import FormField from "../../molecules/FormField";
import Captcha from "../../atoms/Captcha";

const SignUpForm = ({ onSubmit, isLoading, hasError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password");
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const [captchaError, setCaptchaError] = useState(null);

  useEffect(() => {
    if (hasError && captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaToken(null);
    }
  }, [hasError]);

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
    if(token) setCaptchaError(null);
  };

  const onFormSubmit = (data) => {
    if (!captchaToken) {
        setCaptchaError("Es necesario completar el captcha.");
        return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      {/* Nombre y Apellido en una fila */}
      <div className="flex gap-2">
        <div className="flex-1">
          <FormField
            label="Nombre"
            placeholder="Ej: Juan"
            {...register("firstName", { required: "Nombre requerido" })}
          />
          {errors.firstName && (
            <span className="text-red-500 text-xs">
              {errors.firstName.message}
            </span>
          )}
        </div>
        <div className="flex-1">
          <FormField
            label="Apellido"
            placeholder="Ej: Pérez"
            {...register("lastName", { required: "Apellido requerido" })}
          />
          {errors.lastName && (
            <span className="text-red-500 text-xs">
              {errors.lastName.message}
            </span>
          )}
        </div>
      </div>

      {/* Email (Sustituye al username según el log del back) */}
      <div>
        <FormField
          label="Correo Electrónico"
          type="email"
          placeholder="usuario@correo.com"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Formato de email inválido",
            },
          })}
        />
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <FormField
          label="Contraseña"
          type="password"
          placeholder="********"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: { value: 8, message: "Mínimo 8 caracteres" },
          })}
        />
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Confirmar Contraseña (Requerido por el back) */}
      <div>
        <FormField
          label="Confirmar Contraseña"
          type="password"
          placeholder="********"
          {...register("confirmPassword", {
            required: "Debes confirmar la contraseña",
            validate: (value) =>
              value === password || "Las contraseñas no coinciden",
          })}
        />
        {errors.confirmPassword && (
          <span className="text-red-500 text-xs">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {/* Captcha Integrado */}
      <div className="flex flex-col items-center mt-2">
         <Captcha ref={captchaRef} onChange={onCaptchaChange} />
         {captchaError && <span className="text-red-500 text-xs font-bold mt-1">{captchaError}</span>}
      </div>

      <div className="flex items-start gap-2 mt-2">
        <input
          type="checkbox"
          id="acceptedTerms"
          className="mt-1"
          {...register("acceptedTerms", {
            required: "Debes aceptar los términos y condiciones",
          })}
        />
        <label htmlFor="acceptedTerms" className="text-sm text-gray-600">
          Acepto los términos y condiciones de ContractX.
        </label>
      </div>
      {errors.acceptedTerms && (
        <span className="text-red-500 text-xs">
          {errors.acceptedTerms.message}
        </span>
      )}

      <Button type="submit" disabled={isLoading} className="mt-4">
        {isLoading ? "Registrando..." : "Crear Cuenta"}
      </Button>
    </form>
  );
};

export default SignUpForm;
