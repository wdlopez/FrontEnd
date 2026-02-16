import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddDocumentTemplateModal from '../../../components/organisms/Forms/AddDocumentTemplateModal';
import Alerts from '../../../components/molecules/Alerts';
import DocumentTemplateService from '../../../services/Others/DocumentTemplate/document-template.service';
import { normalizeList } from '../../../utils/api-helpers';

const DocumentTemplatePage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await DocumentTemplateService.getAllDocuments();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, i) => ({
        ...item,
        index: i + 1,
        type_badge: item.template_type?.toUpperCase(),
        status_display: item.is_active ? '✅ Activo' : '❌ Inactivo',
        created_display: new Date(item.created_at).toLocaleDateString(),
        // Ejemplo de visualización de ruta corta
        path_display: item.file_path?.split('/').pop() || item.file_path
      }));

      setTemplates(formatted);
    } catch (error) {
        console.error("Error al cargar plantillas:", error);
      setAlert({ open: true, message: "Error al cargar las plantillas.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Nombre': 'template_name',
    'Tipo': 'type_badge',
    'Archivo': 'path_display',
    'Estado': 'status_display',
    'Fecha': 'created_display'
  };

  return (
    <div className="p-6 space-y-6">
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plantillas del Sistema</h1>
          <p className="text-gray-500 text-sm">Administre los formatos predefinidos para la creación de documentos oficiales.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Buscando plantillas...</div>
        ) : (
          <InteractiveTable 
            data={templates}
            columnMapping={columnMapping}
            actions={true}
            onDelete={async (row) => {
              try {
                await DocumentTemplateService.deleteDocument(row.id);
                fetchTemplates();
              } catch (e) {
                console.error("Error al eliminar plantilla:", e);
                setAlert({ open: true, message: "No se pudo eliminar la plantilla.", type: "error" });
              }
            }}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nueva Plantilla"
                onRefresh={fetchTemplates}
              />
            }
          />
        )}
      </div>

      <AddDocumentTemplateModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={fetchTemplates} 
      />
    </div>
  );
};

export default DocumentTemplatePage;