import { Text, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es"
    i18n.changeLanguage(newLang)
  }

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      style={{
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: "#374151",
        }}
      >
        {i18n.language.toUpperCase()}
      </Text>
    </TouchableOpacity>
  )
}
