const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLogin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Crear directorio para screenshots
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('📱 Abriendo aplicación...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Screenshot inicial (página de login)
    await page.screenshot({ path: path.join(screenshotDir, '1-login-page.png') });
    console.log('✅ Screenshot 1: Página de login');

    // Llenar credenciales
    console.log('📝 Ingresando credenciales...');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');

    // Screenshot con credenciales
    await page.screenshot({ path: path.join(screenshotDir, '2-credentials-filled.png') });
    console.log('✅ Screenshot 2: Credenciales ingresadas');

    // Enviar formulario
    console.log('🔐 Enviando login...');
    await page.click('button[type="submit"]');

    // Esperar a que se cargue la dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Screenshot de dashboard
    await page.screenshot({ path: path.join(screenshotDir, '3-dashboard.png') });
    console.log('✅ Screenshot 3: Dashboard después del login');

    // Verificar si está autenticado
    const url = page.url();
    const pageTitle = await page.title();

    console.log('\n✅ VERIFICACIÓN COMPLETADA:');
    console.log(`   URL actual: ${url}`);
    console.log(`   Título: ${pageTitle}`);

    if (url.includes('localhost:5173') && !url.includes('/login')) {
      console.log('\n🎉 LOGIN EXITOSO - Usuario autenticado correctamente');
      console.log(`\n📸 Screenshots guardados en: ${screenshotDir}`);
    } else {
      console.log('\n⚠️  Verificar si el login fue exitoso');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin();
