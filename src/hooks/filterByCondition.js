/**
 * Filtra un array de objetos según una condición.
 *
 * @param {Object[]} arr - Array de objetos a filtrar.
 * @param {Function|Object} condition -
 *    - Si es Function: se trata de un predicado que recibe (item) y retorna true/false.
 *    - Si es Object: debe tener la forma { clave: valor }, y se filtrará por igualdad estricta.
 *
 * @returns {Object[]} - Array filtrado.
 */
export function filterArray(arr, condition) {
  if (typeof condition === "function") {
    // if condition is a predicate function, use it directly
    return arr.filter(condition);
  }

  if (typeof condition === "object" && condition !== null) {
    // if condition is an object { key: value }, filter by obj[key] === value
    const key = Object.keys(condition)[0];
    const valor = condition[key];
    return arr.filter(item => item[key] === valor);
  }

  // Si la condición no es ni función ni objeto válido, devolvemos el array sin cambiar
  return arr;
}
