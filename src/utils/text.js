// src/utils/getText.js
import textEs from "../i18n/locales/es.json";

export function getText(key) {
  return textEs[key] || `[Texto no encontrado: ${key}]`;
}
