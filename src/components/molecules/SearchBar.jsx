import React from "react";
import { useForm } from "react-hook-form";
import Button from 'components/atoms/Button';

function SearchBar ({ onSearch }){
    // 1. Inicializamos el hook useForm
    const { register, handleSubmit, reset } = useForm();

    // 2. Esta función recibe los datos ya procesados por la librería
    const onSubmit = (data) => {
        // 'data' será un objeto: { parameter: "valor escrito" }
        console.log(data.parameter);
        
        // Limpiamos el formulario
        reset();
    };

    return (
        <form 
            // 3. handleSubmit gestiona el e.preventDefault() automáticamente
            onSubmit={handleSubmit(onSubmit)} 
            className="flex items-center bg-gradient-to-r from-blue-50 to-white border border-blue-500 rounded-lg overflow-hidden w-full max-w-md"
        >
            <input
                // 4. Usamos 'register' para conectar el input con el hook. 
                // El string "parameter" será el nombre de la propiedad en el objeto data.
                {...register("parameter")}
                
                placeholder="Buscar"
                type="text"
                className="flex-grow px-4 py-1 text-gray-700 bg-transparent outline-none"
            />
           <Button onClick={() => onSearch("buscando...")}>Buscar</Button>
        </form>
    );
}

export default SearchBar;