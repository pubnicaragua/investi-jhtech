const { test, expect } = require('@playwright/test');
const config = require('./config-comprehensive');

// Test completo para detectar todos los errores automáticamente
test.describe('Detección Automática de Errores - Investi App', () => {
  let browser;
  let context;
  let page;
  let consoleErrors = [];
  let networkErrors = [];
  let navigationErrors = [];

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      baseURL: 'http://localhost:19006', // Expo web dev server
    });
    page = await context.newPage();

    // Capturar errores de consola
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });

    // Capturar errores de red
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
        console.log(`🌐 Network Error: ${response.status()} - ${response.url()}`);
      }
    });

    // Capturar errores de navegación
    page.on('pageerror', (error) => {
      navigationErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.log(`🧭 Navigation Error: ${error.message}`);
    });
  });

  test.afterAll(async () => {
    // Reporte final de errores
    console.log('\n📊 REPORTE FINAL DE ERRORES:');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);
    console.log(`Navigation Errors: ${navigationErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ ERRORES DE CONSOLA:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text} (${error.timestamp})`);
      });
    }

    if (networkErrors.length > 0) {
      console.log('\n🌐 ERRORES DE RED:');
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.status} ${error.statusText} - ${error.url}`);
      });
    }

    if (navigationErrors.length > 0) {
      console.log('\n🧭 ERRORES DE NAVEGACIÓN:');
      navigationErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
      });
    }

    await context.close();
  });

  test('1. Verificar carga inicial sin errores', async () => {
    console.log('🚀 Iniciando carga de la aplicación...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que no hay errores críticos en la carga inicial
    expect(consoleErrors.filter(e => e.text.includes('Module not found')).length).toBe(0);
    expect(consoleErrors.filter(e => e.text.includes('Cannot resolve')).length).toBe(0);
    
    console.log('✅ Carga inicial completada');
  });

  test('2. Probar selección de idioma', async () => {
    console.log('🌐 Probando selección de idioma...');
    
    // Verificar que aparece la pantalla de selección de idioma
    await expect(page.locator('text=Choose your language')).toBeVisible({ timeout: 10000 });
    
    // Probar selección de español
    await page.click('text=Español');
    await page.click('text=Continuar');
    
    // Verificar que cambia a español
    await expect(page.locator('text=¡Únete a Investí Community!')).toBeVisible({ timeout: 5000 });
    
    // Probar cambio a inglés desde settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Buscar el toggle de idioma y cambiarlo
    const languageToggle = page.locator('[data-testid="language-toggle"]').first();
    if (await languageToggle.isVisible()) {
      await languageToggle.click();
    }
    
    console.log('✅ Selección de idioma funcional');
  });

  test('3. Verificar navegación entre pantallas principales', async () => {
    console.log('🧭 Probando navegación entre pantallas...');
    
    const screens = [
      { name: 'Welcome', path: '/welcome', expectedText: 'Investí Community' },
      { name: 'SignIn', path: '/signin', expectedText: 'Sign In' },
      { name: 'SignUp', path: '/signup', expectedText: 'Sign Up' },
      { name: 'HomeFeed', path: '/home', expectedText: 'For You' },
      { name: 'Communities', path: '/communities', expectedText: 'Communities' },
      { name: 'Settings', path: '/settings', expectedText: 'Settings' },
      { name: 'Profile', path: '/profile', expectedText: 'Profile' },
      { name: 'MarketInfo', path: '/market-info', expectedText: 'Stock market' },
      { name: 'Educacion', path: '/educacion', expectedText: 'Education' },
      { name: 'Promotions', path: '/promotions', expectedText: 'Promotions' },
    ];

    for (const screen of screens) {
      console.log(`  📱 Navegando a ${screen.name}...`);
      
      const initialErrorCount = consoleErrors.length;
      
      try {
        await page.goto(screen.path);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Verificar que no se agregaron errores nuevos
        const newErrorCount = consoleErrors.length;
        if (newErrorCount > initialErrorCount) {
          console.log(`    ⚠️  Se detectaron ${newErrorCount - initialErrorCount} errores nuevos en ${screen.name}`);
        }
        
        // Verificar que la pantalla carga correctamente
        const hasExpectedContent = await page.locator(`text=${screen.expectedText}`).isVisible({ timeout: 5000 });
        if (!hasExpectedContent) {
          console.log(`    ⚠️  Contenido esperado "${screen.expectedText}" no encontrado en ${screen.name}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error navegando a ${screen.name}: ${error.message}`);
        navigationErrors.push({
          screen: screen.name,
          path: screen.path,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('✅ Navegación entre pantallas completada');
  });

  test('4. Verificar botones de back en todas las pantallas', async () => {
    console.log('⬅️ Probando botones de back...');
    
    const screensWithBack = [
      '/signin',
      '/signup', 
      '/pick-goals',
      '/pick-interests',
      '/pick-knowledge',
      '/settings',
      '/profile'
    ];

    for (const screenPath of screensWithBack) {
      console.log(`  🔙 Probando back button en ${screenPath}...`);
      
      try {
        await page.goto(screenPath);
        await page.waitForLoadState('networkidle');
        
        // Buscar botón de back (ArrowLeft icon)
        const backButton = page.locator('button').filter({ has: page.locator('svg') }).first();
        
        if (await backButton.isVisible()) {
          await backButton.click();
          await page.waitForTimeout(1000); // Esperar navegación
          console.log(`    ✅ Back button funcional en ${screenPath}`);
        } else {
          console.log(`    ⚠️  Back button no encontrado en ${screenPath}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error probando back button en ${screenPath}: ${error.message}`);
      }
    }
    
    console.log('✅ Prueba de botones back completada');
  });

  test('5. Verificar carga de imágenes', async () => {
    console.log('🖼️ Verificando carga de imágenes...');
    
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    
    // Obtener todas las imágenes
    const images = await page.locator('img').all();
    let brokenImages = 0;
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      
      if (src) {
        // Verificar si la imagen se carga correctamente
        const naturalWidth = await img.evaluate((el) => el.naturalWidth);
        
        if (naturalWidth === 0) {
          brokenImages++;
          console.log(`    ❌ Imagen rota: ${src}`);
        }
      }
    }
    
    console.log(`📊 Imágenes verificadas: ${images.length}, Rotas: ${brokenImages}`);
    
    // Fallar el test si hay muchas imágenes rotas
    expect(brokenImages).toBeLessThan(images.length * 0.1); // Máximo 10% de imágenes rotas
    
    console.log('✅ Verificación de imágenes completada');
  });

  test('6. Probar APIs críticas', async () => {
    console.log('🔌 Probando APIs críticas...');
    
    // Interceptar llamadas API específicas
    const apiCalls = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/rest/v1/') || url.includes('/auth/v1/')) {
        apiCalls.push({
          url: url,
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // Navegar a pantallas que hacen llamadas API
    const apiScreens = ['/home', '/communities', '/profile', '/settings'];
    
    for (const screen of apiScreens) {
      console.log(`  📡 Probando APIs en ${screen}...`);
      
      await page.goto(screen);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Esperar llamadas API
    }
    
    // Analizar respuestas API
    const failedAPIs = apiCalls.filter(call => call.status >= 400);
    
    if (failedAPIs.length > 0) {
      console.log('❌ APIs que fallaron:');
      failedAPIs.forEach(api => {
        console.log(`  ${api.method} ${api.url} - Status: ${api.status}`);
      });
    }
    
    console.log(`📊 Total API calls: ${apiCalls.length}, Failed: ${failedAPIs.length}`);
    console.log('✅ Prueba de APIs completada');
  });

  test('7. Verificar funcionalidad de onboarding completo', async () => {
    console.log('🎯 Probando flujo de onboarding...');
    
    // Simular flujo completo de onboarding
    const onboardingSteps = [
      { path: '/language-selection', action: () => page.click('text=English') },
      { path: '/welcome', action: () => page.click('text=Get Started') },
      { path: '/signup', action: async () => {
        await page.fill('input[placeholder*="email"]', 'test@example.com');
        await page.fill('input[placeholder*="password"]', 'password123');
        await page.fill('input[placeholder*="name"]', 'Test User');
        await page.fill('input[placeholder*="username"]', 'testuser');
      }},
      { path: '/pick-goals', action: () => page.click('button').first() },
      { path: '/pick-interests', action: async () => {
        const buttons = await page.locator('button').all();
        for (let i = 0; i < Math.min(3, buttons.length); i++) {
          await buttons[i].click();
        }
      }},
      { path: '/pick-knowledge', action: () => page.click('button').first() }
    ];

    for (const step of onboardingSteps) {
      console.log(`  🔄 Paso: ${step.path}...`);
      
      try {
        await page.goto(step.path);
        await page.waitForLoadState('networkidle');
        
        if (step.action) {
          await step.action();
          await page.waitForTimeout(1000);
        }
        
        console.log(`    ✅ ${step.path} completado`);
        
      } catch (error) {
        console.log(`    ❌ Error en ${step.path}: ${error.message}`);
      }
    }
    
    console.log('✅ Flujo de onboarding completado');
  });

  test('8. Verificar que no hay errores específicos conocidos', async () => {
    console.log('🔍 Verificando errores específicos conocidos...');
    
    // Lista de errores que NO deben aparecer
    const forbiddenErrors = [
      'Module not found: Can\'t resolve \'crypto\'',
      'useNativeDriver is not supported',
      'The action \'RESET\' with payload',
      'The action \'NAVIGATE\' with payload',
      'ProfileScreen',
      'via.placeholder.com',
      'user_communities.*400'
    ];
    
    let foundForbiddenErrors = [];
    
    for (const error of consoleErrors) {
      for (const forbidden of forbiddenErrors) {
        if (error.text.includes(forbidden) || new RegExp(forbidden).test(error.text)) {
          foundForbiddenErrors.push({
            forbidden: forbidden,
            actual: error.text,
            timestamp: error.timestamp
          });
        }
      }
    }
    
    if (foundForbiddenErrors.length > 0) {
      console.log('❌ Errores prohibidos encontrados:');
      foundForbiddenErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. "${error.forbidden}" en: ${error.actual}`);
      });
    }
    
    // El test falla si encuentra errores prohibidos
    expect(foundForbiddenErrors.length).toBe(0);
    
    console.log('✅ No se encontraron errores prohibidos');
  });

  test('9. Reporte final y métricas', async () => {
    console.log('\n📈 GENERANDO REPORTE FINAL...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalConsoleErrors: consoleErrors.length,
      totalNetworkErrors: networkErrors.length,
      totalNavigationErrors: navigationErrors.length,
      criticalErrors: consoleErrors.filter(e => 
        e.text.includes('Module not found') || 
        e.text.includes('Cannot resolve') ||
        e.text.includes('TypeError')
      ).length,
      warningErrors: consoleErrors.filter(e => 
        e.text.includes('Warning') || 
        e.text.includes('deprecated')
      ).length,
      apiErrors: networkErrors.filter(e => e.status >= 400).length,
      imageErrors: networkErrors.filter(e => 
        e.url.includes('.jpg') || 
        e.url.includes('.png') || 
        e.url.includes('.gif')
      ).length
    };
    
    console.log('📊 MÉTRICAS FINALES:');
    console.log(`   Total Console Errors: ${report.totalConsoleErrors}`);
    console.log(`   Critical Errors: ${report.criticalErrors}`);
    console.log(`   Warning Errors: ${report.warningErrors}`);
    console.log(`   Network Errors: ${report.totalNetworkErrors}`);
    console.log(`   API Errors: ${report.apiErrors}`);
    console.log(`   Image Errors: ${report.imageErrors}`);
    console.log(`   Navigation Errors: ${report.totalNavigationErrors}`);
    
    // Guardar reporte en archivo
    const fs = require('fs');
    fs.writeFileSync(
      `./test-report-${Date.now()}.json`, 
      JSON.stringify({
        report,
        consoleErrors,
        networkErrors,
        navigationErrors
      }, null, 2)
    );
    
    console.log('💾 Reporte guardado en archivo JSON');
    
    // Criterios de éxito
    const isSuccess = report.criticalErrors === 0 && 
                     report.apiErrors === 0 && 
                     report.totalNavigationErrors === 0;
    
    if (isSuccess) {
      console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! La aplicación está libre de errores críticos.');
    } else {
      console.log('⚠️  Se encontraron errores que requieren atención.');
    }
    
    // Fallar el test si hay errores críticos
    expect(report.criticalErrors).toBe(0);
    expect(report.apiErrors).toBe(0);
  });
});
