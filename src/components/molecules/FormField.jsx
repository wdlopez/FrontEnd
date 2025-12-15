import Input from '../atoms/Input';

const FormField = ({ label, type, name, placeholder, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
      <Input type={type} name={name} placeholder={placeholder} onChange={onChange} />
    </div>
  );
};
export default FormField;