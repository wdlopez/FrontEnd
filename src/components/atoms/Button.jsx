  import React from 'react';

  const Button = ({ children, type = "primary", className, ...props }) => {
    
    const baseStyle = "px-4 py-2 rounded font-bold transition-colors w-full";
    
    const primaryStyles = "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400";
    const secondaryStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-400";
    
    const styles = type === "primary" ? primaryStyles : secondaryStyles;
    
    const isDisabled = props.disabled; 
    
    const cursorStyle = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';

    return (
      <button 
        className={`${baseStyle} ${styles} ${cursorStyle} ${className || ''}`} 
        {...props}
      >
        {children}
      </button>
    );
  };

  export default Button;