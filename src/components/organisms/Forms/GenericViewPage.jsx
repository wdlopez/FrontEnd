import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCrumb from "../../molecules/BreadCrumb";
import Alerts from "../../molecules/Alerts";
import InfoTooltip from "../../atoms/InfoToolTip";
import GenericEditModal from "./GenericEditModal";

const DetailField = ({ label, value, type }) => {
  let displayValue = value || "-";

  if (type === "date" && value) {
    displayValue = new Date(value).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (type === "currency" && value) {
    displayValue = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  }

  return (
    <div>
      <div className="font-bold text-gray-700 text-sm">{label}</div>
      <div className="text-gray-600 mt-1">{displayValue}</div>
    </div>
  );
};

const GenericViewPage = ({
  service,
  config,
  entityName,
  basePath,
  titleKey = "name",
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Gestión Integral", url: basePath },
    { name: `${entityName}s`, url: basePath },
    { name: `${entityName} #${id}`, url: null },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await service.getById(id);
      const normalizedData =
        response.data || response.ClientEntity || response.client || response;
      setData(normalizedData);
    } catch (error) {
      console.error(`Error al cargar ${entityName}:`, error);
      setAlert({
        open: true,
        message: `Error al cargar los datos del ${entityName.toLowerCase()}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const visibleFields = config.columns.filter(
    (col) =>
      col.backendKey &&
      col.backendKey !== "id" &&
      col.backendKey !== "actions" &&
      col.backendKey !== "active" &&
      col.backendKey !== "index",
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <BreadCrumb paths={breadcrumbPaths} />
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-blue-600">
            progress_activity
          </span>
          <p className="font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts
        open={alert.open}
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })}
        message={alert.message}
        type={alert.type}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(basePath)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined">chevron_left</span>
          Volver a {entityName}s
        </button>
      </div>

      {data && Object.keys(data).length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-8">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">
                      folder_open
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {data[titleKey] || "Sin nombre"}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                        ID: {data.id}
                      </span>

                      {Object.prototype.hasOwnProperty.call(data, "active") && (
                        <span
                          className={
                            data.active ? "bg-green-100" : "bg-red-100"
                          }
                        >
                          {data.active ? "Activo" : "Inactivo"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <InfoTooltip
                  size="sm"
                  message={`Detalle completo del ${entityName}`}
                  sticky={true}
                >
                  <span className="material-symbols-outlined text-gray-400">
                    info
                  </span>
                </InfoTooltip>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
                {visibleFields.map((field) => (
                  <DetailField
                    key={field.backendKey}
                    label={field.header}
                    value={data[field.backendKey]}
                    type={field.type || "text"}
                  />
                ))}

                {data.createdAt && (
                  <DetailField
                    label="Fecha de Creación"
                    value={data.createdAt}
                    type="date"
                  />
                )}
                {data.updatedAt && (
                  <DetailField
                    label="Última Actualización"
                    value={data.updatedAt}
                    type="date"
                  />
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  Editar
                </button>
                <button
                  onClick={() => navigate(basePath)}
                  className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">
            search_off
          </span>
          <h3 className="text-lg font-medium text-gray-900">No encontrado</h3>
          <p className="text-gray-500">
            No se encontró información para este registro.
          </p>
        </div>
      )}

      {/* Modal Genérico de Edición */}
      <GenericEditModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        entityId={id}
        service={service}
        config={config}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default GenericViewPage;
