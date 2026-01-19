import React, { useState } from "react";
import PropTypes from "prop-types";

const InfoTooltip = ({ message, children, sticky, bgColor = "bg-white", textColor = "text-black", position = 'bottom', size = 'md', maxHeight ='max-h-60' }) => {
  const [hover, setHover] = useState(false);

  // Clases para el tooltip (puedes personalizarlas)
  const tooltipClasses = `px-2 py-1 rounded ${bgColor} ${textColor} text-sm whitespace-pre-wrap`;

  // Si sticky es true, el tooltip se posiciona sticky en la parte superior; de lo contrario, se ubica justo arriba del contenido.
  const tooltipPosition = sticky
    ? "fixed top-46 text-balance z-50 w-5/6 shadow-md"
    : position === "top"
      ? "absolute mb-1 top-full text-nowrap left-1/2 transform -translate-x-1/2 z-50"
      : position === "bottom"
        ? "absolute mb-1 bottom-full text-nowrap left-1/2 transform -translate-x-1/2 z-50"
        : position === "left"
          ? "absolute mb-1 left-full text-balance left-1/2 transform -translate-x-1/2 z-50"
          : position === "right"
            ? "absolute mb-1 right-full text-balance left-1/2 transform -translate-x-1/2 z-50" : "";

  const getSizeClass = (size) => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return size;
    }
  };

  return (
    <>
      <div className={`relative ${hover ?'' :' w-md'}`}>
        {hover && (
          <div 
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`${tooltipPosition} ${tooltipClasses} ${getSizeClass(size)} ${maxHeight} overflow-y-auto`}>
            <p>{message}</p>
          </div>
        )}
      </div>
      <div
      className="relative w-min"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      >{children}</div>
    </>
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
