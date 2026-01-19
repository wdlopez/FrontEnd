import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

const Toolbar = ({ message, children, bgColor = "bg-white", textColor = "text-black", position = 'bottom' }) => {
  const [hover, setHover] = useState(false);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltipStyle, setTooltipStyle] = useState(null);

  // Clases para el tooltip (puedes personalizarlas)
  const tooltipClasses = `px-2 py-1 rounded ${bgColor} ${textColor} text-sm`;

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      // default place above the element
      const top = position === 'bottom' ? r.bottom + window.scrollY : r.top + window.scrollY - 40;
      const left = r.left + window.scrollX + r.width / 2;
      setTooltipStyle({ top, left });
    };
    if (hover) {
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
    }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [hover, position]);

  return (
    <div
      className="relative inline-block"
      ref={containerRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && tooltipStyle && createPortal(
        <div ref={tooltipRef} style={{ position: 'fixed', top: tooltipStyle.top, left: tooltipStyle.left, transform: 'translateX(-50%)', zIndex: 9999 }} className={tooltipClasses}>
          <p className="text-letterGray">{message}</p>
        </div>, document.body)
      }
      <div>{children}</div>
    </div>
  );
};

Toolbar.propTypes = {
  message: PropTypes.string.isRequired,
  children: PropTypes.node,
  sticky: PropTypes.bool,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
};

Toolbar.defaultProps = {
  sticky: false,
};

export default Toolbar;
