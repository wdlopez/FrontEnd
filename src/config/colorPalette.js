// src/config/colorPalette.js

/**
 * Paleta de colores global para usar en todos los dashboards.
 */

export const chartColors = {
  // Colores principales
  primary: '#237DF3',    // primario
  secondary: '#4178BE',  // secundario
  tertiary: '#F0C200',   // terciario
  colorError: '#FF5C5C', // error

  // Tipografía y texto
  titleBlue: '#0C1F5B',
  letterGray: '#4B5563',

  // Grises y neutros
  customGray1: '#F4F4F4',
  customGray2: '#666666',

  // Azul extendido
  blueTable: '#5A92D6',
  customBlue: '#004A94',
  darkBlue: '#CDEBF4',
  lightBlue: '#BBC9F5',
  grayBlue: '#435A99',
  grayDark: '#192457',
  darkerBlue: '#020617',
  blueTop: '#0C1F5B',

  // Modo oscuro
  dark1: '#111111',
  dark2: '#2C2C2C',
  dark3: '#1A1A1A',
  dark4: '#444444',

  // Colores para estados de contrato
  status: [
    '#237DF3', // Activo (primary)
    '#FF5C5C', // Cancelado (error)
    '#435A99', // Vencido (grayBlue)
    '#F0C200', // En Negociación (tertiary)
    '#4178BE', // Otros (secondary)
    '#0C1F5B',
    '#BBC9F5',
    '#CDEBF4'
  ],

  // Colores SLA
  sla: {
    green: '#237DF3',  // usa primary para "supera objetivo"
    yellow: '#F0C200', // tertiary para "mínimo requerido"
    red: '#FF5C5C'     // error para "incumplido"
  },
  
};
