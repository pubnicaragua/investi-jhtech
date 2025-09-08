const { chromium } = require('playwright');
const config = require('./config');
const { test, expect } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase para limpieza de datos de prueba
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Objeto para almacenar el estado entre pruebas
const testState = {
  user: null,
  authToken: null,
  testPostId: null,
  testCommunityId: null,
};

// Configuración global de Playwright
test.describe.configure({ mode: 'serial' });

test.describe('Pruebas E2E de Investi App', () => {
  let browser;
  let context;
  let page;

  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: config.headless,
      slowMo: config.slowMo,
    });
    context = await browser.newContext({
      viewport: config.viewport,
      baseURL: config.baseUrl,
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
    await browser.close();
  });

  test('Registro de nuevo usuario', async () => {
    // Navegar a la página de registro
    await page.goto(config.routes.register);
    
    // Completar el formulario de registro
    await page.fill('input[name="email"]', config.testUser.email);
    await page.fill('input[name="password"]', config.testUser.password);
    await page.fill('input[name="fullName"]', config.testUser.fullName);
    await page.fill('input[name="username"]', config.testUser.username);
    
    // Hacer clic en el botón de registro
    await page.click('button[type="submit"]');
    
    // Verificar redirección después del registro exitoso
    await page.waitForURL('**/upload-avatar');
    expect(page.url()).toContain('/upload-avatar');
    
    // Almacenar el token de autenticación para usar en pruebas posteriores
    const storage = await context.storageState();
    testState.authToken = storage.origins[0]?.localStorage?.find(
      item => item.name === 'sb-access-token'
    )?.value;
  });

  test('Completar onboarding', async () => {
    // Subir foto de perfil
    // Nota: En un entorno real, necesitarías un archivo de prueba
    
    // Seleccionar intereses
    await page.goto('/pick-interests');
    await page.click('button:has-text("Mercado de Valores")');
    await page.click('button:has-text("Criptomonedas")');
    await page.click('button:has-text("Siguiente")');
    
    // Seleccionar objetivos
    await page.waitForURL('**/pick-goals');
    await page.click('button:has-text("Aprender a invertir")');
    await page.click('button:has-text("Finalizar")');
    
    // Verificar redirección al feed principal
    await page.waitForURL('**/home');
    expect(page.url()).toContain('/home');
  });

  test('Navegación principal', async () => {
    // Verificar que podemos navegar a las secciones principales
    const sections = [
      { name: 'Inicio', path: '/home' },
      { name: 'Comunidades', path: '/communities' },
      { name: 'Mercado', path: '/market-info' },
      { name: 'Educación', path: '/educacion' },
      { name: 'Inversiones', path: '/inversiones' },
    ];

    for (const section of sections) {
      await page.goto(section.path);
      await expect(page).toHaveURL(section.path);
      await expect(page.locator('h1')).toContainText(section.name);
    }
  });

  test('Crear y publicar un post', async () => {
    // Navegar a la creación de post
    await page.goto(config.routes.createPost);
    
    // Completar el formulario de publicación
    const testPost = `Prueba automatizada - ${new Date().toISOString()}`;
    await page.fill('textarea[name="content"]', testPost);
    
    // Publicar
    await page.click('button:has-text("Publicar")');
    
    // Verificar que el post aparece en el feed
    await page.waitForSelector(`text="${testPost}"`);
    
    // Guardar el ID del post para pruebas posteriores
    const postElement = await page.$(`text="${testPost}"`);
    const postId = await postElement.getAttribute('data-testid');
    testState.testPostId = postId;
  });

  test('Interactuar con un post', async () => {
    if (!testState.testPostId) {
      test.skip(!testState.testPostId, 'No hay un post de prueba disponible');
      return;
    }
    
    // Navegar al post
    await page.goto(`/post/${testState.testPostId}`);
    
    // Dar like
    await page.click('button[aria-label="Me gusta"]');
    
    // Comentar
    const testComment = 'Comentario de prueba';
    await page.fill('input[placeholder="Escribe un comentario..."]', testComment);
    await page.press('input[placeholder="Escribe un comentario..."]', 'Enter');
    
    // Verificar que el comentario se muestra
    await expect(page.locator('.comment')).toContainText(testComment);
  });

  test('Explorar comunidades', async () => {
    await page.goto(config.routes.communities);
    
    // Hacer clic en la primera comunidad
    const firstCommunity = await page.$('.community-card');
    if (firstCommunity) {
      const communityId = await firstCommunity.getAttribute('data-community-id');
      testState.testCommunityId = communityId;
      await firstCommunity.click();
      
      // Verificar que estamos en la página de la comunidad
      await page.waitForURL(`**/community/${communityId}`);
      
      // Unirse a la comunidad
      const joinButton = await page.$('button:has-text("Unirse")');
      if (joinButton) {
        await joinButton.click();
        await expect(page.locator('button:has-text("Abandonar")')).toBeVisible();
      }
    }
  });

  test('Ver perfil de usuario', async () => {
    await page.goto('/profile');
    
    // Verificar que la información del perfil se muestra correctamente
    await expect(page.locator('h1')).toContainText(config.testUser.fullName);
    await expect(page.locator(`text="@${config.testUser.username}"`)).toBeVisible();
    
    // Verificar que los posts del usuario se muestran
    await expect(page.locator('.user-posts')).toBeVisible();
  });

  test('Configuración de la cuenta', async () => {
    await page.goto('/settings');
    
    // Actualizar biografía
    const newBio = 'Biografía de prueba actualizada';
    await page.fill('textarea[name="bio"]', newBio);
    await page.click('button:has-text("Guardar cambios")');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text="Cambios guardados"')).toBeVisible();
    
    // Verificar que los cambios se reflejan en el perfil
    await page.goto('/profile');
    await expect(page.locator(`text="${newBio}"`)).toBeVisible();
  });

  test('Cerrar sesión', async () => {
    // Navegar a configuración
    await page.goto('/settings');
    
    // Hacer clic en cerrar sesión
    await page.click('button:has-text("Cerrar sesión")');
    
    // Verificar que se redirige a la página de inicio de sesión
    await page.waitForURL('**/signin');
    expect(page.url()).toContain('/signin');
  });

  test('Inicio de sesión', async () => {
    // Navegar a la página de inicio de sesión
    await page.goto(config.routes.login);
    
    // Completar el formulario de inicio de sesión
    await page.fill('input[name="email"]', config.testUser.email);
    await page.fill('input[name="password"]', config.testUser.password);
    
    // Hacer clic en el botón de inicio de sesión
    await page.click('button[type="submit"]');
    
    // Verificar redirección después del inicio de sesión exitoso
    await page.waitForURL('**/home');
    expect(page.url()).toContain('/home');
  });
});

// Limpieza después de todas las pruebas
test.afterAll(async () => {
  // Limpiar datos de prueba en Supabase
  if (testState.authToken) {
    const { data: { user } } = await supabase.auth.getUser(testState.authToken);
    
    if (user) {
      // Eliminar publicaciones de prueba
      await supabase
        .from('posts')
        .delete()
        .eq('user_id', user.id);
      
      // Eliminar perfil de usuario
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      // Eliminar cuenta de autenticación
      await supabase.auth.admin.deleteUser(user.id);
    }
  }
});
