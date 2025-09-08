# Pruebas E2E para Investi App

Este directorio contiene pruebas de extremo a extremo (E2E) para la aplicación Investi. Las pruebas utilizan Playwright para automatizar la interacción con la aplicación y verificar su funcionalidad.

## Requisitos previos

- Node.js 16 o superior
- npm o yarn
- Navegadores compatibles con Playwright (Chrome, Firefox, WebKit)

## Configuración

1. Instalar las dependencias de desarrollo:

```bash
npm install --save-dev @playwright/test playwright
```

2. Instalar los navegadores necesarios para las pruebas:

```bash
npx playwright install
```

## Configuración del entorno

Crea un archivo `.env` en el directorio raíz del proyecto con las siguientes variables de entorno:

```
APP_URL=http://localhost:19006
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_api_key_de_supabase
```

## Ejecutando las pruebas

Para ejecutar todas las pruebas en modo headless (sin interfaz gráfica):

```bash
npx playwright test
```

Para ejecutar las pruebas con la interfaz de usuario de Playwright:

```bash
npx playwright test --ui
```

Para ejecutar pruebas específicas:

```bash
npx playwright test tests/e2e/test-runner.js
```

Para ejecutar las pruebas en modo depuración (con el navegador visible):

```bash
npx playwright test --headed
```

## Estructura de pruebas

- `config.js`: Configuración centralizada para las pruebas
- `test-runner.js`: Script principal de pruebas E2E
- `fixtures/`: Datos de prueba y utilidades (si es necesario)
- `reports/`: Informes de pruebas (se genera automáticamente)

## Cobertura de pruebas

Las pruebas cubren los siguientes flujos de usuario:

1. Registro de nuevo usuario
2. Proceso de onboarding
3. Navegación principal
4. Creación y gestión de publicaciones
5. Interacción con publicaciones (likes, comentarios)
6. Exploración de comunidades
7. Gestión de perfil de usuario
8. Configuración de cuenta
9. Inicio y cierre de sesión

## Generación de informes

Después de ejecutar las pruebas, se genera un informe HTML en la carpeta `playwright-report/`. Para verlo:

```bash
npx playwright show-report
```

## Solución de problemas

- Si las pruebas fallan, verifica que la aplicación esté en ejecución en la URL especificada en la configuración.
- Asegúrate de que todas las variables de entorno estén configuradas correctamente.
- Para depuración, usa el modo `--debug`:

```bash
npx playwright test --debug
```

## Notas adicionales

- Las pruebas están diseñadas para ejecutarse en un entorno de desarrollo local.
- Para entornos de prueba o producción, ajusta las URLs y credenciales según sea necesario.
- Las pruebas limpian automáticamente los datos de prueba después de ejecutarse.
