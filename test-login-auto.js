const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navegar a la aplicación
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    console.log('✓ Aplicación cargada');
    
    // Esperar el formulario de login
    await page.waitForSelector('input[placeholder*="username"], input[placeholder*="Usuario"], input[type="text"]', { timeout: 5000 }).catch(() => null);
    
    // Intentar encontrar y llenar los campos de login
    const userInputs = await page.locator('input[type="text"], input[placeholder*="user"], input[placeholder*="Usuario"]').all();
    const passInputs = await page.locator('input[type="password"]').all();
    
    console.log(`Encontrados ${userInputs.length} campos de usuario y ${passInputs.length} campos de contraseña`);
    
    if (userInputs.length > 0 && passInputs.length > 0) {
      // Llenar credenciales
      await userInputs[0].fill('admin');
      console.log('✓ Usuario ingresado: admin');
      
      await passInputs[0].fill('admin');
      console.log('✓ Contraseña ingresada');
      
      // Buscar y hacer click en el botón de login
      const loginButton = await page.locator('button:has-text("Login"), button:has-text("Iniciar"), button:has-text("Sign in")').first().catch(() => null);
      if (loginButton) {
        await loginButton.click();
        console.log('✓ Botón de login presionado');
        
        // Esperar a que se complete el login
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => null);
        console.log('✓ Login completado');
      }
    }
    
    // Mantener el navegador abierto
    console.log('');
    console.log('Credenciales usadas:');
    console.log('  Usuario: admin');
    console.log('  Contraseña: admin');
    console.log('');
    console.log('Navegador permanecerá abierto. Ciérralo cuando termines las pruebas.');
    
    await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutos
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
