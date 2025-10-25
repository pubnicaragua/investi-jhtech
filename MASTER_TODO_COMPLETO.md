# 🎯 MASTER TODO - TODAS LAS CORRECCIONES

## 🚨 PROBLEMAS CRÍTICOS

### 1. Login sin contraseña ❌
**Problema:** Deja pasar solo con email
**Causa:** Supabase puede tener "email link" habilitado
**Solución:** Verificar en Supabase Dashboard > Authentication > Providers

### 2. API Market Data Error 401 ❌
**Problema:** `Error: API error: 401`
**Causa:** API key inválida o expirada
**Solución:** Obtener nueva API key en https://site.financialmodelingprep.com/developer/docs/

**Actualizar .env:**
```env
EXPO_PUBLIC_FMP_API_KEY=NUEVA_API_KEY_AQUI
```

## 📱 8 PANTALLAS A VERIFICAR

### ✅ Ya Funcionan:
1. **CommunityPostDetail** - ✅
2. **SavedPosts** - ✅
3. **EditCommunity** - ✅
4. **Following** - ✅

### ❌ Necesitan Corrección:

#### 1. EditProfile
**Estado:** Funciona pero falta validación
**SQL Verificación:**
```sql
SELECT id, full_name, nombre, username, bio, avatar_url, photo_url
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
```

#### 2. Settings
**Estado:** Falta funcionalidad en botones
**Correcciones:**
- Cambiar logo Angel Investor por `assets/LogoAngelInvestors.png`
- Hacer todos los botones funcionales con popups
- Backend driven

#### 3. CommunityMembers
**Estado:** Funciona pero falta mostrar nombres
**SQL Verificación:**
```sql
SELECT 
  cm.user_id,
  u.full_name,
  u.nombre,
  u.username,
  u.avatar_url,
  cm.role,
  cm.joined_at
FROM community_members cm
JOIN users u ON u.id = cm.user_id
WHERE cm.community_id = 'TU_COMMUNITY_ID'
ORDER BY cm.joined_at DESC;
```

#### 4. Followers
**Estado:** Funciona pero muestra "Usuario" en vez de nombres
**SQL Verificación:**
```sql
SELECT 
  uf.follower_id,
  u.full_name,
  u.nombre,
  u.username,
  u.avatar_url
FROM user_follows uf
JOIN users u ON u.id = uf.follower_id
WHERE uf.following_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY uf.created_at DESC;
```

## 🔍 BÚSQUEDA (PromotionsScreen)

**Problemas:**
- Lenta
- No muestra todos los resultados
- Falta búsqueda por keywords

**Correcciones:**
```typescript
// Agregar índices en Supabase
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('spanish', coalesce(full_name, '') || ' ' || coalesce(nombre, '') || ' ' || coalesce(username, '')));
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('spanish', coalesce(contenido, '') || ' ' || coalesce(content, '')));
CREATE INDEX idx_communities_search ON communities USING gin(to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(nombre, '') || ' ' || coalesce(description, '')));
```

## 🏘️ COMUNIDADES RECOMENDADAS

**Problemas:**
- Siempre las mismas comunidades
- No respeta nivel de conocimiento
- Personas recomendadas siempre las mismas 4

**SQL Corrección:**
```sql
-- Comunidades recomendadas basadas en intereses
CREATE OR REPLACE FUNCTION get_recommended_communities(user_id_param UUID, limit_param INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  nombre TEXT,
  description TEXT,
  members_count BIGINT,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_interests AS (
    SELECT unnest(interests) as interest
    FROM users
    WHERE id = user_id_param
  ),
  user_communities AS (
    SELECT community_id
    FROM community_members
    WHERE user_id = user_id_param
  )
  SELECT 
    c.id,
    c.name,
    c.nombre,
    c.description,
    COUNT(DISTINCT cm.user_id) as members_count,
    (
      SELECT COUNT(*)::FLOAT
      FROM user_interests ui
      WHERE ui.interest = ANY(c.tags)
    ) / GREATEST(array_length(c.tags, 1), 1)::FLOAT as relevance_score
  FROM communities c
  LEFT JOIN community_members cm ON cm.community_id = c.id
  WHERE c.id NOT IN (SELECT community_id FROM user_communities)
  AND c.tipo = 'public'
  GROUP BY c.id
  HAVING (
    SELECT COUNT(*)
    FROM user_interests ui
    WHERE ui.interest = ANY(c.tags)
  ) > 0
  ORDER BY relevance_score DESC, members_count DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
```

## 💰 INVESTMENT SIMULATOR

**Crear nueva pantalla:** `src/screens/InvestmentSimulatorScreen.tsx`

**Características:**
- 100% hardcoded (simulación)
- Disclaimer visible
- Escenarios: Conservador, Moderado, Agresivo
- Gráficos de proyección
- Cálculo de ROI

## ⚙️ SETTINGS - CORRECCIONES

### Logo Angel Investor
```typescript
// Cambiar en Settings
<Image 
  source={require('../../assets/LogoAngelInvestors.png')} 
  style={styles.angelInvestorLogo}
/>
```

### Botones Funcionales
Todos los botones deben abrir modals con funcionalidad real:
- Notificaciones
- Privacidad
- Seguridad
- Idioma
- Tema
- etc.

## 🎨 UI/UX CORRECCIONES

### ForgotPassword
**Cambiar colores morado por Investi:**
```typescript
// Colores Investi
primaryColor: '#2563EB'  // Azul Investi
secondaryColor: '#3B82F6'
accentColor: '#60A5FA'
```

### Crear Comunidad - Intereses
**Cambiar de lista a dropdown:**
```typescript
<Picker
  selectedValue={selectedInterest}
  onValueChange={(value) => setSelectedInterest(value)}
>
  {INTERESTS.map(interest => (
    <Picker.Item key={interest} label={interest} value={interest} />
  ))}
</Picker>
```

### Herramientas Financieras
**Cambiar títulos:**
```typescript
const TOOLS = [
  { id: 1, name: 'Planificador Financiero', icon: '📊' },
  { id: 2, name: 'El Caza Hormigas', icon: '🐜' },
  { id: 3, name: 'Generador de Reporte', icon: '📈' },
];
```

## 📚 FILTROS

### Cursos
```typescript
const COURSE_CATEGORIES = [
  'Todos', 'Inversiones', 'Criptomonedas', 'Bolsa', 'Finanzas Personales'
];
```

### Noticias
```typescript
const NEWS_CATEGORIES = [
  'Todas', 'Regulaciones', 'Criptomonedas', 'Tecnología', 'Inversiones', 'Startups'
];
```

### Videos
```typescript
const VIDEO_CATEGORIES = [
  'Todos', 'Tutoriales', 'Análisis', 'Entrevistas', 'Webinars'
];
```

## 🔧 CORRECCIONES BACKEND

### Usuarios Recomendados - Mostrar Nombres
```sql
-- Verificar que el query incluya full_name, nombre, username
SELECT 
  u.id,
  COALESCE(u.full_name, u.nombre, u.username, 'Usuario') as display_name,
  u.avatar_url,
  u.bio
FROM users u
WHERE u.id != 'CURRENT_USER_ID'
AND u.id NOT IN (
  SELECT following_id FROM user_follows WHERE follower_id = 'CURRENT_USER_ID'
)
ORDER BY RANDOM()
LIMIT 10;
```

### Posts en Perfil
```sql
-- Verificar que los posts se guarden correctamente
INSERT INTO posts (user_id, contenido, content, created_at)
VALUES ('USER_ID', 'Contenido', 'Content', NOW())
RETURNING *;
```

## 🏗️ GROK API PARA APK

**Configurar en app.json:**
```json
{
  "expo": {
    "extra": {
      "grokApiKey": process.env.EXPO_PUBLIC_GROK_API_KEY
    }
  }
}
```

**Usar en código:**
```typescript
import Constants from 'expo-constants';
const GROK_API_KEY = Constants.expoConfig?.extra?.grokApiKey || process.env.EXPO_PUBLIC_GROK_API_KEY;
```

## 📋 CHECKLIST FINAL

### Crítico (Hacer YA):
- [ ] Obtener nueva API key de FMP
- [ ] Actualizar .env con nueva key
- [ ] Verificar login en Supabase (deshabilitar email link)
- [ ] Corregir ForgotPassword colores
- [ ] Crear InvestmentSimulator

### Backend:
- [ ] Ejecutar SQL de índices de búsqueda
- [ ] Ejecutar SQL de comunidades recomendadas
- [ ] Verificar SQL de usuarios recomendados
- [ ] Verificar SQL de posts en perfil

### UI/UX:
- [ ] Cambiar logo Angel Investor
- [ ] Hacer botones Settings funcionales
- [ ] Cambiar intereses a dropdown
- [ ] Cambiar títulos herramientas
- [ ] Agregar filtros en Cursos
- [ ] Agregar filtros en Noticias
- [ ] Agregar filtros en Videos

### Verificación:
- [ ] EditProfile - 100% funcional
- [ ] Settings - 100% funcional
- [ ] CommunityMembers - Mostrar nombres
- [ ] Followers - Mostrar nombres
- [ ] PromotionsScreen - Búsqueda rápida
- [ ] Comunidades recomendadas - Algoritmo correcto
- [ ] Usuarios recomendados - Mostrar nombres
- [ ] Posts en perfil - Se agregan correctamente

---

**TIEMPO ESTIMADO: 6-8 horas de trabajo**
**PRIORIDAD: Empezar por API key y login**
