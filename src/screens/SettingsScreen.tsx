import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Shield,
  Lock,
  Bell,
  TrendingUp,
  Rocket,
  HelpCircle,
  FileText,
  Eye,
  Info,
  FileCheck,
  LogOut,
  Headphones,
} from "lucide-react-native";
import { LanguageToggle } from "../components/LanguageToggle";
import { authSignOut } from "../rest/api";
import { useAuthGuard } from "../hooks/useAuthGuard";

export function SettingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  useAuthGuard();

  const handleSignOut = () => {
    Alert.alert(
      t("settings.signOutConfirmTitle"),
      t("settings.signOutConfirmMessage"),
      [
        { text: t("settings.cancel"), style: "cancel" },
        {
          text: t("settings.signOut"),
          style: "destructive",
          onPress: async () => {
            await authSignOut();
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
          },
        },
      ]
    );
  };

  const handleComingSoon = (label: string) => {
    Alert.alert(label, "✨ Esta sección estará disponible pronto.");
  };

  const settingsItems = [
    { icon: Lock, label: t("settings.loginSecurity") },
    { icon: Shield, label: t("settings.dataPrivacy") },
    { icon: Bell, label: t("settings.notifications") },
    { icon: TrendingUp, label: t("settings.angelInvestor") },
    { icon: Rocket, label: t("settings.startups") },
  ];

  const supportItems = [
    { icon: HelpCircle, label: t("settings.helpCenter") },
    { icon: FileText, label: t("settings.privacyPolicy") },
    { icon: Eye, label: t("settings.accessibility") },
    { icon: Info, label: t("settings.recommendationsTransparency") },
    { icon: FileCheck, label: t("settings.userLicense") },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <TouchableOpacity style={styles.headerRight}>
          <Headphones size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Idioma */}
        <View style={styles.languageSection}>
          <View style={styles.languageRow}>
            <Text style={styles.languageLabel}>{t("settings.language")}</Text>
            <LanguageToggle />
          </View>
        </View>

        {/* Configuración */}
        <View style={styles.section}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={() => handleComingSoon(item.label)}
            >
              <item.icon size={22} color="#333" />
              <Text style={styles.settingItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Soporte */}
        <View style={styles.section}>
          {supportItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={() => handleComingSoon(item.label)}
            >
              <item.icon size={22} color="#333" />
              <Text style={styles.settingItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cerrar sesión */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <LogOut size={22} color="#EF4444" />
            <Text style={[styles.settingItemText, { color: "#EF4444" }]}>
              {t("settings.signOut")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Versión */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            {t("settings.version")} 1.0.45.42
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  scrollView: {
    flex: 1,
  },
  languageSection: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageLabel: {
    fontSize: 18,
    color: "#111",
  },
  section: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingItemText: {
    fontSize: 16,
    color: "#111",
    marginLeft: 16,
    flex: 1,
  },
  versionSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#667",
  },
});
