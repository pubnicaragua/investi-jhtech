# ✅ Checklist de Testing por Desarrollador

## 👨‍💻 **GABRIEL - MITAD 1** (12 pantallas)

### **🎯 Pantallas a Probar:**

#### **1. Autenticación (4 pantallas)**
- [ ] **LanguageSelection** - ¿Funciona selección de idioma?
- [ ] **Welcome** - ¿Pantalla de bienvenida carga correctamente?
- [ ] **SignIn** - ¿Inicio de sesión funciona? (OAuth incluido)
- [ ] **SignUp** - ¿Registro funciona? (OAuth incluido)

#### **2. Onboarding (6 pantallas)**
- [ ] **UploadAvatar** - ¿Subir foto funciona?
- [ ] **PickGoals** - ¿Selección de objetivos funciona?
- [ ] **PickInterests** - ¿Selección de intereses funciona?
- [ ] **PickKnowledge** - ¿Nivel de conocimiento funciona?
- [ ] **CommunityRecommendations** - ¿Recomendaciones cargan?

#### **3. Pantalla Principal (1 pantalla)**
- [ ] **HomeFeed** - ¿Feed principal carga posts?

---

## 👨‍💻 **DESARROLLADOR CUBANO - MITAD 2** (35+ pantallas)

### **🎯 Pantallas a Probar:**

#### **4. Posts y Contenido (6 pantallas)**
- [ ] **CreatePost** - ¿Crear publicación funciona?
- [ ] **CreateCommunityPost** - ¿Crear post comunitario funciona?
- [ ] **PostDetail** - ¿Detalle de post funciona?
- [ ] **CommunityPostDetail** - ¿Detalle comunitario funciona?
- [ ] **SharePost** - ¿Compartir funciona?
- [ ] **SavedPosts** - ¿Posts guardados funcionan?

#### **5. Comunidades (6 pantallas)**
- [ ] **Communities** - ¿Lista de comunidades carga?
- [ ] **CommunityDetail** - ¿Detalle de comunidad funciona?
- [ ] **CommunitySettings** - ¿Configuración funciona?
- [ ] **CommunityMembers** - ¿Miembros cargan?
- [ ] **CreateCommunity** - ¿Crear comunidad funciona?
- [ ] **EditCommunity** - ¿Editar comunidad funciona?

#### **6. Perfiles y Configuración (4 pantallas)**
- [ ] **Profile** - ¿Perfil de usuario carga?
- [ ] **EditProfile** - ¿Editar perfil funciona?
- [ ] **Followers** - ¿Lista de seguidores funciona?
- [ ] **Following** - ¿Lista de seguidos funciona?
- [ ] **Settings** - ¿Configuraciones funcionan?

#### **7. Chat y Mensajería (5 pantallas)**
- [ ] **ChatList** - ¿Lista de chats carga?
- [ ] **ChatScreen** - ¿Chat individual funciona?
- [ ] **NewMessageScreen** - ¿Nuevo mensaje funciona?
- [ ] **GroupChat** - ¿Chat grupal funciona?
- [ ] **Messages** - ¿Sistema de mensajes funciona?

#### **8. Notificaciones (1 pantalla)**
- [ ] **Notifications** - ¿Notificaciones cargan?

#### **9. Contenido (3 pantallas)**
- [ ] **News** - ¿Noticias cargan?
- [ ] **NewsDetail** - ¿Detalle de noticia funciona?
- [ ] **Educacion** - ¿Educación financiera funciona?

#### **10. Cursos (2 pantallas)**
- [ ] **CourseDetail** - ¿Detalle de curso funciona?
- [ ] **LearningPaths** - ¿Rutas de aprendizaje funcionan?

#### **11. Herramientas Financieras (6 pantallas)**
- [ ] **MarketInfo** - ¿Información de mercado funciona?
- [ ] **Promotions** - ¿Promociones cargan?
- [ ] **PromotionDetail** - ¿Detalle de promoción funciona?
- [ ] **Inversiones** - ¿Inversiones funciona?
- [ ] **PlanificadorFinanciero** - ¿Planificador funciona?
- [ ] **CazaHormigas** - ¿Caza hormigas funciona?
- [ ] **ReportesAvanzados** - ¿Reportes funcionan?

#### **12. Herramientas Especiales (4 pantallas)**
- [ ] **Payment** - ¿Pagos funcionan?
- [ ] **VideoPlayer** - ¿Reproductor funciona?
- [ ] **IRIChatScreen** - ¿Chat con IA funciona?
- [ ] **Inversionista** - ¿Perfil inversionista funciona?

---

## 📝 **Formato de Reporte**

Para cada pantalla, reportar:

```
✅ **NombrePantalla**
- ✅ Navegación: Funciona
- ✅ UI: Se ve bien
- ✅ API: Conecta correctamente
- ✅ Funcionalidad: Todo funciona
- 📸 Screenshot: [adjuntar]
- 📝 Notas: [si hay problemas menores]
```

---

## ⏰ **Tiempo Estimado por Desarrollador**

- **Gabriel**: 45-60 minutos
- **Cubano**: 90-120 minutos

**Total**: ~2-3 horas

---

## 🎯 **Flujo de Testing Sugerido**

### **Gabriel:**
```
LanguageSelection → Welcome → SignIn → SignUp → UploadAvatar →
PickGoals → PickInterests → PickKnowledge → CommunityRecommendations → HomeFeed
```

### **Cubano:**
```
HomeFeed → CreatePost → Communities → Profile → ChatList →
Settings → Educacion → Inversiones → PlanificadorFinanciero
```

---

**¡Éxito con el testing!** 🚀
