# 🐛 Debug - Pantalla de Metas

## Problema Reportado
- Error: "Error saving user goals" y "updating goals"
- No permite avanzar a la siguiente pantalla
- Terminal solo muestra: `LOG 📸 Navigation: Sin avatar, yendo a UploadAvatar`

## ✅ Cambios Realizados

### 1. **Logs Detallados Agregados**

En `PickGoalsScreen.tsx`:
```typescript
- 🔑 User ID: [muestra el ID del usuario]
- 🎯 Selected Goals: [muestra los IDs de metas seleccionadas]
- 💾 Guardando metas...
- ✅ Metas guardadas exitosamente
- 👤 Actualizando paso de onboarding...
- ✅ Onboarding actualizado exitosamente
- 🚀 Navegando a PickKnowledge
```

En `api.ts` - `saveUserGoals()`:
```typescript
- 📝 saveUserGoals - userId: [ID]
- 📝 saveUserGoals - goalIds: [array de IDs]
- 🔐 Session check: Autenticado/No autenticado
- 🗑️ Eliminando metas anteriores...
- 📥 Insertando metas: [datos a insertar]
- ✅ Metas insertadas exitosamente
```

### 2. **Validación de Sesión**
Ahora verifica que haya una sesión activa de Supabase antes de intentar guardar.

### 3. **Manejo de Errores Mejorado**
- Muestra alertas al usuario con el mensaje de error específico
- Logs detallados de error code, message, details, hint

### 4. **Columna `metas` Removida**
Ya no se intenta actualizar `users.metas` (que puede no existir).
Solo se actualiza `users.onboarding_step`.

## 🔍 Pasos para Debuggear

### Paso 1: Ejecutar SQL en Supabase
Ejecuta este archivo para asegurar que la columna existe:
```
sql/add_onboarding_step_column.sql
```

### Paso 2: Verificar Tabla user_goals
En Supabase SQL Editor:
```sql
-- Ver estructura de la tabla
SELECT * FROM information_schema.columns 
WHERE table_name = 'user_goals';

-- Ver políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'user_goals';

-- Verificar que las metas existen
SELECT id, name FROM goals;
```

### Paso 3: Probar la App
1. Reinicia la app
2. Ve a la pantalla de metas
3. Selecciona 1-3 metas
4. Presiona "Continuar"
5. **Revisa la terminal** - ahora verás logs detallados

### Paso 4: Interpretar los Logs

#### ✅ Si funciona correctamente:
```
🔑 User ID: abc-123-def
🎯 Selected Goals: ["uuid1", "uuid2", "uuid3"]
📝 saveUserGoals - userId: abc-123-def
📝 saveUserGoals - goalIds: ["uuid1", "uuid2", "uuid3"]
🔐 Session check: Autenticado
🗑️ Eliminando metas anteriores...
📥 Insertando metas: [{user_id: ..., goal_id: ..., priority: 1}, ...]
✅ Metas insertadas exitosamente
👤 Actualizando paso de onboarding...
✅ Onboarding actualizado exitosamente
🚀 Navegando a PickKnowledge
```

#### ❌ Si hay error de sesión:
```
🔑 User ID: abc-123-def
🔐 Session check: No autenticado
❌ No hay sesión activa
```
**Solución**: El usuario necesita volver a iniciar sesión.

#### ❌ Si hay error de permisos RLS:
```
❌ Error insertando metas: {...}
❌ Error code: 42501
❌ Error message: new row violates row-level security policy
```
**Solución**: Verificar políticas RLS en Supabase.

#### ❌ Si hay error de FK (Foreign Key):
```
❌ Error code: 23503
❌ Error message: insert or update on table "user_goals" violates foreign key constraint
```
**Solución**: El `goal_id` no existe en la tabla `goals`.

## 🛠️ Soluciones Comunes

### Problema: No hay sesión activa
```typescript
// En SignInScreen.tsx o donde hagas login
await supabase.auth.signInWithPassword({
  email: email,
  password: password
})
```

### Problema: Políticas RLS bloqueando
```sql
-- Verificar que auth.uid() coincide con user_id
SELECT auth.uid();

-- Ver si puede insertar manualmente
INSERT INTO user_goals (user_id, goal_id, priority)
VALUES (auth.uid(), 'goal-uuid-here', 1);
```

### Problema: goal_id no existe
```sql
-- Verificar IDs de metas
SELECT id, name FROM goals;

-- Insertar metas si faltan (ver update_goals_table.sql)
```

## 📱 Testing Manual

1. **Limpia la app**:
   ```bash
   npm start -- --reset-cache
   ```

2. **Verifica que el usuario esté autenticado**:
   - Ve a Settings → Debe mostrar tu perfil
   - Si no, vuelve a iniciar sesión

3. **Prueba el flujo completo**:
   - Welcome → Upload Avatar → Pick Goals → Pick Interests → Pick Knowledge

4. **Verifica en Supabase**:
   ```sql
   -- Ver metas guardadas
   SELECT * FROM user_goals WHERE user_id = 'tu-user-id';
   
   -- Ver paso de onboarding
   SELECT id, nombre, onboarding_step FROM users WHERE id = 'tu-user-id';
   ```

## 🎯 Siguiente Paso

**Ejecuta la app nuevamente** y comparte los logs completos de la terminal para identificar el error exacto.
