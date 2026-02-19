import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCrumb from "../../molecules/BreadCrumb";
import Alerts from "../../molecules/Alerts";
import ClientService from "../../../services/Clients/client.service";
import InfoTooltip from "../../atoms/InfoToolTip";

const ViewOneClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataClient, setDataClient] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", type: "info" });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Gestion Integral", url: "/client" },
    { name: "Clientes", url: "/client" },
    { name: `Cliente # ${id}`, url: `/client/${id}` },
  ];

  // Cargar el cliente por ID
  const fetchClient = async () => {
    setLoading(true);
    try {
      const data = await ClientService.getClientById(id);
      console.log("📦 Client Detail Response:", data);

      // Normalizar la respuesta (puede venir en diferentes formatos)
      let clientData = {};
      if (data?.data) {
        clientData = data.data;
      } else if (data?.ClientEntity || data?.client) {
        clientData = data.ClientEntity || data.client;
      } else {
        clientData = data;
      }

      setDataClient(clientData);
    } catch (error) {
      console.error("Error al cargar el cliente:", error);
      setAlert({
        open: true,
        message: "Error al cargar los datos del cliente",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  // Renderizar información de detalle
  const DetailField = ({ label, value }) => (
    <>
      <div className="font-bold text-gray-700">{label}</div>
      <div className="text-gray-600">{value || "-"}</div>
    </>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <BreadCrumb paths={breadcrumbPaths} />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">
            progress_activity
          </span>
          <p className="font-medium">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Navegación y Alertas */}
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts
        open={alert.open}
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })}
        message={alert.message}
        type={alert.type}
      />

      {/* Botón Volver */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/client")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined">chevron_left</span>
          Volver
        </button>
      </div>

      {/* Card de Detalle */}
      {dataClient && Object.keys(dataClient).length > 0 ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-6">
              <div className="flex gap-3 items-start">
                <InfoTooltip
                  size="sm"
                  message="Información detallada del cliente seleccionado"
                  sticky={true}
                >
                  <span className="material-symbols-outlined text-gray-400">
                    info
                  </span>
                </InfoTooltip>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {dataClient.name || "Sin nombre"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    ID: <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">{dataClient.id || "N/A"}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailField
                  label="Nombre del Cliente"
                  value={dataClient.name}
                />
                <DetailField
                  label="Persona de Contacto"
                  value={dataClient.contact_person}
                />

                <DetailField
                  label="Documento (NIT)"
                  value={dataClient.document_file}
                />
                <DetailField label="Categoría" value={dataClient.category} />

                <DetailField label="Correo Electrónico" value={dataClient.email} />
                <DetailField label="Teléfono" value={dataClient.phone} />
                <DetailField label="Dirección" value={dataClient.address} />


                <DetailField
                  label="Estado"
                  value={
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        dataClient.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {dataClient.active ? "check_circle" : "cancel"}
                      </span>
                      {dataClient.active ? "Activo" : "Inactivo"}
                    </span>
                  }
                />

                {dataClient.createdAt && (
                  <DetailField
                    label="Fecha de Creación"
                    value={new Date(dataClient.createdAt).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  />
                )}
              </div>

              {/* Acciones */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => navigate("/client")}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">
            person_off
          </span>
          <p className="text-gray-500">No se encontró información del cliente</p>
        </div>
      )}
    </div>
  );
};

export default ViewOneClient;
