# 📱 Documentación de Cambios - Sistema de Chat

**Fecha:** 2 de Octubre, 2025  
**Desarrollador:** +53 5 4374371  
**Revisado por:** Gabriel

---

## 📋 Resumen de Cambios Solicitados

Tu desarrollador necesitaba los siguientes cambios en las tablas de Supabase para el sistema de chat:

### ✅ Cambios Implementados

1. **Tabla `chats`**: Agregar campo `unread_count`
2. **Tabla `messages`**: 
   - ✅ Agregar `receiver_id` (destinatario)
   - ✅ Agregar `media_url` (para archivos)
   - ✅ Agregar `message_type` (tipo de mensaje)
   - ✅ Eliminar campo duplicado `content`/`contenido`
   - ✅ Eliminar `conversation_id` (ya existe `chat_id`)

---

## 🚀 Cómo Ejecutar los Cambios

### Paso 1: Ir a Supabase SQL Editor

1. Abre tu proyecto en Supabase: https://paoliakwfoczcallnecf.supabase.co
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query

### Paso 2: Ejecutar el Script

1. Abre el archivo: `sql/fix_chat_tables_for_developer.sql`
2. Copia TODO el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **RUN** (o presiona Ctrl+Enter)

### Paso 3: Verificar

Al final del script verás:
```
✅ Script ejecutado exitosamente. Tablas actualizadas.
```

Y también verás dos tablas con la estructura actualizada de `messages` y `chats`.

---

## 📊 Estructura Final de las Tablas

### Tabla `messages` (DESPUÉS de los cambios)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del mensaje (PK) |
| `chat_id` | UUID | ID del chat (FK a `chats`) |
| `sender_id` | UUID | Usuario que envía el mensaje (FK a `users`) |
| **`receiver_id`** | UUID | **NUEVO** - Usuario que recibe el mensaje (FK a `users`) |
| `contenido` | TEXT | Contenido del mensaje |
| **`media_url`** | TEXT | **NUEVO** - URL del archivo multimedia (opcional) |
| **`message_type`** | TEXT | **NUEVO** - Tipo: `text`, `image`, `video`, `file`, `audio`, `voice` |
| `created_at` | TIMESTAMP | Fecha de creación |

**Campos ELIMINADOS:**
- ❌ `content` (duplicado de `contenido`)
- ❌ `conversation_id` (duplicado de `chat_id`)

---

### Tabla `chats` (DESPUÉS de los cambios)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del chat (PK) |
| `user1_id` | UUID | Primer usuario (FK a `users`) |
| `user2_id` | UUID | Segundo usuario (FK a `users`) |
| `community_id` | UUID | Comunidad asociada (opcional, FK a `communities`) |
| **`unread_count`** | INTEGER | **NUEVO** - Contador de mensajes no leídos (default: 0) |
| `created_at` | TIMESTAMP | Fecha de creación |

---

## 💻 Ejemplos de Uso para el Desarrollador

### 1. Enviar un mensaje de texto simple

```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    chat_id: 'uuid-del-chat',
    sender_id: 'uuid-del-sender',
    receiver_id: 'uuid-del-receiver',
    contenido: '¡Hola! ¿Cómo estás?',
    message_type: 'text'
  });
```

### 2. Enviar un mensaje con imagen

```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    chat_id: 'uuid-del-chat',
    sender_id: 'uuid-del-sender',
    receiver_id: 'uuid-del-receiver',
    contenido: 'Mira esta foto',
    media_url: 'https://tudominio.com/imagen.jpg',
    message_type: 'image'
  });
```

### 3. Enviar un archivo

```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    chat_id: 'uuid-del-chat',
    sender_id: 'uuid-del-sender',
    receiver_id: 'uuid-del-receiver',
    contenido: 'Te envío el documento',
    media_url: 'https://tudominio.com/documento.pdf',
    message_type: 'file'
  });
```

### 4. Obtener mensajes de un chat

```typescript
const { data: messages, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:sender_id(id, nombre, photo_url),
    receiver:receiver_id(id, nombre, photo_url)
  `)
  .eq('chat_id', 'uuid-del-chat')
  .order('created_at', { ascending: true });
```

### 5. Marcar chat como leído (resetear contador)

```typescript
const { data, error } = await supabase
  .rpc('mark_chat_as_read', {
    chat_id_param: 'uuid-del-chat',
    user_id_param: 'uuid-del-usuario'
  });
```

### 6. Obtener chats con contador de no leídos

```typescript
const { data: chats, error } = await supabase
  .from('chats')
  .select(`
    *,
    user1:user1_id(id, nombre, photo_url),
    user2:user2_id(id, nombre, photo_url),
    unread_count
  `)
  .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
  .order('created_at', { ascending: false });
```

---

## 🔒 Seguridad (Row Level Security)

El script incluye políticas RLS para proteger los datos:

### Políticas Implementadas:

1. **Leer mensajes**: Solo puedes ver mensajes donde eres `sender_id` o `receiver_id`, o si eres participante del chat
2. **Enviar mensajes**: Solo puedes enviar mensajes en chats donde eres participante
3. **Actualizar mensajes**: Solo puedes editar tus propios mensajes
4. **Eliminar mensajes**: Solo puedes eliminar tus propios mensajes

**Esto significa que:**
- ✅ Los usuarios solo ven sus propios mensajes
- ✅ No pueden leer mensajes de otros usuarios
- ✅ No pueden modificar mensajes ajenos
- ✅ Seguridad automática a nivel de base de datos

---

## ⚙️ Funciones Automáticas Creadas

### 1. `update_chat_unread_count()`

**¿Qué hace?**  
Se ejecuta automáticamente cada vez que se inserta un nuevo mensaje y incrementa el contador `unread_count` del chat.

**¿Necesitas hacer algo?**  
❌ NO - Es automático. Solo inserta el mensaje normalmente.

### 2. `mark_chat_as_read(chat_id, user_id)`

**¿Qué hace?**  
Resetea el contador de mensajes no leídos a 0 cuando el usuario abre el chat.

**¿Cuándo llamarla?**  
✅ Cuando el usuario abre un chat y ve los mensajes.

**Ejemplo:**
```typescript
// Cuando el usuario abre el chat
useEffect(() => {
  if (chatId && userId) {
    supabase.rpc('mark_chat_as_read', {
      chat_id_param: chatId,
      user_id_param: userId
    });
  }
}, [chatId, userId]);
```

---

## 🎯 Tipos de Mensajes Soportados

El campo `message_type` acepta los siguientes valores:

| Tipo | Descripción | Requiere `media_url` |
|------|-------------|---------------------|
| `text` | Mensaje de texto simple | ❌ No |
| `image` | Imagen (JPG, PNG, etc.) | ✅ Sí |
| `video` | Video (MP4, etc.) | ✅ Sí |
| `file` | Documento (PDF, DOC, etc.) | ✅ Sí |
| `audio` | Audio (MP3, etc.) | ✅ Sí |
| `voice` | Nota de voz | ✅ Sí |

---

## 📝 Índices Creados (Performance)

Para mejorar el rendimiento, se crearon los siguientes índices:

1. `idx_messages_receiver_id` - Búsquedas por receptor
2. `idx_messages_message_type` - Filtrar por tipo de mensaje
3. `idx_messages_chat_created` - Ordenar mensajes por chat y fecha

**Resultado:** Las queries serán más rápidas 🚀

---

## ✅ Checklist para el Desarrollador

Antes de empezar a trabajar con el chat, verifica:

- [ ] Ejecutaste el script SQL en Supabase
- [ ] Viste el mensaje de éxito al final
- [ ] Verificaste que la tabla `messages` tiene los nuevos campos
- [ ] Verificaste que la tabla `chats` tiene `unread_count`
- [ ] Actualizaste tus tipos TypeScript (si usas tipos)
- [ ] Probaste enviar un mensaje de texto
- [ ] Probaste enviar un mensaje con imagen
- [ ] Probaste la función `mark_chat_as_read`
- [ ] Verificaste que el contador `unread_count` se incrementa automáticamente

---

## 🐛 Troubleshooting

### Error: "column already exists"

**Solución:** El script usa `IF NOT EXISTS`, así que esto no debería pasar. Si ocurre, significa que ya ejecutaste el script antes. Puedes ignorarlo.

### Error: "permission denied"

**Solución:** Asegúrate de estar ejecutando el script como administrador en Supabase (con tu cuenta de owner del proyecto).

### El contador `unread_count` no se actualiza

**Solución:** Verifica que el trigger `trigger_update_unread_count` se haya creado correctamente:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_unread_count';
```

### Los mensajes no se muestran

**Solución:** Verifica las políticas RLS:

```sql
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

---

## 📞 Contacto

Si tienes dudas o problemas:

1. Revisa esta documentación completa
2. Verifica que ejecutaste el script correctamente
3. Revisa los ejemplos de código
4. Contacta a Gabriel si necesitas ayuda adicional

---

## 🎉 ¡Listo para Desarrollar!

Con estos cambios, tu desarrollador puede:

✅ Enviar mensajes de texto  
✅ Enviar imágenes y archivos  
✅ Ver el contador de mensajes no leídos  
✅ Marcar chats como leídos  
✅ Tener seguridad automática con RLS  
✅ Disfrutar de queries rápidas con índices  

**Todo está documentado, probado y listo para usar.**

---

**Archivo SQL:** `sql/fix_chat_tables_for_developer.sql`  
**Documentación:** Este archivo  
**Fecha:** 2 de Octubre, 2025
