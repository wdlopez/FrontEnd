import React, { useEffect } from "react";

export default function Alert({ open, setOpen, message, type }) {
    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        let timer;
        if (open) {
            timer = setTimeout(() => setOpen(false), 3600); // Cerrar después de 4 segundos solo si está abierto
        }
        return () => clearTimeout(timer); // Limpiar el timer al desmontar o al cambiar el estado
    }, [open, setOpen]);

    const getAlertStyle = () => {
        switch (type) {
            case "success":
                return "bg-blue-100 border-blue-500 text-blue-800";
            case "error":
                return "bg-yellow-100 border-yellow-500 text-yellow-800";
            default:
                return "bg-gray-100 border-gray-500 text-gray-800";
        }
    };

    if (!open) return null; // No renderizar nada si el modal no está abierto

    return (
        <div
            style={{zIndex:100}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100"
            onClick={handleClose}
        >
            <div
                className={`relative w-full max-w-md p-4 border rounded-lg shadow-lg ${getAlertStyle()}`}
                onClick={(e) => e.stopPropagation()} // Evitar que el evento cierre al hacer clic dentro del modal
            >
                <button
                    className="absolute top-2 right-2 text-xl text-gray-800 hover:text-gray-600"
                    onClick={handleClose}
                >
                    ✖
                </button>
                <p className="py-4">{message}</p>
            </div>
        </div>
    );
}
