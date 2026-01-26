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
    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            {/* Mostrar AddComponent si existe, si no crear un botón con onAdd */}
            {AddComponent ? (
                AddComponent
            ) : onAdd ? (
                <button 
                    onClick={onAdd}
                    className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition'
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    {addButtonLabel}
                </button>
            ) : null}

            {/* Botón de Refrescar */}
            {onRefresh && (
                <button 
                    onClick={onRefresh}
                    className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2 transition'
                    title="Refrescar datos"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
            )}

            {typeof isActive !== 'undefined' && typeof onToggle === 'function' && (
                <Toolbar position="bottom" message={isActive ? 'Ver registros activos' : 'Ver registros inactivos'}>
                    <button onClick={onToggle} className='btn btn-primary'>
                        <span className="material-symbols-outlined">
                            {isActive ? 'content_paste_go' : 'content_paste_off'}
                        </span>
                    </button>
                </Toolbar>
            )}

            {ExportComponent}

            {children}
        </div>
    );
};

export default HeaderActions;
