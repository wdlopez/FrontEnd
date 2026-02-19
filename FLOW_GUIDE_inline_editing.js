/**
 * GUÍA DE USO: Edición Inline y Acciones de Tabla
 * Módulo de Clientes
 * 
 * Esta guía explica el nuevo flujo de edición inline y las acciones de la tabla
 */

// ========================
// 1. EDICIÓN INLINE
// ========================
/**
 * Cómo funciona:
 * - Usuario hace DOBLE CLIC en cualquier celda editable
 * - La celda se convierte en un INPUT
 * - Usuario escribe el nuevo valor
 * - Al presionar ENTER o PERDER FOCO:
 *   → Se llama handleEditSave() en InteractiveTable
 *   → Se valida que el valor haya cambiado
 *   → Se dispara ClientService.updateClient(id, { field: newValue })
 *   → La tabla se actualiza localmente sin recargar
 * 
 * Campos NO editables (nonEditableColumns):
 * - N°
 * - Estado
 * 
 * Campos editables:
 * - Nombre → backend: "name"
 * - NIT / Documento → backend: "document_file"
 * - Contacto → backend: "contact_person"
 * - Industria → backend: "category"
 * - Email → backend: "email"
 * - Phone → backend: "phone"
 */

// ========================
// 2. COLUMNA DE ACCIONES
// ========================
/**
 * Los tres botones en la columna ACCIONES son:
 * 
 * 1. BOTÓN + (Verde) - "Agregar"
 *    - Abre el modal AddClientModal
 *    - Permite crear un nuevo cliente
 *    - Callback: onAdd → handleAdd() → setIsModalOpen(true)
 * 
 * 2. BOTÓN OJO (Azul) - "Ver"
 *    - Redirige a /client/:id
 *    - Abre OneClient.jsx con los detalles del cliente
 *    - Usa React Router <Link>
 * 
 * 3. BOTÓN PAPELERA (Rojo) - "Eliminar"
 *    - Abre el modal DesactiveClientModal
 *    - Muestra confirmación antes de eliminar
 *    - Callback: onDelete → handleDelete() → abre modal
 */

// ========================
// 3. FLUJO DE DATOS
// ========================
/**
 * ACTUALIZACIÓN INLINE:
 * User doble-clic → Input aparece → Edita valor → Presiona Enter/Blur
 * ↓
 * handleEditSave(rowIndex, colIndex, row, newValue)
 * ↓
 * handleEdit({row, column, newValue, realColumn, ...})
 * ↓
 * ClientService.updateClient(row.id, { [realColumn]: newValue })
 * ↓
 * PUT /client/:id { field: value }
 * ↓
 * Actualiza tabla localmente: setClients(...map...)
 * ↓
 * Muestra alerta de éxito
 * 
 * EN CASO DE ERROR:
 * - Se muestra alerta con mensaje del backend
 * - La tabla NO se actualiza
 * - El usuario puede reintentar
 */

// ========================
// 4. ESTRUCTURA DE DATOS
// ========================
/**
 * Cómo se mapean los campos:
 * 
 * Backend devuelve:
 * {
 *   id: "uuid",
 *   name: "Acme Corp",
 *   contact_person: "John Doe",
 *   document_file: "900.123.456",
 *   category: "Tecnología",
 *   email: "info@acme.com",
 *   phone: "+57 300 123 4567",
 *   address: "Calle 123 # 45-67",
 *   active: true
 * }
 * 
 * Se convierte a formato tabla:
 * {
 *   "N°": 1,
 *   "Nombre": "Acme Corp",
 *   "NIT / Documento": "900.123.456",
 *   "Contacto": "John Doe",
 *   "Industria": "Tecnología",
 *   "Email": "info@acme.com",
 *   "Phone": "+57 300 123 4567",
 *   "Estado": "Activo",
 *   id: "uuid"
 * }
 * 
 * columnMapping asegura que "Nombre" → "name" en el backend
 */

// ========================
// 5. IMPORTANCIA DEL columnMapping
// ========================
/**
 * Sin columnMapping:
 * - Al editar "Nombre", se enviaría: { "Nombre": "nuevo valor" }
 * - Backend rechazaría porque espera { "name": "nuevo valor" }
 * 
 * Con columnMapping:
 * - Al editar "Nombre", se envía: { "name": "nuevo valor" }
 * - Backend lo acepta y procesa correctamente
 * 
 * Está definido en ClientsPage.jsx:
 * const columnMapping = {
 *   'Nombre': 'name',
 *   'NIT / Documento': 'document_file',
 *   'Contacto': 'contact_person',
 *   'Industria': 'category',
 *   'Email': 'email',
 *   'Phone': 'phone',
 * };
 */

// ========================
// 6. MANEJO DE ERRORES
// ========================
/**
 * Escenarios de error:
 * 
 * 1. Validación del backend:
 *    - Email inválido → mostrará el mensaje de validación
 *    - Teléfono incorrecto → mostrará el mensaje de validación
 *    - Campos requeridos vacíos → mostrará el mensaje de validación
 * 
 * 2. Errores de red:
 *    - Conexión perdida → mostrará alerta genérica
 *    - Timeout → mostrará alerta genérica
 * 
 * 3. Permisos:
 *    - No autorizado → mostrará mensaje del backend
 *    - Usuario no tiene permisos → mostrará mensaje del backend
 */

// ========================
// 7. FUNCIONES CLAVE
// ========================

/**
 * handleEdit({row, column, newValue, realColumn, rowIndex, colIndex})
 * - Llama a ClientService.updateClient
 * - Actualiza tabla localmente
 * - Muestra alerta de éxito/error
 * 
 * handleDelete(row)
 * - Abre modal DesactiveClientModal
 * - Pasa el cliente a eliminar
 * - Modal maneja la confirmación
 * 
 * handleAdd()
 * - Abre modal AddClientModal
 * - Permite crear nuevo cliente
 * - Recarga tabla al crear exitosamente
 * 
 * handleEditSave(rowIndex, colIndex, row, newValue)
 * - En InteractiveTable.jsx
 * - Valida que el valor cambió
 * - Llama a onEdit callback
 * - Maneja el estado isSaving
 */

// ========================
// 8. PRUEBAS RECOMENDADAS
// ========================
/**
 * 1. Edición inline:
 *    - Doble clic en "Nombre" → edita → Enter → actualiza
 *    - Doble clic en "Email" → edita → Blur → actualiza
 *    - Intenta editar "N°" → debería estar deshabilitado
 * 
 * 2. Acciones:
 *    - Clic en + → abre modal crear
 *    - Clic en ojo → navega a /client/:id
 *    - Clic en papelera → abre modal eliminar
 * 
 * 3. Errores:
 *    - Edita email a valor inválido → debe mostrar error del backend
 *    - Edita nombre a valor duplicado → debe mostrar error si aplica
 * 
 * 4. Flujo completo:
 *    - Crea cliente → En tabla aparece
 *    - Edita nombre → Actualiza sin recargar
 *    - Clic ojo → Ve detalles
 *    - Clic papelera → Elimina con confirmación
 */

export default {
  notes: "Este archivo es una guía de referencia. No se importa en la aplicación."
};
