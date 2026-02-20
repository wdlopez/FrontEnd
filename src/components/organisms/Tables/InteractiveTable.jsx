import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Pagination from "../../molecules/Pagination";
import { Link } from "react-router-dom";
import MenuModal from "../Navigation/MenuModal";
import Toolbar from "../Navigation/ToolBar";

function InteractiveTable({
  data,
  columnWidths = [],
  onSubmit,
  onEdit,
  onAdd,
  onDelete,
  rowsPerPage = 12,
  originData,
  parameterId,
  configModalC = {},
  selectColumns = {},
  columnMapping = {},
  typeColumns = {},
  parameterState,
  actionButton,
  path,
  nonEditableColumns = [],
  checkboxSelectAllOptions = false,
  hiddenColumns = [],
  headerButtons = null,
}) {
  const [editableCell, setEditableCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ rowIndex: 0, colIndex: 0 });
  const [editingValue, setEditingValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // valueCell removed (not used) to avoid unused variable warnings
  const [currentPage, setCurrentPage] = useState(1);
  const [dynamicRowsPerPage, setDynamicRowsPerPage] = useState(rowsPerPage);
  const [selectedRow, setSelectedRow] = useState(null);
  const [filters, setFilters] = useState({});
  const [tempSelected, setTempSelected] = useState({});
  const [sortConfig, setSortConfig] = useState({ column: null, ascending: true });
  const tableRef = useRef(null);
  // checkboxModal removed (unused in current simplified implementation)
  
  // Estado para columnas ocultas por el usuario
  const [userHiddenColumns, setUserHiddenColumns] = useState([]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Referencia para cerrar el menú al hacer click fuera
  const columnMenuRef = useRef(null);
  const columnButtonRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updatePos = () => {
      if (columnButtonRef.current) {
        const r = columnButtonRef.current.getBoundingClientRect();
        setMenuPos({ left: r.left, top: r.bottom });
      }
    };
    if (showColumnMenu) {
      updatePos();
      window.addEventListener('resize', updatePos);
      window.addEventListener('scroll', updatePos, true);
    }
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [showColumnMenu]);

  // console.log(path);
  // Ajusta rowsPerPage según la altura de la ventana
  useEffect(() => {
    const calculateRows = () => {
      const h = window.innerHeight;
      let n;
      if (h < 600) n = rowsPerPage;
      else if (h < 800) n = rowsPerPage;
      else if (h < 1000) n = rowsPerPage + 4;
      else n = rowsPerPage + 8;
      setDynamicRowsPerPage(n);
    };
    calculateRows();
    window.addEventListener("resize", calculateRows);
    return () => window.removeEventListener("resize", calculateRows);
  }, [rowsPerPage]);

  // Efecto para manejar el foco
  useEffect(() => {
    if (tableRef.current && selectedCell.rowIndex >= 0 && selectedCell.colIndex >= 0) {
      const rows = tableRef.current.querySelectorAll("tbody tr");
      if (rows[selectedCell.rowIndex]) {
        const cell = rows[selectedCell.rowIndex].children[selectedCell.colIndex + 1];
        if (editableCell) {
          const input = cell?.querySelector('input, select, button');
          input?.focus();
        } else if (cell) {
          cell.focus();
        }
      }
    }
  }, [selectedCell, editableCell]);
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full p-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-dark3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Sin registros</div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">No se encontraron elementos para mostrar en esta tabla.</p>
          {headerButtons ? (
            <div className="flex items-center justify-center">{headerButtons}</div>
          ) : (
            <div className="text-sm text-gray-500">Añade registros desde el módulo correspondiente.</div>
          )}
        </div>
      </div>
    );
  }

  const columns = Array.isArray(data) && data.length > 0 && data[0]
    ? Object.keys(data[0])
    : [];
  
  // Combinar columnas ocultas por props y por usuario
  const allHiddenColumns = [...hiddenColumns, ...userHiddenColumns];

  const displayedColumns = columns.filter(
    (col) =>
      col.toLowerCase() !== "id" &&
      col !== parameterState &&
      col !== configModalC.parameterConnec &&
      !allHiddenColumns.includes(col)
  );

  // Toggle de visibilidad de columna
  const toggleColumn = (columnName) => {
    setUserHiddenColumns(prev => {
      if (prev.includes(columnName)) {
        return prev.filter(c => c !== columnName);
      } else {
        return [...prev, columnName];
      }
    });
  };

  //   const columnWidthMap = React.useMemo(() => {
  //   const map = {};
  //   columnWidths.forEach(({ column, width }) => {
  //     map[column] = width;
  //   });
  //   return map;
  // }, [columnWidths]);

  const widthMap = new Map();
  columnWidths.forEach(({ column, width }) => {
    widthMap.set(column, width);
  });


  const filteredData = data.filter((row) =>
    Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      return row[key]?.toString().toLowerCase().includes(filterValue.toLowerCase());
    })
  );

  const sortedData = sortConfig.column
    ? [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.column];
      const bVal = b[sortConfig.column];
      const isNumeric = (val) => !isNaN(parseFloat(val)) && isFinite(val);
      if (isNumeric(aVal) && isNumeric(bVal)) {
        return sortConfig.ascending
          ? parseFloat(aVal) - parseFloat(bVal)
          : parseFloat(bVal) - parseFloat(aVal);
      }
      return sortConfig.ascending
        ? aVal?.toString().localeCompare(bVal?.toString())
        : bVal?.toString().localeCompare(aVal?.toString());
    })
    : filteredData;

  // Usamos dynamicRowsPerPage para la paginación
  const totalPages = Math.ceil(sortedData.length / dynamicRowsPerPage);
  const startIndex = (currentPage - 1) * dynamicRowsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + dynamicRowsPerPage);

  // Navegación con teclado
  const handleKeyDown = (e, rowIdx, colIdx) => {
    if (editableCell) return;
    let nextRow = rowIdx;
    let nextCol = colIdx;
    const maxRow = currentData.length - 1;
    const maxCol = displayedColumns.length - 1;
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        handleDoubleClick(rowIdx, colIdx, currentData[rowIdx]);
        break;
      case "ArrowRight":
        e.preventDefault();
        nextCol = Math.min(colIdx + 1, maxCol);
        break;
      case "ArrowLeft":
        e.preventDefault();
        nextCol = Math.max(colIdx - 1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        nextRow = Math.min(rowIdx + 1, maxRow);
        break;
      case "ArrowUp":
        e.preventDefault();
        nextRow = Math.max(rowIdx - 1, 0);
        break;
      case "Tab":
        e.preventDefault();
        if (colIdx < maxCol) nextCol = colIdx + 1;
        else if (rowIdx < maxRow) {
          nextCol = 0;
          nextRow = rowIdx + 1;
        }
        break;
      default:
        return;
    }
    setSelectedCell({ rowIndex: nextRow, colIndex: nextCol });
  };

  // Edición con doble clic o Enter
  const handleDoubleClick = (rowIndex, colIndex, row) => {
    const colName = displayedColumns[colIndex];
    if (colIndex === 0) return;
    if (colName.toLowerCase() === "id" || nonEditableColumns.includes(colName)) return;
    
    // Capturar el valor actual
    setEditingValue(row[colName] || "");
    setEditableCell({ rowIndex, colIndex });
    const newSelectedRow = originData?.find((o) => o[parameterId] === row.id) || row;
    setSelectedRow(newSelectedRow);
  };

  // Guardar cambios de edición inline
  const handleEditSave = async (rowIndex, colIndex, row, newValue) => {
    const colName = displayedColumns[colIndex];
    
    // Si el valor no cambió, cancelar edición
    if (newValue === (row[colName] || "")) {
      setEditableCell(null);
      return;
    }

    setIsSaving(true);
    try {
      // Llamar a onEdit con los datos de la fila, la columna y el nuevo valor
      if (onEdit) {
        await onEdit({
          row,
          column: colName,
          newValue,
          rowIndex,
          colIndex,
          realColumn: columnMapping[colName] || colName
        });
      }
    } catch (error) {
      console.error("Error al guardar edición:", error);
    } finally {
      setIsSaving(false);
      setEditableCell(null);
      setEditingValue("");
    }
  };

  // closeCheckboxModal removed (unused after cleanup)

  // handleCheckboxSave removed (unused)

  // Submit desde inputs
  const handleInputKeyDown = (e, rowIdx, colIdx, col, row) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newValue = e.target.value;
      handleEditSave(rowIdx, colIdx, row, newValue);
    }
  };

  // handleSelectAll removed (unused)

  const handleSortChange = (col, /*checked*/) => {
    setSortConfig(prev => ({
      column: col,
      ascending: prev.column === col ? !prev.ascending : true
    }));
  };

  return (
    <div className="flex flex-col w-full relative">

      <div className="responsive-table !table-auto w-full flex flex-col items-center relative">
        <div className="w-full overflow-y-auto max-h-[75vh] overflow-x-auto flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-dark3" style={{ scrollPaddingTop: '80px' }}>

          {/* Toolbar Superior dentro del contenedor desplazable para que se desplace horizontalmente con la tabla */}
          <div className="w-full sticky top-0 left-0 bg-white/80 dark:bg-dark3/80 backdrop-blur-sm px-1 py-1 z-20">
            <div className="w-full flex flex-wrap items-center justify-start gap-2 relative">
              {/* Configurar Columnas (Izquierda) */}
              <button
                ref={columnButtonRef}
                onClick={() => setShowColumnMenu(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Configurar columnas visibles"
              >
                <span className="material-symbols-outlined text-[20px]">view_column</span>
                <span className="hidden sm:inline">Columnas</span>
              </button>

              {/* Botones de acción (Derecha de configurar columnas) */}
              {headerButtons && (
                <div className="flex items-center gap-2 ml-2">
                  {headerButtons}
                </div>
              )}

              {showColumnMenu && menuPos && createPortal(
                <div ref={columnMenuRef} style={{ position: 'fixed', left: menuPos.left, top: menuPos.top, zIndex: 2000 }} className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-[300px] overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 px-2 uppercase tracking-wider">Columnas Visibles</div>
                    {columns.filter(col => col.toLowerCase() !== "id" && col !== parameterState && col !== configModalC.parameterConnec).map(col => (
                      <label key={col} className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={!allHiddenColumns.includes(col)}
                          onChange={() => toggleColumn(col)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-200 truncate select-none" title={col}>{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              , document.body)}
            </div>
          </div>

          <div className="w-full min-w-full">
            <table
              className="w-full text-sm text-left text-gray-500 dark:text-gray-400"
              ref={tableRef}
              tabIndex={0}
            >
              <colgroup>
                {/* Checkbox (selección) */}
                <col style={{ width: "60px" }} />

                {/* Columnas dinámicas */}
                {displayedColumns.map((col, index) => (
                  <col
                    key={index}
                    style={
                      index === 0
                        ? { width: "60px", minWidth: "60px", maxWidth: "60px" } // primera columna
                        : { minWidth: "150px" }
                    }
                  />
                ))}

                {/* Columna de acciones */}
                <col style={{ minWidth: "100px" }} />
              </colgroup>

              <thead className="bg-customBluee text-white dark:bg-dark1 dark:text-gray-200 text-xs uppercase">
                <tr>
                  {/* Checkbox Sticky */}
                  <th className="sticky left-0 z-30 w-[60px] min-w-[60px] px-4 py-3 bg-customBlue dark:bg-dark1 border-r border-blue-400 dark:border-gray-600">
                    {/* <input type="checkbox" className="accent-white" onChange={handleSelectAll} /> */}
                  </th>

                  {/* Columnas */}
                  {displayedColumns.map((col, index) => {
                    // Primera columna de datos es sticky (después del checkbox)
                    const isSticky = index === 0;
                    const stickyClass = isSticky 
                      ? "sticky left-[60px] z-30 border-r-2 border-r-blue-300 dark:border-r-gray-500 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.2)] bg-customBlue dark:bg-dark1" 
                      : "border-r border-blue-400 dark:border-gray-600 last:border-r-0";

                    return (
                      <th
                        key={index}
                        className={`px-4 py-3 text-left font-bold bg-customBlue dark:bg-dark1 dark:text-gray-200 ${stickyClass}`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-sm font-bold truncate max-w-full" title={col}>
                            {col}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={filters[col] || ""}
                              onChange={(e) => setFilters({ ...filters, [col]: e.target.value })}
                              className="w-full min-w-[80px] px-2 py-1 border-none rounded bg-blue-700/30 dark:bg-gray-700 text-white dark:text-gray-200 placeholder-blue-200/50 dark:placeholder-gray-500 text-xs focus:ring-1 focus:ring-blue-300 outline-none transition-all"
                              placeholder="Buscar..."
                            />
                            <label className="cursor-pointer hover:bg-blue-700/50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={sortConfig.column === col ? !sortConfig.ascending : false}
                                onChange={(e) => handleSortChange(col, e.target.checked)}
                                className="hidden"
                              />
                              <span className={`material-symbols-outlined text-[16px] ${sortConfig.column === col ? 'text-white' : 'text-blue-300 dark:text-gray-500'}`}>swap_vert</span>
                            </label>
                          </div>
                        </div>
                      </th>
                    );
                  })}

                  {/* Acciones */}
                  {(onDelete || actionButton || path !== undefined) &&
                    (
                      <th className="px-4 py-3 text-center font-bold bg-customBlue dark:bg-dark1 dark:text-gray-200 border-l border-blue-400 dark:border-gray-600 min-w-[140px]">
                        ACCIONES
                      </th>
                    )}

                </tr>
              </thead>

              <tbody>
                {currentData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group odd:bg-gray-50 even:bg-white dark:odd:bg-dark4 dark:even:bg-dark3 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                    <td
                      className={`
                        px-4 py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer align-top
                        sticky left-0 z-20 w-[60px] min-w-[60px]
                        bg-white group-odd:bg-gray-50 group-hover:bg-blue-50
                        dark:bg-dark3 dark:group-odd:bg-dark4 dark:group-hover:bg-gray-800
                        transition-colors
                      `}
                      onClick={() => setSelectedCell({ rowIndex, colIndex: -1 })}
                    >
                      {configModalC?.parameterConnec ? (
                        <MenuModal
                          icon={configModalC.icon}
                          styleBtn={configModalC.styleBtn}
                          elementsRedirect={
                            row[configModalC.parameterConnec] || []
                          }
                        />
                      ) : (
                        <>
                          {/* <input type="checkbox" className="row-checkbox" /> */}
                        </>
                      )}
                    </td>
                    {displayedColumns.map((col, colIndex) => {
                      const isSticky = colIndex === 0;
                      const stickyClass = isSticky 
                        ? "sticky left-[60px] z-20 border-r-2 border-r-gray-300 dark:border-r-gray-500 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] bg-white group-odd:bg-gray-50 group-hover:bg-blue-50 dark:bg-dark3 dark:group-odd:bg-dark4 dark:group-hover:bg-gray-800" 
                        : "";
                      
                      const widthClass = widthMap.get(col) || "min-w-[150px] max-w-[300px]";
                      
                      return (
                        <td
                          key={colIndex}
                          onClick={() => setSelectedCell({ rowIndex, colIndex })}
                          onDoubleClick={() => onEdit ? null : handleDoubleClick(rowIndex, colIndex, row)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                          className={`px-4 py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer align-top ${widthClass} ${stickyClass} transition-colors
                        ${((editableCell?.rowIndex === rowIndex && editableCell?.colIndex === colIndex) ||
                              (selectedCell.rowIndex === rowIndex && selectedCell.colIndex === colIndex))
                              ? "!bg-blue-100 dark:!bg-blue-900/40 ring-2 ring-inset ring-blue-400 z-25"
                              : ""
                            }`}
                          tabIndex={0}
                        >
                          {editableCell?.rowIndex === rowIndex && editableCell?.colIndex === colIndex ? (
                            // Caso edición
                            typeColumns[col] === 'checkbox' && Array.isArray(selectColumns[col]) ? (
                              // En vez de render inline, usamos MenuModal para mostrar opciones en popup
                              <MenuModal icon="edit" styleBtn="btn btn-sm btn-secondary" position="right" size="xl">
                                <div className="p-2 ">
                                  {/* Contenedor con tabIndex para captura de Enter */}
                                  <div
                                  
                                    className="flex flex-col space-y-2"
                                    tabIndex={0}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const real = columnMapping[col] || col;
                                        onSubmit({ ...selectedRow, [real]: tempSelected[col] || [] });
                                        setEditableCell(null);
                                      }
                                    }}
                                  >
                                    {/* Botones Seleccionar / Deseleccionar todos si aplica */}
                                    {checkboxSelectAllOptions && (
                                      <div className="flex gap-2 mb-2">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline"
                                          onClick={() => {
                                            const all = selectColumns[col].map(o => o.value);
                                            setTempSelected(prev => ({ ...prev, [col]: all }));
                                          }}
                                        >
                                          Seleccionar todos
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline"
                                          onClick={() => {
                                            setTempSelected(prev => ({ ...prev, [col]: [] }));
                                          }}
                                        >
                                          Deseleccionar todos
                                        </button>
                                      </div>
                                    )}

                                    {/* Lista de checkboxes */}
                                    <div className="max-h-48 overflow-auto" >
                                      {selectColumns[col].map(opt => {
                                        const current = tempSelected[col] ??
                                          (Array.isArray(selectedRow[columnMapping[col] || col])
                                            ? selectedRow[columnMapping[col] || col]
                                            : []);
                                        const checked = current.includes(opt.value);
                                        return (
                                          <label key={opt.value} className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={e => {
                                                let arr = [...current];
                                                if (e.target.checked) {
                                                  if (!arr.includes(opt.value)) arr.push(opt.value);
                                                } else {
                                                  arr = arr.filter(v => v !== opt.value);
                                                }
                                                setTempSelected(prev => ({ ...prev, [col]: arr }));
                                              }}
                                              className="w-4 h-4"
                                            />
                                            <span className="text-gray-900 dark:text-gray-100">{opt.label}</span>
                                          </label>
                                        );
                                      })}
                                    </div>

                                    {/* Botón de Guardar en el modal */}
                                    <div className="mt-2 flex justify-end">
                                      <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                          const real = columnMapping[col] || col;
                                          onSubmit({ ...selectedRow, [real]: tempSelected[col] || [] });
                                          setEditableCell(null);
                                        }}
                                      >
                                        Guardar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </MenuModal>
                            )
                              : selectColumns[col] ? (
                                <select
                                  defaultValue={row[col]}
                                  onChange={(e) => {
                                    const realColumn = columnMapping[col] || (colIndex === 1 ? "min-w-[50px]" : "min-w-[150px]");
                                    onSubmit({
                                      ...selectedRow,
                                      [realColumn]: e.target.value,
                                    });
                                    setEditableCell(null);
                                  }}
                                  onBlur={() => setEditableCell(null)}
                                  onKeyDown={(e) => handleInputKeyDown(e, rowIndex, colIndex, col)}
                                  className="rounded py-1 outline-none text-black dark:text-gray-800 w-full"
                                >
                                  {selectColumns[col].map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                  <input
                                    lang="es-ES"
                                    type={typeColumns[col] || "text"}
                                    defaultValue={row[col]}
                                    onBlur={(e) => handleEditSave(rowIndex, colIndex, row, e.target.value)}
                                    onKeyDown={(e) => handleInputKeyDown(e, rowIndex, colIndex, col, row)}
                                    className="rounded py-1 outline-none text-black dark:text-gray-800 w-full"
                                    autoFocus
                                  />
                              )
                          ) : (
                            <div
                              className={`w-full ${isSticky ? '' : 'truncate'} block`}
                              title={typeof row[col] === 'string' ? row[col] : ''}
                            >
                            <p key={colIndex} className="truncate">
                              {React.isValidElement(row[col]) ? row[col] : (typeof row[col] === 'object' ? '' : String(row[col]))}
                            </p>

                            </div>
                          )}
                        </td>
                      );
                    })}
                    {(onDelete || onAdd || actionButton || path !== undefined) &&
                      <td className="px-4 py-3 border-l border-gray-200 dark:border-gray-700 min-w-[140px]">
                        <div className="flex items-center justify-center gap-2">
                            {/* Botón Editar */}
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(row)}
                                    disabled={isSaving}
                                    className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded p-1 transition-colors disabled:opacity-50"
                                    title="Editar"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                            )}

                            {/* Botón Agregar */}
                            {onAdd && (
                                <button
                                    onClick={() => onAdd()}
                                    className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                                    title="Agregar"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            )}

                            {/* Botón Eliminar */}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(row)}
                                    disabled={isSaving}
                                    className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded p-1 transition-colors disabled:opacity-50"
                                    title="Eliminar"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            )}

                            {/* Botón Ver Detalles */}
                            {path && (
                                <Link to={`${path}${row.id}`} className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded p-1 transition-colors" title="Ver detalles">
                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </Link>
                            )}

                            {/* Acciones extra */}
                            {actionButton && (
                              React.isValidElement(actionButton)
                                ? React.cloneElement(actionButton, { row })
                                : typeof actionButton === "function"
                                  ? actionButton(row)
                                  : null
                            )}
                        </div>
                      </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}

export default InteractiveTable;
