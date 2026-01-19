import React, { useState, useEffect } from "react";
import updateNotificationStatus from "../../services/notifications-service/updateNotificationStatus";
import validateSession from "../../utils/validateSession";
import useNotificationsSocket from "../../hooks/useNotificationsSocket";
import Modal from "./modal";
import getOneContractService from "../../services/contract-service/getOneContract";
import Form from "./form";
//import reviewDeliverableService from "../../services/workflow-service/reviewDeliverable";

export default function NotificationsList() {
  const [userId, setUserId] = useState(null);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRawNotif, setSelectedRawNotif] = useState(null);
  const [selectNotification, setSelectNotification] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  // 1) obtenemos userId una sola vez
  useEffect(() => {
    validateSession.getValidate()
      .then(({ user }) => setUserId(user.id))
      .catch(console.error);
  }, []);

  // 2) usamos el hook; él se encarga de join/leave y recargar
  const {
    notifications,
    reloadNotifications
  } = useNotificationsSocket(
    userId,
    payload => console.log("📨 New notification:", payload),
  );


  // 3) marcar estado
  const handleStatusChange = async (notif_id, status) => {
    try {
      await updateNotificationStatus.updateNotificationStatus(notif_id, status);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // 4) abrir modal
  const handleOpenModal = async (notif) => {
    setOpenModal(true);
    setSelectedRawNotif(notif);
    setSelectNotification(null);
    setLoading(true);
    console.log(notif);
    try {
      await updateNotificationStatus.updateNotificationStatus(notif.notif_id, 1);
      reloadNotifications();
      if (notif.notif_type === "contracts" && notif.cont_id) {
        const details = await getOneContractService.getOneContract(notif.cont_id);
        setSelectNotification(details);
      }
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };


  // 5) agrupar por estado
 const filteredNotifications = notifications.filter(n =>
    filterType === "ALL"
      || n.assigned_entity_type === filterType
      || n.notif_type === filterType
  );

  const grouped = status =>
    filteredNotifications.filter(n => n.notif_status === status);
  console.log(notifications);
  console.log("notificaciones filtradas",filteredNotifications)
  // 6) renderizar secciones
  const renderSection = (title, statusCode) => {
    const group = grouped(statusCode);
    if (group.length === 0) return null;
    return (
      <div key={statusCode} className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        {group.map(notif => (
          <div
            key={notif.notif_id}
            className={`p-4 mb-4 border rounded shadow-sm flex justify-between items-start
              ${notif.notif_status === 0 ? "bg-blue-50" : "bg-white"}`}
          >
            <div
              className="flex-1 cursor-pointer"
              onDoubleClick={() => handleOpenModal(notif)}
            >
              <h4 className="font-bold hover:underline">{notif.notif_title}</h4>
              <p className="text-gray-600">{notif.notif_message}</p>
              {notif.days_left && (
                <p className="text-sm text-gray-500">
                  Vence en {notif.days_left} días
                </p>
              )}
            </div>
            <div className="ml-4">
              <label className="text-sm font-medium block mb-1 text-right">
                Estado
              </label>
              <select
                className="p-2 text-sm border rounded"
                value={notif.notif_status}
                onChange={e =>
                  handleStatusChange(
                    notif.notif_id,
                    parseInt(e.target.value, 10)
                  )
                }
              >
                <option value={0}>No leído</option>
                <option value={1}>Leído</option>
                <option value={2}>Pendiente</option>
                <option value={3}>Escalado</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 7) contenido del modal
  const renderModalContent = () => {
    if (loading) return <p>Cargando...</p>;
    if (!selectedRawNotif) return null;

    if (
      selectedRawNotif.notif_type === "contracts" &&
      selectNotification
    ) {
      const c = selectNotification;
      console.log(c);
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            {selectedRawNotif.notif_title}
          </h2>
          <p>{selectedRawNotif.notif_message}</p>

          <div className="space-y-1 text-sm text-gray-700">
            <p><strong>Contrato:</strong> {c.contract_key_name}</p>
            <p><strong>Cliente:</strong> {c.client?.client_name}</p>
            <p><strong>Proveedor:</strong> {c.provider?.prov_name}</p>
            <p><strong>Descripción:</strong> {c.cont_description}</p>
            <p><strong>Valor Total:</strong> {Intl.NumberFormat('es-CO', { style: 'currency', currency: c.type_value?.typev_simbol || 'COP' }).format(c.total_value)}</p>
            <p><strong>Fecha de Inicio:</strong> {new Date(c.start_date).toLocaleDateString('es-CO')}</p>
            <p><strong>Fecha de Fin:</strong> {new Date(c.end_date).toLocaleDateString('es-CO')}</p>
            <p><strong>Estado:</strong> {c.status === 1 ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>


      );
    } else if (selectedRawNotif.assigned_entity_type === "deliverable") {
      const c = selectedRawNotif;
      window.location.href = `/Contract/deliverables/${c.assigned_entity_id}`
      // return (
      //   <div>
      //     <h2><b>{c.notif_title}</b></h2>
      //     <p>{c.notif_message}</p>
      //     <Form
      //       sendMessage="Enviar Revisión"
      //       onSubmit={async data => {
      //         const payload = {
      //           assigned_entity_id: c.assigned_entity_id,
      //           reviewer_id: userId,
      //           newState: data.newState,
      //           comment: data.comment,
      //           hasIssues: data.hasIssues === "true",
      //         };
      //         try {
      //           await reviewDeliverableService(
      //             payload.assigned_entity_id,
      //             payload.reviewer_id,
      //             payload.newState,
      //             payload.comment,
      //             payload.hasIssues
      //           );
      //           setOpenModal(false);
      //         } catch (err) {
      //           console.error(err);
      //         }
      //       }}
      //       fields={[
      //         {
      //           name: "newState",
      //           type: "select",
      //           label: "Nuevo estado",
      //           options: [
      //             { value: "approved", label: "Aprobado" },
      //             { value: "rejected", label: "Rechazado" },
      //             { value: "dispute", label: "En disputa" },
      //           ],
      //           required: true,
      //         },
      //         {
      //           name: "hasIssues",
      //           type: "select",
      //           label: "Tiene incidencias",
      //           options: [
      //             { value: "true", label: "Sí" },
      //             { value: "false", label: "No" },
      //           ],
      //           required: true,
      //         },
      //         {
      //           name: "comment",
      //           type: "textarea",
      //           label: "Comentario",
      //           placeholder: "Agrega tus comentarios aquí...",
      //           required: true,
      //         },
      //       ]}
      //       gridLayout={false}
      //     />
      //   </div>
      // );
    } else if (selectedRawNotif.assigned_entity_type === "sla" && selectedRawNotif.notif_type === "sla") {
      const c = selectedRawNotif;
      window.location.href = `/contract/sla-credit/show/${c.assigned_entity_id}`
    }

    return (
      <div>
        <h2>{selectedRawNotif.notif_title}</h2>
        <p>{selectedRawNotif.notif_message}</p>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Mis Notificaciones</h2>
      <div className="mb-6">
        <label className="mr-2 font-medium">Filtrar por tipo:</label>
        <select
          className="border rounded px-2 py-1"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="ALL">Todos</option>
          <option value="contracts">Contratos</option>
          <option value="deliverable">Entregables</option>
          <option value="sla">Sla</option>
        </select>
      </div>
      {notifications.length === 0 ? (
        <p>No hay notificaciones disponibles.</p>
      ) : (
        <>
          {renderSection("No leídas", 0)}
          {renderSection("Leídas", 1)}
          {renderSection("Pendientes", 2)}
          {renderSection("Escaladas", 3)}
        </>
      )}
      <Modal open={openModal} setOpen={setOpenModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}
