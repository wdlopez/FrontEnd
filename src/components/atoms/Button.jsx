const Button = ({ children, onClick, type = "primary" }) => {
  const baseStyle = "px-4 py-2 rounded font-bold transition-colors";
  const styles = type === "primary" 
    ? "bg-blue-600 text-white hover:bg-blue-700" 
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button className={`${baseStyle} ${styles}`} onClick={onClick}>
      {children}
    </button>
  );
};
export default Button;