function formatDate(isoString) {
  const date = new Date(isoString);  // ahora isoString = "2025-05-12T14:00:00.000Z"
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimeZone
  });
}


export default formatDate;
