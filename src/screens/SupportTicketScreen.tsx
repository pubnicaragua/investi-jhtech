import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Upload,
  X,
  Send,
  AlertCircle,
  MessageSquare,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { supabase } from "../supabase";

interface Attachment {
  id: string;
  uri: string;
  type: "image" | "video";
  name: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at: string;
  attachments_count: number;
}

export function SupportTicketScreen({ navigation }: any) {
  const { t } = useTranslation();
  useAuthGuard();

  const [activeTab, setActiveTab] = useState<"create" | "tickets">("create");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);

  const loadUserTickets = async () => {
    try {
      setLoadingTickets(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
      Alert.alert("Error", "No se pudieron cargar los tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "tickets") {
      loadUserTickets();
    }
  }, [activeTab]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          name: asset.uri.split("/").pop() || `attachment_${Date.now()}`,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: "image",
          name: asset.uri.split("/").pop() || `photo_${Date.now()}`,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const createTicket = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Por favor completa el título y descripción");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          priority,
          status: "open",
          attachments_count: attachments.length,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      if (attachments.length > 0 && ticket) {
        for (const attachment of attachments) {
          try {
            const response = await fetch(attachment.uri);
            const blob = await response.blob();

            const fileName = `${ticket.id}/${Date.now()}_${attachment.name}`;
            const { error: uploadError } = await supabase.storage
              .from("support_attachments")
              .upload(fileName, blob);

            if (uploadError) throw uploadError;

            await supabase.from("support_attachments").insert({
              ticket_id: ticket.id,
              file_name: attachment.name,
              file_path: fileName,
              file_type: attachment.type,
              file_size: blob.size,
            });
          } catch (error) {
            console.error("Error uploading attachment:", error);
          }
        }
      }

      Alert.alert(
        "✓ Ticket creado",
        `Tu ticket #${ticket.id} ha sido creado exitosamente.`,
        [
          {
            text: "Crear otro",
            onPress: () => {
              setTitle("");
              setDescription("");
              setPriority("medium");
              setAttachments([]);
            },
          },
        ]
      );

      setTitle("");
      setDescription("");
      setPriority("medium");
      setAttachments([]);
    } catch (error) {
      console.error("Error creating ticket:", error);
      Alert.alert("Error", "No se pudo crear el ticket");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "#EF4444";
      case "in_progress": return "#F59E0B";
      case "resolved": return "#10B981";
      case "closed": return "#6B7280";
      default: return "#6B7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Abierto";
      case "in_progress": return "En progreso";
      case "resolved": return "Resuelto";
      case "closed": return "Cerrado";
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "#10B981";
      case "medium": return "#F59E0B";
      case "high": return "#EF4444";
      case "critical": return "#7C3AED";
      default: return "#6B7280";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low": return "Baja";
      case "medium": return "Media";
      case "high": return "Alta";
      case "critical": return "Crítica";
      default: return priority;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soporte y Reportes</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "create" && styles.tabActive]}
          onPress={() => setActiveTab("create")}
        >
          <Send size={18} color={activeTab === "create" ? "#2563EB" : "#999"} />
          <Text style={[styles.tabText, activeTab === "create" && styles.tabTextActive]}>
            Reportar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "tickets" && styles.tabActive]}
          onPress={() => setActiveTab("tickets")}
        >
          <MessageSquare size={18} color={activeTab === "tickets" ? "#2563EB" : "#999"} />
          <Text style={[styles.tabText, activeTab === "tickets" && styles.tabTextActive]}>
            Mis Tickets
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "create" ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <AlertCircle size={20} color="#2563EB" />
            <Text style={styles.infoText}>
              Describe el problema detalladamente. Adjunta capturas o videos si es necesario.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Título del reporte *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Error al crear post"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe qué sucedió..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={1000}
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityContainer}>
              {(["low", "medium", "high", "critical"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityButton, priority === p && styles.priorityButtonActive]}
                  onPress={() => setPriority(p)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
                  <Text style={[styles.priorityLabel, priority === p && styles.priorityLabelActive]}>
                    {getPriorityLabel(p)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Adjuntos</Text>
            <View style={styles.attachmentButtonsContainer}>
              <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
                <Upload size={20} color="#2563EB" />
                <Text style={styles.attachmentButtonText}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachmentButton} onPress={takePhoto}>
                <Upload size={20} color="#2563EB" />
                <Text style={styles.attachmentButtonText}>Cámara</Text>
              </TouchableOpacity>
            </View>

            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.attachmentType}>
                        {attachment.type === "video" ? "Video" : "Imagen"}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeAttachment(attachment.id)}>
                      <X size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={createTicket}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Send size={20} color="white" />
                <Text style={styles.submitButtonText}>Enviar Reporte</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>
      ) : (
        <View style={styles.ticketsContainer}>
          {loadingTickets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color="#CCC" />
              <Text style={styles.emptyText}>No tienes tickets aún</Text>
              <Text style={styles.emptySubtext}>Crea un reporte para que nuestro equipo te ayude</Text>
            </View>
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.ticketCard}
                  onPress={() => {
                    setSelectedTicket(item);
                    setShowTicketDetail(true);
                  }}
                >
                  <View style={styles.ticketHeader}>
                    <View style={{flex: 1}}>
                      <Text style={styles.ticketId}>#{item.id}</Text>
                      <Text style={styles.ticketTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.ticketFooter}>
                    <View style={styles.priorityBadge}>
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                      <Text style={styles.priorityBadgeText}>{getPriorityLabel(item.priority)}</Text>
                    </View>
                    <Text style={styles.ticketDate}>
                      {new Date(item.created_at).toLocaleDateString("es-ES")}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.ticketsList}
            />
          )}
        </View>
      )}

      <Modal visible={showTicketDetail} transparent animationType="slide" onRequestClose={() => setShowTicketDetail(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTicketDetail(false)}>
              <X size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalle del Ticket</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedTicket && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>ID del Ticket</Text>
                <Text style={styles.modalValue}>#{selectedTicket.id}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Estado</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTicket.status) + "20", alignSelf: "flex-start" }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(selectedTicket.status) }]}>
                    {getStatusLabel(selectedTicket.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Prioridad</Text>
                <View style={styles.priorityBadge}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(selectedTicket.priority) }]} />
                  <Text style={styles.priorityBadgeText}>{getPriorityLabel(selectedTicket.priority)}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Título</Text>
                <Text style={styles.modalValue}>{selectedTicket.title}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Descripción</Text>
                <Text style={styles.modalValue}>{selectedTicket.description}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Fecha de Creación</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedTicket.created_at).toLocaleString("es-ES")}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Última Actualización</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedTicket.updated_at).toLocaleString("es-ES")}
                </Text>
              </View>

              {selectedTicket.attachments_count > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Adjuntos ({selectedTicket.attachments_count})</Text>
                  <Text style={styles.modalValue}>Archivos adjuntos disponibles</Text>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fa" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  backButton: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
  headerRight: { width: 40 },
  tabsContainer: { flexDirection: "row", backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#2563EB" },
  tabText: { fontSize: 14, color: "#999", marginLeft: 8, fontWeight: "500" },
  tabTextActive: { color: "#2563EB" },
  scrollView: { flex: 1 },
  infoBox: { flexDirection: "row", backgroundColor: "#DBEAFE", margin: 16, padding: 12, borderRadius: 8, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 14, color: "#1E40AF", marginLeft: 12 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 8 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111" },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  charCount: { fontSize: 12, color: "#999", marginTop: 4, textAlign: "right" },
  priorityContainer: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  priorityButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, backgroundColor: "white" },
  priorityButtonActive: { borderColor: "#2563EB", backgroundColor: "#DBEAFE" },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  priorityLabel: { fontSize: 12, color: "#666", fontWeight: "500" },
  priorityLabelActive: { color: "#2563EB" },
  attachmentButtonsContainer: { flexDirection: "row", gap: 8 },
  attachmentButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, backgroundColor: "#F0F9FF", borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 8 },
  attachmentButtonText: { fontSize: 14, color: "#2563EB", fontWeight: "600", marginLeft: 8 },
  attachmentsList: { marginTop: 12, gap: 8 },
  attachmentItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "white", borderRadius: 8, borderWidth: 1, borderColor: "#e5e5e5" },
  attachmentInfo: { flex: 1 },
  attachmentName: { fontSize: 14, color: "#111", fontWeight: "500" },
  attachmentType: { fontSize: 12, color: "#999", marginTop: 2 },
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginBottom: 16, paddingVertical: 14, backgroundColor: "#2563EB", borderRadius: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "white", marginLeft: 8 },
  spacer: { height: 20 },
  ticketsContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#111", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#999", marginTop: 4 },
  ticketsList: { padding: 16, gap: 12 },
  ticketCard: { backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#e5e5e5" },
  ticketHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  ticketId: { fontSize: 12, color: "#999", fontWeight: "600" },
  ticketTitle: { fontSize: 14, fontWeight: "600", color: "#111", marginTop: 4, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  ticketFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priorityBadge: { flexDirection: "row", alignItems: "center" },
  priorityBadgeText: { fontSize: 12, color: "#666", marginLeft: 4, fontWeight: "500" },
  ticketDate: { fontSize: 12, color: "#999" },
  modalContainer: { flex: 1, backgroundColor: "#f7f8fa" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
  modalContent: { flex: 1, padding: 16 },
  modalSection: { backgroundColor: "white", padding: 12, borderRadius: 8, marginBottom: 12 },
  modalLabel: { fontSize: 12, color: "#999", fontWeight: "600", marginBottom: 4 },
  modalValue: { fontSize: 14, color: "#111", fontWeight: "500" },
});
