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
  { name: "Catálogo de Entregables (E&O)", path: "/contract/deliverables"},
  { name: "Definición de Niveles de Servicio", path: "/contract/sla"},
  { name: "Registro Central de Servicios", path: "/contract/services"},

];
const changes = [
  { name: "Solicitudes de Cambio (CRs)", path: "/Contract/deliverables"},
  { name: "Ejecución de Órdenes de Trabajo (OTs)", path: "/contract/workOrders"},
];

const schemas = [
  { name: "Esquemas de Contratos", path: "/contract/schemas"},
  { name: "Esquemas de Proveedores", path: "/suppliers/schemas"},
  { name: "Esquemas de Entregables", path: "/deliverables/schemas"},
  { name: "Esquemas de Slas", path: "/slas/schemas"},
  { name: "Esquemas de Facturas", path: "/invoices/schemas"},
]

const follow_up = [
  { name: "Gestión de reuniones", path: "/Relationship/"},
  { name: "Seguimiento", path: "/Relationship/" },
  { name: "Escalamiento", path: "/Relationship/"},
];

const finance = [
  { name: "Flujo de Pagos", path: "/Costs/" },
  { name: "Registro de Pagos", path: "/invoices" },
  { name: "Auditoría", path: "/Costs/" },
];

const risks = [
  { name: "Gestión RAID", path: "/Risks/" },
  { name: "Evaluaciones", path: "/Risks/" },
  { name: "Análisis de Exposición y Seguros", path: "/Risks/" },
];

const flows = [
  { name: "Configuración de Accesos y Roles", path: "/workflow/test" },
  { name: "Monitor de Procesos Activos", path: "/workflow/test" },
  { name: "Diseñador de Reglas y Automatización", path: "/workflow/test" },
  { name: "Procesos de Aprobacion", path: "/workflow/test" },
  { name: "Mis tareas", path: "/workflow/test" },
  { name: "Plantillas y Alertas", path: "/workflow/test" },
];

const ia =[
  { name: "Extracción de Datos (OCR & NLP)", path: "/ia/contractWriter" },
]

const practics = [
  { name: "Estándares de Gobierno Corporativo", path: "/practics/" },
  { name: "Biblioteca de SOW y Alcances", path: "/practics/" },
  { name: "Guía de Diseño de SLAs", path: "/practics/" },
  { name: "Otros Recursos y Documentación", path: "/practics/" },
];

const report = [
  { name: "Informes Estándar", path: "/reports/" },
  { name: "Ad Hoc", path: "/practics/" },
];

const settings = [
  { name: "Parámetros Regionales y Moneda", path: "/settings/TypeValue" },
  { name: "Centro de Integraciones (API/Webhooks)", path: "/perfil" },
  { name: "Personalización de Marca", path: "/settings/userNroles",}
];

const help = [
  { name: "FAQ", path: "/suport/" },
  { name: "Guía de uso", path: "/suport/" },
  { name: "Soporte", path: "/suport/" },
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
          menuId="schemas"
          options={filterMenu(schemas)}
          nameMenu={isCollapsed ? "" : "Esquemas"}
          icon={"schema"}
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
          menuId="ia"
          options={ia}
          nameMenu={isCollapsed ? "" : "IA"}
          icon={"smart_toy"}
          isCollapsed={isCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          setIsCollapsed={setIsCollapsed}
        />
        <ExpandableMenu
          menuId="practics"
          options={practics}
          nameMenu={isCollapsed ? "" : "Base de Conocimiento"}
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
