import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import * as Localization from "expo-localization"

import en from "./locales/en.json"
import es from "./locales/es.json"

const resources = {
  en: { translation: en },
  es: { translation: es },
}

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: Localization.getLocales()[0]?.languageCode || "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
