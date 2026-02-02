import React from 'react';
import Toolbar from './toolBar';

const HeaderActions = ({ 
    AddComponent, 
    isActive, 
    onToggle, 
    ExportComponent, 
    children, 
    className,
    onAdd,
    addButtonLabel = "Agregar",
    onRefresh,
    showExport
}) => {
    const btnClass = "btn btn-primary !p-2 !h-[38px] !w-[38px] flex items-center justify-center shadow-sm";

    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            {/* Mostrar AddComponent si existe, si no crear un botón con onAdd */}
            {AddComponent ? (
                AddComponent
            ) : onAdd ? (
                <Toolbar position="bottom" message={addButtonLabel}>
                    <button 
                        onClick={onAdd}
                        className={btnClass}
                    >
                        <span className="material-symbols-outlined text-[22px]">add</span>
                    </button>
                </Toolbar>
            ) : null}

            {typeof isActive !== 'undefined' && typeof onToggle === 'function' && (
                <Toolbar position="bottom" message={isActive ? 'Ver inactivos' : 'Ver activos'}>
                    <button onClick={onToggle} className={btnClass}>
                        <span className="material-symbols-outlined text-[22px]">
                            {isActive ? 'find_in_page' : 'rule_folder'}
                        </span>
                    </button>
                </Toolbar>
            )}

            {/* Botón de Refrescar */}
            {onRefresh && (
                <Toolbar position="bottom" message="Refrescar">
                    <button 
                        onClick={onRefresh}
                        className={btnClass}
                    >
                        <span className="material-symbols-outlined text-[22px]">refresh</span>
                    </button>
                </Toolbar>
            )}

            {ExportComponent ? (
                ExportComponent
            ) : showExport ? (
                <Toolbar position="bottom" message="Exportar">
                    <button className={btnClass}>
                        <span className="material-symbols-outlined text-[22px]">download</span>
                    </button>
                </Toolbar>
            ) : null}

            {children}
        </div>
    );
};

export default HeaderActions;
