import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardService from "../../services/dashboard.service";
import WelcomeWidget from "./components/WelcomeWidget";
import Alerts from "../../components/molecules/Alerts";

// Importación de los Dashboards específicos
import DashBSuperAdmin from "./DashBAdmin";
import DashBContratoAdmin from "./DashBAdminContractC";
import WelcomeClient from "./Clients";
import WelcomeUser from "./Users";
import DashbRendimiento from "./DashBRendimiento";
import DashbFinanzas from "./DashBFinanzas";
import DashbReportes from "./DashBReportes";
import DashbRelacionamiento from "./DashBRelacionamiento";
import DashbRiesgos from "./DashBRiesgos";  

const ROLES = {
  SUPER_ADMIN: "super_admin",
  CONTRACT_ADMIN: "client_contract_admin",
  CLIENT_PERFORMANCE_RESP: "client_performance_resp",
  CLIENT_FINANCE_RESP: "client_finance_resp",
  CLIENT_REPORTS_RESP: "client_reports_resp",
  CLIENT_RELATIONSHIP_RESP: "client_relationship_resp",
  CLIENT_RISK_RESP: "client_risk_resp",
};

const DashboardIndex = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    contracts: [],
    slas: [],
    clientsCount: 0,
    usersCount: 0,
  });

  // Estados para Alertas (requeridos por WelcomeClient)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !user?.role) return;
      try {
        setLoading(true);
        let data = { contracts: [], slas: [], clientsCount: 0, usersCount: 0 };

        if (user.role === ROLES.SUPER_ADMIN) {
          data = await DashboardService.getSuperAdminSummary();
        } else if (user.role === ROLES.CONTRACT_ADMIN) {
          data = await DashboardService.getContractAdminSummary(
            user.role,
            user.id,
          );
        }

        setDashboardData(data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role) fetchDashboardData();
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="p-10 text-center">Verificando sesión...</div>;
  }

  if (!user) {
    return (
      <div className="p-10 text-center">
        No autorizado. Por favor inicia sesión.
      </div>
    );
  }

  if (loading)
    return <div className="p-10 text-center">Cargando tablero...</div>;

  // CASO 1: SUPER ADMINISTRADOR
  if (user.role === ROLES.SUPER_ADMIN) {
    return (
      <div className="space-y-6">
        {/* Sección de Bienvenida con botones de acceso rápido */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user.role}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a ContractX. Comienza gestionando clientes y usuarios.
            </p>
          </div>

          {/* Grid de botones de acceso rápido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeClient 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.clientsCount}
            />
            <WelcomeUser 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.usersCount}
            />
          </div>
        </div>

        {/* Alertas Globales del Dashboard */}
        <Alerts 
          open={alertOpen} 
          setOpen={setAlertOpen} 
          message={alertMessage} 
          type={alertType} 
        />

        {/* Dashboard Completo siempre visible */}
        <DashBSuperAdmin
          user={user}
          contracts={dashboardData.contracts}
          slas={dashboardData.slas}
        />
      </div>
    );
  }

  // CASO 2: ADMIN DE CONTRATOS
  if (user.role === ROLES.CONTRACT_ADMIN) {
    return (
      <div className="space-y-6">
        {/* Botones de acceso rápido para Contract Admin */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user.role}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a ContractX. Comienza gestionando clientes y contratos.
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Acceso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeClient 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.clientsCount}
            />
            {/* Solo mostramos WelcomeUser para super_admin, o si quieres habilitarlo para contract_admin también, quita el condicional */}
            {user.role === ROLES.SUPER_ADMIN && (
              <WelcomeUser 
                setMsg={setAlertMessage} 
                setOpenAlert={setAlertOpen} 
                setAlert={setAlertType} 
                count={dashboardData.usersCount}
              />
            )}
          </div>
        </div>

        {/* Dashboard de Contract Admin */}
        <DashBContratoAdmin
          user={user}
          contracts={dashboardData.contracts}
          slas={dashboardData.slas}
        />
      </div>
    );
  }

  // CASO 3: RESPONSABLES DE RENDIMIENTOS DE ClIENTE
  if (user.role === ROLES.CLIENT_PERFORMANCE_RESP) {
    return (
      <div className="space-y-6">
        {/* Botones de acceso rápido para Contract Admin */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user.role}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a ContractX. Comienza gestionando clientes y contratos.
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Acceso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeClient 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.clientsCount}
            />
            {/* Solo mostramos WelcomeUser para super_admin, o si quieres habilitarlo para contract_admin también, quita el condicional */}
            {user.role === ROLES.SUPER_ADMIN && (
              <WelcomeUser 
                setMsg={setAlertMessage} 
                setOpenAlert={setAlertOpen} 
                setAlert={setAlertType} 
                count={dashboardData.usersCount}
              />
            )}
          </div>
        </div>

        {/* Dashboard de Contract Admin */}
        <DashbRendimiento
          user={user}
          contracts={dashboardData.contracts}
          slas={dashboardData.slas}
        />
      </div>
    );
  }

  // CASO 4: RESPONSABLES DE RIESGOS DE CLIENTE
  if (user.role === ROLES.CLIENT_RISK_RESP) {
    return (
      <div className="space-y-6">
        {/* Botones de acceso rápido para Contract Admin */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user.role}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a ContractX. Comienza gestionando clientes y contratos.
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Acceso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeClient 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.clientsCount}
            />
            {/* Solo mostramos WelcomeUser para super_admin, o si quieres habilitarlo para contract_admin también, quita el condicional */}
            {user.role === ROLES.SUPER_ADMIN && (
              <WelcomeUser 
                setMsg={setAlertMessage} 
                setOpenAlert={setAlertOpen} 
                setAlert={setAlertType} 
                count={dashboardData.usersCount}
              />
            )}
          </div>
        </div>

        {/* Dashboard de Contract Admin */}
        <DashbRiesgos
          user={user}
          contracts={dashboardData.contracts}
          slas={dashboardData.slas}
        />
      </div>
    );
  }

  // CASO 5: RESPONSABLES DE REPORTES DE ClIENTE
  if (user.role === ROLES.CLIENT_REPORTS_RESP) {
    return (
      <div className="space-y-6">
        {/* Botones de acceso rápido para Contract Admin */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user.role}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a ContractX. Comienza gestionando clientes y contratos.
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Acceso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeClient 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.clientsCount}
            />
            {/* Solo mostramos WelcomeUser para super_admin, o si quieres habilitarlo para contract_admin también, quita el condicional */}
            {user.role === ROLES.SUPER_ADMIN && (
              <WelcomeUser 
                setMsg={setAlertMessage} 
                setOpenAlert={setAlertOpen} 
                setAlert={setAlertType} 
                count={dashboardData.usersCount}
              />
            )}
          </div>
        </div>

        {/* Dashboard de Contract Admin */}
        <DashbReportes
          user={user}
          contracts={dashboardData.contracts}
          slas={dashboardData.slas}
        />
      </div>
    );
  }

  // CASO 6: RESPONSABLES DE FINANZAS DE ClIENTE
  if (user.role === ROLES.CLIENT_FINANCE_RESP) {
    return (
      <div className="space-y-6">
        {/* Botones de acceso rápido para Contract Admin */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user.role}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a ContractX. Comienza gestionando clientes y contratos.
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Acceso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeClient 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.clientsCount}
            />
            {/* Solo mostramos WelcomeUser para super_admin, o si quieres habilitarlo para contract_admin también, quita el condicional */}
            {user.role === ROLES.SUPER_ADMIN && (
              <WelcomeUser 
                setMsg={setAlertMessage} 
                setOpenAlert={setAlertOpen} 
                setAlert={setAlertType} 
                count={dashboardData.usersCount}
              />
            )}
          </div>
        </div>

        {/* Dashboard de Contract Admin */}
        <DashbFinanzas
          user={user}
          contracts={dashboardData.contracts}
          slas={dashboardData.slas}
        />
      </div>
    );
  }

  // CASO 7: RESPONSABLES DE RELACIONAMIENTO DE ClIENTE
  if (user.role === ROLES.CLIENT_RELATIONSHIP_RESP) {
    return (
      <div className="space-y-6">
        {/* Botones de acceso rápido para Contract Admin */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user.role}
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a ContractX. Comienza gestionando clientes y contratos.
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Acceso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WelcomeClient 
              setMsg={setAlertMessage} 
              setOpenAlert={setAlertOpen} 
              setAlert={setAlertType} 
              count={dashboardData.clientsCount}
            />
            {/* Solo mostramos WelcomeUser para super_admin, o si quieres habilitarlo para contract_admin también, quita el condicional */}
            {user.role === ROLES.SUPER_ADMIN && (
              <WelcomeUser 
                setMsg={setAlertMessage} 
                setOpenAlert={setAlertOpen} 
                setAlert={setAlertType} 
                count={dashboardData.usersCount}
              />
            )}
          </div>
        </div>

        {/* Dashboard de Contract Admin */}
        <DashbRelacionamiento
          user={user}
          contracts={dashboardData.contracts}
          slas={dashboardData.slas}
        />
      </div>
    );
  }

  // CASO DEFAULT
  return (
    <div className="p-6 text-center">
      <h2>Rol no reconocido</h2>
      <p className="text-xs text-gray-400">ID detectado: {user.role}</p>
    </div>
  );
};

export default DashboardIndex;