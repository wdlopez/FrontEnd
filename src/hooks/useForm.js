import { useState } from "react";

export const useForm = (initialForm = {}) => {
  const [formState, setFormState] = useState(initialForm);

  const onInputChange = ({ target }) => {
    const { name, value } = target;
    setFormState({
      ...formState,
      [name]: value
    });
  };

  const onResetForm = () => {
    setFormState(initialForm);
  };

  return {
    values: formState,        // ✅ Cambiar a 'values' para claridad
    handleInputChange: onInputChange,  // ✅ Nombre consistente
    resetForm: onResetForm,
    setValues: setFormState   // Para acceso directo si lo necesitas
  };
};