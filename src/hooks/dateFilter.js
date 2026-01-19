// src/utils/dateFilter.js

/**
 * Devuelve un array filtrado de items cuyo campo de fecha (dateField)
 * cae dentro del período especificado por periodKey.
 */
export function filterByPeriod(items, periodKey, dateField = "date") {
  if (!Array.isArray(items)) return [];

  const now = new Date();
  let startDate;

  switch (periodKey) {
    case "7D":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "MTD":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "YTD":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "1Y":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 364);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "ALL":
    default:
      return items.slice();
  }

  return items.filter((item) => {
    const value = item[dateField];
    if (!value) return false;
    const itemDate = new Date(value);
    if (isNaN(itemDate)) return false;
    // SOLO cota inferior, para incluir fechas futuras:
    return itemDate >= startDate;
  });
}
