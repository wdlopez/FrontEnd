import React, { useState } from "react";
import PropTypes from "prop-types";

const InfoTooltip = ({ message, children, sticky, bgColor = "bg-white", textColor = "text-black", position = 'bottom', size = 'md', maxHeight ='max-h-60' }) => {
  const [hover, setHover] = useState(false);

  // Clases para el tooltip (puedes personalizarlas)
  const tooltipClasses = `px-2 py-1 rounded ${bgColor} ${textColor} text-sm whitespace-pre-wrap`;

  // Si sticky es true, el tooltip se posiciona sticky en la parte superior; de lo contrario, se ubica junto al icono.
  // Sin text-nowrap para que los textos largos (intros de servicios, contratos, etc.) hagan wrap y no desborden.
  const tooltipPosition = sticky
    ? "fixed top-46 text-balance z-50 w-5/6 shadow-md"
    : position === "top"
      ? "absolute mb-1 top-full left-1/2 -translate-x-1/2 z-50"
      : position === "bottom"
        ? "absolute mb-1 bottom-full left-1/2 -translate-x-1/2 z-50"
        : position === "left"
          ? "absolute mb-1 left-full top-1/2 -translate-y-1/2 z-50"
          : position === "right"
            ? "absolute mb-1 right-full top-1/2 -translate-y-1/2 z-50"
            : "";

  const getSizeClass = (size) => {
    switch (size) {
      case 'sm':
        return 'max-w-sm min-w-0'; // min-w-0 evita que el contenido largo fuerce el ancho
      case 'md':
        return 'max-w-md min-w-0';
      case 'lg':
        return 'max-w-lg min-w-0';
      case 'xl':
        return 'max-w-xl min-w-0';
      default:
        return size;
    }
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <div
          className={`${tooltipPosition} ${tooltipClasses} ${getSizeClass(size)} ${maxHeight} overflow-y-auto overflow-x-hidden shadow-lg border border-gray-200`}
        >
          <p className="break-words min-w-0">{message}</p>
        </div>
      )}
      <div className="w-min">{children}</div>
    </div>
  );
};

InfoTooltip.propTypes = {
  message: PropTypes.string.isRequired,
  children: PropTypes.node,
  sticky: PropTypes.bool,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  size: PropTypes.string,
  maxHeight: PropTypes.string,
};

InfoTooltip.defaultProps = {
  sticky: false,
  size: 'md',
  maxHeight: 'max-h-60',
};

export default InfoTooltip;
