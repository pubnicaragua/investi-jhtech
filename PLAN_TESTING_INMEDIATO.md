# 🧪 PLAN DE TESTING INMEDIATO

**Fecha**: 2025-10-03 08:40  
**Estado BD**: ✅ Todos los fixes aplicados correctamente

---

## ✅ VERIFICACIÓN DE BD COMPLETADA

```
✅ Trigger: trigger_update_member_count ACTIVO
✅ Funciones SQL: 5/5 operativas
✅ Contadores: 40/40 sincronizados (100%)
✅ Índices: Creados y activos
✅ Estructura: Completa
```

---

## 🎯 TESTS PRIORITARIOS

### TEST 1: Unirse a Comunidades (CRÍTICO) 🔴

**Objetivo:** Verificar que el trigger funciona en tiempo real

**Pasos:**
1. Reiniciar app: `npm start -- --reset-cache`
2. Abrir app en dispositivo/emulador
3. Ir a `CommunitiesScreen` o `CommunityRecommendationsScreen`
4. Seleccionar una comunidad (ej: "Educación Financiera")
5. Tocar botón "Unirse"

**Verificaciones:**
- [ ] ✅ Botón cambia a "Unido" inmediatamente
- [ ] ✅ Contador de miembros aumenta en +1
- [ ] ✅ No hay errores en consola
- [ ] ✅ Aparece en "Mis Comunidades"

**Verificación en BD:**
```sql
-- Ejecutar DESPUÉS de unirse
SELECT 
  c.nombre,
  c.member_count,
  COUNT(uc.id) as real_count
FROM communities c
LEFT JOIN user_communities uc ON c.id = uc.community_id
WHERE c.nombre = 'Educación Financiera'
GROUP BY c.id, c.nombre, c.member_count;

-- Debe mostrar: member_count = real_count
```

**Si falla:**
- Verificar logs de Supabase
- Verificar que trigger existe: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_member_count';`
- Verificar permisos RLS en `user_communities`

---

### TEST 2: Group Chat de Comunidad 🟡

**Objetivo:** Verificar que aparece el chat después de unirse

**Prerequisito:** Haber completado TEST 1

**Pasos:**
1. Después de unirse a una comunidad
2. Ir a `ChatListScreen`
3. Buscar chat de la comunidad

**Verificaciones:**
- [ ] ✅ Aparece chat grupal de la comunidad
- [ ] ✅ Nombre de la comunidad correcto
- [ ] ✅ Avatar de la comunidad visible
- [ ] ✅ Se puede abrir el chat
- [ ] ✅ Se pueden enviar mensajes

**Si falla:**
- Verificar que `user_communities` tiene el registro
- Verificar que `status = 'active'`
- Revisar lógica de `ChatListScreen` para filtrar comunidades

---

### TEST 3: Personas por Intereses (NUEVO) 🆕

**Objetivo:** Probar nuevo endpoint de personas por intereses

**Pasos:**
1. Ir a `PromotionsScreen`
2. Scroll hasta sección "Personas Sugeridas"
3. Observar resultados

**Verificaciones:**
- [ ] ✅ Aparecen personas sugeridas
- [ ] ✅ Personas tienen intereses similares al usuario
- [ ] ✅ Se muestra información relevante
- [ ] ✅ Se puede interactuar (seguir, ver perfil)

**Verificación manual en BD:**
```sql
-- Reemplazar USER_ID con tu ID de usuario
SELECT 
  name,
  array_length(shared_interests, 1) as intereses_compartidos,
  ROUND(match_score, 2) as score
FROM get_people_by_shared_interests('USER_ID', 10)
ORDER BY match_score DESC;
```

**Si no aparecen resultados:**
- Verificar que tu usuario tiene intereses configurados
- Verificar que otros usuarios tienen intereses
- Ejecutar query manual para debug

---

### TEST 4: Algoritmo de Recomendaciones 🎯

**Objetivo:** Validar que el algoritmo funciona correctamente

**Pasos:**
1. Ir a `CommunityRecommendationsScreen`
2. Observar comunidades recomendadas

**Verificaciones:**
- [ ] ✅ Aparecen comunidades recomendadas
- [ ] ✅ Score de coincidencia visible
- [ ] ✅ Comunidades relevantes según metas/intereses
- [ ] ✅ Al tocar "Unirse", funciona (TEST 1)

**Verificación manual en BD:**
```sql
-- Reemplazar USER_ID con tu ID de usuario
SELECT 
  community_name,
  members_count,
  ROUND(match_score, 2) as score,
  matching_goals
FROM get_recommended_communities_by_goals_v2('USER_ID', 10)
ORDER BY match_score DESC;
```

**Nota:** Si no hay resultados, puede ser porque:
- Usuario no tiene metas configuradas (solo 5 usuarios las tienen)
- No hay comunidades con metas coincidentes
- Solución: Configurar metas en onboarding

---

### TEST 5: Contador en Tiempo Real ⏱️

**Objetivo:** Verificar que el trigger actualiza en tiempo real

**Pasos:**
1. Abrir Supabase Dashboard
2. Ir a Table Editor → `communities`
3. Buscar una comunidad específica
4. Anotar `member_count` actual
5. En la app, unirse a esa comunidad
6. Refrescar tabla en Supabase

**Verificaciones:**
- [ ] ✅ `member_count` aumentó en +1
- [ ] ✅ Actualización fue instantánea
- [ ] ✅ `updated_at` se actualizó

---

## 🐛 TROUBLESHOOTING

### Problema: "Ya eres miembro" pero no aparece en lista

**Diagnóstico:**
```sql
-- Ver membresías del usuario
SELECT 
  c.nombre,
  uc.status,
  uc.joined_at
FROM user_communities uc
JOIN communities c ON c.id = uc.community_id
WHERE uc.user_id = 'USER_ID'
ORDER BY uc.joined_at DESC;
```

**Solución:**
- Si `status != 'active'`, actualizar: `UPDATE user_communities SET status = 'active' WHERE id = 'MEMBERSHIP_ID';`

---

### Problema: Contador no se actualiza

**Diagnóstico:**
```sql
-- Verificar que el trigger existe
SELECT 
  tgname,
  tgenabled,
  tgtype
FROM pg_trigger
WHERE tgname = 'trigger_update_member_count';
```

**Solución:**
- Si no existe, ejecutar: `sql/fix_join_community_critical.sql`
- Si existe pero `tgenabled = 'D'`, habilitar: `ALTER TABLE user_communities ENABLE TRIGGER trigger_update_member_count;`

---

### Problema: No aparecen personas por intereses

**Diagnóstico:**
```sql
-- Ver intereses del usuario
SELECT intereses FROM users WHERE id = 'USER_ID';

-- Ver cuántos usuarios tienen intereses
SELECT COUNT(*) FROM users WHERE intereses IS NOT NULL AND array_length(intereses, 1) > 0;
```

**Solución:**
- Si usuario no tiene intereses, configurar en perfil
- Si pocos usuarios tienen intereses, es esperado que haya pocos resultados

---

## 📊 MÉTRICAS A MONITOREAR

### Durante Testing:

1. **Tasa de éxito de unirse a comunidades**
   - Intentos vs éxitos
   - Errores en consola

2. **Sincronización de contadores**
   - Comparar `member_count` vs conteo real
   - Frecuencia de desincronización

3. **Performance de queries**
   - Tiempo de respuesta de funciones SQL
   - Uso de índices

4. **Calidad de recomendaciones**
   - Relevancia de comunidades sugeridas
   - Relevancia de personas sugeridas

---

## ✅ CHECKLIST DE TESTING

### Preparación:
- [ ] Scripts SQL ejecutados en Supabase
- [ ] App reiniciada con `--reset-cache`
- [ ] Usuario de prueba tiene intereses configurados
- [ ] Usuario de prueba tiene metas configuradas (opcional)

### Tests Críticos:
- [ ] TEST 1: Unirse a comunidades ✅
- [ ] TEST 2: Group chat ✅
- [ ] TEST 5: Contador en tiempo real ✅

### Tests Importantes:
- [ ] TEST 3: Personas por intereses ✅
- [ ] TEST 4: Algoritmo de recomendaciones ✅

### Verificación Final:
- [ ] No hay errores en consola
- [ ] No hay errores en logs de Supabase
- [ ] Contadores sincronizados
- [ ] UX fluida y sin bugs

---

## 🎯 CRITERIOS DE ÉXITO

### Mínimo Aceptable:
- ✅ TEST 1 pasa (unirse a comunidades funciona)
- ✅ TEST 5 pasa (contador se actualiza)
- ✅ No hay errores críticos

### Ideal:
- ✅ Todos los tests pasan
- ✅ Performance aceptable (<2s por operación)
- ✅ UX fluida
- ✅ Recomendaciones relevantes

---

## 📝 REPORTE DE RESULTADOS

Después de completar los tests, documentar:

1. **Tests que pasaron**: X/5
2. **Tests que fallaron**: Lista con detalles
3. **Errores encontrados**: Descripción y logs
4. **Performance**: Tiempos de respuesta
5. **Observaciones**: Cualquier comportamiento inesperado

---

**ÚLTIMA ACTUALIZACIÓN**: 2025-10-03 08:40  
**ESTADO**: ✅ Listo para testing  
**PREREQUISITO**: Scripts SQL ejecutados correctamente ✅
