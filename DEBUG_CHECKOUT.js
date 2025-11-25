// SCRIPT DE DIAGNÓSTICO - Copia y pega en la consola del navegador
// cuando estés en http://localhost:3000/checkout

(async () => {
  console.clear();
  console.log('🔍 DIAGNÓSTICO PROFUNDO DEL CHECKOUT\n');
  console.log('═'.repeat(60));
  
  // 1. LocalStorage
  const authData = JSON.parse(localStorage.getItem('auth-storage'));
  console.log('\n1️⃣ LOCALSTORAGE:');
  console.log('   User exists:', !!authData?.state?.user);
  console.log('   Email:', authData?.state?.user?.email);
  console.log('   UserLevel:', authData?.state?.user?.userLevel);
  console.log('   IsAuthenticated:', authData?.state?.isAuthenticated);
  
  // 2. Verificar si hay elementos VIP en la página
  console.log('\n2️⃣ ELEMENTOS VIP EN LA PÁGINA:');
  const pageText = document.body.innerText;
  console.log('   Tiene "VIP":', pageText.includes('VIP'));
  console.log('   Tiene "Beneficio VIP":', pageText.includes('Beneficio VIP'));
  console.log('   Tiene "Descuento VIP":', pageText.includes('Descuento VIP'));
  console.log('   Tiene "50%":', pageText.includes('50%'));
  console.log('   Tiene "€0.00":', pageText.includes('€0.00'));
  console.log('   Tiene "Pago Diferido":', pageText.includes('Pago Diferido'));
  
  // 3. Buscar elementos con clase yellow (que usan los componentes VIP)
  console.log('\n3️⃣ ELEMENTOS AMARILLOS (VIP):');
  const yellowElements = document.querySelectorAll('[class*="yellow"]');
  console.log('   Elementos con "yellow" en className:', yellowElements.length);
  yellowElements.forEach((el, i) => {
    console.log(`   ${i + 1}. ${el.tagName} - ${el.className.substring(0, 50)}...`);
  });
  
  // 4. Buscar el resumen del pedido
  console.log('\n4️⃣ RESUMEN DEL PEDIDO:');
  const summaryHeading = Array.from(document.querySelectorAll('h2')).find(h => 
    h.textContent.includes('Resumen del Pedido')
  );
  if (summaryHeading) {
    console.log('   Encontrado: SÍ');
    const summaryDiv = summaryHeading.closest('div');
    const summaryText = summaryDiv?.innerText || '';
    console.log('   Contiene VIP:', summaryText.includes('VIP'));
    console.log('   Primeras 300 chars:', summaryText.substring(0, 300));
  } else {
    console.log('   Encontrado: NO');
  }
  
  // 5. Verificar si React DevTools está disponible
  console.log('\n5️⃣ REACT STATE:');
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('   React DevTools: Disponible');
  } else {
    console.log('   React DevTools: No disponible');
  }
  
  // 6. Intentar acceder al store de Zustand
  console.log('\n6️⃣ ZUSTAND STORE:');
  // Buscar el store en el window
  const possibleStores = Object.keys(window).filter(key => 
    key.includes('store') || key.includes('Store') || key.includes('auth')
  );
  console.log('   Posibles stores en window:', possibleStores);
  
  console.log('\n═'.repeat(60));
  console.log('\n🎯 CONCLUSIÓN:');
  
  if (authData?.state?.user?.userLevel === 'VIP') {
    console.log('   ✅ userLevel está en localStorage: VIP');
    
    if (!pageText.includes('Beneficio VIP')) {
      console.log('   ❌ PERO no aparece "Beneficio VIP" en la página');
      console.log('\n   🔧 PROBLEMA: El componente no está renderizando el VIP');
      console.log('   📝 CAUSA PROBABLE:');
      console.log('      - El useAuthStore() no está devolviendo el user');
      console.log('      - Hay un problema de sincronización');
      console.log('      - El componente se renderiza antes de que llegue el user');
    } else {
      console.log('   ✅ Y SÍ aparece en la página');
      console.log('   🎉 TODO FUNCIONA CORRECTAMENTE');
    }
  } else {
    console.log('   ❌ userLevel NO está en localStorage o no es VIP');
    console.log('   🔧 SOLUCIÓN: Cierra sesión y vuelve a iniciar sesión');
  }
  
  console.log('\n═'.repeat(60));
})();
