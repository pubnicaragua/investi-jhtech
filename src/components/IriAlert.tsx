/**
 * Alert personalizado con el GIF de Irï
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface IriAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const { width } = Dimensions.get('window');

export function IriAlert({
  visible,
  title,
  message,
  onClose,
  type = 'info',
}: IriAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '😔';
      default:
        return '💡';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {/* Imagen de Irï */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/iri-icono.jpg')}
              style={styles.iriImage}
              resizeMode="cover"
            />
          </View>

          {/* Título */}
          {title && (
            <Text style={styles.title}>
              {getIcon()} {title}
            </Text>
          )}

          {/* Mensaje */}
          <Text style={styles.message}>{message}</Text>

          {/* Botón */}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
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
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iriImage: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});
