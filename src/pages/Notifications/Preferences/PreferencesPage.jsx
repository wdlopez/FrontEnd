import React, { useEffect, useState } from 'react';
import BreadCrumb from '../../../components/molecules/BreadCrumb';
import HeaderActions from '../../../components/organisms/Navigation/HeaderActions';
import InteractiveTable from '../../../components/organisms/Tables/InteractiveTable';
import AddPreferencesModal from '../../../components/organisms/Forms/AddPreferencesModal';
import Alerts from '../../../components/molecules/Alerts';
import PreferenceService from '../../../services/Notifications/Preferences/preference.service';
import InfoTooltip from '../../../components/atoms/InfoToolTip';
import { getText } from '../../../utils/text';
import { normalizeList } from '../../../utils/api-helpers';

const PreferencePage = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'info' });

  const breadcrumbPaths = [
    { name: "Inicio", url: "/dashboard" },
    { name: "Sistema", url: null },
    { name: "Preferencias de Notificación", url: null }
  ];

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await PreferenceService.getAllPreferences();
      const rawList = normalizeList(response);

      const formatted = rawList.map((pref, i) => ({
        ...pref,
        index: i + 1,
        // Como no tenemos el join poblado, mostramos los ID truncados temporalmente
        user_display: `Usuario ${pref.user_id?.substring(0,8)}`,
        contract_display: `Contrato ${pref.cont_id?.substring(0,8)}`,
        email_display: pref.notify_email ? '✅ Sí' : '❌ No',
        platform_display: pref.notify_platform ? '✅ Sí' : '❌ No',
        days_display: `${pref.advance_days} días`,
        limit_display: `${pref.days_limit} días`
      }));

      setPreferences(formatted);
    } catch (error) {
        console.error("Error cargando preferencias:", error);
      setAlert({ open: true, message: "Error al cargar las preferencias.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPreferences(); }, []);

  const columnMapping = {
    'N°': 'index',
    'Usuario': 'user_display',
    'Contrato': 'contract_display',
    'Anticipación': 'days_display',
    'Límite': 'limit_display',
    'Vía Email': 'email_display',
    'Vía Plataforma': 'platform_display'
  };

  const handleDelete = async (row) => {
    try {
      await PreferenceService.deletePreference(row.id);
      setAlert({ open: true, message: "Preferencia eliminada con éxito", type: "success" });
      fetchPreferences();
    } catch (error) {
        console.error("Error eliminando preferencia:", error);
      setAlert({ open: true, message: "No se pudo eliminar la preferencia", type: "error" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <BreadCrumb paths={breadcrumbPaths} />
      <Alerts 
        open={alert.open} 
        setOpen={(isOpen) => setAlert({ ...alert, open: isOpen })} 
        message={alert.message} 
        type={alert.type} 
      />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2 items-center">
            <InfoTooltip size="sm" message={getText("preferencesIntro") || "Administra cómo se alertará a los usuarios respecto a los hitos de sus contratos."}>
              <span className="material-symbols-outlined text-gray-400">info</span>
            </InfoTooltip>
            <h1 className="text-2xl font-bold text-gray-800">Preferencias de Notificación</h1>
          </div>
          <p className="text-gray-500 text-sm">Configuración de plazos y canales de comunicación por contrato.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando preferencias...</div>
        ) : (
          <InteractiveTable 
            data={preferences}
            columnMapping={columnMapping}
            actions={true}
            onEdit={(row) => console.log("Editar Preferencia", row.id)}
            onDelete={handleDelete}
            headerButtons={
              <HeaderActions 
                onAdd={() => setIsModalOpen(true)}
                addButtonLabel="Nueva Preferencia"
                onRefresh={fetchPreferences}
              />
            }
          />
        )}
      </div>

      <AddPreferencesModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onSuccess={fetchPreferences} />
    </div>
  );
};

export default PreferencePage;