import React from "react";
import Modal from "../../molecules/Modal";

/**
 * Modal genérico de confirmación de acciones (eliminar / restaurar / otras).
 *
 * Nueva API recomendada:
 * - isOpen: boolean
 * - onClose: () => void
 * - onConfirm: () => void | Promise<void>
 * - title: string
 * - message: string
 * - isDangerous: boolean   (true = acción destructiva, botón rojo)
 * - loading?: boolean
 * - confirmLabel?: string
 * - cancelLabel?: string
 *
 * Compatibilidad hacia atrás:
 * - Soporta aún: setIsOpen, data, entityName
 * - Si no se proveen title/message/isDangerous, se derivan desde data.state y entityName
 */
function ConfirmActionModal({
  // Nueva API
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDangerous,
  loading = false,
  confirmLabel,
  cancelLabel,

  // Props legadas (backwards compatible)
  setIsOpen,
  data,
  entityName = "registro",
}) {
  const isLegacyDelete = data?.state === true;

  const resolvedIsDangerous =
    typeof isDangerous === "boolean" ? isDangerous : !!isLegacyDelete;

  const resolvedTitle =
    title ||
    (data
      ? isLegacyDelete
        ? "Confirmar Eliminación"
        : "Confirmar Reactivación"
      : "Confirmar Acción");

  const entityLabel = entityName || "registro";
  const itemName = data?.name || "sin nombre";

  const resolvedMessage =
    message ||
    (data
      ? isLegacyDelete
        ? `¿Estás seguro de que deseas eliminar el ${entityLabel} "${itemName}"? Esta acción podría no deshacerse inmediatamente.`
        : `¿Estás seguro de que deseas reactivar el ${entityLabel} "${itemName}"?`
      : "¿Estás seguro de que deseas continuar con esta acción?");

  const resolvedConfirmLabel =
    confirmLabel ||
    (data
      ? isLegacyDelete
        ? "Eliminar"
        : "Reactivar"
      : resolvedIsDangerous
      ? "Eliminar"
      : "Restaurar");

  const resolvedCancelLabel = cancelLabel || "Cancelar";

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    if (!onConfirm) return;
    // Compatibilidad: muchos handlers históricos esperan recibir `data`
    return onConfirm(data);
  };

  return (
    <Modal open={isOpen} setOpen={handleClose}>
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          {resolvedTitle}
        </h2>

        <p className="text-gray-600 mb-6">{resolvedMessage}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {resolvedCancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              resolvedIsDangerous
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-sm">
                  refresh
                </span>
                Procesando...
              </span>
            ) : (
              resolvedConfirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmActionModal;