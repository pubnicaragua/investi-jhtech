# 🧪 Sistema de Testing de Pantallas

## ✅ Estado Actual

El sistema de testing está **HABILITADO** y configurado para probar `HomeFeedScreen`.

## 📋 Cómo Usar

### 1. Cambiar la Pantalla a Probar

Edita el archivo `src/utils/screenTesting.ts`:

```typescript
export const TESTING_CONFIG = {
  ENABLED: true,  // ← true para activar, false para desactivar
  SCREEN: 'HomeFeedScreen',  // ← Cambia esto al nombre de la pantalla
  // ...
}
```

### 2. Pantallas Disponibles

#### 🔐 AUTENTICACIÓN (No requieren parámetros)
- `SignInScreen`
- `SignUpScreen`
- `WelcomeScreen`
- `LanguageSelectionScreen`

#### 🎯 ONBOARDING (No requieren parámetros)
- `UploadAvatarScreen`
- `PickInterestsScreen`
- `PickGoalsScreen`
- `PickKnowledgeScreen`
- `OnboardingCompleteScreen`

#### 🏠 PRINCIPALES (No requieren parámetros)
- `HomeFeedScreen`
- `ProfileScreen`
- `SettingsScreen`
- `CreatePostScreen`

#### 📰 CONTENIDO (No requieren parámetros)
- `NewsScreen`
- `EducacionScreen`
- `InversionesScreen`
- `CommunitiesScreen`
- `MarketInfoScreen`
- `LearningPathsScreen`
- `SavedPostsScreen`
- `PromotionsScreen`

#### 💬 COMUNICACIÓN (No requieren parámetros)
- `MessagesScreen`
- `NotificationsScreen`
- `ChatListScreen`

#### 🔧 UTILIDADES (No requieren parámetros)
- `DevMenuScreen`
- `InversionistaScreen`
- `CazaHormigasScreen`
- `ReportesAvanzadosScreen`
- `PlanificadorFinancieroScreen`
- `InvestmentKnowledgeScreen`
- `VideoPlayerScreen`

#### ⚠️ REQUIEREN PARÁMETROS (Ya configuradas)
- `PostDetailScreen` - Requiere `postId`
- `ChatScreen` - Requiere `chatId` y `userId`
- `CommunityDetailScreen` - Requiere `communityId`
- `PromotionDetailScreen` - Requiere objeto `promotion`
- `NewsDetailScreen` - Requiere `newsId`, `title`, `content`, `imageUrl`
- `PaymentScreen` - Requiere `amount`, `currency`, `description`
- `CourseDetailScreen` - Requiere `courseId`
- `GroupChatScreen` - Requiere `groupId`, `groupName`
- `SharePostScreen` - Requiere `postId`

### 3. Ejemplo de Uso

Para probar la pantalla de Inversiones:

```typescript
export const TESTING_CONFIG = {
  ENABLED: true,
  SCREEN: 'InversionesScreen',
  // ...
}
```

Para probar una pantalla con parámetros (ya están configuradas):

```typescript
export const TESTING_CONFIG = {
  ENABLED: true,
  SCREEN: 'PostDetailScreen',  // Ya tiene parámetros configurados
  // ...
}
```

### 4. Desactivar el Modo Testing

Cuando termines de probar, desactiva el modo testing:

```typescript
export const TESTING_CONFIG = {
  ENABLED: false,  // ← Cambia a false
  SCREEN: 'HomeFeedScreen',
  // ...
}
```

## 🗑️ Archivo a Eliminar

**`src/screens/PickKnowledgeScreenNew.tsx`** - NO está en la navegación oficial y puede ser eliminado de forma segura.

La navegación usa `PickKnowledgeScreen` (sin "New").

## 📝 Notas

- El sistema de testing se activa automáticamente en `App.tsx` cuando `TESTING_CONFIG.ENABLED = true`
- No necesitas modificar `App.tsx`, solo cambia la configuración en `screenTesting.ts`
- Las pantallas que requieren parámetros ya tienen valores de prueba configurados en `UNSAFE_SCREENS`
