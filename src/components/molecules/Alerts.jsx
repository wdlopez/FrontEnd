import React, { useEffect } from "react";
import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const DEFAULT_TITLES = {
    success: "Éxitoso",
    info: "Información",
    warning: "Advertencia",
    error: "Error",
};

export default function Alert({ open, setOpen, message, type = "info", title }) {
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

    if (!open) return null; // No renderizar nada si el modal no está abierto

    const severity = ["success", "info", "warning", "error"].includes(type)
        ? type
        : "info";

    const resolvedTitle = title || DEFAULT_TITLES[severity] || "Info";

    return (
        <div
            style={{ zIndex: 100 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-md px-4"
                onClick={(e) => e.stopPropagation()} // Evitar que el evento cierre al hacer clic dentro del modal
            >
                <MuiAlert
                    severity={severity}
                    variant="filled"
                    onClose={handleClose}
                    sx={{ alignItems: "flex-start" }}
                >
                    <AlertTitle>{resolvedTitle}</AlertTitle>
                    {message}
                </MuiAlert>
            </div>
        </div>
    );
}
