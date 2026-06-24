const puppeteer = require('puppeteer');

async function testRelatedProducts() {
  console.log('🧪 Iniciando test E2E de productos relacionados...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Interceptar requests
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('/api/v1/products/slug/')) {
      console.log('📡 API Call detectada:', request.url());
      apiCalls.push(request.url());
    }
  });
  
  // Interceptar responses
  page.on('response', async response => {
    if (response.url().includes('/api/v1/products/slug/')) {
      console.log('📥 Respuesta recibida:', response.url());
      try {
        const data = await response.json();
        console.log('📦 Datos del producto:', {
          name: data.name,
          hasRelatedProducts: !!data.relatedProducts,
          relatedProductsCount: data.relatedProducts?.length || 0,
          relatedProducts: data.relatedProducts
        });
      } catch (e) {
        console.log('❌ Error parseando respuesta:', e.message);
      }
    }
  });
  
  // Interceptar console logs del navegador
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('📦 Producto recibido') || text.includes('🔗 Productos relacionados')) {
      console.log('🌐 Console del navegador:', text);
    }
  });
  
  try {
    console.log('1️⃣ Navegando a la página de inicio...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log('2️⃣ Navegando a la página del producto...');
    await page.goto('http://localhost:3000/productos/lc-8-kinson-son-0006', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('3️⃣ Esperando que el producto cargue...');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    const productName = await page.$eval('h1', el => el.textContent);
    console.log('✅ Producto cargado:', productName);
    
    console.log('4️⃣ Buscando sección de productos relacionados...');
    
    // Buscar el título "Productos relacionados"
    const relatedSection = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const relatedHeading = headings.find(h => h.textContent.includes('Productos relacionados'));
      return {
        found: !!relatedHeading,
        text: relatedHeading?.textContent,
        visible: relatedHeading ? window.getComputedStyle(relatedHeading).display !== 'none' : false
      };
    });
    
    console.log('🔍 Resultado búsqueda sección relacionados:', relatedSection);
    
    // Contar productos relacionados en el DOM
    const relatedProductsInDOM = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const relatedHeading = headings.find(h => h.textContent.includes('Productos relacionados'));
      if (!relatedHeading) return 0;
      
      const section = relatedHeading.parentElement;
      if (!section) return 0;
      
      // Buscar tarjetas de productos (divs con cursor-pointer)
      const productCards = section.querySelectorAll('.cursor-pointer');
      return productCards.length;
    });
    
    console.log('📊 Productos relacionados en el DOM:', relatedProductsInDOM);
    
    console.log('\n📊 RESUMEN:');
    console.log('- API Calls realizadas:', apiCalls.length);
    console.log('- Sección "Productos relacionados" encontrada:', relatedSection.found);
    console.log('- Productos en el DOM:', relatedProductsInDOM);
    
    if (apiCalls.length === 0) {
      console.log('\n❌ PROBLEMA: No se hizo ninguna llamada al API');
      console.log('   Causa probable: React Query tiene el producto cacheado');
      console.log('   Solución: Invalidar caché de React Query');
    } else if (relatedProductsInDOM === 0) {
      console.log('\n❌ PROBLEMA: API se llama pero no hay productos en el DOM');
      console.log('   Causa probable: Backend devuelve array vacío o frontend no renderiza');
    } else {
      console.log('\n✅ TODO FUNCIONA CORRECTAMENTE');
    }
    
    // Esperar 5 segundos para inspeccionar
    console.log('\n⏳ Esperando 5 segundos para inspección manual...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  } finally {
    await browser.close();
  }
}

testRelatedProducts();
