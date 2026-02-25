// src/utils/getText.js
import textEs from "../i18n/locales/es.json";

/**
 * Obtiene un texto del diccionario i18n (es.json).
 * Soporta claves anidadas con notación por puntos, ej: "intros.clients", "entities.client.formInfo".
 */
export function getText(key) {
  if (!key || typeof key !== "string") return "";
  const value = key.includes(".")
    ? key.split(".").reduce((obj, k) => (obj != null && typeof obj === "object" ? obj[k] : undefined), textEs)
    : textEs[key];
  return typeof value === "string" ? value : `[Texto no encontrado: ${key}]`;
}

/** Mapeo nombre de entidad (config.name) a clave en entities para formInfo */
const ENTITY_NAME_TO_KEY = {
  Cliente: "client",
  Proveedor: "provider",
  Usuario: "user",
  Contrato: "contract",
  Entregable: "deliverable",
  SLA: "sla",
  Servicio: "service",
  Cláusula: "clause",
  "Ventana de Medición": "measurementWindow",
};

/**
 * Devuelve el texto de ayuda del formulario para una entidad (crear/editar).
 * Usar en GenericAddModal y GenericEditModal con config.name.
 */
export function getEntityFormInfo(entityName, fallback = "") {
  const key = ENTITY_NAME_TO_KEY[entityName];
  if (!key) return fallback;
  const value = getText(`entities.${key}.formInfo`);
  return value.startsWith("[Texto no encontrado") ? fallback : value;
}
