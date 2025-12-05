/**
 * Test: Verificar que descuento VIP NO se aplica a montajes de calculadora
 * pero SÍ a productos individuales y packs
 */

// Simular la función calculateCartTotals
function calculateCartTotals(params) {
  const {
    items,
    deliveryOption = 'pickup',
    distance = 0,
    includeInstallation = false,
    shippingIncludedInPrice = false,
    userLevel = 'STANDARD',
    appliedCoupon = null,
  } = params;

  console.log('\n🧪 === INICIANDO CÁLCULO DE DESCUENTOS VIP ===\n');

  // 1. CALCULAR SUBTOTAL
  const subtotal = items.reduce((sum, item) => {
    let itemTotal = item.totalPrice;
    
    if (!itemTotal) {
      if (item.eventMetadata) {
        const metadata = item.eventMetadata;
        const partsTotal = Number(metadata.partsTotal || 0);
        const extrasTotal = Number(metadata.extrasTotal || 0);
        const packBasePrice = Number(metadata.packBasePrice || 0);
        
        itemTotal = partsTotal + extrasTotal + packBasePrice;
      } else {
        if (item.startDate && item.endDate) {
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
          itemTotal = Number(item.product.pricePerDay) * days * item.quantity;
        } else {
          itemTotal = Number(item.product.pricePerDay) * item.quantity;
        }
      }
    }
    
    return sum + (Number(itemTotal) || 0);
  }, 0);

  console.log('📊 Subtotal TOTAL:', subtotal);

  // 2. CALCULAR ENVÍO
  let shippingCost = 0;
  if (!shippingIncludedInPrice && deliveryOption === 'delivery' && distance > 0) {
    shippingCost = distance * 1.5;
    if (appliedCoupon?.freeShipping) {
      shippingCost = 0;
    }
  }

  // 3. CALCULAR INSTALACIÓN
  let installationCost = 0;
  if (!shippingIncludedInPrice && includeInstallation) {
    installationCost = items.reduce((sum, item) => {
      const installCost = Number(item.installationCost) || 0;
      return sum + (installCost * item.quantity);
    }, 0);
  }

  // 4. CALCULAR DESCUENTO VIP (EXCLUIR MONTAJES)
  let vipDiscount = 0;
  if (userLevel === 'VIP' || userLevel === 'VIP_PLUS') {
    console.log('\n💎 Usuario VIP detectado. Calculando descuento...\n');
    
    // Calcular subtotal EXCLUYENDO montajes (extras de la calculadora)
    const subtotalWithoutMontajes = items.reduce((sum, item) => {
      let itemTotal = 0;
      
      // IMPORTANTE: SIEMPRE recalcular para items de calculadora para excluir montajes
      if (item.eventMetadata) {
        const metadata = item.eventMetadata;
        const partsTotal = Number(metadata.partsTotal || 0);
        const extrasTotal = Number(metadata.extrasTotal || 0);
        const packBasePrice = Number(metadata.packBasePrice || 0);
        
        console.log('🔍 Item de calculadora detectado:');
        console.log('   - Producto:', item.product.name);
        console.log('   - partsTotal (equipos):', partsTotal);
        console.log('   - extrasTotal (MONTAJES - EXCLUIDOS):', extrasTotal);
        console.log('   - packBasePrice:', packBasePrice);
        
        // NO incluir extrasTotal porque son montajes
        itemTotal = partsTotal + packBasePrice; // Solo partes y pack base, SIN extras (montajes)
        console.log('   - ✅ Base para descuento:', itemTotal);
        console.log('   - ❌ NO incluir montajes:', extrasTotal);
      } else {
        // Para productos normales, usar totalPrice existente o calcularlo
        itemTotal = item.totalPrice;
        
        if (!itemTotal) {
          if (item.startDate && item.endDate) {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
            itemTotal = Number(item.product.pricePerDay) * days * item.quantity;
          } else {
            itemTotal = Number(item.product.pricePerDay) * item.quantity;
          }
        }
        
        console.log('🔍 Producto individual/pack:');
        console.log('   - Producto:', item.product.name);
        console.log('   - ✅ Total para descuento:', itemTotal);
      }
      
      return sum + (Number(itemTotal) || 0);
    }, 0);
    
    console.log('\n💰 Subtotal TOTAL (con montajes):', subtotal);
    console.log('💰 Subtotal SIN montajes (para descuento VIP):', subtotalWithoutMontajes);
    
    // Aplicar descuento solo sobre subtotal sin montajes
    if (userLevel === 'VIP') {
      vipDiscount = subtotalWithoutMontajes * 0.50; // 50%
      console.log('⭐ Descuento VIP (50% de', subtotalWithoutMontajes, '):', vipDiscount);
    } else if (userLevel === 'VIP_PLUS') {
      vipDiscount = subtotalWithoutMontajes * 0.70; // 70%
      console.log('👑 Descuento VIP PLUS (70% de', subtotalWithoutMontajes, '):', vipDiscount);
    }
  }

  // 5. CALCULAR DESCUENTO DE CUPÓN
  const couponDiscount = appliedCoupon?.discountAmount || 0;

  // 6. APLICAR EL MAYOR DESCUENTO (NO SE SUMAN)
  const totalDiscount = Math.max(vipDiscount, couponDiscount);

  // 7. CALCULAR TOTAL ANTES DE IVA
  const totalBeforeTax = subtotal + shippingCost + installationCost - totalDiscount;

  // 8. CALCULAR IVA (21% sobre el total después de descuentos)
  const tax = Math.max(0, totalBeforeTax * 0.21);

  // 9. TOTAL FINAL
  const total = totalBeforeTax + tax;

  return {
    subtotal: Math.max(0, subtotal),
    shippingCost: Math.max(0, shippingCost),
    installationCost: Math.max(0, installationCost),
    vipDiscount: Math.max(0, vipDiscount),
    couponDiscount: Math.max(0, couponDiscount),
    totalBeforeTax: Math.max(0, totalBeforeTax),
    tax: Math.max(0, tax),
    total: Math.max(0, total),
  };
}

// === TEST 1: Item de calculadora con montajes (usuario VIP) ===
console.log('\n\n🧪 TEST 1: Item de calculadora con montajes (usuario VIP)\n');
console.log('═'.repeat(60));

const calculatorItem = {
  id: 'calc-item-1',
  product: {
    id: 'pack-1',
    name: 'Pack Boda Premium',
    pricePerDay: 950
  },
  quantity: 1,
  eventMetadata: {
    partsTotal: 500,      // Equipos (deben tener descuento)
    extrasTotal: 450,     // Montajes (NO deben tener descuento)
    packBasePrice: 0,
    eventDate: '2026-05-07',
    selectedParts: [
      { id: '1', name: 'Equipo sonido', pricePerDay: 300, quantity: 1 },
      { id: '2', name: 'Iluminación', pricePerDay: 200, quantity: 1 }
    ],
    selectedExtras: [
      { id: '3', name: 'Montaje', pricePerDay: 250, quantity: 1 },
      { id: '4', name: 'Transporte', pricePerDay: 200, quantity: 1 }
    ]
  }
};

const result1 = calculateCartTotals({
  items: [calculatorItem],
  deliveryOption: 'pickup',
  userLevel: 'VIP', // 50% descuento
});

console.log('\n📋 RESULTADOS TEST 1:');
console.log('─'.repeat(60));
console.log('Subtotal:              €' + result1.subtotal.toFixed(2));
console.log('Descuento VIP (50%):  -€' + result1.vipDiscount.toFixed(2));
console.log('Total antes IVA:       €' + result1.totalBeforeTax.toFixed(2));
console.log('IVA (21%):            +€' + result1.tax.toFixed(2));
console.log('TOTAL FINAL:           €' + result1.total.toFixed(2));

// Verificación
const expectedDiscount = 500 * 0.50; // Solo sobre equipos
const test1Pass = Math.abs(result1.vipDiscount - expectedDiscount) < 0.01;

console.log('\n✅ VERIFICACIÓN TEST 1:');
console.log('─'.repeat(60));
console.log('Descuento esperado:   €' + expectedDiscount.toFixed(2) + ' (50% de €500)');
console.log('Descuento obtenido:   €' + result1.vipDiscount.toFixed(2));
console.log('¿Correcto?:', test1Pass ? '✅ SÍ' : '❌ NO');

if (!test1Pass) {
  console.log('\n⚠️ ERROR: El descuento debería ser €250 (50% de €500), no €' + result1.vipDiscount.toFixed(2));
  console.log('Los montajes (€450) NO deben tener descuento VIP.');
}

// === TEST 2: Producto individual (usuario VIP) ===
console.log('\n\n🧪 TEST 2: Producto individual (usuario VIP)\n');
console.log('═'.repeat(60));

const individualProduct = {
  id: 'prod-1',
  product: {
    id: 'product-1',
    name: 'Mesa DJ',
    pricePerDay: 100
  },
  quantity: 2,
  startDate: '2026-05-07',
  endDate: '2026-05-08',
  totalPrice: 200 // 100 * 2 días
};

const result2 = calculateCartTotals({
  items: [individualProduct],
  deliveryOption: 'pickup',
  userLevel: 'VIP',
});

console.log('\n📋 RESULTADOS TEST 2:');
console.log('─'.repeat(60));
console.log('Subtotal:              €' + result2.subtotal.toFixed(2));
console.log('Descuento VIP (50%):  -€' + result2.vipDiscount.toFixed(2));
console.log('Total antes IVA:       €' + result2.totalBeforeTax.toFixed(2));
console.log('IVA (21%):            +€' + result2.tax.toFixed(2));
console.log('TOTAL FINAL:           €' + result2.total.toFixed(2));

const expectedDiscount2 = 200 * 0.50;
const test2Pass = Math.abs(result2.vipDiscount - expectedDiscount2) < 0.01;

console.log('\n✅ VERIFICACIÓN TEST 2:');
console.log('─'.repeat(60));
console.log('Descuento esperado:   €' + expectedDiscount2.toFixed(2) + ' (50% de €200)');
console.log('Descuento obtenido:   €' + result2.vipDiscount.toFixed(2));
console.log('¿Correcto?:', test2Pass ? '✅ SÍ' : '❌ NO');

// === TEST 3: Mix de calculadora + productos individuales ===
console.log('\n\n🧪 TEST 3: Mix calculadora + productos individuales (usuario VIP)\n');
console.log('═'.repeat(60));

const result3 = calculateCartTotals({
  items: [calculatorItem, individualProduct],
  deliveryOption: 'pickup',
  userLevel: 'VIP',
});

console.log('\n📋 RESULTADOS TEST 3:');
console.log('─'.repeat(60));
console.log('Subtotal TOTAL:        €' + result3.subtotal.toFixed(2));
console.log('  - Calculadora:       €950 (€500 equipos + €450 montajes)');
console.log('  - Producto indiv.:   €200');
console.log('Descuento VIP (50%):  -€' + result3.vipDiscount.toFixed(2));
console.log('Total antes IVA:       €' + result3.totalBeforeTax.toFixed(2));
console.log('IVA (21%):            +€' + result3.tax.toFixed(2));
console.log('TOTAL FINAL:           €' + result3.total.toFixed(2));

const expectedDiscount3 = (500 + 200) * 0.50; // Solo equipos + producto individual
const test3Pass = Math.abs(result3.vipDiscount - expectedDiscount3) < 0.01;

console.log('\n✅ VERIFICACIÓN TEST 3:');
console.log('─'.repeat(60));
console.log('Base descuento:       €700 (€500 equipos + €200 producto)');
console.log('Montajes excluidos:   €450');
console.log('Descuento esperado:   €' + expectedDiscount3.toFixed(2) + ' (50% de €700)');
console.log('Descuento obtenido:   €' + result3.vipDiscount.toFixed(2));
console.log('¿Correcto?:', test3Pass ? '✅ SÍ' : '❌ NO');

// === RESUMEN FINAL ===
console.log('\n\n📊 RESUMEN FINAL DE TESTS\n');
console.log('═'.repeat(60));
console.log('Test 1 (Calculadora con montajes):  ', test1Pass ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 2 (Producto individual):       ', test2Pass ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 3 (Mix calculadora + producto):', test3Pass ? '✅ PASÓ' : '❌ FALLÓ');

const allTestsPass = test1Pass && test2Pass && test3Pass;

console.log('\n' + (allTestsPass ? '🎉 TODOS LOS TESTS PASARON' : '⚠️ ALGUNOS TESTS FALLARON'));
console.log('═'.repeat(60));

if (allTestsPass) {
  console.log('\n✅ El descuento VIP funciona correctamente:');
  console.log('   - Montajes de calculadora: SIN descuento');
  console.log('   - Equipos de calculadora: CON descuento');
  console.log('   - Productos individuales: CON descuento');
} else {
  console.log('\n❌ HAY PROBLEMAS con el cálculo de descuentos VIP.');
  console.log('   Se requieren correcciones en cartCalculations.ts');
}

process.exit(allTestsPass ? 0 : 1);
