import React, { forwardRef } from 'react';

// 1. Envolvemos todo el componente dentro de forwardRef(...)
const Input = forwardRef(({ type = "text", className, ...props }, ref) => {
  return (
    <input ref={ref}
      type={type}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
      {...props} 
    />
  );
});

Input.displayName = 'Input';

export default Input;