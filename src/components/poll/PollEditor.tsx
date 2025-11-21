import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { X, Plus, Trash2 } from 'lucide-react-native'

export interface PollData {
  options: string[]
  duration: 1 | 3 | 7 // days
}

interface PollEditorProps {
  visible: boolean
  onClose: () => void
  onSave: (poll: PollData) => void
  initialData?: PollData
}

const MAX_OPTIONS = 5
const MIN_OPTIONS = 2
const MAX_OPTION_LENGTH = 80

const DURATION_OPTIONS = [
  { value: 1, label: '1 día' },
  { value: 3, label: '3 días' },
  { value: 7, label: '7 días' },
] as const

export function PollEditor({ visible, onClose, onSave, initialData }: PollEditorProps) {
  const [options, setOptions] = useState<string[]>(
    initialData?.options || ['', '']
  )
  const [duration, setDuration] = useState<1 | 3 | 7>(initialData?.duration || 1)

  const handleAddOption = () => {
    if (options.length >= MAX_OPTIONS) {
      Alert.alert('Límite alcanzado', `Máximo ${MAX_OPTIONS} opciones permitidas`)
      return
    }
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) {
      Alert.alert('Mínimo requerido', `Debe haber al menos ${MIN_OPTIONS} opciones`)
      return
    }
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleOptionChange = (index: number, value: string) => {
    if (value.length > MAX_OPTION_LENGTH) {
      return
    }
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSave = () => {
    // Validate
    const filledOptions = options.filter((opt) => opt.trim().length > 0)
    
    if (filledOptions.length < MIN_OPTIONS) {
      Alert.alert(
        'Opciones incompletas',
        `Debes completar al menos ${MIN_OPTIONS} opciones`
      )
      return
    }

    onSave({
      options: filledOptions,
      duration,
    })
    onClose()
  }

  const handleCancel = () => {
    // Reset to initial or empty
    setOptions(initialData?.options || ['', ''])
    setDuration(initialData?.duration || 1)
    onClose()
  }

  const canSave = options.filter((opt) => opt.trim().length > 0).length >= MIN_OPTIONS

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear encuesta</Text>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.closeButton}
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Options */}
            <Text style={styles.sectionLabel}>Opciones</Text>
            <Text style={styles.sectionHint}>Escribe al menos 2 opciones para crear la encuesta</Text>
            {options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Escribe la opción ${index + 1} aquí...`}
                  placeholderTextColor="#9CA3AF"
                  value={option}
                  onChangeText={(value) => handleOptionChange(index, value)}
                  maxLength={MAX_OPTION_LENGTH}
                  autoCapitalize="sentences"
                  autoFocus={index === 0}
                />
                <Text style={styles.charCount}>
                  {option.length}/{MAX_OPTION_LENGTH}
                </Text>
                {options.length > MIN_OPTIONS && (
                  <TouchableOpacity
                    onPress={() => handleRemoveOption(index)}
                    style={styles.removeOptionButton}
                    accessibilityLabel={`Eliminar opción ${index + 1}`}
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Add Option Button */}
            {options.length < MAX_OPTIONS && (
              <TouchableOpacity
                style={styles.addOptionButton}
                onPress={handleAddOption}
                accessibilityLabel="Agregar opción"
                accessibilityRole="button"
              >
                <Plus size={20} color="#3B82F6" />
                <Text style={styles.addOptionText}>Agregar opción</Text>
              </TouchableOpacity>
            )}

            {/* Duration */}
            <Text style={[styles.sectionLabel, styles.durationLabel]}>Duración</Text>
            <View style={styles.durationContainer}>
              {DURATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.durationOption,
                    duration === opt.value && styles.durationOptionSelected,
                  ]}
                  onPress={() => setDuration(opt.value)}
                  accessibilityLabel={`Duración ${opt.label}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: duration === opt.value }}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      duration === opt.value && styles.durationOptionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              accessibilityLabel="Cancelar"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              accessibilityLabel="Guardar encuesta"
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
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
    fontSize: 18,
    fontWeight: '600',
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
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  durationLabel: {
    marginTop: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
    minWidth: 40,
  },
  removeOptionButton: {
    marginLeft: 8,
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  addOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  durationOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  durationOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  durationOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
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
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
