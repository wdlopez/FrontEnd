import React from 'react';
import Toolbar from './toolBar';

const HeaderActions = ({ AddComponent, isActive, onToggle, ExportComponent, children, className }) => {
    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            {AddComponent}

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
