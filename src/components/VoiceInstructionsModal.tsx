import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { X, Mic, MessageSquare, Sparkles } from 'lucide-react-native';

interface VoiceInstructionsModalProps {
  visible: boolean;
  onClose: () => void;
  toolName: 'cazahormigas' | 'planificador' | 'reportes';
}

const instructions = {
  cazahormigas: {
    title: '🐜 Instrucciones de Voz - CazaHormigas',
    description: 'Usa tu voz para gestionar gastos hormiga de forma rápida',
    examples: [
      {
        category: '➕ Agregar Gastos',
        commands: [
          '"Agrega un café de $3 diarios"',
          '"Registra Netflix de $15 mensuales"',
          '"Añade transporte de $50 semanales"',
          '"Gasto de comida rápida $8"',
        ],
      },
      {
        category: '📊 Consultar Información',
        commands: [
          '"¿Cuánto gasto en total?"',
          '"Muéstrame mis gastos hormiga"',
          '"¿Cuál es mi ahorro potencial?"',
          '"¿Cuántos gastos tengo detectados?"',
        ],
      },
      {
        category: '🎯 Análisis y Recomendaciones',
        commands: [
          '"Analiza mis gastos"',
          '"Dame recomendaciones"',
          '"¿Qué puedo mejorar?"',
          '"¿Cómo puedo ahorrar más?"',
        ],
      },
    ],
    tips: [
      '💡 No necesitas decir todas las variables, Irï usa valores por defecto',
      '🎯 Puedes hablar de forma natural, Irï entiende el contexto',
      '⚡ Si no especificas frecuencia, se asume "mensual"',
      '🔄 Puedes pedir análisis en cualquier momento',
    ],
  },
  planificador: {
    title: '💰 Instrucciones de Voz - Planificador Financiero',
    description: 'Gestiona tus presupuestos con comandos de voz',
    examples: [
      {
        category: '➕ Crear Presupuestos',
        commands: [
          '"Crea presupuesto de comida de $500"',
          '"Agrega presupuesto de transporte $200"',
          '"Nuevo presupuesto entretenimiento $150"',
          '"Presupuesto de salud $300"',
        ],
      },
      {
        category: '📊 Consultar Estado',
        commands: [
          '"¿Cómo van mis presupuestos?"',
          '"¿Cuánto he gastado en comida?"',
          '"Muéstrame el presupuesto total"',
          '"¿Cuánto me queda disponible?"',
        ],
      },
      {
        category: '🎯 Análisis y Ajustes',
        commands: [
          '"Analiza mis gastos"',
          '"¿Estoy excediendo algún presupuesto?"',
          '"Dame consejos para ahorrar"',
          '"¿Qué presupuesto debo ajustar?"',
        ],
      },
    ],
    tips: [
      '💡 Irï detecta automáticamente la categoría del presupuesto',
      '🎯 Si no especificas monto, Irï te pedirá confirmación',
      '⚡ Puedes consultar presupuestos específicos por nombre',
      '🔄 Los análisis se actualizan en tiempo real',
    ],
  },
  reportes: {
    title: '📊 Instrucciones de Voz - Reportes Avanzados',
    description: 'Genera reportes financieros con tu voz',
    examples: [
      {
        category: '📈 Generar Reportes',
        commands: [
          '"Dame un reporte con ingresos de $2000"',
          '"Genera reporte: ingresos $3000, gastos $1500"',
          '"Reporte con ahorros de $500"',
          '"Análisis financiero completo"',
        ],
      },
      {
        category: '🧮 Calcular Fórmulas',
        commands: [
          '"Calcula mi ahorro neto"',
          '"¿Cuál es mi porcentaje de ahorro?"',
          '"Proyección anual de ahorros"',
          '"Ratio de endeudamiento"',
        ],
      },
      {
        category: '🎯 Análisis IA',
        commands: [
          '"Analiza mi situación financiera"',
          '"Dame recomendaciones personalizadas"',
          '"¿Cómo puedo mejorar mis finanzas?"',
          '"Score financiero"',
        ],
      },
    ],
    tips: [
      '💡 Puedes dictar múltiples valores en un solo comando',
      '🎯 Irï calcula automáticamente las fórmulas disponibles',
      '⚡ Los valores faltantes se completan con ceros',
      '🔄 El análisis IA considera todos tus datos',
    ],
  },
};

export function VoiceInstructionsModal({
  visible,
  onClose,
  toolName,
}: VoiceInstructionsModalProps) {
  const content = instructions[toolName];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Mic size={24} color="#2673f3" />
              <Text style={styles.title}>{content.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Description */}
            <View style={styles.descriptionCard}>
              <Sparkles size={20} color="#FFD700" />
              <Text style={styles.description}>{content.description}</Text>
            </View>

            {/* Examples */}
            {content.examples.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.category}</Text>
                {section.commands.map((command, cmdIndex) => (
                  <View key={cmdIndex} style={styles.commandCard}>
                    <MessageSquare size={16} color="#2673f3" />
                    <Text style={styles.commandText}>{command}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Consejos Útiles</Text>
              {content.tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  {tip}
                </Text>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🎤 Mantén presionado el botón del micrófono para hablar
              </Text>
              <Text style={styles.footerSubtext}>
                Irï procesará tu voz y ejecutará la acción automáticamente
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose}>
            <Text style={styles.closeButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF9E6',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  description: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  commandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commandText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    fontStyle: 'italic',
  },
  tipsSection: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2673f3',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  closeButtonBottom: {
    backgroundColor: '#2673f3',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
