/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode:'class',
  theme: {
    extend: {
       colors: {
        primary: '#237DF3',
        secondary: '#4178BE',
        tertiary:'#F0C200',
        colorError:'#FF5C5C',
        titleBlue:'#0C1F5B',
        customGray1:'#F4F4F4',
        customGray2:'#666666',
        letterGray:"#4B5563",
        blueTable:"#5A92D6",
        customBlue:'#004A94',
        darkBlue:'#CDEBF4',
        lightBlue:'#BBC9F5',
        grayBlue:'#435A99',
        grayDark:'#192457',
        darkerBlue:'#020617',
        dark1:'#111111',
        dark2:'#2C2C2C',
        dark3:'#1A1A1A',
        dark4:'#444444',
        blueTop:'#0C1F5B'
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};