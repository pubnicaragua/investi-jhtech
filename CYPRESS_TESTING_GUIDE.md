# Cypress Automation Testing Guide - Investí App

## 📋 Tabla de Contenidos
1. [Instalación](#instalación)
2. [Configuración](#configuración)
3. [Estructura de Tests](#estructura-de-tests)
4. [Ejecución de Tests](#ejecución-de-tests)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Instalación

### Paso 1: Instalar Cypress
```bash
npm install
```

### Paso 2: Verificar instalación
```bash
npx cypress --version
```

---

## ⚙️ Configuración

### Variables de Entorno
Crear archivo `.env.cypress` en la raíz del proyecto:

```env
# Credenciales de prueba
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123

# URLs
CYPRESS_BASE_URL=http://localhost:8081

# Timeouts (ms)
CYPRESS_DEFAULT_COMMAND_TIMEOUT=10000
CYPRESS_REQUEST_TIMEOUT=10000
CYPRESS_RESPONSE_TIMEOUT=10000
```

### Archivo de Configuración
El archivo `cypress.config.ts` ya está configurado con:
- Viewport móvil (375x812)
- Timeouts apropiados
- Reportes en HTML y JSON
- Capturas de pantalla en fallos
- Videos de ejecución

---

## 📁 Estructura de Tests

```
cypress/
├── e2e/
│   ├── 01-auth.cy.ts              # Tests de autenticación
│   ├── 02-home-feed.cy.ts         # Tests del feed principal
│   ├── 03-iri-voice.cy.ts         # Tests de IRI Voice AI
│   └── 04-messaging.cy.ts         # Tests de mensajería
├── support/
│   ├── e2e.ts                     # Configuración global
│   ├── commands.ts                # Comandos personalizados
│   └── component.ts               # Soporte de componentes
├── fixtures/                      # Datos de prueba
└── reports/                       # Reportes generados
```

### Convención de Nombres
- `01-` Tests de autenticación
- `02-` Tests de funcionalidades principales
- `03-` Tests de características avanzadas
- `04-` Tests de integraciones

---

## 🧪 Ejecución de Tests

### Modo Interactivo (Recomendado para desarrollo)
```bash
npm run cypress:open
```

Esto abre la interfaz gráfica de Cypress donde puedes:
- Ver todos los tests disponibles
- Ejecutar tests individuales
- Ver el navegador en tiempo real
- Debuggear con DevTools

### Modo Headless (CI/CD)
```bash
npm run cypress:run
```

Ejecuta todos los tests sin interfaz gráfica.

### Ejecutar Tests Específicos
```bash
# Solo tests de autenticación
npx cypress run --spec "cypress/e2e/01-auth.cy.ts"

# Solo tests de IRI Voice
npx cypress run --spec "cypress/e2e/03-iri-voice.cy.ts"

# Múltiples archivos
npx cypress run --spec "cypress/e2e/01-auth.cy.ts,cypress/e2e/02-home-feed.cy.ts"
```

### Ejecutar con Navegador Específico
```bash
# Chrome
npx cypress run --browser chrome

# Firefox
npx cypress run --browser firefox

# Edge
npx cypress run --browser edge
```

### Generar Reportes
```bash
npm run cypress:report
```

Genera reportes en `cypress/reports/` en formato HTML y JSON.

---

## 📊 Comandos Personalizados

### Autenticación
```typescript
cy.login(email, password)
cy.logout()
```

### Navegación
```typescript
cy.navigateTo(screenName)
```

### Esperas
```typescript
cy.waitForLoading()
```

### Notificaciones
```typescript
cy.checkNotificationBadge(count)
cy.checkMessageBadge(count)
```

### Posts
```typescript
cy.createPost(content)
cy.likePost(postIndex)
cy.commentOnPost(postIndex, comment)
```

### Mensajes
```typescript
cy.sendMessage(recipientName, message)
```

### Búsqueda
```typescript
cy.searchUsers(query)
cy.followUser(userName)
```

### IRI Voice
```typescript
cy.checkIRIVoiceResponse()
cy.changeVoiceGender(gender) // 'M' o 'F'
```

---

## ✅ Mejores Prácticas

### 1. Selectores
Usar `data-testid` en lugar de clases o IDs:
```typescript
// ✅ Bueno
cy.get('[data-testid="send-button"]').click()

// ❌ Evitar
cy.get('.btn-primary').click()
cy.get('#sendBtn').click()
```

### 2. Esperas Explícitas
```typescript
// ✅ Bueno
cy.get('[data-testid="loading"]').should('not.exist')

// ❌ Evitar
cy.wait(5000)
```

### 3. Organización de Tests
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup común
  })

  describe('Subfunción 1', () => {
    it('Should do something', () => {
      // Test
    })
  })
})
```

### 4. Assertions Claras
```typescript
// ✅ Claro
cy.get('[data-testid="message"]').should('contain', 'Hola')

// ❌ Vago
cy.get('[data-testid="message"]').should('exist')
```

### 5. Manejo de Errores
```typescript
cy.on('uncaught:exception', (err, runnable) => {
  // Manejar excepciones esperadas
  return false
})
```

---

## 🔍 Selectores Recomendados

Asegúrate de que los componentes tengan `data-testid`:

```typescript
// Autenticación
[data-testid="email-input"]
[data-testid="password-input"]
[data-testid="login-button"]

// Feed
[data-testid="home-feed"]
[data-testid="post-item"]
[data-testid="like-button"]
[data-testid="notification-badge"]
[data-testid="message-badge"]

// IRI Voice
[data-testid="iri-chat-screen"]
[data-testid="iri-input"]
[data-testid="send-button"]
[data-testid="voice-gender-button"]
[data-testid="iri-message"]

// Mensajes
[data-testid="chat-list"]
[data-testid="chat-item"]
[data-testid="message-input"]
[data-testid="send-message-button"]
```

---

## 📈 Cobertura de Tests

### Autenticación (01-auth.cy.ts)
- ✅ Login con credenciales válidas
- ✅ Login con credenciales inválidas
- ✅ Signup y validaciones
- ✅ Recuperación de contraseña
- ✅ Logout

### Home Feed (02-home-feed.cy.ts)
- ✅ Visualización del feed
- ✅ Contadores dinámicos (notificaciones y mensajes)
- ✅ Interacciones con posts (like, save, comment)
- ✅ Creación de posts
- ✅ Paginación
- ✅ Búsqueda

### IRI Voice (03-iri-voice.cy.ts)
- ✅ Interfaz de chat
- ✅ Selección de género de voz
- ✅ Envío de mensajes
- ✅ Reproducción de voz
- ✅ Historial de conversaciones
- ✅ Manejo de errores
- ✅ Performance

### Mensajería (04-messaging.cy.ts)
- ✅ Lista de chats
- ✅ Inicio de conversaciones
- ✅ Envío de mensajes
- ✅ Mensajes no leídos
- ✅ Detalles de chat
- ✅ Reacciones a mensajes
- ✅ Búsqueda de mensajes
- ✅ Indicador de escritura

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'cypress'"
```bash
npm install cypress --save-dev
```

### Tests se quedan esperando
```typescript
// Aumentar timeout
cy.get('[data-testid="element"]', { timeout: 15000 })
```

### Fallos intermitentes
```typescript
// Usar retry
cy.get('[data-testid="element"]').should('exist').then(() => {
  // Continuar
})
```

### Problemas de sincronización
```typescript
// Esperar a que la aplicación esté lista
cy.visit('/')
cy.get('[data-testid="app-ready"]').should('exist')
```

### Limpiar estado entre tests
```typescript
beforeEach(() => {
  cy.clearLocalStorage()
  cy.clearCookies()
})
```

---

## 📊 Integración con CI/CD

### GitHub Actions
```yaml
name: Cypress Tests
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run cypress:run
      - uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: cypress-reports
          path: cypress/reports/
```

---

## 📝 Ejemplo de Test Completo

```typescript
describe('User Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Should login successfully', () => {
    // Arrange
    const email = 'test@example.com'
    const password = 'password123'

    // Act
    cy.get('[data-testid="email-input"]').type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()

    // Assert
    cy.url().should('include', '/home')
    cy.get('[data-testid="home-feed"]').should('be.visible')
  })
})
```

---

## 🎯 Próximos Pasos

1. Ejecutar `npm install` para instalar Cypress
2. Configurar `.env.cypress` con credenciales de prueba
3. Ejecutar `npm run cypress:open` para ver los tests
4. Agregar `data-testid` a los componentes React Native
5. Ejecutar tests regularmente en CI/CD

---

## 📞 Soporte

Para más información:
- [Documentación oficial de Cypress](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)

---

**Última actualización:** Noviembre 2025
**Versión de Cypress:** 13.6.6
