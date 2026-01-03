# ✅ CORRECCIÓN - Tablas Supabase

## Tablas Correctas

### 1. ✅ IRI Chat - Tabla correcta: `iri_chat_messages`

**Ya existe en Supabase:**
```sql
CREATE TABLE public.iri_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT iri_chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT iri_chat_messages_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_iri_chat_messages_user_id 
ON public.iri_chat_messages USING btree (user_id);

CREATE INDEX idx_iri_chat_messages_created_at 
ON public.iri_chat_messages USING btree (created_at);
```

**Funciones en `api.ts` - YA CORRECTAS:**
- `saveIRIChatMessage()` - usa `iri_chat_messages` ✅
- `loadIRIChatHistory()` - usa `iri_chat_messages` ✅

**NO CREAR** `iri_chat_history` - usar `iri_chat_messages`

---

### 2. ✅ Conversations - Columnas correctas

**Tabla `conversations`:**
```sql
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT,
  type TEXT DEFAULT 'direct'::text CHECK (type = ANY (ARRAY['direct'::text, 'group'::text])),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  participant_one UUID,  -- ✅ CORRECTO
  participant_two UUID,  -- ✅ CORRECTO
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_created_by_fkey FOREIGN KEY (created_by) 
    REFERENCES public.users(id),
  CONSTRAINT conversations_participant_one_fkey FOREIGN KEY (participant_one) 
    REFERENCES public.users(id),
  CONSTRAINT conversations_participant_two_fkey FOREIGN KEY (participant_two) 
    REFERENCES public.users(id)
);
```

**Columnas correctas:**
- ✅ `participant_one` (no `participant1_id`)
- ✅ `participant_two` (no `participant2_id`)

**Query correcto en `api.ts`:**
```typescript
export async function getUserConversations(userId: string) {
  try {
    const response = await request("GET", "/conversations", {
      params: {
        or: `(participant_one.eq.${userId},participant_two.eq.${userId})`,
        select: "id,type,last_message,updated_at,participant_one:users!participant_one(id,nombre,avatar_url,is_online),participant_two:users!participant_two(id,nombre,avatar_url,is_online)",
        order: "updated_at.desc"
      }
    });
    // ...
  }
}
```

---

### 3. ✅ Query SQL Correcto para Mensajes Directos

**Para verificar conversaciones del usuario:**
```sql
-- ✅ CORRECTO
SELECT * FROM conversations 
WHERE participant_one = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
   OR participant_two = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY updated_at DESC;

-- ❌ INCORRECTO (columnas no existen)
SELECT * FROM conversations 
WHERE participant1_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
   OR participant2_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
```

**Para verificar mensajes:**
```sql
SELECT 
  c.id as conversation_id,
  c.type,
  c.last_message,
  c.updated_at,
  u1.nombre as participant_one_name,
  u2.nombre as participant_two_name,
  COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN users u1 ON c.participant_one = u1.id
LEFT JOIN users u2 ON c.participant_two = u2.id
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.participant_one = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
   OR c.participant_two = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
GROUP BY c.id, c.type, c.last_message, c.updated_at, u1.nombre, u2.nombre
ORDER BY c.updated_at DESC;
```

---

### 4. ✅ IRI Chat - Query Correcto

**Para verificar mensajes de IRI del usuario:**
```sql
-- ✅ CORRECTO
SELECT * FROM iri_chat_messages 
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY created_at DESC;

-- Ver total de mensajes
SELECT 
  role,
  COUNT(*) as total
FROM iri_chat_messages 
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
GROUP BY role;
```

---

## 📊 Resumen de Correcciones

| Tabla/Función | Estado | Nombre Correcto |
|---------------|--------|-----------------|
| IRI Chat tabla | ✅ Correcto | `iri_chat_messages` |
| IRI Chat funciones | ✅ Correcto | Ya usan `iri_chat_messages` |
| Conversations columnas | ✅ Correcto | `participant_one`, `participant_two` |
| getUserConversations | ✅ Correcto | Ya usa columnas correctas |

---

## 🚀 Acciones

### 1. NO crear tabla `iri_chat_history`
La tabla correcta ya existe: `iri_chat_messages`

### 2. Verificar mensajes directos
```sql
-- Ejecutar en Supabase SQL Editor
SELECT * FROM conversations 
WHERE participant_one = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
   OR participant_two = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
```

### 3. Verificar mensajes IRI
```sql
-- Ejecutar en Supabase SQL Editor
SELECT * FROM iri_chat_messages 
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Estado Final

- ✅ Tabla `iri_chat_messages` existe y funciona
- ✅ Funciones `api.ts` usan nombres correctos
- ✅ Query de conversaciones usa `participant_one/two`
- ⚠️ Verificar si usuario tiene conversaciones en DB

**Todo el código ya está correcto. Solo falta verificar datos en Supabase.**
