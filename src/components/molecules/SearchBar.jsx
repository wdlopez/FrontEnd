import Button from 'components/atoms/Button';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="flex gap-2">
      <input 
        type="text" 
        placeholder="Buscar..." 
        className="border border-gray-300 rounded px-2 py-1"
      />
      <Button onClick={() => onSearch("buscando...")}>Buscar</Button>
    </div>
  );
};
export default SearchBar;