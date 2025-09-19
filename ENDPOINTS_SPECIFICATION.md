# 📊 Especificación de Endpoints para Sistema de Segmentación

## 🎯 Endpoints para Pantallas de Onboarding

### 1. **PickGoalsScreen.tsx**
```typescript
// GET /api/investment-goals
// Obtiene todas las metas de inversión disponibles
interface InvestmentGoal {
  id: string
  name: string
  description: string
  icon: string
  category: 'short_term' | 'medium_term' | 'long_term'
  priority: number
  created_at: string
}

// POST /api/users/{userId}/goals
// Guarda las metas seleccionadas por el usuario
interface UserGoalsPayload {
  goals: string[] // Array de IDs de metas
  priority_order?: number[] // Orden de prioridad
}
```

### 2. **PickInterestsScreen.tsx**
```typescript
// GET /api/investment-interests
// Obtiene todos los intereses de inversión disponibles
interface InvestmentInterest {
  id: string
  name: string
  description: string
  icon: string
  category: 'stocks' | 'crypto' | 'real_estate' | 'bonds' | 'commodities' | 'education'
  risk_level: 'low' | 'medium' | 'high'
  popularity_score: number
  created_at: string
}

// POST /api/users/{userId}/interests
// Guarda los intereses seleccionados por el usuario
interface UserInterestsPayload {
  interests: string[] // Array de IDs de intereses
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
}
```

### 3. **PickKnowledgeScreen.tsx**
```typescript
// GET /api/knowledge-levels
// Obtiene todos los niveles de conocimiento disponibles
interface KnowledgeLevel {
  id: string
  name: string
  description: string
  level: 'none' | 'little' | 'basic' | 'expert'
  requirements: string[]
  next_steps: string[]
}

// POST /api/users/{userId}/knowledge-level
// Guarda el nivel de conocimiento del usuario
interface UserKnowledgePayload {
  level: 'none' | 'little' | 'basic' | 'expert'
  specific_areas?: string[] // Áreas específicas de conocimiento
  learning_goals?: string[]
}
```

## 🏘️ Endpoints para CommunityRecommendationsScreen

### 4. **Detalles de Comunidad**
```typescript
// GET /api/communities/{communityId}/details
// Obtiene información completa de una comunidad
interface CommunityDetails {
  id: string
  name: string
  description: string
  image_url: string
  cover_image_url: string
  member_count: number
  post_count: number
  category: string
  tags: string[]
  is_public: boolean
  created_at: string
  admin_users: {
    id: string
    name: string
    avatar_url: string
    role: 'admin' | 'moderator'
  }[]
  recent_activity: {
    type: 'post' | 'member_joined' | 'event'
    count: number
    last_activity: string
  }
  engagement_stats: {
    daily_active_members: number
    weekly_posts: number
    average_response_time: string
  }
}
```

### 5. **Personas Sugeridas**
```typescript
// GET /api/users/{userId}/suggested-people
// Obtiene personas que el usuario podría conocer
interface SuggestedPerson {
  id: string
  name: string
  avatar_url: string
  profession: string
  expertise_areas: string[]
  mutual_connections: number
  mutual_communities: string[]
  compatibility_score: number // 0-100
  reason: 'similar_interests' | 'mutual_connections' | 'same_community' | 'expertise_match'
  recent_activity: {
    type: 'post' | 'comment' | 'achievement'
    description: string
    timestamp: string
  }
}

// POST /api/users/{userId}/follow
// Seguir a una persona
interface FollowPayload {
  target_user_id: string
  source: 'suggestions' | 'search' | 'community' | 'post'
}
```

## 🏠 Endpoints para HomeFeedScreen Enhanced

### 6. **Feed Personalizado Avanzado**
```typescript
// GET /api/users/{userId}/feed
// Feed personalizado basado en segmentación
interface PersonalizedFeed {
  posts: EnhancedPost[]
  recommendations: {
    communities: CommunityRecommendation[]
    people: SuggestedPerson[]
    content: ContentRecommendation[]
  }
  user_segments: UserSegment[]
  pagination: {
    next_cursor: string
    has_more: boolean
  }
}

interface EnhancedPost {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar_url: string
    verified: boolean
    expertise_badge?: string
  }
  media: {
    type: 'image' | 'video' | 'chart' | 'document'
    url: string
    thumbnail_url?: string
  }[]
  engagement: {
    likes_count: number
    comments_count: number
    shares_count: number
    saves_count: number
    user_liked: boolean
    user_saved: boolean
  }
  community?: {
    id: string
    name: string
    image_url: string
  }
  relevance_score: number // Para el algoritmo de feed
  created_at: string
  tags: string[]
}
```

### 7. **Notificaciones del Usuario**
```typescript
// GET /api/users/{userId}/notifications
// Obtiene notificaciones del usuario
interface UserNotification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'community_invite' | 'post_mention' | 'achievement'
  title: string
  message: string
  is_read: boolean
  action_url?: string
  actor: {
    id: string
    name: string
    avatar_url: string
  }
  target_object: {
    type: 'post' | 'comment' | 'community' | 'user'
    id: string
    preview?: string
  }
  created_at: string
}

// POST /api/notifications/{notificationId}/mark-read
// Marcar notificación como leída
```

### 8. **Mensajes del Usuario**
```typescript
// GET /api/users/{userId}/messages/conversations
// Obtiene conversaciones del usuario
interface Conversation {
  id: string
  type: 'direct' | 'group'
  participants: {
    id: string
    name: string
    avatar_url: string
    is_online: boolean
    last_seen?: string
  }[]
  last_message: {
    id: string
    content: string
    sender_id: string
    timestamp: string
    is_read: boolean
  }
  unread_count: number
  updated_at: string
}

// GET /api/conversations/{conversationId}/messages
// Obtiene mensajes de una conversación
interface Message {
  id: string
  content: string
  sender_id: string
  conversation_id: string
  message_type: 'text' | 'image' | 'file' | 'system'
  media_url?: string
  is_read: boolean
  created_at: string
}
```

### 9. **Búsqueda Avanzada**
```typescript
// GET /api/search
// Búsqueda global en la plataforma
interface SearchParams {
  query: string
  type?: 'all' | 'users' | 'posts' | 'communities'
  filters?: {
    date_range?: 'today' | 'week' | 'month' | 'year'
    user_type?: 'expert' | 'beginner' | 'verified'
    content_type?: 'educational' | 'news' | 'discussion'
    community_category?: string[]
  }
  limit?: number
  offset?: number
}

interface SearchResults {
  users: SearchUser[]
  posts: SearchPost[]
  communities: SearchCommunity[]
  total_results: number
  suggestions: string[]
}
```

### 10. **Acciones Rápidas**
```typescript
// POST /api/posts/{postId}/quick-actions
// Acciones rápidas en posts
interface QuickActionPayload {
  action: 'like' | 'save' | 'share' | 'report'
  metadata?: {
    share_platform?: 'whatsapp' | 'telegram' | 'twitter' | 'linkedin'
    report_reason?: string
  }
}

// GET /api/users/{userId}/quick-stats
// Estadísticas rápidas del usuario para el header
interface UserQuickStats {
  notifications_count: number
  messages_count: number
  followers_count: number
  following_count: number
  posts_count: number
  achievements: {
    id: string
    name: string
    icon: string
    earned_at: string
  }[]
}
```

## 🎯 Sistema de Segmentación de Usuarios

### 11. **Segmentación Inteligente**
```typescript
// GET /api/users/{userId}/segments
// Obtiene los segmentos del usuario
interface UserSegment {
  id: string
  name: string
  category: 'investment_style' | 'risk_tolerance' | 'experience_level' | 'interests' | 'behavior'
  score: number // 0-100
  attributes: {
    key: string
    value: string | number
    confidence: number
  }[]
  last_updated: string
}

// Ejemplos de segmentos:
// - "Conservative Investor" (basado en goals + knowledge)
// - "Crypto Enthusiast" (basado en interests + activity)
// - "Learning Focused" (basado en behavior + goals)
// - "Community Leader" (basado en engagement + posts)
```

### 12. **Contenido Personalizado**
```typescript
// GET /api/users/{userId}/personalized-content
// Contenido personalizado basado en segmentación
interface PersonalizedContent {
  educational_content: {
    articles: Article[]
    courses: Course[]
    videos: Video[]
  }
  investment_opportunities: {
    stocks: StockRecommendation[]
    crypto: CryptoRecommendation[]
    funds: FundRecommendation[]
  }
  community_suggestions: CommunityRecommendation[]
  expert_insights: ExpertInsight[]
  trending_topics: TrendingTopic[]
}
```

## 📊 Estructura de Base de Datos Sugerida

```sql
-- Tabla para almacenar segmentos de usuarios
CREATE TABLE user_segments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  segment_type VARCHAR(50),
  segment_value VARCHAR(100),
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla para almacenar preferencias de usuarios
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category VARCHAR(50), -- 'goals', 'interests', 'knowledge'
  preference_key VARCHAR(100),
  preference_value JSONB,
  priority INTEGER,
  created_at TIMESTAMP
);

-- Tabla para tracking de comportamiento
CREATE TABLE user_behavior_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50),
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP
);
```

## 🔧 Implementación Recomendada

### Prioridad Alta:
1. **Endpoints de opciones** para PickGoals, PickInterests, PickKnowledge
2. **Sistema de almacenamiento** de preferencias de usuario
3. **CommunityDetails y SuggestedPeople** endpoints
4. **Notificaciones y mensajes** básicos

### Prioridad Media:
1. **Búsqueda avanzada**
2. **Sistema de segmentación** completo
3. **Contenido personalizado**
4. **Analytics y tracking**

### Prioridad Baja:
1. **Optimizaciones de algoritmo**
2. **Machine learning** para recomendaciones
3. **A/B testing** de segmentación
4. **Reportes avanzados**
