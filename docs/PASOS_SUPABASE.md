# 🚀 Pasos para Completar CommunityDetailScreen

## 📋 CHECKLIST RÁPIDO

### 1. **Obtener IDs Reales** (5 min)
```sql
-- En Supabase SQL Editor:

-- Tu user ID
SELECT id, nombre, email FROM users LIMIT 5;

-- Community ID
SELECT id, nombre, descripcion FROM communities;
```

**Anota:**
- `TU_USER_ID`: _______________
- `TU_COMMUNITY_ID`: _______________

---

### 2. **Agregar Columna cover_image_url** (2 min)
```sql
-- Agregar columna para imagen de portada
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Actualizar comunidad con imagen de portada
UPDATE communities
SET cover_image_url = 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1200'
WHERE id = 'TU_COMMUNITY_ID';
```

---

### 3. **Verificar/Crear Membresía** (2 min)
```sql
-- Verificar si ya estás unido
SELECT * FROM user_communities 
WHERE user_id = 'TU_USER_ID' AND community_id = 'TU_COMMUNITY_ID';

-- Si no estás unido, ejecutar:
INSERT INTO user_communities (user_id, community_id, joined_at)
VALUES ('TU_USER_ID', 'TU_COMMUNITY_ID', NOW())
ON CONFLICT DO NOTHING;
```

---

### 4. **Crear Posts de Prueba** (5 min)
```sql
-- Post 1: Con imagen
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, image_url, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  'Invertir en la bolsa puede ser una excelente manera de aumentar su patrimonio con el tiempo. Sin embargo, es importante comprender los riesgos y tomar decisiones informadas. Aquí les comparto un análisis del mercado actual.',
  100,
  100,
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  NOW() - INTERVAL '2 hours'
);

-- Post 2: Sin imagen
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  '¿Alguien tiene experiencia con inversiones inmobiliarias en Chile? Estoy considerando comprar mi primera propiedad para rentar y me gustaría conocer sus opiniones.',
  50,
  25,
  NOW() - INTERVAL '5 hours'
);

-- Post 3: Celebración
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  '🎉 ¡Gran noticia! Mi portafolio ha crecido un 15% este trimestre. Gracias a todos por sus consejos y apoyo en esta comunidad.',
  200,
  80,
  NOW() - INTERVAL '6 hours'
);
```

---

### 5. **Crear Canales de Chat** (3 min)
```sql
INSERT INTO community_channels (community_id, name, description, type, created_at)
VALUES 
  ('TU_COMMUNITY_ID', 'General', 'Conversaciones generales sobre inversiones', 'text', NOW()),
  ('TU_COMMUNITY_ID', 'Oportunidades', 'Comparte oportunidades de inversión', 'text', NOW()),
  ('TU_COMMUNITY_ID', 'Análisis', 'Análisis técnico y fundamental', 'text', NOW()),
  ('TU_COMMUNITY_ID', 'Dudas', 'Pregunta lo que necesites saber', 'text', NOW());
```

---

### 6. **Verificar Datos del Usuario** (2 min)
```sql
-- Asegurarte de que tu usuario tiene todos los campos
UPDATE users
SET 
  full_name = COALESCE(full_name, nombre, username),
  avatar_url = COALESCE(avatar_url, photo_url, 'https://i.pravatar.cc/100'),
  role = COALESCE(role, 'Financiero')
WHERE id = 'TU_USER_ID';
```

---

## 🧪 VERIFICACIÓN FINAL

### Query de Verificación Completa:
```sql
-- Verificar que todo está correcto
SELECT 
  'Comunidad' as tipo,
  c.nombre,
  c.cover_image_url,
  (SELECT COUNT(*) FROM user_communities WHERE community_id = c.id) as miembros,
  (SELECT COUNT(*) FROM posts WHERE community_id = c.id) as posts,
  (SELECT COUNT(*) FROM community_channels WHERE community_id = c.id) as canales
FROM communities c
WHERE c.id = 'TU_COMMUNITY_ID';
```

**Resultado Esperado:**
```
tipo       | nombre                           | cover_image_url | miembros | posts | canales
-----------|----------------------------------|-----------------|----------|-------|--------
Comunidad  | Inversiones Inmobiliarias Chile  | https://...     | 1        | 3     | 4
```

---

## 🎯 RESULTADO ESPERADO EN LA APP

Después de ejecutar estos pasos, deberías ver:

1. ✅ **Portada azul** (o imagen si la agregaste)
2. ✅ **Avatar de comunidad** centrado sobre la portada
3. ✅ **Botón "Unido"** (gris, deshabilitado) si ya te uniste
4. ✅ **3 posts** en el feed con:
   - Avatar del autor
   - Nombre y rol
   - Contenido
   - Imagen (en post 1)
   - Likes y comentarios
   - Botones de acción
5. ✅ **4 canales** en tab "Chats"
6. ✅ **Input habilitado** para publicar
7. ✅ **Quick actions habilitadas** (clickeables)

---

## 🆘 TROUBLESHOOTING

### Problema: Aún dice "No hay publicaciones"
**Solución:**
```sql
-- Verificar que los posts tienen el community_id correcto
SELECT id, contenido, community_id, user_id 
FROM posts 
WHERE community_id = 'TU_COMMUNITY_ID';

-- Si está vacío, los posts no se crearon correctamente
-- Verifica que reemplazaste TU_COMMUNITY_ID
```

### Problema: Botón sigue diciendo "Unirse"
**Solución:**
```sql
-- Verificar membresía
SELECT * FROM user_communities 
WHERE user_id = 'TU_USER_ID' AND community_id = 'TU_COMMUNITY_ID';

-- Si no existe, crear:
INSERT INTO user_communities (user_id, community_id, joined_at)
VALUES ('TU_USER_ID', 'TU_COMMUNITY_ID', NOW());
```

### Problema: No se ven los canales
**Solución:**
```sql
-- Verificar canales
SELECT * FROM community_channels 
WHERE community_id = 'TU_COMMUNITY_ID';

-- Si no existen, ejecutar el INSERT de canales del paso 5
```

---

## ⏱️ TIEMPO TOTAL ESTIMADO: 15-20 minutos

1. Obtener IDs: 5 min
2. Agregar columna: 2 min
3. Verificar membresía: 2 min
4. Crear posts: 5 min
5. Crear canales: 3 min
6. Verificar usuario: 2 min
7. Verificación final: 2 min

---

## 📞 SIGUIENTE PASO

Una vez ejecutados estos pasos:
1. Cierra y abre la app
2. Navega a la comunidad
3. Deberías ver todo funcionando 100%
4. Si hay algún problema, revisa los logs de la consola

**¿Listo para ejecutar?** 🚀
