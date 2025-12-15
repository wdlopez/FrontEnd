import SearchBar from 'components/molecules/SearchBar';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-xl font-bold text-blue-900">Mi App Atómica</h1>
      <SearchBar onSearch={(val) => console.log(val)} />
    </nav>
  );
};
export default Navbar;