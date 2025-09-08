import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next"

export function LanguageToggle() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es"
    i18n.changeLanguage(newLang)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
      <Text style={styles.text}>{i18n.language.toUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
})
