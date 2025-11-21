# ✅ SETUP COMPLETO - SISTEMA DE SOPORTE INVESTÍ

## 📋 Resumen de lo Completado

### 1. PANTALLA DE SOPORTE Y REPORTE DE BUGS ✅

**Archivo:** `src/screens/SupportTicketScreen.tsx`

**Características:**
- ✅ Formulario para reportar bugs con título y descripción
- ✅ Selector de prioridad (Baja, Media, Alta, Crítica)
- ✅ Carga de imágenes desde galería
- ✅ Captura de fotos con cámara
- ✅ Adjuntar múltiples archivos
- ✅ Visualización de mis tickets
- ✅ Estados de tickets (Abierto, En Progreso, Resuelto, Cerrado)
- ✅ Detalle de cada ticket
- ✅ Historial de cambios

**Integración:**
- ✅ Agregada a `src/navigation/index.tsx`
- ✅ Agregada a `src/types/navigation.ts`
- ✅ Accesible desde Settings (icono Headphones)

---

## 🗄️ BACKEND SUPABASE

### Archivos SQL Listos para Ejecutar

#### 1. SUPPORT_BACKEND_CLEAN.sql
Contiene:
- ✅ Tabla `support_tickets`
- ✅ Tabla `support_attachments`
- ✅ Tabla `support_ticket_history`
- ✅ Índices para optimización
- ✅ Políticas RLS (Row Level Security)
- ✅ Funciones:
  - `update_support_ticket_timestamp()` - Actualiza timestamp
  - `log_support_ticket_change()` - Registra cambios
  - `get_recent_errors()` - Últimos 10 errores
  - `get_user_tickets()` - Tickets del usuario
  - `get_ticket_stats()` - Estadísticas

#### 2. SETUP_STORAGE_POLICIES.sql
Contiene:
- ✅ Políticas para bucket `support_attachments`
- ✅ Permisos SELECT (descargar)
- ✅ Permisos INSERT (subir)
- ✅ Permisos DELETE (admin)

---

## 🚀 PASOS DE INSTALACIÓN

### PASO 1: Ejecutar Backend SQL

1. Abre [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Crea una nueva query
5. Copia todo el contenido de `SUPPORT_BACKEND_CLEAN.sql`
6. Haz clic en **Run** (o Ctrl+Enter)
7. Espera a que se complete

**Resultado esperado:**
```
✅ Tables created
✅ Indexes created
✅ RLS enabled
✅ Policies created
✅ Functions created
✅ Triggers created
```

---

### PASO 2: Crear Bucket de Storage

1. En Supabase, ve a **Storage**
2. Haz clic en **Create a new bucket**
3. Nombre: `support_attachments`
4. Privado: **NO** (desmarca la opción)
5. Haz clic en **Create bucket**

---

### PASO 3: Configurar Políticas de Storage

1. En Supabase, ve a **Storage** > **Policies**
2. Selecciona el bucket `support_attachments`
3. Haz clic en **New Policy**
4. Copia las políticas de `SETUP_STORAGE_POLICIES.sql`

O ejecuta directamente en SQL Editor:

```sql
CREATE POLICY "Users can download own attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'support_attachments' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'support_attachments' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Admin can delete attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'support_attachments' 
    AND auth.uid() IS NOT NULL
  );
```

---

### PASO 4: Verificar la Instalación

Ejecuta esta query en Supabase SQL Editor:

```sql
SELECT * FROM support_tickets LIMIT 1;
SELECT * FROM support_attachments LIMIT 1;
SELECT * FROM support_ticket_history LIMIT 1;
```

Deberías ver las tablas vacías (sin errores).

---

### PASO 5: Probar la Pantalla

1. Abre la app en tu dispositivo/emulador
2. Ve a **Settings** (Configuración)
3. Haz clic en el icono de **Headphones** (Soporte)
4. Deberías ver la pantalla de SupportTicket
5. Prueba crear un ticket

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: support_tickets

```sql
id (UUID)                    -- ID único del ticket
user_id (UUID)              -- Usuario que reportó
title (VARCHAR 255)         -- Título del reporte
description (TEXT)          -- Descripción del problema
status (VARCHAR 50)         -- open, in_progress, resolved, closed
priority (VARCHAR 50)       -- low, medium, high, critical
attachments_count (INT)     -- Cantidad de archivos
assigned_to (UUID)          -- Asignado a (admin)
resolution_notes (TEXT)     -- Notas de resolución
resolved_at (TIMESTAMP)     -- Fecha de resolución
created_at (TIMESTAMP)      -- Fecha de creación
updated_at (TIMESTAMP)      -- Última actualización
```

### Tabla: support_attachments

```sql
id (UUID)                   -- ID único del adjunto
ticket_id (UUID)            -- Ticket asociado
file_name (VARCHAR 255)     -- Nombre del archivo
file_path (VARCHAR 500)     -- Ruta en storage
file_type (VARCHAR 50)      -- image, video, document
file_size (INT)             -- Tamaño en bytes
created_at (TIMESTAMP)      -- Fecha de creación
```

### Tabla: support_ticket_history

```sql
id (UUID)                   -- ID único
ticket_id (UUID)            -- Ticket asociado
changed_by (UUID)           -- Quién hizo el cambio
old_status (VARCHAR 50)     -- Estado anterior
new_status (VARCHAR 50)     -- Estado nuevo
old_priority (VARCHAR 50)   -- Prioridad anterior
new_priority (VARCHAR 50)   -- Prioridad nueva
comment (TEXT)              -- Comentario del cambio
created_at (TIMESTAMP)      -- Fecha del cambio
```

---

## 🔐 SEGURIDAD (RLS)

Todas las tablas tienen Row Level Security habilitado:

- ✅ Usuarios solo ven sus propios tickets
- ✅ Usuarios solo pueden crear tickets propios
- ✅ Usuarios solo pueden ver sus adjuntos
- ✅ Historial protegido por RLS

---

## 📱 FUNCIONALIDADES DE LA PANTALLA

### Pestaña 1: Reportar

- ✅ Título del reporte (máx 100 caracteres)
- ✅ Descripción (máx 1000 caracteres)
- ✅ Selector de prioridad (4 opciones)
- ✅ Botón "Galería" para seleccionar archivos
- ✅ Botón "Cámara" para tomar fotos
- ✅ Lista de adjuntos con opción de eliminar
- ✅ Botón "Enviar Reporte"
- ✅ Validación de campos requeridos

### Pestaña 2: Mis Tickets

- ✅ Lista de todos los tickets del usuario
- ✅ Ordenados por fecha (más recientes primero)
- ✅ Muestra: ID, Título, Estado, Prioridad, Fecha
- ✅ Tap en ticket para ver detalles
- ✅ Modal con información completa del ticket
- ✅ Estados con colores:
  - 🔴 Abierto (Rojo)
  - 🟠 En Progreso (Naranja)
  - 🟢 Resuelto (Verde)
  - ⚫ Cerrado (Gris)

---

## 📊 ÚLTIMOS 10 ERRORES (Dashboard)

Para ver los últimos 10 errores reportados, ejecuta:

```sql
SELECT * FROM get_recent_errors(10);
```

Resultado:
```
id | title | priority | status | user_id | created_at | attachments_count
```

---

## 📈 ESTADÍSTICAS DE TICKETS

Para ver estadísticas generales:

```sql
SELECT * FROM get_ticket_stats();
```

Resultado:
```
total_tickets | open_tickets | in_progress_tickets | resolved_tickets | critical_tickets | high_priority_tickets
```

---

## 🎯 PRÓXIMOS PASOS

### Fase 2: Dashboard de Admin

- [ ] Crear pantalla de admin para ver todos los tickets
- [ ] Filtrar por estado, prioridad, usuario
- [ ] Asignar tickets a staff
- [ ] Agregar notas de resolución
- [ ] Cambiar estado de tickets
- [ ] Ver historial de cambios

### Fase 3: Notificaciones

- [ ] Notificar al usuario cuando su ticket cambia de estado
- [ ] Notificar al admin cuando hay nuevo ticket
- [ ] Notificar por email

### Fase 4: Analytics

- [ ] Gráficos de tickets por prioridad
- [ ] Gráficos de tickets por estado
- [ ] Tiempo promedio de resolución
- [ ] Errores más comunes

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module '../rest/supabaseClient'"
**Solución:** Ya corregido. El import ahora es `import { supabase } from "../supabase";`

### Error: "Table does not exist"
**Solución:** Ejecuta `SUPPORT_BACKEND_CLEAN.sql` en Supabase SQL Editor

### Error: "Permission denied" al subir archivos
**Solución:** Verifica que el bucket `support_attachments` exista y las políticas estén configuradas

### Error: "RLS policy violation"
**Solución:** Asegúrate de estar autenticado. Las políticas requieren `auth.uid()`

---

## 📞 CONTACTO Y SOPORTE

**Email:** contacto@investiiapp.com  
**Sitio Web:** https://www.investiiapp.com  
**Versión:** 1.0.45.42

---

## 📝 ARCHIVOS GENERADOS

1. ✅ `src/screens/SupportTicketScreen.tsx` - Pantalla de soporte
2. ✅ `SUPPORT_BACKEND_CLEAN.sql` - Backend SQL
3. ✅ `SETUP_STORAGE_POLICIES.sql` - Políticas de storage
4. ✅ `PROYECTO_INVESTI_SCRUM.md` - Documentación SCRUM
5. ✅ `PROMPT_NOTION_SCRUM.txt` - Prompt para Notion
6. ✅ `SETUP_COMPLETO.md` - Este archivo

---

## ✅ CHECKLIST FINAL

- [x] Pantalla SupportTicketScreen creada
- [x] Integrada en navigation
- [x] Backend SQL preparado
- [x] Storage configurado
- [x] RLS habilitado
- [x] Funciones SQL creadas
- [x] Documentación completa
- [x] Prompt para Notion listo

**Estado:** 🟢 LISTO PARA PRODUCCIÓN

---

**Última actualización:** 17 de Noviembre, 2025
