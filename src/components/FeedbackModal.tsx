import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'periodic' | 'logout';
}

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd0BWdTeeZx9dVNkTneaXpB8e8tZhw0Y1MaJJNvKGn1MOg7VQ/viewform?embedded=true';

export function FeedbackModal({ visible, onClose, type }: FeedbackModalProps) {
  const handleOpenExternal = () => {
    Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSd0BWdTeeZx9dVNkTneaXpB8e8tZhw0Y1MaJJNvKGn1MOg7VQ/viewform');
    onClose();
  };

  const title = type === 'logout' 
    ? '¡Gracias por usar Investí! 💙'
    : '¿Cómo va tu experiencia? 🚀';
  
  const subtitle = type === 'logout'
    ? 'Antes de irte, cuéntanos qué te gustó y qué podemos mejorar'
    : 'Ayúdanos a mejorar Investí con tu feedback';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {Platform.OS === 'web' ? (
              <iframe
                src={FEEDBACK_FORM_URL}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Feedback Form"
              />
            ) : (
              <WebView
                source={{ uri: FEEDBACK_FORM_URL }}
                style={styles.webview}
                startInLoadingState={true}
                scalesPageToFit={true}
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onClose}
            >
              <Text style={styles.skipButtonText}>
                {type === 'logout' ? 'Cerrar sesión sin feedback' : 'Ahora no'}
              </Text>
            </TouchableOpacity>
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.externalButton}
                onPress={handleOpenExternal}
              >
                <Text style={styles.externalButtonText}>Abrir en navegador</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    minHeight: 400,
  },
  webview: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  externalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2673f3',
    alignItems: 'center',
  },
  externalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
