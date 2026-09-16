const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
    
    console.log("✓ Aplicación cargada");
    console.log("");
    console.log("Buscando campos de login...");
    
    // Esperar a que aparezcan los campos
    await page.waitForTimeout(2000);
    
    // Llenar campos
    const userField = page.locator("input[type=\"text\"]").first();
    const passField = page.locator("input[type=\"password\"]");
    
    await userField.fill("admin");
    console.log("✓ Usuario: admin");
    
    await passField.fill("admin");
    console.log("✓ Contraseña: admin");
    
    // Click en login
    const loginBtn = page.locator("button").filter({ hasText: /Login|Iniciar|Sign in/ }).first();
    await loginBtn.click();
    console.log("✓ Botón de login presionado");
    
    // Esperar a que la navegación se complete
    await page.waitForTimeout(3000);
    
    console.log("");
    console.log("================================");
    console.log("Sesión iniciada exitosamente");
    console.log("================================");
    console.log("");
    console.log("El navegador permanecerá abierto.");
    console.log("Ciérralo cuando termines las pruebas.");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
