# INSTRUCCIONES PARA PRÓXIMOS PASOS

## 🔴 CRÍTICO - HACER PRIMERO

### 1. Registrar nuevas pantallas en navegación
**Archivo:** `src/navigation/RootNavigator.tsx` o similar

**Agregar:**
```tsx
<Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
<Stack.Screen name="ArchivedChats" component={ArchivedChatsScreen} />
```

**Importar:**
```tsx
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen'
import { ArchivedChatsScreen } from '../screens/ArchivedChatsScreen'
```

---

## 🟡 IMPORTANTE - VALIDAR DESPUÉS

### 2. Probar que todo funciona
```
✅ Notificaciones muestran imagen y nombre
✅ PostDetail: likes suman/restan
✅ PostDetail: comentarios actualizan count
✅ HomeFeed: botón Enviar abre ChatList
✅ No hay errores de TypeScript
```

---

## 🟢 PRÓXIMOS ITEMS A ATACAR

### Item 10 - Herramientas + 3 nuevas (20 min)
**Crear 3 archivos:**
1. `CalculadoraDividendosScreen.tsx` - Calcular dividendos
2. `AnalizadorRatiosScreen.tsx` - Analizar ratios financieros
3. `SimuladorPortafolioScreen.tsx` - Simular portafolio

**Luego:** Agregar en EducacionScreen en sección herramientas

**Template para cada uno:**
```tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'

export function [NombrePantalla]({ navigation }: any) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const handleCalculate = () => {
    // Lógica de cálculo
    setResult(0)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>[Título]</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Inputs y botón */}
        <TextInput
          style={styles.input}
          placeholder="Ingresa valor"
          value={input}
          onChangeText={setInput}
          keyboardType="decimal-pad"
        />
        
        <TouchableOpacity style={styles.button} onPress={handleCalculate}>
          <Text style={styles.buttonText}>Calcular</Text>
        </TouchableOpacity>

        {result !== null && (
          <View style={styles.result}>
            <Text style={styles.resultText}>Resultado: {result}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#1382EF', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  result: { backgroundColor: '#F0F9FF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#1382EF' },
  resultText: { fontSize: 16, fontWeight: '600', color: '#1382EF' },
})
```

---

### Item 30 - MarketInfo Disclaimer + Simulación (15 min)
**Cambios en MarketInfoScreen:**

1. Agregar Disclaimer Modal
```tsx
const [showDisclaimer, setShowDisclaimer] = useState(false)

// En modal de stock, agregar:
<TouchableOpacity style={styles.simulateBtn} onPress={() => {
  setShowDisclaimer(true)
}}>
  <Text style={styles.simulateBtnText}>Simular Inversión</Text>
</TouchableOpacity>

// Disclaimer Modal:
<Modal visible={showDisclaimer} transparent>
  <View style={styles.disclaimerContainer}>
    <Text style={styles.disclaimerTitle}>Aviso Legal</Text>
    <Text style={styles.disclaimerText}>
      Esta es una simulación educativa. No es asesoramiento financiero.
      Los resultados pasados no garantizan resultados futuros.
    </Text>
    <TouchableOpacity onPress={() => {
      setShowDisclaimer(false)
      navigation.navigate('InvestmentSimulator', { stock: selectedStock })
    }}>
      <Text>Entendido, Continuar</Text>
    </TouchableOpacity>
  </View>
</Modal>
```

---

### Item 35 - CommunityDetail UI 100% (20 min)
**Verificar que:**
1. ✅ Tabs deslicen horizontalmente
2. ✅ Contenido se actualice al cambiar tab
3. ✅ Botones funcionen (Unirse, Seguir, Compartir)
4. ✅ UI sea pixel-perfect
5. ✅ No haya errores

**Si hay problemas:**
- Reemplazar ScrollView con FlatList
- Agregar indicador de tab activo
- Sincronizar scroll con tabs

---

### Item 18 - CommunityDetail tabs deslizar (10 min)
**Cambio necesario:**
```tsx
// Usar ScrollView horizontal para tabs
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {tabs.map(tab => (
    <TouchableOpacity 
      key={tab.id}
      style={[styles.tab, activeTab === tab.id && styles.tabActive]}
      onPress={() => setActiveTab(tab.id)}
    >
      <Text>{tab.name}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>

// Agregar indicador
{activeTab === tab.id && <View style={styles.tabIndicator} />}
```

---

### Item 32 - Palomitas leído ChatScreen (15 min)
**Agregar checkmarks:**
```tsx
// En cada mensaje:
{message.status === 'sent' && <Check size={16} color="#9CA3AF" />}
{message.status === 'delivered' && <Check size={16} color="#9CA3AF" />}
{message.status === 'read' && (
  <View style={{ flexDirection: 'row' }}>
    <Check size={16} color="#1382EF" />
    <Check size={16} color="#1382EF" style={{ marginLeft: -8 }} />
  </View>
)}
```

---

### Item 17 - Invitar app (15 min)
**Agregar Share API:**
```tsx
import { Share } from 'react-native'

const handleInvite = async () => {
  try {
    await Share.share({
      message: 'Únete a Investi - La app de inversión para principiantes',
      url: 'https://investi.app/download', // Tu link
      title: 'Invita a un amigo'
    })
  } catch (error) {
    console.error(error)
  }
}
```

---

### Item 33 - SearchAPI validación (10 min)
**Verificar en MarketInfoScreen:**
```tsx
// Agregar validación:
if (!realStocks || realStocks.length === 0) {
  console.warn('SearchAPI retornó datos vacíos')
  // Usar fallback
}

// Agregar logging:
console.log('Stocks obtenidos:', realStocks.length)
```

---

### Item 34 - Navegación InvestmentSimulator (5 min)
**Conectar desde MarketInfo:**
```tsx
// En botón Simular:
onPress={() => navigation.navigate('InvestmentSimulator', { 
  stock: selectedStock 
})}

// En InvestmentSimulator, recibir:
const { stock } = route.params
```

---

### Item 20-22 - EditCommunity (30 min)
**Agregar ImagePicker:**
```tsx
import * as ImagePicker from 'expo-image-picker'

const handlePickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  })

  if (!result.cancelled) {
    setCommunityImage(result.uri)
  }
}

// Guardar:
const handleSave = async () => {
  if (communityImage) {
    const { data } = await uploadMedia(communityImage)
    await supabase
      .from('communities')
      .update({ image_url: data.path })
      .eq('id', communityId)
  }
}
```

---

### Item 21 - CommunitySettings (20 min)
**Agregar opciones:**
```tsx
const settings = [
  { id: 'privacy', label: 'Privacidad', value: 'public' },
  { id: 'notifications', label: 'Notificaciones', value: true },
  { id: 'moderation', label: 'Moderación', value: 'strict' },
  { id: 'posting', label: 'Quién puede publicar', value: 'members' },
]

// Renderizar con toggles/pickers
```

---

### Item 9 - Educación scroll bugs (10 min)
**Solución:**
Reemplazar ScrollView principal con FlatList para evitar anidamiento

---

## 📋 CHECKLIST FINAL

Cuando termines TODO:

- [ ] Registrar nuevas pantallas en navegación
- [ ] Probar que no hay errores de TypeScript
- [ ] Probar que todas las pantallas abren
- [ ] Probar que los botones funcionan
- [ ] Validar que los datos se guardan en Supabase
- [ ] Hacer commit con mensaje: "feat: completar 17 items pendientes"

---

## 🎯 TIEMPO ESTIMADO

- Registrar pantallas: 5 min
- Item 10 (Herramientas): 20 min
- Item 30 (Disclaimer): 15 min
- Item 35 (CommunityDetail): 20 min
- Item 18 (Tabs): 10 min
- Item 32 (Palomitas): 15 min
- Item 17 (Invitar): 15 min
- Item 33 (SearchAPI): 10 min
- Item 34 (Nav): 5 min
- Item 20-22 (EditCommunity): 30 min
- Item 21 (Settings): 20 min
- Item 9 (Scroll): 10 min

**Total: ~2.5 horas**

---

## 💡 TIPS

1. Usa los templates proporcionados
2. Copia/pega estilos de otras pantallas
3. Mantén consistencia con colores (#1382EF, #111827)
4. Siempre agregar SafeAreaView
5. Siempre agregar botón Atrás
6. Validar antes de guardar

---

**¡Buena suerte! 🚀**
