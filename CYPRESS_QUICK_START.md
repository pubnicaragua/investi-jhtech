# 🚀 Cypress Testing - Quick Start

## ⚡ 5 Minutos para Empezar

### Paso 1: Instalar Cypress
```bash
npm install
```

### Paso 2: Configurar Variables de Entorno
```bash
cp .env.cypress.example .env.cypress
# Editar .env.cypress con tus credenciales de prueba
```

### Paso 3: Iniciar la App
```bash
npm run start:web
# O en otra terminal:
npm run dev
```

### Paso 4: Abrir Cypress
```bash
npm run cypress:open
```

### Paso 5: Ejecutar Tests
- Selecciona un archivo de test (ej: `01-auth.cy.ts`)
- Haz clic en "Run"
- Observa los tests ejecutándose en tiempo real

---

## 📊 Cobertura de Tests

| Módulo | Tests | Estado |
|--------|-------|--------|
| 🔐 Autenticación | 8 | ✅ |
| 📱 Home Feed | 18 | ✅ |
| 🤖 IRI Voice | 22 | ✅ |
| 💬 Mensajería | 25 | ✅ |
| **TOTAL** | **73** | **✅** |

---

## 🎯 Comandos Principales

```bash
# Modo interactivo (recomendado)
npm run cypress:open

# Ejecutar todos los tests
npm run cypress:run

# Ejecutar tests en headless
npm run cypress:run:headless

# Ejecutar tests específicos
npx cypress run --spec "cypress/e2e/01-auth.cy.ts"

# Generar reportes
npm run cypress:report
```

---

## 📁 Estructura de Tests

```
✅ 01-auth.cy.ts
   - Login
   - Signup
   - Password Recovery
   - Logout

✅ 02-home-feed.cy.ts
   - Feed Display
   - Dynamic Counters
   - Post Interactions
   - Post Creation
   - Pagination
   - Search

✅ 03-iri-voice.cy.ts
   - Chat Interface
   - Voice Gender Selection
   - Message Sending
   - Voice Playback
   - Conversation History
   - Error Handling
   - Performance

✅ 04-messaging.cy.ts
   - Chat List
   - Starting Conversations
   - Message Sending
   - Unread Messages
   - Chat Details
   - Message Reactions
   - Message Search
   - Typing Indicator
   - Message Deletion
```

---

## 🔧 Selectores Necesarios

Asegúrate de que tus componentes tengan `data-testid`:

```tsx
// Ejemplo en React Native
<TouchableOpacity data-testid="send-button">
  <Send size={20} />
</TouchableOpacity>

<TextInput data-testid="message-input" />

<View data-testid="notification-badge">
  <Text>{count}</Text>
</View>
```

---

## 📈 Resultados Esperados

Después de ejecutar los tests, deberías ver:

```
✓ 73 tests passed
✓ 0 tests failed
✓ Execution time: ~2-3 minutes
✓ Reports generated in cypress/reports/
✓ Videos saved in cypress/videos/
✓ Screenshots on failures
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Tests no encuentran elementos | Agregar `data-testid` a componentes |
| Tests se quedan esperando | Aumentar timeout en cypress.config.ts |
| Fallos intermitentes | Usar `cy.waitForLoading()` |
| Problemas de sincronización | Usar esperas explícitas, no `cy.wait()` |
| Limpiar estado | `cy.clearLocalStorage()` en beforeEach |

---

## 📊 Ejemplo de Ejecución

```bash
$ npm run cypress:open

> investi-app@1.0.0 cypress:open
> cypress open

Opening Cypress...

✓ Cypress opened successfully
✓ Found 4 test files
✓ Ready to run tests
```

---

## 🎓 Próximos Pasos

1. ✅ Instalar Cypress
2. ✅ Configurar variables de entorno
3. ✅ Ejecutar tests en modo interactivo
4. ✅ Revisar reportes
5. ✅ Integrar con CI/CD (GitHub Actions)

---

## 📚 Recursos

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)

---

## 💡 Tips Profesionales

### 1. Usar Cypress Studio
```bash
npx cypress open --env CYPRESS_INTERNAL_BROWSER_OPEN_PREFERENCE=chrome
```

### 2. Debug en Tiempo Real
```typescript
cy.debug() // Pausa la ejecución
cy.pause() // Pausa antes del siguiente comando
```

### 3. Generar Reportes HTML
```bash
npm run cypress:report
# Abre cypress/reports/report.html en el navegador
```

### 4. Ejecutar en CI/CD
```bash
npm run cypress:run:headless
# Perfecto para GitHub Actions, Jenkins, etc.
```

---

**¡Listo para automatizar! 🎉**

Ejecuta `npm run cypress:open` y comienza a probar.
