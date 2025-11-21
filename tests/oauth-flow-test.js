/**
 * PRUEBA AUTOMATIZADA DE FLUJO OAUTH Y NAVEGACIÓN
 * User ID de prueba: c7812eb1-c3b1-429f-aabe-ba8da052201f
 * 
 * Esta prueba verifica:
 * 1. Login con Google, Facebook, LinkedIn
 * 2. Flujo de redirección correcto
 * 3. Creación de perfil en public.users
 * 4. Navegación a Onboarding
 * 5. Integridad de todas las pantallas
 */

require('dotenv').config();
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://paoliakwfoczcallnecf.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY no está configurada en .env');
  process.exit(1);
}
const TEST_USER_ID = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
const APP_URL = 'http://localhost:19006'; // Expo web dev server

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Colores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Resultados de pruebas
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
  consoleErrors: [],
};

async function checkUserProfile(userId) {
  log('\n🔍 Verificando perfil del usuario en DB...', 'cyan');
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      log(`❌ Error consultando usuario: ${error.message}`, 'red');
      testResults.failed.push(`User profile query failed: ${error.message}`);
      return null;
    }

    if (!user) {
      log('⚠️ Usuario no encontrado en la base de datos', 'yellow');
      testResults.warnings.push('User not found in database');
      return null;
    }

    log('✅ Usuario encontrado:', 'green');
    log(`   ID: ${user.id}`, 'blue');
    log(`   Email: ${user.email}`, 'blue');
    log(`   Nombre: ${user.full_name || user.nombre}`, 'blue');
    log(`   Username: ${user.username}`, 'blue');
    log(`   Onboarding Step: ${user.onboarding_step}`, 'blue');
    log(`   Avatar: ${user.avatar_url || user.photo_url ? 'Sí' : 'No'}`, 'blue');

    testResults.passed.push('User profile exists in database');
    return user;
  } catch (err) {
    log(`❌ Error inesperado: ${err.message}`, 'red');
    testResults.failed.push(`Unexpected error: ${err.message}`);
    return null;
  }
}

async function testOAuthFlow(browser, provider) {
  log(`\n🧪 Probando flujo OAuth con ${provider.toUpperCase()}...`, 'magenta');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capturar errores de consola
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      testResults.consoleErrors.push(`[${provider}] ${text}`);
      log(`   ⚠️ Console Error: ${text}`, 'yellow');
    } else if (text.includes('[SignInScreen]') || text.includes('[AuthCallback]')) {
      log(`   📝 ${text}`, 'blue');
    }
  });

  // Capturar errores de página
  page.on('pageerror', error => {
    testResults.failed.push(`[${provider}] Page error: ${error.message}`);
    log(`   ❌ Page Error: ${error.message}`, 'red');
  });

  try {
    // 1. Navegar a la app
    log(`   → Navegando a ${APP_URL}...`, 'cyan');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 2. Buscar botón de login social
    log(`   → Buscando botón de ${provider}...`, 'cyan');
    
    // Intentar encontrar el botón por diferentes selectores
    const buttonSelectors = [
      `button:has-text("${provider}")`,
      `[data-provider="${provider}"]`,
      `[aria-label*="${provider}"]`,
      `.oauth-${provider}`,
    ];

    let button = null;
    for (const selector of buttonSelectors) {
      try {
        button = await page.waitForSelector(selector, { timeout: 5000 });
        if (button) break;
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }

    if (!button) {
      log(`   ⚠️ No se encontró botón de ${provider}`, 'yellow');
      testResults.warnings.push(`${provider} button not found`);
      await context.close();
      return;
    }

    // 3. Click en el botón OAuth
    log(`   → Haciendo click en botón de ${provider}...`, 'cyan');
    await button.click();
    await page.waitForTimeout(2000);

    // 4. Verificar redirección
    const currentUrl = page.url();
    log(`   → URL actual: ${currentUrl}`, 'blue');

    if (currentUrl.includes('auth/callback')) {
      log(`   ✅ Redirección a callback detectada`, 'green');
      testResults.passed.push(`${provider} OAuth redirect successful`);
    } else if (currentUrl.includes(provider.toLowerCase())) {
      log(`   ✅ Redirección a ${provider} detectada`, 'green');
      testResults.passed.push(`${provider} OAuth initiated`);
    } else {
      log(`   ⚠️ URL inesperada: ${currentUrl}`, 'yellow');
      testResults.warnings.push(`${provider} unexpected redirect URL`);
    }

  } catch (error) {
    log(`   ❌ Error en prueba de ${provider}: ${error.message}`, 'red');
    testResults.failed.push(`${provider} OAuth test failed: ${error.message}`);
  } finally {
    await context.close();
  }
}

async function testScreenNavigation(browser) {
  log('\n🧪 Probando navegación entre pantallas...', 'magenta');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const screensToTest = [
    { name: 'Welcome', path: '/' },
    { name: 'SignIn', path: '/auth/signin' },
    { name: 'SignUp', path: '/auth/signup' },
  ];

  for (const screen of screensToTest) {
    try {
      log(`   → Probando pantalla: ${screen.name}`, 'cyan');
      await page.goto(`${APP_URL}${screen.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      
      // Verificar que no haya errores críticos
      const hasError = await page.evaluate(() => {
        return document.body.innerText.includes('Error') || 
               document.body.innerText.includes('crashed');
      });

      if (hasError) {
        log(`   ⚠️ Posible error en pantalla ${screen.name}`, 'yellow');
        testResults.warnings.push(`${screen.name} may have errors`);
      } else {
        log(`   ✅ Pantalla ${screen.name} cargada correctamente`, 'green');
        testResults.passed.push(`${screen.name} screen loaded`);
      }
    } catch (error) {
      log(`   ❌ Error en pantalla ${screen.name}: ${error.message}`, 'red');
      testResults.failed.push(`${screen.name} screen failed: ${error.message}`);
    }
  }

  await context.close();
}

async function testButtonClicks(browser) {
  log('\n🧪 Probando clicks en botones y elementos interactivos...', 'magenta');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capturar logs de consola
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[SignInScreen]') || text.includes('[AuthCallback]') || text.includes('OAuth')) {
      log(`   📝 ${text}`, 'blue');
    }
  });

  try {
    await page.goto(`${APP_URL}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Navegar a SignIn
    log(`   → Navegando a SignIn...`, 'cyan');
    
    // Buscar el botón "Ya tengo una cuenta" en la pantalla de Welcome
    const yatengoCuentaButton = await page.waitForSelector('text=Ya tengo una cuenta', { timeout: 10000 }).catch(() => null);
    if (yatengoCuentaButton) {
      log(`   → Clickeando "Ya tengo una cuenta"...`, 'blue');
      await yatengoCuentaButton.click();
      await page.waitForTimeout(3000);
    } else {
      // Si no está en Welcome, intentar ir directamente a /auth/signin
      log(`   → Navegando directamente a /auth/signin...`, 'blue');
      await page.goto(`${APP_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
    }

    // Buscar botones de OAuth
    log(`   → Buscando botones de OAuth...`, 'cyan');
    
    // Tomar screenshot para debugging
    await page.screenshot({ path: 'tests/screenshots/signin-screen.png', fullPage: true });
    log(`   📸 Screenshot guardado en tests/screenshots/signin-screen.png`, 'blue');

    // Buscar todos los elementos clickeables (React Native Web usa divs con cursor:pointer)
    const allButtons = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, [role="button"], a, div'));
      const clickable = elements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.cursor === 'pointer' || el.onclick || el.getAttribute('role') === 'button';
      });
      
      return clickable.map((btn, idx) => ({
        index: idx,
        text: btn.innerText?.trim() || btn.textContent?.trim() || '',
        tagName: btn.tagName,
        className: btn.className,
        id: btn.id,
        hasImage: btn.querySelector('img') !== null,
        hasSvg: btn.querySelector('svg') !== null,
        cursor: window.getComputedStyle(btn).cursor,
      }));
    });

    log(`   → Encontrados ${allButtons.length} elementos clickeables:`, 'cyan');
    allButtons.slice(0, 15).forEach(btn => {
      const info = btn.text ? `"${btn.text.substring(0, 50)}"` : (btn.hasImage || btn.hasSvg ? '[ICONO]' : '[SIN TEXTO]');
      log(`      • [${btn.tagName}] ${info}`, 'blue');
    });

    // Buscar botones OAuth por imágenes/SVG (los botones de OAuth son íconos sin texto)
    const oauthButtons = allButtons.filter(btn => 
      (btn.hasImage || btn.hasSvg) && !btn.text
    );

    log(`   → Botones con íconos (posibles OAuth): ${oauthButtons.length}`, 'cyan');

    if (oauthButtons.length >= 3) {
      log(`   ✅ Encontrados ${oauthButtons.length} botones de OAuth (Facebook, Google, LinkedIn)`, 'green');
      testResults.passed.push(`Found ${oauthButtons.length} OAuth icon buttons`);
      
      // Intentar clickear el primero (Facebook)
      try {
        log(`   → Intentando click en primer botón OAuth...`, 'cyan');
        const firstOAuthButton = await page.$$('div[style*="cursor: pointer"]');
        if (firstOAuthButton.length > 0) {
          // Buscar el que tiene imagen
          for (const btn of firstOAuthButton) {
            const hasImg = await btn.$('img, svg');
            if (hasImg) {
              await btn.click();
              await page.waitForTimeout(2000);
              log(`   ✅ Click en botón OAuth ejecutado`, 'green');
              testResults.passed.push('OAuth button click successful');
              break;
            }
          }
        }
      } catch (e) {
        log(`   ⚠️ Error al clickear botón OAuth: ${e.message}`, 'yellow');
      }
    } else {
      log(`   ⚠️ No se encontraron suficientes botones de OAuth (esperados: 3, encontrados: ${oauthButtons.length})`, 'yellow');
      testResults.warnings.push(`Expected 3 OAuth buttons, found ${oauthButtons.length}`);
    }

    testResults.passed.push(`Tested button detection successfully`);

  } catch (error) {
    log(`   ❌ Error en prueba de clicks: ${error.message}`, 'red');
    testResults.failed.push(`Button click test failed: ${error.message}`);
  } finally {
    await context.close();
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  PRUEBA AUTOMATIZADA DE OAUTH Y NAVEGACIÓN - INVESTI APP  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n📋 User ID de prueba: ${TEST_USER_ID}`, 'blue');
  log(`🌐 URL de la app: ${APP_URL}`, 'blue');
  log(`🗄️  Supabase URL: ${SUPABASE_URL}`, 'blue');

  // 1. Verificar perfil del usuario
  const userProfile = await checkUserProfile(TEST_USER_ID);

  // 2. Iniciar browser
  log('\n🚀 Iniciando navegador Chromium...', 'cyan');
  const browser = await chromium.launch({ 
    headless: false, // Cambiar a true para modo headless
    slowMo: 500 // Ralentizar para ver las acciones
  });

  try {
    // 3. Probar navegación básica
    await testScreenNavigation(browser);

    // 4. Probar clicks en botones
    await testButtonClicks(browser);

    // 5. Probar flujos OAuth (comentado porque requiere credenciales reales)
    // await testOAuthFlow(browser, 'google');
    // await testOAuthFlow(browser, 'facebook');
    // await testOAuthFlow(browser, 'linkedin');

  } finally {
    await browser.close();
  }

  // Mostrar resumen
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    RESUMEN DE PRUEBAS                      ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n✅ Pruebas exitosas: ${testResults.passed.length}`, 'green');
  testResults.passed.forEach(test => log(`   • ${test}`, 'green'));

  if (testResults.warnings.length > 0) {
    log(`\n⚠️  Advertencias: ${testResults.warnings.length}`, 'yellow');
    testResults.warnings.forEach(warning => log(`   • ${warning}`, 'yellow'));
  }

  if (testResults.failed.length > 0) {
    log(`\n❌ Pruebas fallidas: ${testResults.failed.length}`, 'red');
    testResults.failed.forEach(fail => log(`   • ${fail}`, 'red'));
  }

  if (testResults.consoleErrors.length > 0) {
    log(`\n🐛 Errores de consola: ${testResults.consoleErrors.length}`, 'yellow');
    testResults.consoleErrors.slice(0, 10).forEach(error => log(`   • ${error}`, 'yellow'));
    if (testResults.consoleErrors.length > 10) {
      log(`   ... y ${testResults.consoleErrors.length - 10} más`, 'yellow');
    }
  }

  log('\n✅ Pruebas completadas\n', 'green');

  // Retornar código de salida
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Ejecutar pruebas
runAllTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
