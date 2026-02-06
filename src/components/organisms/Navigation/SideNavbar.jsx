import React, { useState, useEffect } from "react";
import ExpandableMenu from "../../molecules/ExpandableMenu";
//import getOnePermissService from "../../../services/permission-service/getOnePermiss";
const dashBoardOptions = [
  { name: "Contratos", path: "/dashboard/Contract" },
  { name: "Solicitudes", path: "/dashboard/request" },
  { name: "Riesgos", path: "/dashboard/risk" },
  { name: "Entregables", path: "/dashboard/deliverable" },
  { name: "Facturas", path: "/dashboard/invoices" },
  { name: "RAID", path: "/dashboard/raid" },
  { name: "Ejecutivo", path: "/dashboard/ejecutive" },
  { name: "Niveles de servicio", path: "/dashboard/slas" },
];
const integralControl = [
  { name: "Clientes", path: "/client", allowedRoles: [1], allowedPermissions: ["read-clients"] },
  { name: "Contratos", path: "/contract/general"},
  { name: "Usuarios", path: "/settings/userNroles", allowedRoles: [1, 2, 8], allowedPermissions: ["read-users"] },
  { name: "Proveedores", path: "/suppliers"},
  { name: "Entregables", path: "/Contract/deliverables", allowedRoles: [1, 2, 3, 8, 9], allowedPermissions: ["read-deliverables"] },
  { name: "Servicios", path: "/contract/services", allowedRoles: [1, 2, 3, 8, 9] },
  { name: "SLAs", path: "/Contract/sla", allowedRoles: [1, 2, 8], allowedPermissions: ["read-serviceLevel"] },
  { name: "Clausulas", path: "/Contract/clauses", allowedRoles: [1, 2,] }, // 👈 Agregado

];
const contract = [
  { name: "Entregables", path: "/Contract/deliverables", allowedRoles: [1, 2, 3, 8, 9], allowedPermissions: ["read-deliverables"] },
  { name: "SLAs", path: "/Contract/sla", allowedRoles: [1, 2, 8], allowedPermissions: ["read-serviceLevel"] },
  // { name: "Ventanas de medición", path: "/contract/measurementWindows", allowedRoles: [1, 7] },
  { name: "Ordenes de Trabajo", path: "/Contract/workOrders", allowedRoles: [1, 2, 3, 4] },
];

const relationship = [
  { name: "gestión de Reuniones", path: "/Relationship/", allowedRoles: [1, 2, 3, 4, 7] },
  { name: "Seguimiento", path: "/Relationship/" },
  { name: "Escalamiento", path: "/Relationship/", allowedRoles: [1, 2, 3, 4, 7] },
];

const costs = [
  { name: "Registro de Pagos", path: "/Costs/" },
  { name: "Flujo de Pago", path: "/Costs/" },
  { name: "Auditoría", path: "/Costs/" },
];

const risks = [
  { name: "gestión RAID", path: "/Risks/" },
  { name: "Evaluaciones", path: "/Risks/" },
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
          nameMenu={isCollapsed ? "" : "Dashboards"}
          icon={"bar_chart_4_bars"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="integralControl"
          options={filterMenu(integralControl)}
          nameMenu={isCollapsed ? "" : "Configuración Contrato"}
          icon={"manage_accounts"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="contract"
          options={filterMenu(contract)}
          nameMenu={isCollapsed ? "" : "Gestión de Contratos"}
          icon={"contract_edit"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="relationship"
          options={filterMenu(relationship)}
          nameMenu={isCollapsed ? "" : "Relacionamiento"}
          icon={"groups"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="costs"
          options={costs}
          nameMenu={isCollapsed ? "" : "Gastos"}
          icon={"request_quote"}
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
