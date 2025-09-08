import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next"

interface EmptyStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function EmptyState({ title, message, onRetry }: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || t("common.noData")}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#667",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#2673f3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
