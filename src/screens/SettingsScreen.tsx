import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  Modal,
  Switch,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

export function SettingsScreen({ navigation: drawerNav }: any) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
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

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAngelInvestorModal, setShowAngelInvestorModal] = useState(false);

  const handleNotifications = () => {
    Alert.alert(
      t("settings.notifications"),
      "Configurar notificaciones",
      [
        { text: "Push", onPress: () => setNotificationsEnabled(!notificationsEnabled) },
        { text: "Email", onPress: () => Alert.alert("Email", "Notificaciones por email activadas") },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      t("settings.dataPrivacy"),
      "Nivel de privacidad",
      [
        { text: "Público", onPress: () => Alert.alert("✓", "Perfil público") },
        { text: "Amigos", onPress: () => Alert.alert("✓", "Solo amigos") },
        { text: "Privado", onPress: () => Alert.alert("✓", "Perfil privado") },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handleSecurity = () => {
    Alert.alert(
      t("settings.loginSecurity"),
      "Opciones de seguridad",
      [
        { text: "Cambiar contraseña", onPress: () => navigation.navigate("ChangePassword") },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handleAngelInvestor = () => {
    setShowAngelInvestorModal(true);
  };

  const handleStartups = () => {
    Alert.alert(
      'Próximamente en v2.0 de Investí',
      'Esta función estará disponible en la próxima versión de Investí.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    console.log('🎫 Navegando a SupportTicket...');
    try {
      drawerNav.navigate('SupportTicket');
    } catch (error) {
      console.error('❌ Error navegando a SupportTicket:', error);
      Alert.alert('Error', 'No se pudo abrir Soporte');
    }
  };

  const handleOpenURL = async (url: string, label: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `No se puede abrir el enlace: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert("Error", "No se pudo abrir el enlace");
    }
  };

  const handleComingSoon = (label: string) => {
    Alert.alert(label, "✨ Esta sección estará disponible pronto.");
  };

  const settingsItems = [
    { icon: Lock, label: t("settings.loginSecurity"), onPress: handleSecurity },
    { icon: Shield, label: t("settings.dataPrivacy"), onPress: handlePrivacy },
    { icon: Bell, label: t("settings.notifications"), onPress: handleNotifications },
    { icon: TrendingUp, label: t("settings.angelInvestor"), onPress: handleAngelInvestor, isAngelInvestor: true },
    { icon: Rocket, label: t("settings.startups"), onPress: handleStartups },
  ];

  const supportItems = [
    { icon: Headphones, label: "Soporte y Reportes", onPress: handleSupport, isAction: true },
    { icon: HelpCircle, label: t("settings.helpCenter"), url: "https://www.investiiapp.com/ayuda" },
    { icon: FileText, label: t("settings.privacyPolicy"), url: "https://www.investiiapp.com/privacidad" },
    { icon: Eye, label: t("settings.accessibility"), url: "https://www.investiiapp.com/ayuda" },
    { icon: Info, label: t("settings.recommendationsTransparency"), url: "https://www.investiiapp.com/terminos" },
    { icon: FileCheck, label: t("settings.userLicense"), url: "https://www.investiiapp.com/terminos" },
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
        <TouchableOpacity style={styles.headerRight} onPress={handleSupport}>
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
              onPress={item.onPress}
            >
              {item.isAngelInvestor ? (
                <Image 
                  source={require('../../assets/LogoAngelInvestors.png')} 
                  style={styles.angelLogo}
                  resizeMode="contain"
                />
              ) : (
                <item.icon size={22} color="#333" />
              )}
              <Text style={styles.settingItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal Angel Investor */}
        <Modal
          visible={showAngelInvestorModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAngelInvestorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image 
                source={require('../../assets/LogoAngelInvestors.png')} 
                style={styles.modalLogo}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Inversionista Ángel</Text>
              <Text style={styles.modalDescription}>
                Conviértete en un inversionista ángel y apoya a startups prometedoras.
              </Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowAngelInvestorModal(false);
                  navigation.navigate("Inversionista");
                }}
              >
                <Text style={styles.modalButtonText}>Explorar oportunidades</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => setShowAngelInvestorModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Soporte */}
        <View style={styles.section}>
          {supportItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={() => {
                if (item.isAction && item.onPress) {
                  item.onPress();
                } else if (item.url) {
                  handleOpenURL(item.url, item.label);
                }
              }}
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
  angelLogo: {
    width: 22,
    height: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonSecondary: {
    paddingVertical: 12,
  },
  modalButtonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
