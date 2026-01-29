import logo from "../../assets/images/it_experts_sin fondo.png";
import React, { useState, useEffect } from "react";
import Form from "../../components/organisms/Forms/Form";
import Modal from "../../components/molecules/Modal";
import Alert from "../../components/molecules/Alerts";
import AuthService from "../../services/auth/auth.service";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. Extraer el token ANTES de inicializar cualquier estado
  const tokenFromUrl = searchParams.get("token") || "";

  // 2. Ahora sí, inicializar estados usando esa constante
  const [initialToken] = useState(tokenFromUrl);
  const [modalReset, setModalReset] = useState(!!tokenFromUrl);
  
  const [openAlert, setOpenAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ message: "", type: "" });

  // 3. Limpiar la URL si entramos por link de correo
  useEffect(() => {
    if (tokenFromUrl) {
      // Reemplazamos la ruta para limpiar el token de la barra de direcciones
      // pero el componente ya lo tiene guardado en 'initialToken'
      navigate("/reset-password", { replace: true });
    }
  }, []); // Se ejecuta solo al montar

  const handleRequestToken = async (data) => {
    try {
      await AuthService.forgotPassword({ email: data.email });
      setAlertConfig({
        type: "success",
        message: "Si el correo existe, recibirás instrucciones de recuperación."
      });
      setOpenAlert(true);
    } catch (error) {
      setAlertConfig({
        type: "error",
        message: error.response?.data?.message || "Error al solicitar recuperación"
      });
      setOpenAlert(true);
    }
  };

  const handleResetPassword = async (data) => {
    if (isSubmitting) return;
    if (data.newPassword !== data.confirmPassword) {
      setAlertConfig({ type: "error", message: "Las contraseñas no coinciden" });
      setOpenAlert(true);
      return;
    }
    setIsSubmitting(true);

    try {
    const response = await AuthService.resetPassword({
      token: data.token || initialToken,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    });

    // ¡ESTA ES LA CLAVE! 
    // Debes revisar si la propiedad success dentro de la data es true
    if (response.success) { 
      setAlertConfig({ type: "success", message: "Contraseña actualizada con éxito." });
      setOpenAlert(true);
      setTimeout(() => navigate("/login"), 3000);
    } else {
      // Si el backend mandó un 200 pero success: false
      setAlertConfig({ type: "error", message: response.message || "Token inválido" });
      setOpenAlert(true);
      setIsSubmitting(false);
    }
  } catch (error) {
    // Aquí solo entran errores 400, 500, etc.
    setAlertConfig({
      type: "error",
      message: error.response?.data?.message || "Error de conexión"
    });
    setOpenAlert(true);
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex justify-center items-center h-full bg-gray-100 min-h-screen">
      <div className="w-full max-w-md shadow-2xl px-8 py-10 flex flex-col items-center gap-6 bg-white rounded-3xl">
        <img src={logo} alt="IT Experts Logo" className="w-48" />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">¿Olvidaste tu contraseña?</h2>
          <p className="text-gray-500 mt-2">
            Ingresa tu email y te enviaremos las instrucciones.
          </p>
        </div>

        <Form
          gridLayout={false}
          fields={[
            {
              name: "email",
              type: "email",
              label: "Correo Electrónico",
              placeholder: "ejemplo@correo.com",
              required: true
            },
          ]}
          onSubmit={handleRequestToken}
          submitText="Enviar instrucciones"
        />

        <Link to="/login" className="text-blue-600 text-sm hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>

      <Modal open={modalReset} setOpen={setModalReset}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Restablecer Contraseña</h3>
          <Form
            gridLayout={false}
            fields={[
              {
                name: "token",
                type: "text",
                label: "Token de seguridad",
                placeholder: "Pega el código recibido",
                required: true,
                defaultValue: initialToken // Aquí ya no fallará
              },
              {
                name: "newPassword",
                type: "password",
                label: "Nueva Contraseña",
                placeholder: "********",
                required: true
              },
              {
                name: "confirmPassword",
                type: "password",
                label: "Confirmar Contraseña",
                placeholder: "********",
                required: true
              },
            ]}
            onSubmit={handleResetPassword}
            submitText="Cambiar Contraseña"
          />
        </div>
      </Modal>

      <Alert
        type={alertConfig.type}
        message={alertConfig.message}
        open={openAlert}
        setOpen={setOpenAlert}
      />
    </div>
  );
}

export default ForgotPassword;