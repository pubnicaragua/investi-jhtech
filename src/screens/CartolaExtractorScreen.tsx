import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, Upload, Download, CheckCircle, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Share } from 'react-native';

interface TransactionData {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

interface ExtractedData {
  accountHolder: string;
  accountNumber: string;
  period: string;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: TransactionData[];
}

export function CartolaExtractorScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setSelectedFile(file.name);
      Alert.alert('Archivo seleccionado', `${file.name} listo para procesar`);
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const extractDataFromCartola = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Por favor selecciona un archivo primero');
      return;
    }

    setLoading(true);

    // Simulación de extracción de datos (en producción, esto se haría con un servicio backend)
    setTimeout(() => {
      const mockData: ExtractedData = {
        accountHolder: 'Juan Pérez',
        accountNumber: '**** **** **** 1234',
        period: 'Enero 2025',
        openingBalance: 5000.00,
        closingBalance: 4250.50,
        totalIncome: 3500.00,
        totalExpenses: 4249.50,
        transactions: [
          { date: '2025-01-05', description: 'Salario', amount: 3500.00, type: 'income', category: 'Ingreso' },
          { date: '2025-01-07', description: 'Supermercado La Colonia', amount: -250.00, type: 'expense', category: 'Alimentación' },
          { date: '2025-01-10', description: 'Pago de Luz', amount: -85.50, type: 'expense', category: 'Servicios' },
          { date: '2025-01-12', description: 'Gasolina', amount: -120.00, type: 'expense', category: 'Transporte' },
          { date: '2025-01-15', description: 'Restaurante', amount: -180.00, type: 'expense', category: 'Entretenimiento' },
          { date: '2025-01-18', description: 'Farmacia', amount: -65.00, type: 'expense', category: 'Salud' },
          { date: '2025-01-20', description: 'Netflix', amount: -12.99, type: 'expense', category: 'Suscripciones' },
          { date: '2025-01-22', description: 'Supermercado', amount: -300.00, type: 'expense', category: 'Alimentación' },
          { date: '2025-01-25', description: 'Pago de Internet', amount: -45.00, type: 'expense', category: 'Servicios' },
          { date: '2025-01-28', description: 'Ropa', amount: -150.00, type: 'expense', category: 'Compras' },
        ]
      };

      setExtractedData(mockData);
      setLoading(false);
      Alert.alert('¡Éxito!', 'Datos extraídos correctamente');
    }, 2000);
  };

  const generatePDF = async () => {
    if (!extractedData) {
      Alert.alert('Error', 'No hay datos para generar el PDF');
      return;
    }

    setLoading(true);

    try {
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #6366F1;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #6366F1;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              font-size: 14px;
            }
            .account-info {
              background: #F3F4F6;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              color: #6B7280;
            }
            .value {
              color: #111827;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #FFFFFF;
              border: 2px solid #E5E7EB;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .summary-card.income {
              border-color: #10B981;
            }
            .summary-card.expense {
              border-color: #EF4444;
            }
            .summary-label {
              font-size: 12px;
              color: #6B7280;
              margin-bottom: 8px;
            }
            .summary-amount {
              font-size: 24px;
              font-weight: bold;
            }
            .summary-amount.income {
              color: #10B981;
            }
            .summary-amount.expense {
              color: #EF4444;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: #6366F1;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #E5E7EB;
            }
            tr:hover {
              background: #F9FAFB;
            }
            .amount-income {
              color: #10B981;
              font-weight: 600;
            }
            .amount-expense {
              color: #EF4444;
              font-weight: 600;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #9CA3AF;
              font-size: 12px;
              border-top: 1px solid #E5E7EB;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">💰 Investí</div>
            <div class="subtitle">Reporte de Movimientos Bancarios</div>
          </div>

          <div class="account-info">
            <div class="info-row">
              <span class="label">Titular:</span>
              <span class="value">${extractedData.accountHolder}</span>
            </div>
            <div class="info-row">
              <span class="label">Cuenta:</span>
              <span class="value">${extractedData.accountNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Período:</span>
              <span class="value">${extractedData.period}</span>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Saldo Inicial</div>
              <div class="summary-amount">C$ ${extractedData.openingBalance.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Saldo Final</div>
              <div class="summary-amount">C$ ${extractedData.closingBalance.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card income">
              <div class="summary-label">Total Ingresos</div>
              <div class="summary-amount income">+C$ ${extractedData.totalIncome.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card expense">
              <div class="summary-label">Total Gastos</div>
              <div class="summary-amount expense">-C$ ${extractedData.totalExpenses.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <h3>Detalle de Transacciones</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${extractedData.transactions.map(tx => `
                <tr>
                  <td>${new Date(tx.date).toLocaleDateString('es-NI')}</td>
                  <td>${tx.description}</td>
                  <td>${tx.category || 'Sin categoría'}</td>
                  <td class="${tx.type === 'income' ? 'amount-income' : 'amount-expense'}">
                    ${tx.type === 'income' ? '+' : ''}C$ ${tx.amount.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generado por Investí - Tu asistente financiero personal</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </body>
        </html>
      `;

      // Compartir el contenido HTML como texto
      await Share.share({
        title: 'Reporte de Cartola - Investí',
        message: `Reporte de movimientos bancarios - ${extractedData.period}\n\nTitular: ${extractedData.accountHolder}\nCuenta: ${extractedData.accountNumber}\n\nSaldo Inicial: C$ ${extractedData.openingBalance.toLocaleString('es-NI')}\nSaldo Final: C$ ${extractedData.closingBalance.toLocaleString('es-NI')}\n\nIngresos: +C$ ${extractedData.totalIncome.toLocaleString('es-NI')}\nGastos: -C$ ${extractedData.totalExpenses.toLocaleString('es-NI')}\n\nGenerado por Investí 💰`
      });

      setLoading(false);
      Alert.alert('¡Éxito!', 'Reporte generado y listo para compartir');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setLoading(false);
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <FileText size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Extractor de Cartola</Text>
          <Text style={styles.headerSubtitle}>
            Convierte tus estados de cuenta en reportes profesionales
          </Text>
        </LinearGradient>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Cómo funciona</Text>
          <View style={styles.instructionCard}>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>Selecciona tu archivo de cartola (PDF, CSV o TXT)</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>Extrae automáticamente los datos</Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>Genera un PDF profesional con el logo de Investí</Text>
            </View>
          </View>
        </View>

        {/* File Selection */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSelectFile}
            activeOpacity={0.8}
          >
            <Upload size={24} color="#6366F1" />
            <Text style={styles.uploadButtonText}>
              {selectedFile || 'Seleccionar Archivo'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <TouchableOpacity
              style={styles.extractButton}
              onPress={extractDataFromCartola}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.extractButtonText}>Extraer Datos</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Extracted Data Preview */}
        {extractedData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Vista Previa</Text>
            
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Titular:</Text>
                <Text style={styles.previewValue}>{extractedData.accountHolder}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Cuenta:</Text>
                <Text style={styles.previewValue}>{extractedData.accountNumber}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Período:</Text>
                <Text style={styles.previewValue}>{extractedData.period}</Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: '#DCFCE7' }]}>
                <TrendingUp size={24} color="#10B981" />
                <Text style={styles.summaryLabel}>Ingresos</Text>
                <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
                  +C$ {extractedData.totalIncome.toLocaleString('es-NI')}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
                <TrendingDown size={24} color="#EF4444" />
                <Text style={styles.summaryLabel}>Gastos</Text>
                <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
                  -C$ {extractedData.totalExpenses.toLocaleString('es-NI')}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: '#EEF2FF' }]}>
                <DollarSign size={24} color="#6366F1" />
                <Text style={styles.summaryLabel}>Saldo Final</Text>
                <Text style={[styles.summaryAmount, { color: '#6366F1' }]}>
                  C$ {extractedData.closingBalance.toLocaleString('es-NI')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={generatePDF}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Download size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generar PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Características</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Extracción automática de datos</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Diseño profesional con logo de Investí</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Categorización inteligente</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Resumen visual de ingresos y gastos</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Exportación y compartir fácil</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  extractButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  previewValue: {
    fontSize: 14,
    color: '#111827',
  },
  summaryGrid: {
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
});
