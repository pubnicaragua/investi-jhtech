import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { useLanguage } from "../contexts/LanguageContext"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = async () => {
    const newLang = language === "es" ? "en" : "es"
    await setLanguage(newLang)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
      <Text style={styles.text}>{language.toUpperCase()}</Text>
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
