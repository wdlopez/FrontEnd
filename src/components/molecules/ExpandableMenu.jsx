import React from "react";
import { Link } from "react-router-dom";

function ExpandableMenu({
  menuId,
  options,
  nameMenu,
  icon,
  isCollapsed,
  openMenu,
  setOpenMenu,
  setIsCollapsed,
}) {
  const isOpen = openMenu === menuId;

  const handleOpenMenu = () => {
    setOpenMenu(isOpen ? null : menuId);
    setIsCollapsed(false);
  };

  const handleSelectMenu = () => {
    setOpenMenu(null);
    setIsCollapsed(true);
  };

  return (
    <div>
      <button
        className="font-sans flex items-center gap-2 p-2 w-full hover:bg-blue-700 dark:bg-dark1 dark:hover:bg-customBlue hover:text-white rounded-md outline-none"
        onClick={handleOpenMenu}
      >
        <span className="material-symbols-outlined">{icon}</span>
        {!isCollapsed && <h3>{nameMenu}</h3>}
      </button>

      {!isCollapsed && isOpen && (
        <div className="ml-4 border-l border-gray-300 pl-2">
          {options.map((option, index) => {
            let linkTo;
            if (typeof option.path === 'object' && option.path !== null) {
              linkTo = option.path;
            } else if (option.state) {
              linkTo = {
                pathname: option.path,
                state: option.state,
              };
            } else {
              linkTo = option.path;
            }

            // AÑADE ESTE CONSOLE.LOG
            if (option.name === "Niveles de servicio") { // O el nombre exacto de la opción
              console.log("ExpandableMenu: linkTo para Niveles de servicio:", linkTo);
            }

            return (
              <Link
                key={index}
                to={linkTo}
                onClick={handleSelectMenu}
                className="block p-2 text-sm hover:bg-gray-700 rounded-md hover:text-white"
              >
                {option.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExpandableMenu;