import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddBestPracticeModal from '../../../components/organisms/Forms/AddBestPracticeModal';
import Alerts from '../../../components/molecules/Alerts';
import Tabs from '../../../components/molecules/Tabs';
import DocumentTemplatePage from '../DocumentTemplate/DocumentTemplatePage';
import BestPracticesService from '../../../services/Others/BestPractices/best-practice.service';
import { normalizeList } from '../../../utils/api-helpers';


const NAV_ITEMS = [
    { key: "best-practices", label: "Mejores Prácticas" },
    { key: "document-templates", label: "Plantillas de Documentos" },
];

const BestPracticesPage = () => {
  const [practices, setPractices] = useState([]);
  const [activeTab, setActiveTab] = useState(NAV_ITEMS[0].key);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Recursos", url: null },
    { name: "Mejores Prácticas", url: null }
  ];

  const fetchPractices = async () => {
    setLoading(true);
    try {
      const response = await BestPracticesService.getAllPractices();
      const rawList = normalizeList(response);

      const formatted = rawList.map((item, i) => ({
        ...item,
        index: i + 1,
        category_display: item.category?.toUpperCase(),
        content_summary: item.content?.length > 50 
          ? `${item.content.substring(0, 50)}...` 
          : item.content,
        status_display: item.is_active ? '✅ Activo' : '❌ Inactivo',
        date_display: new Date(item.created_at).toLocaleDateString()
      }));

      setPractices(formatted);
    } catch (error) {
      console.error("Error al cargar mejores prácticas:", error);
      setAlert({ open: true, message: "No se pudieron cargar las mejores prácticas.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPractices(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Título': 'title',
    'Categoría': 'category_display',
    'Resumen': 'content_summary',
    'Estado': 'status_display',
    'Fecha': 'date_display'
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs activeKey={activeTab} items={NAV_ITEMS} onChange={setActiveTab} />
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(val) => setAlert({ ...alert, open: val })} 
        message={alert.message} 
        type={alert.type} 
      />

      {activeTab === 'best-practices' ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Repositorio de Mejores Prácticas</h1>
              <p className="text-gray-500 text-sm">Base de conocimientos y estándares del sistema.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Cargando mejores prácticas...</div>
            ) : (
              <InteractiveTable 
                data={practices}
                columnMapping={columnMapping}
                actions={true}
                onEdit={(row) => console.log("Editar práctica", row)}
                onSubmit={async ({ row, column, realColumn, newValue }) => {
                  try {
                    await BestPracticesService.update(row.id, { [realColumn]: newValue });
                    setPractices(prev => prev.map(p => p.id === row.id ? { ...p, [column]: newValue } : p));
                  } catch (e) { console.error(e); }
                }}
                onDelete={async (row) => {
                  await BestPracticesService.deletePractice(row.id);
                  fetchPractices();
                }}
                headerButtons={
                  <HeaderActions 
                    onAdd={() => setIsModalOpen(true)}
                    addButtonLabel="Nueva Práctica"
                    onRefresh={fetchPractices}
                  />
                }
              />
            )}
          </div>

          <AddBestPracticeModal 
            isOpen={isModalOpen} 
            setIsOpen={setIsModalOpen} 
            onSuccess={fetchPractices} 
          />
        </>
      ) : (
        <DocumentTemplatePage />
      )}

    </div>
  );
};

export default BestPracticesPage;