import React, { useState, useEffect, useCallback } from "react";
import SchemaProviderService from "../../../services/Providers/Schemas/schema.service"; // Ajusta ruta
import AddSchemaProviderModal from "../../../components/organisms/Forms/AddSchemaProviderModal";
import Swal from "sweetalert2";
import { normalizeList } from "../../../utils/api-helpers"; // Ajusta ruta
import { getText } from "../../../utils/text";

const SchemasProvidersPage = () => {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchSchemas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SchemaProviderService.getAllSchemas({
        page: pagination.page,
        limit: pagination.limit
      });

      // 1. Usamos normalizeList para obtener el array de datos seguro
      const dataList = normalizeList(response);
      setSchemas(dataList);

      // 2. Extraemos la metadata de paginación manualmente
      // La respuesta del backend suele ser response.data (donde data es el ApiResponseDto)
      // Dentro de eso: response.data.data (PaginatedResponse) -> { total, page, limit, totalPages }
      const meta = response.data?.data || response.data || {};
      
      setPagination(prev => ({
        ...prev,
        total: meta.total || dataList.length,
        totalPages: meta.totalPages || 1
      }));

    } catch (error) {
      console.error("Error fetching schemas:", error);
      Swal.fire("Error", "No se pudieron cargar los esquemas.", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  // Manejador de Eliminación
  const handleDelete = async (id, clientKey) => {
    const result = await Swal.fire({
      title: '¿Eliminar Esquema?',
      text: `Estás a punto de eliminar "${clientKey}". Esta acción borrará el registro del tenant.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await SchemaProviderService.deleteSchema(id);
        Swal.fire('Eliminado', 'El esquema ha sido eliminado.', 'success');
        fetchSchemas();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el esquema.', 'error');
      }
    }
  };

  // Manejador de Validación (Endpoint POST /:id/validate)
  const handleValidate = async (id, clientKey) => {
    try {
      Swal.fire({
        title: 'Validando Estructura...',
        text: 'Verificando tablas y entidades...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await SchemaProviderService.validateSchema(id);
      // El backend devuelve SchemaManagementResponseDto
      // schema_info contiene { last_validation: { valid: boolean, missing_tables: [] } }
      
      const validation = response?.schema_info?.last_validation;
      const isValid = validation?.valid;
      const missing = validation?.missing_tables || [];

      if (isValid) {
        Swal.fire({
            icon: 'success',
            title: 'Esquema Válido',
            text: `El esquema ${clientKey} tiene todas las tablas requeridas.`
        });
      } else {
        Swal.fire({
            icon: 'error',
            title: 'Inconsistencias Detectadas',
            html: `
                <p class="mb-2">Faltan las siguientes tablas:</p>
                <div class="text-left bg-red-50 p-2 rounded max-h-40 overflow-y-auto">
                    <ul class="list-disc pl-5 text-sm text-red-600">
                        ${missing.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            `
        });
      }
      // Actualizamos la lista para reflejar el nuevo estado de validación en la UI si fuera necesario
      fetchSchemas(); 

    } catch (error) {
        Swal.fire('Error', 'Falló la validación del esquema.', 'error');
    }
  };

  // Cambio de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
        setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{getText("Gestión de Tenants y Esquemas")}</h1>
          <p className="text-sm text-gray-500">Administra las conexiones multi-tenant de la aplicación.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-xl font-bold">+</span> {getText("Nuevo Tenant")}
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando esquemas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schema Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schemas.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay esquemas registrados.</td>
                    </tr>
                ) : (
                    schemas.map((schema) => (
                    <tr key={schema.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{schema.client_key}</div>
                        <div className="text-xs text-gray-400">{schema.version || 'v1.0'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {schema.schema_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${schema.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {schema.status}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* Lógica visual para mostrar si fue validado recientemente */}
                            {schema.schema_info?.last_validation?.valid ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    ✓ Validado
                                </span>
                            ) : (
                                <span className="text-orange-400 text-xs">No validado</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                            onClick={() => handleValidate(schema.id, schema.client_key)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                            title="Validar estructura de BD"
                        >
                            Validar
                        </button>
                        <button
                            onClick={() => handleDelete(schema.id, schema.client_key)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar esquema"
                        >
                            Eliminar
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-sm text-gray-700">
                Página {pagination.page} de {pagination.totalPages} (Total: {pagination.total})
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
                >
                    Anterior
                </button>
                <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
                >
                    Siguiente
                </button>
            </div>
        </div>
      </div>

      {/* Modal Importado */}
      <AddSchemaProviderModal
  isOpen={isModalOpen}
  setIsOpen={setIsModalOpen}
  onSuccess={() => {
    fetchSchemas();
    setIsModalOpen(false); // Forzar cierre tras éxito
  }}
/>
    </div>
  );
};

export default SchemasProvidersPage;