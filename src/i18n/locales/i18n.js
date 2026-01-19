// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en.json";
import translationES from "./locales/es.json";

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
};

i18n
  .use(initReactI18next) // conecta i18next con React
  .init({
    resources,
    lng: "en", // idioma por defecto
    fallbackLng: "en", // en caso de que no se encuentre la traducción
    interpolation: {
      escapeValue: false, // React ya se encarga de esto
    },
  });

export default i18n;
