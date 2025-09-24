# 🚀 POSTMAN SETUP RÁPIDO - INVESTI APP

## Configuración Base
- **URL Base**: `https://paoliakwfoczcallnecf.supabase.co`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o`

## Headers Necesarios
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o
```

## 🔥 ENDPOINTS CRÍTICOS PARA PROBAR

### 1. **Posts Feed**
```
GET https://paoliakwfoczcallnecf.supabase.co/rest/v1/posts?select=*,users(nombre,avatar_url)&limit=10
```

### 2. **Communities**
```
GET https://paoliakwfoczcallnecf.supabase.co/rest/v1/communities?select=*&limit=10
```

### 3. **User Stats (RPC)**
```
POST https://paoliakwfoczcallnecf.supabase.co/rest/v1/rpc/get_user_quick_stats
Body: {"p_user_id": "00000000-0000-0000-0000-000000000000"}
```

### 4. **Search All (RPC)**
```
POST https://paoliakwfoczcallnecf.supabase.co/rest/v1/rpc/search_all
Body: {"p_user_id": "00000000-0000-0000-0000-000000000000"}
```

### 5. **Recommended Communities (RPC)**
```
POST https://paoliakwfoczcallnecf.supabase.co/rest/v1/rpc/get_recommended_communities
Body: {"p_user_id": "00000000-0000-0000-0000-000000000000"}
```

## 🎯 TESTING STRATEGY

1. **Primero**: Prueba los endpoints básicos (GET posts, communities)
2. **Segundo**: Prueba las funciones RPC
3. **Tercero**: Prueba la app móvil

## ⚡ CORRECCIÓN FINAL RÁPIDA

Ejecuta este SQL en Supabase para los últimos errores:

```sql
-- Corregir lessons.tipo
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'video';

-- Eliminar funciones duplicadas
DROP FUNCTION IF EXISTS get_recommended_communities(uuid);
DROP FUNCTION IF EXISTS get_recommended_communities(uuid, integer);

-- Recrear función única
CREATE OR REPLACE FUNCTION get_recommended_communities(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN '[]'::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🚀 RESULTADO ESPERADO
- **Postman**: Endpoints funcionando en 5 minutos
- **Test**: 85-90% de éxito después de la corrección
- **App**: Lista para probar
