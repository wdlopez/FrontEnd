import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/atoms/Button'; // Asegúrate de que esta ruta sea correcta

const WelcomeWidget = ({ 
  title, 
  message, 
  linkTo, 
  buttonText, 
  count = 0, 
  icon = "info" // Valor por defecto si no se pasa icono
}) => {

  // -----------------------------------------------------------------------
  // CASO 1: YA HAY DATOS (Modo Resumen / KPI)
  // -----------------------------------------------------------------------
  // Se muestra una tarjeta horizontal elegante con el conteo
  if (count > 0) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 font-medium">{count} Registros activos</p>
            </div>
        </div>
        <Link to={linkTo}>
          <Button variant="secondary" size="sm">Ver detalle</Button>
        </Link>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // CASO 2: NO HAY DATOS (Modo Bienvenida / Empty State)
  // -----------------------------------------------------------------------
  // Se muestra la tarjeta grande vertical con borde punteado invitando a crear
  return (
    <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 hover:border-blue-300 transition-colors duration-300">
      
      {/* Icono Circular */}
      <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-2">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800">
        {count === 0 ? `Comienza con ${title}` : title}
      </h3>
      
      <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
        {message}
      </p>
      
      {/* Botón de acción principal */}
      <Link to={linkTo} className="w-full">
        <div className="mt-2">
           {/* Usamos w-full si el botón lo permite, o dejamos que se ajuste */}
           <Button variant="primary">{buttonText || `Ir a ${title}`}</Button>
        </div>
      </Link>
    </div>
  );
};

export default WelcomeWidget;