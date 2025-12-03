# 📋 Formulario Landing Page - Simplificado

## 🎯 Objetivo
Recolectar información personal básica de usuarios en la landing page sin duplicar lo que ya se pregunta en la app.

---

## ✅ Campos a Recolectar

### 1. **Nombre Completo** (Obligatorio)
- **Campo**: `nombre_completo`
- **Tipo**: Text
- **Validación**: Mínimo 3 caracteres, máximo 100
- **Placeholder**: "Tu nombre completo"
- **Nota**: Se sincroniza con `full_name` en la app

---

### 2. **Correo Electrónico** (Obligatorio)
- **Campo**: `email`
- **Tipo**: Email
- **Validación**: Formato válido de email
- **Placeholder**: "tu@email.com"
- **Nota**: Se usa para login/registro en la app

---

### 3. **Teléfono** (Obligatorio)
- **Campo**: `telefono`
- **Tipo**: Tel
- **Validación**: Formato internacional (opcional)
- **Placeholder**: "+57 300 1234567"
- **Nota**: Para contacto y verificación

---

### 4. **Rango de Edad** (Obligatorio)
- **Campo**: `rango_edad`
- **Tipo**: Select
- **Opciones**:
  - 18-25
  - 26-35
  - 36-45
  - 46-55
  - 56-65
  - 66+
- **Nota**: Para segmentación demográfica

---

## ❌ Campos a ELIMINAR

Los siguientes campos NO deben estar en el formulario porque ya se preguntan en la app:

| Campo | Razón | Dónde se pregunta en app |
|-------|-------|--------------------------|
| País | Se pregunta en onboarding | PickKnowledge / EditProfile |
| Nivel de conocimiento | Se pregunta en onboarding | PickKnowledge |
| Intereses | Se pregunta en onboarding | PickInterests |
| Metas | Se pregunta en onboarding | PickGoals |
| Experiencia inversora | Se pregunta en onboarding | PickKnowledge |
| Presupuesto | No es necesario en landing | - |
| Objetivo de inversión | Se pregunta en onboarding | PickGoals |
| Riesgo tolerado | Se pregunta en onboarding | PickKnowledge |

---

## 📝 Estructura del Formulario

```html
<form id="landing-form">
  <!-- Nombre Completo -->
  <div class="form-group">
    <label for="nombre_completo">Nombre Completo *</label>
    <input
      type="text"
      id="nombre_completo"
      name="nombre_completo"
      placeholder="Tu nombre completo"
      required
      minlength="3"
      maxlength="100"
    />
  </div>

  <!-- Email -->
  <div class="form-group">
    <label for="email">Correo Electrónico *</label>
    <input
      type="email"
      id="email"
      name="email"
      placeholder="tu@email.com"
      required
    />
  </div>

  <!-- Teléfono -->
  <div class="form-group">
    <label for="telefono">Teléfono *</label>
    <input
      type="tel"
      id="telefono"
      name="telefono"
      placeholder="+57 300 1234567"
      required
    />
  </div>

  <!-- Rango de Edad -->
  <div class="form-group">
    <label for="rango_edad">Rango de Edad *</label>
    <select id="rango_edad" name="rango_edad" required>
      <option value="">Selecciona tu rango de edad</option>
      <option value="18-25">18-25 años</option>
      <option value="26-35">26-35 años</option>
      <option value="36-45">36-45 años</option>
      <option value="46-55">46-55 años</option>
      <option value="56-65">56-65 años</option>
      <option value="66+">66+ años</option>
    </select>
  </div>

  <!-- Botón Submit -->
  <button type="submit" class="btn-submit">
    Descargar App Gratis
  </button>
</form>
```

---

## 🔄 Flujo de Datos

### Landing Page → App

```
Landing Form (4 campos)
    ↓
    ├─ nombre_completo → full_name (en users)
    ├─ email → email (en auth)
    ├─ telefono → telefono (en users)
    └─ rango_edad → rango_edad (en users)
    ↓
Enviar a Supabase
    ↓
Usuario descarga app
    ↓
SignUp/SignIn en app
    ↓
Datos se sincronizan
    ↓
Onboarding (pregunta lo que falta)
```

---

## 💾 Tabla Supabase para Landing

### Tabla: `landing_leads`

```sql
CREATE TABLE landing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  rango_edad VARCHAR(10) NOT NULL,
  pais VARCHAR(50),
  fuente VARCHAR(50) DEFAULT 'landing',
  fecha_registro TIMESTAMP DEFAULT NOW(),
  convertido BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_landing_leads_email ON landing_leads(email);
CREATE INDEX idx_landing_leads_fecha ON landing_leads(fecha_registro);
```

---

## 🔌 API Endpoint para Landing

### POST `/api/landing/leads`

**Request**:
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "+57 300 1234567",
  "rango_edad": "26-35"
}
```

**Response (Éxito)**:
```json
{
  "success": true,
  "message": "Lead registrado exitosamente",
  "data": {
    "id": "uuid-xxx",
    "email": "juan@example.com",
    "download_url": "https://play.google.com/store/apps/details?id=com.investi.app"
  }
}
```

**Response (Error)**:
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "error": "EMAIL_EXISTS"
}
```

---

## 🛡️ Validaciones

### Frontend
- [x] Nombre: 3-100 caracteres
- [x] Email: Formato válido
- [x] Teléfono: No vacío
- [x] Rango edad: Seleccionado

### Backend
- [x] Email único en tabla `landing_leads`
- [x] Email no debe existir en tabla `users` (si ya se registró)
- [x] Todos los campos requeridos
- [x] Sanitizar inputs (XSS prevention)
- [x] Rate limiting (máximo 5 submits por IP por hora)

---

## 📊 Campos en Base de Datos

### Tabla: `users` (sincronización)

```sql
-- Campos que se sincronizan desde landing
ALTER TABLE users ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rango_edad VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS fuente_registro VARCHAR(50);
```

---

## 🔗 Integración con App

### En SignUp, si el email existe en `landing_leads`:

```typescript
// src/api.ts
export const signUpWithMetadata = async (email: string, password: string, userData?: any) => {
  // ... código existente ...
  
  // Buscar en landing_leads
  const { data: leadData } = await supabase
    .from('landing_leads')
    .select('*')
    .eq('email', email)
    .single()
  
  if (leadData) {
    // Usar datos del lead
    userData = {
      ...userData,
      nombre_completo: leadData.nombre_completo,
      telefono: leadData.telefono,
      rango_edad: leadData.rango_edad,
    }
    
    // Marcar como convertido
    await supabase
      .from('landing_leads')
      .update({ convertido: true, user_id: userId })
      .eq('id', leadData.id)
  }
  
  // ... resto del código ...
}
```

---

## 📈 Métricas a Rastrear

### En Google Analytics (Landing)
- Vistas del formulario
- Submits completados
- Tasa de conversión
- Fuente de tráfico
- Dispositivo (mobile/desktop)

### En Supabase (Backend)
- Total de leads
- Leads convertidos a usuarios
- Tasa de conversión (leads → usuarios)
- Rango de edad más común
- Países más frecuentes

---

## 🎨 Diseño Recomendado

### Estilos
- Formulario limpio y minimalista
- Máximo 4 campos visibles
- Botón CTA grande y destacado
- Colores de marca (Investí)
- Responsive (mobile-first)

### Copy
- Título: "Únete a la Comunidad Investí"
- Subtítulo: "Aprende a invertir con expertos"
- Botón: "Descargar App Gratis"
- Nota: "Solo 30 segundos para registrarte"

---

## ✅ Checklist de Implementación

- [ ] Crear tabla `landing_leads` en Supabase
- [ ] Crear API endpoint `/api/landing/leads`
- [ ] Implementar validaciones frontend
- [ ] Implementar validaciones backend
- [ ] Agregar rate limiting
- [ ] Configurar Google Analytics
- [ ] Diseñar formulario
- [ ] Integrar con SignUp
- [ ] Probar flujo completo
- [ ] Documentar en Notion

---

## 📞 Contacto y Soporte

Para preguntas sobre el formulario:
- Email: support@investi.app
- Chat: Desde la app (IRI)
- Teléfono: +57 300 1234567

---

**Última actualización**: Diciembre 3, 2025
**Estado**: ✅ Listo para implementar
