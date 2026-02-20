/**
 * Transforma datos del Backend al formato que InteractiveTable espera
 */
export const mapBackendToTable = (data, config) => {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => {
    // Buscamos el ID en las variantes comunes
    const row = { id: item.id || item.uuid || item.ClientEntity_id };

    config.columns.forEach(col => {

        if (col.hideInTable) return;
      if (col.mapFrom) {
        // 1. Si tiene mapFrom (como el N° o el Estado), lo usamos prioritariamente
        row[col.header] = col.mapFrom(item, index);
      } else if (col.backendKey) {
        // 2. Si tiene backendKey, buscamos ese campo directamente en el objeto del backend
        // Usamos el operador || para que si es undefined ponga un string vacío
        row[col.header] = item[col.backendKey] ?? '';
      } else if (col.possibleKeys) {
        // 3. (Opcional) Mantener compatibilidad con entidades viejas que usen possibleKeys
        const foundKey = col.possibleKeys.find(k => item[k] !== undefined);
        row[col.header] = foundKey ? item[foundKey] : '';
      } else {
        row[col.header] = '';
      }
    });

    return row;
  });
};

/**
 * Transforma una fila de la tabla al DTO que espera el Backend
 */
export const mapTableToBackend = (tableRow, config) => {
  const payload = {};
  config.columns.forEach(col => {
    if (col.backendKey) {
      // Tomamos el valor de la columna por su nombre de Header
      let value = tableRow[col.header];
      
      // Limpieza básica
      if (typeof value === 'string') {
        value = (col.type === 'email') ? value.toLowerCase().trim() : value.trim();
      }
      
      if (value !== "") {
        payload[col.backendKey] = value;
      }
    }
  });
  return payload;
};

/**
 * Genera el array 'fields' para el componente Form.jsx automáticamente
 */
export const generateFormFields = (config) => {
  return config.columns
    .filter(col => col.backendKey && col.editable !== false)
    .map(col => {
      const field = {
        name: col.backendKey,
        label: col.header,
        type: col.type || 'text',
        required: col.required || false,
        placeholder: col.placeholder || '',
        options: col.options || [],
        pattern: col.validation,
        patternMessage: col.validationMessage || `${col.header} tiene un formato inválido`
      };

      // Agregar handler onInput si hay caracteres permitidos (allowedChars)
      if (col.allowedChars) {
        field.onInput = (e) => {
          const input = e.target;
          // Filtrar solo los caracteres permitidos
          const filtered = input.value
            .split('')
            .filter(char => col.allowedChars.test(char))
            .join('');
          
          // Solo actualizar si cambió
          if (filtered !== input.value) {
            input.value = filtered;
            // Disparar un evento de cambio para que react-hook-form se entere
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        };
      }

      return field;
    });
};