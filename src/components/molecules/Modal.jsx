import React from "react";
import { createPortal } from "react-dom";

export default function Modal({ 
  open, 
  setOpen, 
  children, 
  size = "md", 
  // Nuevas props para controlar el comportamiento
  hideCloseButton = false, 
  disableBackdropClick = false,
  transparent = false, // Si es true, quita el fondo blanco y padding del modal
  // Si se pasa, sera llamado cuando se solicite cerrar el modal (X o backdrop)
  // Permite que el contenido (ej. un Form) gestione confirmaciones antes de cerrar
  onRequestClose = null,
}) {
  if (!open) return null;

  const handleClose = () => {
    // Si deshabilitamos el click afuera, no hacemos nada
    if (disableBackdropClick) return;

    if (typeof onRequestClose === 'function') {
      try {
        onRequestClose();
        return;
      } catch (err) {
        // Si la función de cierre falla (por ejemplo ref indefinido), hacemos fallback
        console.error('onRequestClose threw an error:', err);
      }
    }

    setOpen(false);
  };

  const getSizeClasses = () => {
    // Clases base de posicionamiento
    let classes = "relative w-full max-h-[90vh] flex flex-col ";

    // Si NO es transparente, agregamos el estilo de tarjeta blanca habitual
    if (!transparent) {
        classes += "bg-white text-letterGray dark:bg-gray-800 dark:text-cyan-100 p-6 rounded-lg shadow-lg overflow-y-auto md:overflow-visible ";
    } else {
        // Si es transparente, solo centramos y quitamos estilos visuales
        classes += "bg-transparent p-0 rounded-none shadow-none ";
    }

    switch (size) {
      case "xxl": return classes + "sm:max-w-xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]";
      case "xl": return classes + "sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl";
      case "lg": return classes + "sm:max-w-lg md:max-w-4xl lg:max-w-5xl";
      case "md": default: return classes + "sm:max-w-md md:max-w-2xl lg:max-w-3xl";
    }
  };

  const modal = (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 w-screen backdrop-blur-sm"
      onClick={handleClose} // Aquí valida si se puede cerrar o no
    >
      <div className={getSizeClasses()} onClick={(e) => e.stopPropagation()}>
        
        {/* Solo mostramos la X del modal si NO le decimos que la esconda */}
        {!hideCloseButton && (
            <button
            className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-2xl z-10"
            onClick={() => {
              if (typeof onRequestClose === 'function') {
                try {
                  onRequestClose();
                  return;
                } catch (err) {
                  console.error('onRequestClose threw an error:', err);
                }
              }
              setOpen(false);
            }}
            aria-label="Cerrar"
            >
            &times;
            </button>
        )}
        
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}