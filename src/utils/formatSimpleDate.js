export default function formatSimpleDate(isoString) {
  if (!isoString) return '';

  // Validar si es solo fecha sin hora
  const isOnlyDate = /^\d{4}-\d{2}-\d{2}$/.test(isoString);

  // Parsear como UTC si es solo fecha para evitar desfase por zona horaria
  const date = isOnlyDate
    ? new Date(isoString + 'T12:00:00Z') // Añadir 'Z' para UTC
    : new Date(isoString);

  // Validar si la fecha es válida
  if (isNaN(date.getTime())) return 'Fecha inválida';

  // Obtener la zona horaria del usuario
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: userTimeZone, // Formatear en la zona horaria del usuario
  });
}