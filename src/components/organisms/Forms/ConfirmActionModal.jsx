import React from "react";
import Modal from "../../molecules/Modal";

function ConfirmActionModal({ 
  isOpen, 
  setIsOpen, 
  data, 
  onConfirm, 
  loading = false, 
  entityName = "registro" 
}) {
  const isDelete = data?.state === true; 

  return (
    <Modal open={isOpen} setOpen={setIsOpen}>
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          {isDelete ? "Confirmar Eliminación" : "Confirmar Reactivación"}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isDelete
            ? `¿Estás seguro de que deseas eliminar el ${entityName} "${data?.name || 'sin nombre'}"? Esta acción podría no deshacerse inmediatamente.`
            : `¿Estás seguro de que deseas reactivar el ${entityName} "${data?.name || 'sin nombre'}"?`}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={() => onConfirm(data)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              isDelete
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-sm">
                  refresh
                </span>
                Procesando...
              </span>
            ) : isDelete ? (
              "Eliminar"
            ) : (
              "Reactivar"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmActionModal;