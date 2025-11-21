# 📄 IMPLEMENTAR LECTURA DE PDF EN IRI

## 🎯 OBJETIVO

Permitir que el usuario suba un PDF (estado de cuenta bancaria) a Iri, que lo lea y responda en audio.

---

## 📋 VERIFICACIÓN DE FUNCIONALIDADES ACTUALES

### ✅ CONFIRMADO FUNCIONANDO:

1. **Tab Herramientas → Click Cartola → abre CartolaExtractor** ✅
   - Ubicación: `DrawerNavigator.tsx` (registrada)
   - Navegación: `EducacionScreen.tsx` → `handleToolPress()`
   - Funciona: Sí

2. **Encuestas se ven en homefeed** ✅
   - Ubicación: `HomeFeedScreen.tsx` (línea 867-895)
   - SELECT: Incluye `poll_options` y `poll_duration`
   - Estilos: `pollContainer`, `pollOption`, etc.
   - Funciona: Sí

3. **Click Soporte y Reportes → abre SupportTicket** ✅
   - Ubicación: `SettingsScreen.tsx` (registrada en Drawer)
   - Navegación: `handleSupport()` → `navigation.navigate("SupportTicket")`
   - Funciona: Sí

---

## 🚀 IMPLEMENTACIÓN: PDF EN IRI

### PASO 1: Instalar dependencias

```bash
npm install react-native-document-picker expo-file-system expo-sharing pdfjs-dist
# O si usas yarn:
yarn add react-native-document-picker expo-file-system expo-sharing pdfjs-dist
```

### PASO 2: Crear servicio para leer PDF

Crear archivo: `src/services/pdfService.ts`

```typescript
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'react-native-document-picker';
import pdfParse from 'pdf-parse';

export interface PDFData {
  fileName: string;
  text: string;
  pages: number;
  uri: string;
}

class PDFService {
  /**
   * Seleccionar un PDF del dispositivo
   */
  async pickPDF(): Promise<PDFData | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const file = result.assets[0];
      const text = await this.extractTextFromPDF(file.uri);

      return {
        fileName: file.name,
        text: text,
        pages: 1, // Aproximado
        uri: file.uri,
      };
    } catch (error) {
      console.error('Error picking PDF:', error);
      throw error;
    }
  }

  /**
   * Extraer texto de un PDF
   */
  async extractTextFromPDF(uri: string): Promise<string> {
    try {
      // Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir base64 a buffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Usar pdfjs para extraer texto
      const pdf = await pdfParse(bytes);
      return pdf.text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('No se pudo leer el PDF. Intenta con otro archivo.');
    }
  }

  /**
   * Procesar PDF para Iri
   */
  async processPDFForIri(pdfData: PDFData): Promise<string> {
    // Limitar el texto a 2000 caracteres para no sobrecargar la API
    const maxChars = 2000;
    const truncatedText = pdfData.text.substring(0, maxChars);

    return `El usuario ha compartido un PDF: "${pdfData.fileName}"\n\nContenido del PDF:\n${truncatedText}${pdfData.text.length > maxChars ? '\n...(contenido truncado)' : ''}`;
  }
}

export default new PDFService();
```

### PASO 3: Modificar IRIChatScreen

Agregar al inicio del archivo:

```typescript
import DocumentPicker from 'react-native-document-picker';
import { Paperclip } from 'lucide-react-native';
import pdfService, { PDFData } from '../services/pdfService';
```

Agregar estados:

```typescript
const [selectedPDF, setSelectedPDF] = useState<PDFData | null>(null);
const [uploadingPDF, setUploadingPDF] = useState(false);
```

Agregar función para seleccionar PDF:

```typescript
const handlePickPDF = async () => {
  try {
    setUploadingPDF(true);
    const pdfData = await pdfService.pickPDF();
    
    if (pdfData) {
      setSelectedPDF(pdfData);
      console.log('📄 PDF seleccionado:', pdfData.fileName);
    }
  } catch (error) {
    console.error('Error picking PDF:', error);
    Alert.alert('Error', 'No se pudo seleccionar el PDF');
  } finally {
    setUploadingPDF(false);
  }
};
```

Modificar función `sendMessage`:

```typescript
const sendMessage = async () => {
  // Si hay PDF seleccionado, incluirlo en el mensaje
  let messageContent = inputText.trim();
  
  if (selectedPDF) {
    const pdfContext = await pdfService.processPDFForIri(selectedPDF);
    messageContent = `${pdfContext}\n\nPregunta del usuario: ${messageContent || 'Analiza este documento'}`;
    setSelectedPDF(null); // Limpiar PDF después de enviar
  }

  if (!messageContent || isLoading) return;

  // ... resto del código igual
};
```

Agregar UI para mostrar PDF seleccionado (en la sección de input):

```typescript
{/* Mostrar PDF seleccionado */}
{selectedPDF && (
  <View style={styles.pdfPreviewContainer}>
    <View style={styles.pdfPreviewContent}>
      <Paperclip size={20} color="#2673f3" />
      <Text style={styles.pdfPreviewText}>{selectedPDF.fileName}</Text>
    </View>
    <TouchableOpacity 
      onPress={() => setSelectedPDF(null)}
      style={styles.pdfRemoveButton}
    >
      <Text style={styles.pdfRemoveText}>✕</Text>
    </TouchableOpacity>
  </View>
)}
```

Agregar botón para seleccionar PDF (en la sección de input):

```typescript
<TouchableOpacity
  style={[styles.pdfButton, uploadingPDF && styles.pdfButtonDisabled]}
  onPress={handlePickPDF}
  disabled={uploadingPDF || isLoading}
>
  {uploadingPDF ? (
    <ActivityIndicator size="small" color="#2673f3" />
  ) : (
    <Paperclip size={22} color="#2673f3" />
  )}
</TouchableOpacity>
```

### PASO 4: Agregar estilos

Agregar a `styles` en IRIChatScreen:

```typescript
pdfButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#F3F4F6',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
},
pdfButtonDisabled: {
  opacity: 0.5,
},
pdfPreviewContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginHorizontal: 16,
  marginBottom: 12,
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: '#F0F9FF',
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: '#2673f3',
},
pdfPreviewContent: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
pdfPreviewText: {
  marginLeft: 8,
  fontSize: 14,
  color: '#2673f3',
  fontWeight: '500',
  flex: 1,
},
pdfRemoveButton: {
  padding: 4,
},
pdfRemoveText: {
  fontSize: 18,
  color: '#9CA3AF',
  fontWeight: 'bold',
},
```

---

## 🔧 FLUJO COMPLETO

### Usuario:
1. Abre Iri
2. Click botón "📎" (Paperclip)
3. Selecciona PDF de estado de cuenta
4. Escribe pregunta (ej: "¿Cuáles son mis gastos principales?")
5. Click enviar

### Iri:
1. Lee el PDF
2. Extrae el texto
3. Envía a Groq API con contexto del PDF
4. Recibe respuesta analítica
5. Responde en audio

### Ejemplo de respuesta:
```
"Según tu estado de cuenta, tus gastos principales son:
- Alimentación: 45% del total
- Transporte: 25%
- Entretenimiento: 20%
- Otros: 10%

Te recomiendo enfocarte en reducir gastos de entretenimiento..."
```

---

## 📊 CASOS DE USO

### 1. Análisis de gastos
- Usuario sube estado de cuenta
- Iri analiza patrones de gasto
- Sugiere optimizaciones

### 2. Presupuesto
- Usuario sube extracto bancario
- Iri calcula presupuesto recomendado
- Sugiere metas de ahorro

### 3. Educación financiera
- Usuario sube documento financiero
- Iri explica conceptos
- Responde preguntas específicas

---

## ⚠️ LIMITACIONES Y CONSIDERACIONES

### Tamaño de archivo:
- Máximo recomendado: 5 MB
- Máximo de texto a procesar: 2000 caracteres
- Groq API tiene límite de tokens

### Privacidad:
- El PDF se procesa localmente primero
- Solo el texto extraído se envía a Groq
- No se almacena el PDF en el servidor

### Precisión:
- Depende de la calidad del PDF
- PDFs escaneados pueden tener problemas
- Mejor con PDFs de texto

---

## 🧪 PROBAR IMPLEMENTACIÓN

```bash
# 1. Instalar dependencias
npm install react-native-document-picker expo-file-system expo-sharing pdfjs-dist

# 2. Reiniciar Expo
npx expo start -c

# 3. Probar:
# - Abrir Iri
# - Click botón 📎
# - Seleccionar PDF
# - Escribir pregunta
# - Click enviar
# - Escuchar respuesta en audio
```

---

## 📝 RESUMEN

**Funcionalidades confirmadas:**
- ✅ Tab Herramientas → Cartola
- ✅ Encuestas en HomeFeed
- ✅ Soporte y Reportes

**Nueva funcionalidad:**
- 📄 Subir PDF a Iri
- 🤖 Iri analiza el PDF
- 🔊 Responde en audio

**Tiempo de implementación:** 30-45 minutos

---

## 🚀 PRÓXIMOS PASOS

1. Instalar dependencias
2. Crear `pdfService.ts`
3. Modificar `IRIChatScreen.tsx`
4. Agregar estilos
5. Probar con PDF real
6. Build para Play Store

**¡Todo listo para responder a tu cliente!** 🎉
