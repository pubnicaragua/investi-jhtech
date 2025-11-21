# 📌 GUÍA PARA IMPORTAR A NOTION

## Opción 1: Importar Markdown Directamente

### Paso 1: Preparar el archivo
- Abre `PROYECTO_INVESTI_SCRUM.md`
- Copia TODO el contenido

### Paso 2: Crear página en Notion
1. Abre [Notion](https://www.notion.so)
2. Crea una nueva página
3. Dale el nombre: "Investí - SCRUM"

### Paso 3: Importar
1. En la página, haz clic en los **3 puntos** (menú)
2. Selecciona **Import**
3. Elige **Markdown**
4. Pega el contenido de `PROYECTO_INVESTI_SCRUM.md`
5. Haz clic en **Import**

Notion convertirá automáticamente:
- Encabezados (#, ##, ###) → Títulos con niveles
- Tablas → Tablas de Notion
- Listas → Listas con viñetas
- Emojis → Se mantienen

---

## Opción 2: Crear Manualmente con Estructura SCRUM

### Estructura Recomendada en Notion

```
📱 Investí - SCRUM
├── 📊 Dashboard
│   ├── Resumen Ejecutivo
│   ├── Estado General (%)
│   └── Últimos Cambios
├── 🏃 Sprints
│   ├── Sprint 1: Autenticación (✅)
│   ├── Sprint 2: Funcionalidades (✅)
│   ├── Sprint 3: Herramientas (✅)
│   └── Sprint 4: Soporte (🔄)
├── 📱 Pantallas (52)
│   ├── 🔐 Autenticación (6)
│   ├── 🎯 Configuración (6)
│   ├── 🏠 Principal (1)
│   ├── 📰 Posts (7)
│   ├── 👥 Comunidades (6)
│   ├── 👤 Perfiles (5)
│   ├── 💬 Chat (5)
│   ├── 🔔 Notificaciones (1)
│   ├── 📚 Educación (5)
│   ├── 💰 Finanzas (8)
│   └── 🔧 Especiales (4)
├── 🐛 Errores Reportados
│   └── Últimos 10 (Tabla)
├── ✅ Backlog
│   ├── Por Hacer
│   ├── En Progreso
│   └── Completado
└── 📚 Documentación
```

---

## Opción 3: Usar Notion AI (Si tienes suscripción)

### Paso 1: Crear página
1. Abre Notion
2. Crea una nueva página

### Paso 2: Usar AI
1. Escribe `/ask` en la página
2. Pega este prompt:

```
Crea una estructura SCRUM completa para un proyecto de app móvil llamado "Investí" 
con las siguientes características:

- 52 pantallas organizadas en 11 categorías
- 4 sprints (3 completados, 1 en progreso)
- Sistema de soporte con tickets
- 10 últimos errores reportados
- Tabla de pantallas con estado
- Flujos de navegación
- Tecnologías: React Native, Supabase, PostgreSQL

Incluye:
- Dashboard con métricas
- Vista de sprints con tareas
- Tabla de pantallas filtrable
- Tabla de errores con prioridad
- Calendario de hitos
- Equipo y responsabilidades
```

3. Notion AI generará la estructura automáticamente

---

## Opción 4: Copiar Tablas Individuales

Si prefieres crear manualmente, aquí están las tablas principales:

### Tabla 1: Pantallas por Categoría

| Categoría | Pantalla | Archivo | APIs | Estado |
|-----------|----------|---------|------|--------|
| 🔐 Autenticación | SignIn | SignInScreen.tsx | signIn() | ✅ |
| 🔐 Autenticación | SignUp | SignUpScreen.tsx | signUpWithMetadata() | ✅ |
| 🎯 Configuración | PickGoals | PickGoalsScreen.tsx | updateUser() | ✅ |
| 🎯 Configuración | PickInterests | PickInterestsScreen.tsx | updateUserInterestsViaRPC() | ✅ |
| 📰 Posts | CreatePost | CreatePostScreen.tsx | createPost() | ✅ |
| 📰 Posts | PostDetail | PostDetailScreen.tsx | getPostDetail() | ✅ |
| 👥 Comunidades | Communities | CommunitiesScreen.tsx | listCommunities() | ✅ |
| 👥 Comunidades | CommunityDetail | CommunityDetailScreen.tsx | getCommunityDetail() | ✅ |
| 💬 Chat | ChatList | ChatListScreen.tsx | getChats() | ✅ |
| 💬 Chat | ChatScreen | ChatScreen.tsx | getChatMessages() | ✅ |

### Tabla 2: Últimos 10 Errores

| ID | Título | Prioridad | Estado | Fecha | Usuario |
|----|--------|-----------|--------|-------|---------|
| 1 | Error al crear post | Alta | Abierto | 2025-11-17 | @user1 |
| 2 | Chat no carga | Media | En progreso | 2025-11-16 | @user2 |
| 3 | Crash en comunidad | Crítica | Resuelto | 2025-11-15 | @user3 |
| 4 | Notificaciones no llegan | Media | Abierto | 2025-11-15 | @user4 |
| 5 | Avatar no actualiza | Baja | Cerrado | 2025-11-14 | @user5 |
| 6 | Búsqueda lenta | Media | En progreso | 2025-11-14 | @user6 |
| 7 | Error simulador | Alta | Abierto | 2025-11-13 | @user7 |
| 8 | Sincronización falla | Alta | Resuelto | 2025-11-13 | @user8 |
| 9 | Interfaz congelada | Crítica | En progreso | 2025-11-12 | @user9 |
| 10 | Error guardar posts | Media | Abierto | 2025-11-12 | @user10 |

### Tabla 3: Sprints

| Sprint | Objetivo | Duración | Estado | Tareas | Completado |
|--------|----------|----------|--------|--------|-----------|
| Sprint 1 | Autenticación y Onboarding | 2 semanas | ✅ Completado | 8 | 100% |
| Sprint 2 | Funcionalidades Principales | 3 semanas | ✅ Completado | 12 | 100% |
| Sprint 3 | Herramientas Financieras | 3 semanas | ✅ Completado | 10 | 100% |
| Sprint 4 | Sistema de Soporte | 2 semanas | 🔄 En Progreso | 8 | 60% |

---

## Vistas Recomendadas en Notion

### Vista 1: Tabla (Database)
- Mostrar todas las pantallas
- Filtrar por categoría, estado
- Agrupar por categoría
- Ordenar por nombre

### Vista 2: Kanban
- Columnas: Por Hacer, En Progreso, Completado
- Tarjetas: Pantallas/Tareas
- Filtrar por prioridad

### Vista 3: Calendario
- Mostrar hitos del proyecto
- Fechas de sprints
- Deadlines

### Vista 4: Galería
- Mostrar pantallas con screenshots
- Categorías como galerías

---

## Propiedades Recomendadas para Database

### Para Pantallas
- **Nombre** (Text)
- **Archivo** (Text)
- **Categoría** (Select)
- **APIs** (Multi-select)
- **Estado** (Select: ✅ Completado, 🔄 En Progreso, ⏳ Pendiente)
- **Prioridad** (Select: Baja, Media, Alta, Crítica)
- **Problemas** (Text)
- **Notas** (Text)

### Para Errores
- **ID** (Number)
- **Título** (Text)
- **Prioridad** (Select)
- **Estado** (Select)
- **Fecha** (Date)
- **Usuario** (Text)
- **Descripción** (Text)
- **Adjuntos** (Files)

### Para Tareas
- **Nombre** (Text)
- **Sprint** (Select)
- **Responsable** (Person)
- **Estado** (Select)
- **Prioridad** (Select)
- **Fecha Inicio** (Date)
- **Fecha Fin** (Date)
- **Completado** (Checkbox)

---

## Emojis Útiles para Notion

```
📱 Proyecto
🔐 Autenticación
🎯 Configuración
🏠 Principal
📰 Posts
👥 Comunidades
👤 Perfiles
💬 Chat
🔔 Notificaciones
📚 Educación
💰 Finanzas
🔧 Herramientas
🐛 Bugs
✅ Completado
🔄 En Progreso
⏳ Pendiente
🔴 Crítica
🟠 Alta
🟡 Media
🟢 Baja
```

---

## Fórmulas Útiles en Notion

### Porcentaje de Completado
```
dateBetween(prop("Fecha Fin"), prop("Fecha Inicio"), "days") / 
dateBetween(now(), prop("Fecha Inicio"), "days") * 100
```

### Días Restantes
```
dateBetween(prop("Fecha Fin"), now(), "days")
```

### Estado Automático
```
if(prop("Completado"), "✅ Completado", if(prop("En Progreso"), "🔄 En Progreso", "⏳ Pendiente"))
```

---

## Pasos Finales

1. ✅ Importa o crea la estructura
2. ✅ Agrega las tablas de pantallas y errores
3. ✅ Configura filtros y vistas
4. ✅ Personaliza con colores y emojis
5. ✅ Comparte con el equipo
6. ✅ Actualiza regularmente

---

## Compartir con el Equipo

1. En Notion, haz clic en **Share**
2. Selecciona **Invite**
3. Agrega emails del equipo
4. Elige permisos (Editor, Commenter, Viewer)
5. Envía invitación

---

**¡Listo para usar en Notion! 🚀**
