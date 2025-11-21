import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X, Plus, Trash2 } from 'lucide-react-native';

export interface PollData {
  options: string[];
  duration: 1 | 3 | 7; // days
}

interface SimplePollCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (poll: PollData) => void;
  initialData?: PollData;
}

export function SimplePollCreator({ visible, onClose, onSave, initialData }: SimplePollCreatorProps) {
  const [option1, setOption1] = useState(initialData?.options[0] || '');
  const [option2, setOption2] = useState(initialData?.options[1] || '');
  const [option3, setOption3] = useState(initialData?.options[2] || '');
  const [option4, setOption4] = useState(initialData?.options[3] || '');
  const [duration, setDuration] = useState<1 | 3 | 7>(initialData?.duration || 1);

  const handleCancel = () => {
    setOption1(initialData?.options[0] || '');
    setOption2(initialData?.options[1] || '');
    setOption3(initialData?.options[2] || '');
    setOption4(initialData?.options[3] || '');
    setDuration(initialData?.duration || 1);
    onClose();
  };

  const handleSave = () => {
    const options = [option1, option2, option3, option4].filter(opt => opt.trim().length > 0);
    
    if (options.length < 2) {
      Alert.alert('Error', 'Debes agregar al menos 2 opciones');
      return;
    }

    onSave({
      options,
      duration,
    });
    
    // Reset
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setDuration(1);
    onClose();
  };

  const canSave = option1.trim().length > 0 && option2.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Encuesta</Text>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Instructions */}
            <Text style={styles.instruction}>Escribe al menos 2 opciones para tu encuesta</Text>

            {/* Option 1 - Required */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Opción 1 *</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe la primera opción..."
                placeholderTextColor="#999"
                value={option1}
                onChangeText={setOption1}
                maxLength={80}
                autoCapitalize="sentences"
                returnKeyType="next"
              />
              <Text style={styles.charCount}>{option1.length}/80</Text>
            </View>

            {/* Option 2 - Required */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Opción 2 *</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe la segunda opción..."
                placeholderTextColor="#999"
                value={option2}
                onChangeText={setOption2}
                maxLength={80}
                autoCapitalize="sentences"
                returnKeyType="next"
              />
              <Text style={styles.charCount}>{option2.length}/80</Text>
            </View>

            {/* Option 3 - Optional */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Opción 3 (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Tercera opción (opcional)..."
                placeholderTextColor="#999"
                value={option3}
                onChangeText={setOption3}
                maxLength={80}
                autoCapitalize="sentences"
                returnKeyType="next"
              />
              <Text style={styles.charCount}>{option3.length}/80</Text>
            </View>

            {/* Option 4 - Optional */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Opción 4 (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Cuarta opción (opcional)..."
                placeholderTextColor="#999"
                value={option4}
                onChangeText={setOption4}
                maxLength={80}
                autoCapitalize="sentences"
                returnKeyType="done"
              />
              <Text style={styles.charCount}>{option4.length}/80</Text>
            </View>

            {/* Duration */}
            <Text style={styles.sectionLabel}>Duración de la encuesta</Text>
            <View style={styles.durationContainer}>
              <TouchableOpacity
                style={[styles.durationButton, duration === 1 && styles.durationButtonActive]}
                onPress={() => setDuration(1)}
              >
                <Text style={[styles.durationText, duration === 1 && styles.durationTextActive]}>
                  1 día
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.durationButton, duration === 3 && styles.durationButtonActive]}
                onPress={() => setDuration(3)}
              >
                <Text style={[styles.durationText, duration === 3 && styles.durationTextActive]}>
                  3 días
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.durationButton, duration === 7 && styles.durationButtonActive]}
                onPress={() => setDuration(7)}
              >
                <Text style={[styles.durationText, duration === 7 && styles.durationTextActive]}>
                  7 días
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveButtonText}>Crear Encuesta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    paddingTop: 60,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  instruction: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    minHeight: 50,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  durationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  durationTextActive: {
    color: '#3B82F6',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
