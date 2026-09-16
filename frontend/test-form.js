const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    console.log('✓ Navegado a la aplicación');
    
    await page.waitForTimeout(2000);
    
    const btnCreate = await page.$('button.btn-create');
    if (btnCreate) {
      console.log('✓ Botón "Nuevo Atractivo" encontrado');
      await btnCreate.click();
      
      await page.waitForTimeout(2000);
      console.log('✓ Modal abierto');
      
      // Buscar los campos
      const estadoField = await page.$('label:has-text("Estado")');
      const nombreField = await page.$('label:has-text("Nombre del atractivo")');
      const subtipoField = await page.$('label:has-text("Sub tipo")');
      const jerarquiaField = await page.$('label:has-text("Jerarquía")');
      
      console.log('✓ Campo Estado:', estadoField ? 'ENCONTRADO' : 'NO ENCONTRADO');
      console.log('✓ Campo Nombre:', nombreField ? 'ENCONTRADO' : 'NO ENCONTRADO');
      console.log('✓ Campo Sub tipo:', subtipoField ? 'ENCONTRADO' : 'NO ENCONTRADO');
      console.log('✓ Campo Jerarquía:', jerarquiaField ? 'ENCONTRADO' : 'NO ENCONTRADO');
      
      // Verificar que están en la misma línea
      if (estadoField && nombreField) {
        const estadoBox = await estadoField.boundingBox();
        const nombreBox = await nombreField.boundingBox();
        
        console.log('\nPosiciones:');
        console.log('  Estado Y:', estadoBox.y);
        console.log('  Nombre Y:', nombreBox.y);
        console.log('  ¿En la misma línea?', Math.abs(estadoBox.y - nombreBox.y) < 10 ? 'SÍ' : 'NO');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
