import React, { forwardRef } from 'react';
import Input from '../atoms/Input';

const FormField = forwardRef(({ label, className, ...props }, ref) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <Input ref={ref} {...props} />
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;