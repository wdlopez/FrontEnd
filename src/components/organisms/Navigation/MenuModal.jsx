import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

function MenuModal({ icon, styleBtn = '', elementsRedirect, children, size = 'md' }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  // Convertir elementsRedirect en array
  let elementsArray = [];
  if (Array.isArray(elementsRedirect)) {
    elementsArray = elementsRedirect;
  } else if (elementsRedirect && typeof elementsRedirect === 'object') {
    elementsArray = [elementsRedirect];
  }

  // Helper para obtener el ancho basado en la prop 'size'
  const getSizeClass = (size) => {
    const sizes = {
      'sm': 'w-32',
      'md': 'w-40',
      'lg': 'w-56',
      'xl': 'w-72'
    };
    return sizes[size] || size;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (menuRef.current && menuRef.current.contains(event.target)) ||
        (buttonRef.current && buttonRef.current.contains(event.target))
      ) {
        return;
      }
      setModalOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updatePos = () => {
      if (buttonRef.current) {
        const r = buttonRef.current.getBoundingClientRect();
        // Renderiza el menú debajo del botón y alineado a la izquierda
        setMenuStyle({ left: r.left, top: r.bottom + window.scrollY, minWidth: r.width });
      }
    };
    if (modalOpen) {
      updatePos();
      window.addEventListener('resize', updatePos);
      window.addEventListener('scroll', updatePos, true);
    }
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [modalOpen]);

  // ELIMINADO: const definePosition = ... (no se usaba y entraba en conflicto con el Portal)

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div className={styleBtn}>
        <button
          ref={buttonRef}
          onClick={() => setModalOpen((prev) => !prev)}
          className="flex items-center gap-3 focus:outline-none"
        >
          <span className="material-symbols-outlined dark:text-white">{icon}</span>
        </button>
      </div>
      
      {modalOpen && menuStyle && createPortal(
        <div 
          ref={menuRef} 
          style={{ 
            position: 'fixed', 
            left: menuStyle.left, 
            top: menuStyle.top, 
            zIndex: 9999, 
            minWidth: menuStyle.minWidth // Usamos el ancho del botón como mínimo
          }} 
          // AQUI: Inyectamos getSizeClass directamente para que funcione el prop 'size'
          className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg ${getSizeClass(size)}`}
        >
          {children ? (
            children
          ) : (
            <ul>
              {elementsArray.map((el, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
                  onClick={() => { setModalOpen(false); navigate(el.path); }}
                >
                  {typeof el.name === "object" ? JSON.stringify(el.name) : el.name}
                </li>
              ))}
            </ul>
          )}
        </div>, document.body)
      }
    </div>
  );
}

export default MenuModal;