import React, { useState, useEffect } from "react";
import ExpandableMenu from "../../molecules/ExpandableMenu";
//import getOnePermissService from "../../../services/permission-service/getOnePermiss";
const dashBoardOptions = [
  { name: "Visión Global de Contratos", path: "/dashboard/Contract" },
  { name: "Cumplimiento de E&O", path: "/dashboard/deliverable" },
  { name: "Desempeño y SLAs", path: "/dashboard/slas" },
  { name: "Gestión Financiera", path: "/dashboard/invoices" },
  { name: "Resumen Ejecutivo (C-Level)", path: "/dashboard/ejecutive" },
  { name: "Matriz de Riesgos (RAID)", path: "/dashboard/raid" },
  { name: "Control de Cambios", path: "/dashboard/request" },
  { name: "Gestión de Gobierno", path: "/dashboard/risk" },
];
const integralControl = [
  { name: "Directorio de Clientes", path: "/client"},
  { name: "Gestión de Usuarios y Roles", path: "/settings/userNroles"},
  { name: "Directorio de Proveedores", path: "/suppliers"},
  { name: "Registro Central de Contratos", path: "/contract/general"},
  { name: "Catálogo de Entregables (E&O)", path: "/Contract/deliverables"},
  { name: "Definición de Niveles de Servicio", path: "/Contract/sla"},
  { name: "Registro Central de Servicios", path: "/contract/services"},

];
const changes = [
  { name: "Solicitudes de Cambio (CRs)", path: "/Contract/deliverables"},
  { name: "Ejecución de Órdenes de Trabajo (OTs)", path: "/Contract/workOrders"},
];

const follow_up = [
  { name: "Gestión de reuniones", path: "/Relationship/"},
  { name: "Seguimiento", path: "/Relationship/" },
  { name: "Escalamiento", path: "/Relationship/"},
];

const finance = [
  { name: "Flujo de Pagos", path: "/Costs/" },
  { name: "Registro de Pagos", path: "/Costs/" },
  { name: "Auditoría", path: "/Costs/" },
];

const risks = [
  { name: "Gestión RAID", path: "/Risks/" },
  { name: "Evaluaciones", path: "/Risks/" },
];

const flows = [
  { name: "Gestion de Roles y Permisos", path: "/workflow/test" },
  { name: "Dashboard", path: "/workflow/test" },
  { name: "Diseño", path: "/workflow/test" },
  { name: "Procesos de Aprobacion", path: "/workflow/test" },
  { name: "Mis tareas", path: "/workflow/test" },
  { name: "Plantillas y Alertas", path: "/workflow/test" },
];

const practics = [
  { name: "SLA", path: "/practics/" },
  { name: "Gobierno", path: "/practics/" },
  { name: "SOW", path: "/practics/" },
  { name: "Otros", path: "/practics/" },
];

const report = [
  { name: "Informes Estándar", path: "/reports/" },
  { name: "Ad Hoc", path: "/practics/" },
];

const settings = [
  { name: "General", path: "/settings/TypeValue" },
  { name: "Notificaciones", path: "/perfil" },
  { name: "Usuarios y roles", path: "/settings/userNroles", allowedRoles: [1, 2, 7] },
  { name: "Tipos de Moneda", path: "/settings/TypeValue", allowedRoles: [1, 2] },
  { name: "Gestión de Permisos", path: "/settings/Permission", allowedRoles: [1, 2, 8] },
  { name: "Panel de Flujos", path: "/workflow/test", allowedRoles: [1, 2, 8] },
  { name: "Alertas", path: "/settings/" },
  { name: "Integraciones", path: "/settings/" },
];

const help = [
  { name: "Guía de uso", path: "/suport/" },
  { name: "Soporte", path: "/suport/" },
  { name: "FAQ", path: "/suport/" },
];

function Sidebar({ isCollapsed, setIsCollapsed, userRol, id }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        /** 
        const { permissions } = await getOnePermissService.getOnePermiss(id);
        setUserPermissions(
          permissions
            .filter(p => p.perm_status === 1)
            .map(p => p.permission.permission_name)
        );
        */
      } catch (err) {
        console.warn("No hay permisos o hubo un error al cargarlos:", err);
       // Aseguramos que, ante cualquier fallo, userPermissions quede en []
          setUserPermissions([]);
      }
    };
    fetchPerms();
  }, [id]);

const filterMenu = options => {
  return options.filter(opt => {
    const { allowedRoles, allowedPermissions } = opt;
    const roleOk = !allowedRoles || allowedRoles.includes(userRol);
    const permOk = !allowedPermissions || allowedPermissions.some(p => userPermissions.includes(p));
    // mostramos si pasa el rol O el permiso
    return roleOk || permOk;
  });
};



  return (
    <aside
      className={`
        overflow-y-scroll custom-scrollbar
        fixed top-14 left-0 h-[calc(100vh-3rem)]
        bg-customBlue dark:bg-dark1 text-white dark:text-white
        transition-all duration-300 z-40
        ${isCollapsed ? "w-16" : "w-64"}
      `}
      style={{ direction: "rtl" }}
    >
      {/* Botón para contraer/expandir el menú */}
      <button
        className="
          p-1 mb-4 rounded-md self-end flex items-center justify-center m-2
          hover:bg-darkBlue dark:hover:bg-gray-700 hover:text-customBlue dark:hover:text-gray-300
        "
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ direction: "ltr" }}
      >
        <span className="material-symbols-outlined">
          {isCollapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>

      {/* Menú */}
      <nav className="space-y-3 direction-ltr mb-10">
        <ExpandableMenu
          menuId="dashboards"
          options={dashBoardOptions}
          nameMenu={isCollapsed ? "" : "Reportes"}
          icon={"bar_chart_4_bars"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="integralControl"
          options={filterMenu(integralControl)}
          nameMenu={isCollapsed ? "" : "Gestión Contrato"}
          icon={"manage_accounts"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="changes"
          options={filterMenu(changes)}
          nameMenu={isCollapsed ? "" : "Gestión de Cambios"}
          icon={"contract_edit"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="follow_up"
          options={filterMenu(follow_up)}
          nameMenu={isCollapsed ? "" : "Control y Seguimiento"}
          icon={"groups"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="finance"
          options={finance}
          nameMenu={isCollapsed ? "" : "Finanzas"}
          icon={"request_quote"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="flows"
          options={flows}
          nameMenu={isCollapsed ? "" : "Flujos y Reglas"}
          icon={"account_tree"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="risks"
          options={risks}
          nameMenu={isCollapsed ? "" : "Riesgos"}
          icon={"warning_amber"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="practics"
          options={practics}
          nameMenu={isCollapsed ? "" : "Mejores Prácticas"}
          icon={"developer_guide"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="report"
          options={report}
          nameMenu={isCollapsed ? "" : "Informes"}
          icon={"chart_data"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="settings"
          options={filterMenu(settings)}
          nameMenu={isCollapsed ? "" : "Configuración"}
          icon={"settings"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="help"
          options={help}
          nameMenu={isCollapsed ? "" : "Ayuda"}
          icon={"contact_support"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
      </nav>
    </aside>
  );
}

export default Sidebar;
