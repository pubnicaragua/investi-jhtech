const { test, expect } = require('@playwright/test');

// Test completo para detectar todos los errores automáticamente
test.describe('Detección Automática de Errores - Investi App', () => {
  let consoleErrors = [];
  let networkErrors = [];
  let navigationErrors = [];

  test.beforeEach(async ({ page }) => {
    // Limpiar arrays de errores para cada test
    consoleErrors = [];
    networkErrors = [];
    navigationErrors = [];

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

  test('1. Verificar carga inicial sin errores', async ({ page }) => {
    console.log('🚀 Iniciando carga de la aplicación...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Verificar que no hay errores críticos en la carga inicial
    const criticalErrors = consoleErrors.filter(e => 
      e.text.includes('Module not found') || 
      e.text.includes('Cannot resolve')
    );
    
    if (criticalErrors.length > 0) {
      console.log('❌ Errores críticos encontrados:');
      criticalErrors.forEach(error => console.log(`  - ${error.text}`));
    }
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Carga inicial completada sin errores críticos');
  });

  test('2. Probar selección de idioma', async ({ page }) => {
    console.log('🌐 Probando selección de idioma...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que aparece la pantalla de selección de idioma o contenido en inglés/español
    const hasLanguageSelection = await page.locator('text=Choose your language').isVisible({ timeout: 5000 }).catch(() => false);
    const hasSpanishContent = await page.locator('text=Español').isVisible({ timeout: 5000 }).catch(() => false);
    const hasEnglishContent = await page.locator('text=English').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasLanguageSelection || hasSpanishContent || hasEnglishContent) {
      console.log('✅ Sistema de idiomas detectado');
    } else {
      console.log('⚠️ No se detectó sistema de selección de idioma');
    }
    
    // Verificar que no hay errores relacionados con idiomas
    const languageErrors = consoleErrors.filter(e => 
      e.text.includes('i18n') || 
      e.text.includes('translation') ||
      e.text.includes('locale')
    );
    
    expect(languageErrors.length).toBe(0);
    console.log('✅ No hay errores de sistema de idiomas');
  });

  test('3. Verificar navegación entre pantallas principales', async ({ page }) => {
    console.log('🧭 Probando navegación entre pantallas...');
    
    const screens = [
      { path: '/welcome', name: 'Welcome' },
      { path: '/signin', name: 'SignIn' },
      { path: '/signup', name: 'SignUp' },
      { path: '/home', name: 'HomeFeed' },
      { path: '/communities', name: 'Communities' },
      { path: '/settings', name: 'Settings' },
      { path: '/profile', name: 'Profile' },
      { path: '/market-info', name: 'MarketInfo' },
      { path: '/educacion', name: 'Educacion' },
      { path: '/promotions', name: 'Promotions' },
    ];

    let navigationSuccessCount = 0;
    let navigationFailCount = 0;

    for (const screen of screens) {
      console.log(`  📱 Navegando a ${screen.name}...`);
      
      const initialErrorCount = consoleErrors.length;
      
      try {
        await page.goto(screen.path);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Verificar que no se agregaron errores nuevos
        const newErrorCount = consoleErrors.length;
        if (newErrorCount > initialErrorCount) {
          console.log(`    ⚠️ Se detectaron ${newErrorCount - initialErrorCount} errores nuevos en ${screen.name}`);
          navigationFailCount++;
        } else {
          navigationSuccessCount++;
        }
        
      } catch (error) {
        console.log(`    ❌ Error navegando a ${screen.name}: ${error.message}`);
        navigationFailCount++;
      }
    }
    
    console.log(`📊 Navegación: ${navigationSuccessCount} exitosas, ${navigationFailCount} fallidas`);
    
    // Verificar que no hay errores específicos de navegación
    const navErrors = consoleErrors.filter(e => 
      e.text.includes('RESET') || 
      e.text.includes('NAVIGATE') ||
      e.text.includes('ProfileScreen')
    );
    
    expect(navErrors.length).toBe(0);
    console.log('✅ Navegación entre pantallas completada');
  });

  test('4. Verificar botones de back', async ({ page }) => {
    console.log('⬅️ Probando botones de back...');
    
    const screensWithBack = [
      '/signin',
      '/signup', 
      '/pick-goals',
      '/pick-interests',
      '/pick-knowledge',
      '/settings'
    ];

    let backButtonsFound = 0;

    for (const screenPath of screensWithBack) {
      console.log(`  🔙 Probando back button en ${screenPath}...`);
      
      try {
        await page.goto(screenPath);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Buscar botón de back (ArrowLeft icon o botón con texto back)
        const hasBackButton = await page.locator('button').filter({ 
          has: page.locator('svg') 
        }).first().isVisible({ timeout: 3000 }).catch(() => false);
        
        const hasBackText = await page.locator('button:has-text("Back")').isVisible({ timeout: 1000 }).catch(() => false);
        
        if (hasBackButton || hasBackText) {
          backButtonsFound++;
          console.log(`    ✅ Back button encontrado en ${screenPath}`);
        } else {
          console.log(`    ⚠️ Back button no encontrado en ${screenPath}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error probando back button en ${screenPath}: ${error.message}`);
      }
    }
    
    console.log(`📊 Back buttons encontrados: ${backButtonsFound}/${screensWithBack.length}`);
    console.log('✅ Prueba de botones back completada');
  });

  test('5. Verificar carga de imágenes', async ({ page }) => {
    console.log('🖼️ Verificando carga de imágenes...');
    
    await page.goto('/home');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Obtener todas las imágenes
    const images = await page.locator('img').all();
    let brokenImages = 0;
    let totalImages = images.length;
    
    console.log(`📊 Total de imágenes encontradas: ${totalImages}`);
    
    for (let i = 0; i < Math.min(images.length, 10); i++) { // Limitar a 10 imágenes para no tomar mucho tiempo
      const img = images[i];
      const src = await img.getAttribute('src');
      
      if (src && src.includes('via.placeholder.com')) {
        brokenImages++;
        console.log(`    ❌ Imagen con URL prohibida: ${src}`);
      }
    }
    
    // Verificar errores de red relacionados con imágenes
    const imageNetworkErrors = networkErrors.filter(e => 
      e.url.includes('.jpg') || 
      e.url.includes('.png') || 
      e.url.includes('.gif') ||
      e.url.includes('via.placeholder.com')
    );
    
    console.log(`📊 Imágenes con URLs prohibidas: ${brokenImages}`);
    console.log(`📊 Errores de red en imágenes: ${imageNetworkErrors.length}`);
    
    // No debe haber URLs de via.placeholder.com
    expect(brokenImages).toBe(0);
    
    console.log('✅ Verificación de imágenes completada');
  });

  test('6. Probar APIs críticas', async ({ page }) => {
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
      
      try {
        await page.goto(screen);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        await page.waitForTimeout(3000); // Esperar llamadas API adicionales
      } catch (error) {
        console.log(`    ⚠️ Error navegando a ${screen}: ${error.message}`);
      }
    }
    
    // Analizar respuestas API
    const failedAPIs = apiCalls.filter(call => call.status >= 400);
    const user_communitiesErrors = failedAPIs.filter(call => call.url.includes('user_communities'));
    
    console.log(`📊 Total API calls: ${apiCalls.length}`);
    console.log(`📊 Failed APIs: ${failedAPIs.length}`);
    console.log(`📊 user_communities errors: ${user_communitiesErrors.length}`);
    
    if (failedAPIs.length > 0) {
      console.log('❌ APIs que fallaron:');
      failedAPIs.forEach(api => {
        console.log(`  ${api.method} ${api.url} - Status: ${api.status}`);
      });
    }
    
    // No debe haber errores 400 en user_communities
    expect(user_communitiesErrors.length).toBe(0);
    
    console.log('✅ Prueba de APIs completada');
  });

  test('7. Verificar errores específicos prohibidos', async ({ page }) => {
    console.log('🔍 Verificando errores específicos prohibidos...');
    
    // Navegar por varias pantallas para capturar errores
    const screens = ['/', '/welcome', '/signin', '/home', '/communities'];
    
    for (const screen of screens) {
      try {
        await page.goto(screen);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        await page.waitForTimeout(2000);
      } catch (error) {
        // Continuar con el siguiente screen
      }
    }
    
    // Lista de errores que NO deben aparecer
    const forbiddenErrors = [
      'Module not found: Can\'t resolve \'crypto\'',
      'useNativeDriver is not supported',
      'The action \'RESET\' with payload',
      'The action \'NAVIGATE\' with payload.*undefined',
      'ProfileScreen',
      'via.placeholder.com'
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

  test('8. Reporte final y métricas', async ({ page }) => {
    console.log('\n📈 GENERANDO REPORTE FINAL...');
    
    // Navegar por toda la app para capturar todos los errores posibles
    const allScreens = [
      '/', '/welcome', '/signin', '/signup', '/home', 
      '/communities', '/settings', '/profile', '/market-info', 
      '/educacion', '/promotions', '/pick-goals', '/pick-interests'
    ];
    
    for (const screen of allScreens) {
      try {
        await page.goto(screen);
        await page.waitForLoadState('networkidle', { timeout: 8000 });
        await page.waitForTimeout(1000);
      } catch (error) {
        // Continuar con el siguiente
      }
    }
    
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
    const reportPath = `./test-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      report,
      consoleErrors,
      networkErrors,
      navigationErrors
    }, null, 2));
    
    console.log(`💾 Reporte guardado en: ${reportPath}`);
    
    // Criterios de éxito
    const isSuccess = report.criticalErrors === 0 && 
                     report.apiErrors === 0 && 
                     report.totalNavigationErrors === 0;
    
    if (isSuccess) {
      console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! La aplicación está libre de errores críticos.');
    } else {
      console.log('⚠️ Se encontraron errores que requieren atención.');
    }
    
    // Mostrar todos los errores encontrados para debugging
    if (consoleErrors.length > 0) {
      console.log('\n📋 TODOS LOS ERRORES DE CONSOLA:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
      });
    }
    
    // No fallar el test aquí, solo reportar
    console.log('✅ Reporte final generado');
  });
});
