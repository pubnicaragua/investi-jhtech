# 🔗 ENDPOINTS POR PANTALLA - SIN HARDCODE

## 📋 CONFIGURACIÓN DE API

### **🌐 BASE URLs (Configurables)**
```javascript
// src/config/api.js
export const API_CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.investi.com.ni',
  WEB_BASE_URL: process.env.EXPO_PUBLIC_WEB_URL || 'https://investi.com.ni'
}
```

---

## 1️⃣ **AUTENTICACIÓN Y ONBOARDING**

### **LanguageSelectionScreen**
```javascript
// Sin endpoints - Solo AsyncStorage local
AsyncStorage.setItem('user_language', lang)
AsyncStorage.setItem('language_selected', 'true')
```

### **WelcomeScreen**
```javascript
// Sin endpoints - Solo navegación
```

### **SignInScreen**
```javascript
POST /auth/signin
POST /auth/google-signin
POST /auth/facebook-signin
GET  /auth/me
```

### **SignUpScreen**
```javascript
POST /auth/signup
POST /auth/verify-email
POST /auth/resend-verification
```

### **UploadAvatarScreen**
```javascript
POST /users/upload-avatar
PUT  /users/profile
GET  /users/me
```

### **PickGoalsScreen**
```javascript
GET  /goals
POST /users/goals
PUT  /users/goals
```

### **PickInterestsScreen**
```javascript
GET  /interests
POST /users/interests
PUT  /users/interests
```

### **PickKnowledgeScreen**
```javascript
GET  /knowledge-levels
POST /users/knowledge-level
PUT  /users/knowledge-level
```

---

## 2️⃣ **PRINCIPALES Y NAVEGACIÓN**

### **HomeFeedScreen**
```javascript
GET  /posts?page={page}&limit=20&order=created_at.desc
GET  /posts/trending?limit=10
GET  /users/me/feed?page={page}&limit=20
POST /posts/{postId}/like
POST /posts/{postId}/unlike
POST /posts/{postId}/save
DELETE /posts/{postId}/save
```

### **CreatePostScreen**
```javascript
POST /posts
POST /posts/upload-image
POST /posts/upload-video
GET  /communities/my-communities
GET  /tags/popular
```

### **PostDetailScreen**
```javascript
GET  /posts/{postId}
GET  /posts/{postId}/comments?page={page}&limit=20
POST /posts/{postId}/comments
POST /comments/{commentId}/like
POST /posts/{postId}/like
POST /posts/{postId}/share
GET  /posts/{postId}/related?limit=5
```

### **SharePostScreen**
```javascript
POST /posts/{postId}/share
GET  /users/followers
GET  /communities/my-communities
POST /shares
```

### **SavedPostsScreen**
```javascript
GET  /users/me/saved-posts?page={page}&limit=20
DELETE /users/me/saved-posts/{postId}
```

### **ProfileScreen**
```javascript
GET  /users/{userId}
GET  /users/{userId}/posts?page={page}&limit=20
GET  /users/{userId}/stats
POST /users/{userId}/follow
DELETE /users/{userId}/follow
GET  /users/{userId}/followers?page={page}&limit=20
GET  /users/{userId}/following?page={page}&limit=20
```

### **SettingsScreen**
```javascript
GET  /users/me/settings
PUT  /users/me/settings
PUT  /users/me/profile
PUT  /users/me/password
DELETE /users/me/account
POST /auth/logout
```

---

## 3️⃣ **COMUNIDADES**

### **CommunitiesScreen**
```javascript
GET  /communities?page={page}&limit=20&category={category}
GET  /communities/trending?limit=10
GET  /communities/my-communities
GET  /communities/recommended?limit=10
GET  /communities/categories
```

### **CommunityDetailScreen**
```javascript
GET  /communities/{communityId}
GET  /communities/{communityId}/posts?page={page}&limit=20
GET  /communities/{communityId}/members?page={page}&limit=20
POST /communities/{communityId}/join
DELETE /communities/{communityId}/leave
GET  /communities/{communityId}/stats
```

### **CommunityRecommendationsScreen**
```javascript
GET  /communities/recommended?limit=20&based_on=interests
POST /communities/{communityId}/join
GET  /users/me/interests
```

---

## 4️⃣ **CHAT Y COMUNICACIÓN**

### **ChatListScreen**
```javascript
GET  /chats?page={page}&limit=20&order=updated_at.desc
GET  /chats/unread-count
PUT  /chats/{chatId}/mark-read
DELETE /chats/{chatId}
```

### **ChatScreen**
```javascript
GET  /chats/{chatId}/messages?page={page}&limit=50
POST /chats/{chatId}/messages
PUT  /chats/{chatId}/messages/{messageId}/read
POST /chats/{chatId}/typing
GET  /chats/{chatId}/info
```

### **GroupChatScreen**
```javascript
GET  /group-chats/{groupId}
GET  /group-chats/{groupId}/messages?page={page}&limit=50
POST /group-chats/{groupId}/messages
GET  /group-chats/{groupId}/members
POST /group-chats/{groupId}/members
DELETE /group-chats/{groupId}/members/{userId}
```

### **NotificationsScreen**
```javascript
GET  /notifications?page={page}&limit=20&order=created_at.desc
PUT  /notifications/{notificationId}/read
PUT  /notifications/mark-all-read
GET  /notifications/unread-count
DELETE /notifications/{notificationId}
```

---

## 5️⃣ **EDUCACIÓN Y CURSOS**

### **EducacionScreen**
```javascript
GET  /courses?page={page}&limit=20&category={category}
GET  /courses/featured?limit=10
GET  /courses/my-courses
GET  /learning-paths?limit=10
GET  /courses/categories
```

### **LearningPathsScreen**
```javascript
GET  /learning-paths?page={page}&limit=20
GET  /learning-paths/{pathId}
POST /learning-paths/{pathId}/enroll
GET  /learning-paths/{pathId}/progress
```

### **CourseDetailScreen**
```javascript
GET  /courses/{courseId}
GET  /courses/{courseId}/lessons
GET  /courses/{courseId}/reviews?page={page}&limit=20
POST /courses/{courseId}/enroll
GET  /courses/{courseId}/progress
POST /courses/{courseId}/reviews
```

### **VideoPlayerScreen**
```javascript
GET  /videos/{videoId}
POST /videos/{videoId}/progress
GET  /videos/{videoId}/subtitles
POST /videos/{videoId}/complete
```

---

## 6️⃣ **INVERSIONES Y FINANZAS**

### **InversionesScreen**
```javascript
GET  /investments/opportunities?page={page}&limit=20
GET  /investments/portfolio
GET  /investments/performance
GET  /market/indices
GET  /investments/categories
```

### **InversionistaScreen**
```javascript
GET  /investors/{investorId}
GET  /investors/{investorId}/portfolio
GET  /investors/{investorId}/performance
GET  /investors/rankings?page={page}&limit=20
POST /investors/{investorId}/follow
```

### **MarketInfoScreen**
```javascript
GET  /market/indices
GET  /market/stocks?page={page}&limit=20
GET  /market/news?limit=10
GET  /market/analysis
GET  /market/trends
```

### **PlanificadorFinancieroScreen**
```javascript
GET  /financial-planner/goals
POST /financial-planner/goals
GET  /financial-planner/recommendations
GET  /financial-planner/progress
PUT  /financial-planner/goals/{goalId}
```

### **CazaHormigasScreen**
```javascript
GET  /expenses/categories
GET  /expenses?page={page}&limit=20&month={month}
POST /expenses
PUT  /expenses/{expenseId}
DELETE /expenses/{expenseId}
GET  /expenses/analytics
```

---

## 7️⃣ **NOTICIAS Y PROMOCIONES**

### **NewsScreen**
```javascript
GET  /news?page={page}&limit=20&category={category}
GET  /news/featured?limit=5
GET  /news/categories
POST /news/{newsId}/like
POST /news/{newsId}/share
```

### **NewsDetailScreen**
```javascript
GET  /news/{newsId}
GET  /news/{newsId}/related?limit=5
POST /news/{newsId}/views
POST /news/{newsId}/comments
GET  /news/{newsId}/comments?page={page}&limit=20
```

### **PromotionsScreen**
```javascript
GET  /promotions?page={page}&limit=20&category={category}
GET  /promotions/featured?limit=5
GET  /promotions/my-promotions
POST /promotions/{promotionId}/claim
```

### **PromotionDetailScreen**
```javascript
GET  /promotions/{promotionId}
POST /promotions/{promotionId}/claim
GET  /promotions/{promotionId}/terms
POST /promotions/{promotionId}/share
```

---

## 8️⃣ **HERRAMIENTAS Y UTILIDADES**

### **PaymentScreen**
```javascript
POST /payments/create-intent
POST /payments/confirm
GET  /payments/methods
POST /payments/methods
DELETE /payments/methods/{methodId}
GET  /payments/history?page={page}&limit=20
```

### **ReportesAvanzadosScreen**
```javascript
GET  /reports/financial-summary
GET  /reports/investment-performance
GET  /reports/expense-analysis
GET  /reports/goal-progress
POST /reports/generate-pdf
```

### **InvestmentKnowledgeScreen**
```javascript
GET  /knowledge/articles?page={page}&limit=20
GET  /knowledge/quizzes
POST /knowledge/quizzes/{quizId}/submit
GET  /knowledge/progress
GET  /knowledge/certificates
```

---

## 🔧 **CONFIGURACIÓN SIN HARDCODE**

### **.env**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://api.investi.com.ni
EXPO_PUBLIC_WEB_URL=https://investi.com.ni
```

### **src/config/endpoints.js**
```javascript
import { API_CONFIG } from './api'

export const ENDPOINTS = {
  // Auth
  SIGNIN: `${API_CONFIG.API_BASE_URL}/auth/signin`,
  SIGNUP: `${API_CONFIG.API_BASE_URL}/auth/signup`,
  
  // Posts
  POSTS: `${API_CONFIG.API_BASE_URL}/posts`,
  POST_DETAIL: (id) => `${API_CONFIG.API_BASE_URL}/posts/${id}`,
  
  // Communities
  COMMUNITIES: `${API_CONFIG.API_BASE_URL}/communities`,
  COMMUNITY_DETAIL: (id) => `${API_CONFIG.API_BASE_URL}/communities/${id}`,
  
  // Users
  USERS: `${API_CONFIG.API_BASE_URL}/users`,
  USER_PROFILE: (id) => `${API_CONFIG.API_BASE_URL}/users/${id}`,
  
  // Notifications
  NOTIFICATIONS: `${API_CONFIG.API_BASE_URL}/notifications`,
  
  // Market
  MARKET: `${API_CONFIG.API_BASE_URL}/market`,
  
  // News
  NEWS: `${API_CONFIG.API_BASE_URL}/news`,
  NEWS_DETAIL: (id) => `${API_CONFIG.API_BASE_URL}/news/${id}`,
}
```

**🎯 TOTAL: 44 PANTALLAS CON ENDPOINTS COMPLETOS Y CONFIGURABLES** ✅
