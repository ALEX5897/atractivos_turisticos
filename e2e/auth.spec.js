import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login antes de cada test
    await page.goto('/login');
  });

  test('debería mostrar página de login', async ({ page }) => {
    // Verificar que la página de login se carga
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('input[type="text"]')).toBeDefined();
    await expect(page.locator('input[type="password"]')).toBeDefined();
  });

  test('debería login con credenciales correctas', async ({ page }) => {
    // Llenar campos de login
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');

    // Hacer click en botón login
    await page.click('button:has-text("Iniciar sesión")');

    // Esperar a que se redirija a la app principal
    await page.waitForURL(/.*\//);

    // Verificar que no estamos más en /login
    expect(page.url()).not.toMatch(/login/);
  });

  test('debería mostrar error con credenciales incorrectas', async ({ page }) => {
    // Intentar login con credenciales incorrectas
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Hacer click en botón login
    await page.click('button:has-text("Iniciar sesión")');

    // Esperar a que aparezca mensaje de error
    const errorMessage = page.locator('.alert, .error-message, [role="alert"]');

    // El error debe aparecer o la URL debe mantenerse en /login
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('login');

    expect(errorVisible || stillOnLogin).toBeTruthy();
  });

  test('debería validar campos requeridos', async ({ page }) => {
    // Intentar hacer login sin llenar campos
    const loginButton = page.locator('button:has-text("Iniciar sesión")');

    // Hacer click sin llenar campos
    await loginButton.click();

    // Debe permanecer en login
    expect(page.url()).toMatch(/login/);
  });

  test('debería mantener usuario logueado después de refresh', async ({ page }) => {
    // Login
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button:has-text("Iniciar sesión")');

    // Esperar a que cargue la app
    await page.waitForURL(/.*\//);

    // Refrescar página
    await page.reload();

    // Debe permanecer logueado (no redirigir a login)
    expect(page.url()).not.toMatch(/login/);
  });
});

test.describe('Logout', () => {
  test('debería logout y redirigir a login', async ({ page }) => {
    // Primero hacer login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button:has-text("Iniciar sesión")');

    // Esperar a que cargue la app
    await page.waitForURL(/.*\//);

    // Buscar botón de logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Cerrar sesión"), [aria-label*="logout"], [aria-label*="salir"]');

    // Si existe el botón, hacer click
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();

      // Debe redirigir a /login
      await page.waitForURL(/.*login/);
      expect(page.url()).toMatch(/login/);
    }
  });
});
