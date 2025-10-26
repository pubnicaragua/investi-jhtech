# RESUMEN DE CAMBIOS PENDIENTES - ATAQUE RÁPIDO

## ✅ COMPLETADOS
- 7. CreatePost encuesta opciones - YA EXISTE (PollEditor)
- 14. Chats archivados - COMPLETADO
- 26. PostDetailScreen comentarios - COMPLETADO

## 🔧 EN PROGRESO

### 8. MarketInfo filtros + simular
**Estado:** Filtros YA EXISTEN (selectedFilter)
**Pendiente:** Agregar simulador de inversión
**Cambio:** Agregar botón "Simular Inversión" en modal de stock

### 9. Educación scroll bugs
**Cambio:** Agregar FlatList en lugar de ScrollView + SafeAreaView

### 10. Herramientas cortadas + 3 nuevas
**Herramientas existentes:** CalculadoraInteresScreen, CazaHormigasScreen, ComparadorInversionesScreen
**Nuevas a agregar:** 
- Calculadora de Dividendos
- Analizador de Ratios Financieros
- Simulador de Portafolio

### 11. Foto portada ProfileScreen
**Cambio:** Agregar cover_photo_url en ProfileScreen

### 13. Seguir usuario estado + notif
**Cambio:** Agregar estado "following" + notificación cuando se sigue

### 17. Invitar dentro/fuera app
**Cambio:** Agregar Share API + Link de invitación

### 18. CommunityDetail tabs deslizar
**Cambio:** Usar ScrollView horizontal para tabs + FlatList para contenido

### 20. EditCommunity imagen + tests
**Cambio:** Agregar ImagePicker + validar antes de guardar

### 21. CommunitySettings completo
**Cambio:** Agregar todas las opciones de configuración

### 22. EditCommunity guardar imagen
**Cambio:** Implementar uploadMedia + actualizar en Supabase

### 28. Educación - SafeArea
**Cambio:** Envolver en SafeAreaView

### 29. Herramientas Financieras - 3 Más
**Cambio:** Crear 3 nuevas herramientas (ver item 10)

### 30. MarketInfoScreen - Disclaimer y Simulación
**Cambio:** Agregar disclaimer + simulador

### 32. Palomitas leído ChatScreen
**Cambio:** Agregar checkmarks para mensajes leídos

### 33. SearchAPI arreglado
**Cambio:** Verificar que searchStocks funcione correctamente

### 34. Navegación InvestmentSimulator
**Cambio:** Conectar navegación desde MarketInfo

### 35. CommunityDetail UI 100% funcional
**Cambio:** Asegurar que todos los tabs funcionen + UI pixel-perfect

---

## PRIORIDAD DE ATAQUE
1. Items rápidos (5 min): 9, 28, 11
2. Items medianos (10 min): 18, 32, 33, 34
3. Items complejos (20 min): 8, 10, 13, 17, 20, 21, 22, 35
