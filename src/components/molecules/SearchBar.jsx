import React from "react";
import { useForm } from "react-hook-form";
import Button from "components/atoms/Button";

function SearchBar({ onSearch }) {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    if (onSearch) {
      onSearch(data.parameter || "");
    }
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-1 bg-white border border-gray-300 rounded-full overflow-hidden w-full max-w-sm h-9 px-2"
    >
      <input
        {...register("parameter")}
        placeholder="Buscar"
        type="text"
        className="flex-grow px-2 text-sm text-gray-700 bg-transparent outline-none"
      />
      <Button
        type="submit"
        className="!w-auto !px-3 !py-1 text-sm h-7 rounded-full"
      >
        Buscar
      </Button>
    </form>
  );
}

export default SearchBar;