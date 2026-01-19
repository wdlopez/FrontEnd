// src/utils/permissions.js
import permissionsConfig from "../config/permissions.json";

/**
 * Mapea método o acción a la letra de permiso.
 * @param {string} action - Puede ser verbo HTTP ('GET','POST','PUT','PATCH','DELETE') o alias como 'show','filter', etc.
 * @returns {string|null} letra de permiso o null si no se reconoce.
 */
function mapActionToLetter(action) {
  const a = action.toUpperCase();
  if (a === "GET") return "r";
  if (a === "POST") return "c";
  if (a === "PUT" || a === "PATCH") return "u";
  if (a === "DELETE") return "d";
  // mapeos personalizados:
  if (a === "SHOW") return "s";
  if (a === "FILTER" || a === "FILTRO") return "f";
  // agrega más si neceario
  return null;
}

/**
 * Valida si un rol tiene acceso a cierto recurso y acción.
 * @param {number|string} role - número o cadena de rol
 * @param {string} resource - nombre de recurso, coincide con clave en permissions.json
 * @param {string} action - método HTTP o alias de acción
 * @returns {boolean}
 */
export function hasAccess(role, resource, action) {
  const letter = mapActionToLetter(action);
  if (!letter) return false;

  const roleKey = String(role);
  const rolePerms = permissionsConfig[roleKey];
  if (!rolePerms) return false;

  const resourcePerms = rolePerms[resource];
  if (!Array.isArray(resourcePerms)) return false;

  return resourcePerms.includes(letter);
}
