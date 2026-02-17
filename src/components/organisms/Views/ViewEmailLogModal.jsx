import React from "react";
import Modal from "../../molecules/Modal";

const ViewEmailLogModal = ({ isOpen, setIsOpen, logData }) => {
  if (!logData) return null;

  return (
    <Modal size="lg" open={isOpen} setOpen={setIsOpen}>
      <div className="flex gap-2 items-center mb-6 border-b pb-4">
        <span className={`material-symbols-outlined ${logData.success ? 'text-green-500' : 'text-red-500'}`}>
          {logData.success ? 'check_circle' : 'error'}
        </span>
        <h2 className="text-xl font-bold text-gray-800">Detalle del Envío</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500 font-medium">Destinatario:</p>
          <p className="text-gray-900">{logData.email_to}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium">Tipo de Notificación:</p>
          <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs font-bold uppercase">
            {logData.notif_type}
          </span>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500 font-medium">Asunto:</p>
          <p className="text-gray-900 font-semibold">{logData.subject}</p>
        </div>
      </div>

      {/* Mensaje de Error si falló */}
      {!logData.success && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-800 font-bold text-xs uppercase mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span> Error Técnico:
          </p>
          <p className="text-red-700 text-sm font-mono">{logData.error_message || 'Error desconocido en el servidor SMTP'}</p>
        </div>
      )}

      {/* Cuerpo del Correo */}
      <div className="space-y-2">
        <p className="text-gray-500 font-medium text-sm">Contenido del Mensaje:</p>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-60 overflow-y-auto shadow-inner text-sm text-gray-700 whitespace-pre-wrap">
          {logData.body}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={() => setIsOpen(false)}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cerrar Visor
        </button>
      </div>
    </Modal>
  );
};

export default ViewEmailLogModal;