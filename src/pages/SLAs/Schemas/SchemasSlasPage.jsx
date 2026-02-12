import React, { useState, useEffect, useCallback } from "react";
import SchemaSlasService from "../../../services/Slas/Schemas/schema.slas.service";
import AddSchemaSlasModal from "../../../components/organisms/Forms/AddSchemaSlasModal";
import Swal from "sweetalert2";
import { normalizeList } from "../../../utils/api-helpers";

const SchemasSlasPage = () => {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchSchemas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SchemaSlasService.getAllSchemas({
        page: pagination.page,
        limit: pagination.limit
      });
      console.log("Respuesta cruda del servidor:", response);

      // 1. SOLUCIÓN: Usar normalizeList para obtener el array 'items' limpio
      const list = normalizeList(response);
      console.log("Lista normalizada:", list); 
      setSchemas(list);

      // 2. Extraer metadatos de paginación
      // Basado en tu JSON: { data: { items: [], meta: { ... } } }
      const meta = response?.data?.meta || {};

      setPagination(prev => ({
        ...prev,
        total: meta.total || 0,
        totalPages: meta.totalPages || 1
      }));

    } catch (error) {
      console.error("Error fetching schemas:", error);
      // Evitamos que la pantalla se quede en blanco si falla
      setSchemas([]); 
      Swal.fire("Error", "No se pudieron cargar los esquemas.", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  const handleDelete = async (id, clientKey) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el esquema "${clientKey}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await SchemaSlasService.deleteSchema(id);
        Swal.fire('Eliminado', 'El esquema ha sido eliminado.', 'success');
        fetchSchemas();
      } catch (error) {
        console.error("Error deleting schema:", error);
        Swal.fire('Error', 'No se pudo eliminar el esquema.', 'error');
      }
    }
  };

  const handleValidate = async (id) => {
    try {
      Swal.fire({
        title: 'Validando...',
        text: 'Verificando integridad de tablas y entidades',
        didOpen: () => Swal.showLoading()
      });
      
      const res = await SchemaSlasService.validateSchema(id);
      
      const validation = res.schema_info?.last_validation;
      const isValid = validation?.valid;

      Swal.fire({
        title: isValid ? 'Esquema Saludable' : 'Problemas Detectados',
        html: `
          <div class="text-left text-sm">
            <p><strong>Tablas existentes:</strong> ${validation?.existing_tables?.length || 0}</p>
            <p><strong>Tablas faltantes:</strong> ${validation?.missing_tables?.length || 0}</p>
            ${validation?.missing_tables?.length > 0 
              ? `<div class="mt-2 text-red-500">Faltan: ${validation.missing_tables.join(', ')}</div>` 
              : ''}
          </div>
        `,
        icon: isValid ? 'success' : 'warning'
      });
      fetchSchemas(); 
    } catch (error) {
        console.error("Error validating schema:", error);
      Swal.fire('Error', 'Falló la validación del esquema.', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending_creation': return 'bg-blue-100 text-blue-800';
      case 'pending_deletion': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Esquemas (Tenants)</h1>
          <p className="text-sm text-gray-500 mt-1">Administración de bases de datos por cliente</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nuevo Esquema
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre / Versión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Cargando esquemas...
                  </div>
                </td>
              </tr>
            ) : schemas.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  No hay esquemas registrados.
                </td>
              </tr>
            ) : (
              // AQUÍ ES DONDE FALLABA EL MAP
              schemas.map((schema) => (
                <tr key={schema.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{schema.client_key}</div>
                    <div className="text-xs text-gray-400 font-mono">{schema.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{schema.schema_name}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {schema.version || 'v1.0'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(schema.status)}`}>
                      {schema.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {schema.schema_info?.last_validation ? (
                        <div className="flex items-center gap-1">
                           <span className={`material-symbols-outlined text-[16px] ${schema.schema_info.last_validation.valid ? 'text-green-500' : 'text-red-500'}`}>
                             {schema.schema_info.last_validation.valid ? 'check_circle' : 'warning'}
                           </span>
                           <span className="text-xs">
                             {new Date(schema.schema_info.last_validation.validated_at).toLocaleDateString()}
                           </span>
                        </div>
                     ) : (
                       <span className="text-xs text-gray-400">Sin validar</span>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(schema.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleValidate(schema.id)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Validar Estructura"
                      >
                        <span className="material-symbols-outlined">health_and_safety</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(schema.id, schema.client_key)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar Esquema"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
         <span>Total: {pagination.total} registros</span>
         <div className="flex gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => setPagination({...pagination, page: pagination.page - 1})}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-2 py-1">Página {pagination.page} de {pagination.totalPages}</span>
            <button 
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({...pagination, page: pagination.page + 1})}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Siguiente
            </button>
         </div>
      </div>

      <AddSchemaSlasModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchSchemas} 
      />
    </div>
  );
};

export default SchemasSlasPage;