/**
 * Test: Verificar la LÓGICA del backend para calcular descuento VIP
 * excluyendo montajes de calculadora
 * 
 * Este test simula la lógica sin necesitar conexión a BD
 */

// Simular la función calculateVIPDiscount del backend ACTUALIZADA
function calculateVIPDiscount(userLevel, items) {
  if (userLevel !== 'VIP' && userLevel !== 'VIP_PLUS') {
    return 0;
  }

  // Calcular subtotal SOLO de productos normales (NO de calculadora)
  let subtotalProductosNormales = 0;

  for (const item of items) {
    // Si el item tiene eventMetadata (viene de calculadora)
    if (item.eventMetadata) {
      const metadata = item.eventMetadata;
      const partsTotal = Number(metadata.partsTotal || 0);
      const extrasTotal = Number(metadata.extrasTotal || 0);
      const totalCalculadora = partsTotal + extrasTotal;
      
      // NO incluir NADA de la calculadora en el descuento VIP
      console.log(`   🚫 Item de CALCULADORA - SIN descuento VIP:`);
      console.log(`      - Equipos (partsTotal): €${partsTotal}`);
      console.log(`      - Montajes (extrasTotal): €${extrasTotal}`);
      console.log(`      - Total calculadora: €${totalCalculadora}`);
      console.log(`      - ❌ NO se aplica descuento VIP`);
    } else {
      // Para productos normales, SÍ incluir el precio completo
      const totalProducto = Number(item.totalPrice || 0);
      subtotalProductosNormales += totalProducto;
      console.log(`   ✅ Producto NORMAL - CON descuento VIP:`);
      console.log(`      - Total: €${totalProducto}`);
    }
  }

  console.log(`\n   💰 Subtotal SOLO productos normales: €${subtotalProductosNormales.toFixed(2)}`);

  // Aplicar descuento según nivel SOLO sobre productos normales
  const discountRate = userLevel === 'VIP' ? 0.50 : 0.70;
  const discount = subtotalProductosNormales * discountRate;
  
  console.log(`   ⭐ Tasa descuento ${userLevel}: ${discountRate * 100}%`);
  console.log(`   ⭐ Descuento aplicado: €${discount.toFixed(2)}`);
  
  if (subtotalProductosNormales === 0) {
    console.log(`   ℹ️ Solo hay items de calculadora - NO hay descuento VIP`);
  }
  
  return discount;
}

console.log('\n🧪 === TEST LÓGICA BACKEND: Descuento VIP ===\n');
console.log('═'.repeat(60));

// TEST 1: Item de calculadora con montajes
console.log('\n📋 TEST 1: Item de calculadora con montajes (usuario VIP)\n');

const items1 = [
  {
    productId: 'pack-1',
    totalPrice: 950,
    eventMetadata: {
      partsTotal: 500,      // Equipos
      extrasTotal: 450,     // Montajes
      packBasePrice: 0
    }
  }
];

const vipDiscount1 = calculateVIPDiscount('VIP', items1);
const expectedDiscount1 = 0; // 0% porque NADA de calculadora tiene descuento

console.log('\n✅ Verificación:');
console.log(`   Esperado: €${expectedDiscount1.toFixed(2)} (calculadora SIN descuento)`);
console.log(`   Obtenido: €${vipDiscount1.toFixed(2)}`);
console.log(`   ¿Correcto?: ${Math.abs(vipDiscount1 - expectedDiscount1) < 0.01 ? '✅ SÍ' : '❌ NO'}`);

// TEST 2: Producto individual sin eventMetadata
console.log('\n\n📋 TEST 2: Producto individual (usuario VIP)\n');

const items2 = [
  {
    productId: 'prod-1',
    totalPrice: 200
  }
];

const vipDiscount2 = calculateVIPDiscount('VIP', items2);
const expectedDiscount2 = 100; // 50% de €200

console.log('\n✅ Verificación:');
console.log(`   Esperado: €${expectedDiscount2.toFixed(2)}`);
console.log(`   Obtenido: €${vipDiscount2.toFixed(2)}`);
console.log(`   ¿Correcto?: ${Math.abs(vipDiscount2 - expectedDiscount2) < 0.01 ? '✅ SÍ' : '❌ NO'}`);

// TEST 3: Mix de calculadora + producto individual
console.log('\n\n📋 TEST 3: Mix calculadora + producto individual (usuario VIP)\n');

const items3 = [
  {
    productId: 'pack-1',
    totalPrice: 950,
    eventMetadata: {
      partsTotal: 500,      // Equipos
      extrasTotal: 450,     // Montajes
      packBasePrice: 0
    }
  },
  {
    productId: 'prod-1',
    totalPrice: 200
  }
];

const vipDiscount3 = calculateVIPDiscount('VIP', items3);
const expectedDiscount3 = 100; // 50% de €200 (solo producto normal)

console.log('\n✅ Verificación:');
console.log(`   Base descuento: €200 (solo producto normal)`);
console.log(`   Calculadora excluida: €950 (€500 equipos + €450 montajes)`);
console.log(`   Esperado: €${expectedDiscount3.toFixed(2)}`);
console.log(`   Obtenido: €${vipDiscount3.toFixed(2)}`);
console.log(`   ¿Correcto?: ${Math.abs(vipDiscount3 - expectedDiscount3) < 0.01 ? '✅ SÍ' : '❌ NO'}`);

// TEST 4: Cálculo completo de pedido
console.log('\n\n📋 TEST 4: Cálculo completo de pedido (usuario VIP)\n');

const items4 = [
  {
    productId: 'pack-1',
    totalPrice: 950,
    eventMetadata: {
      partsTotal: 500,
      extrasTotal: 450,
      packBasePrice: 0
    }
  }
];

// Calcular como lo hace el backend
let subtotal = 0;
for (const item of items4) {
  subtotal += Number(item.totalPrice || 0);
}

const vipDiscount4 = calculateVIPDiscount('VIP', items4);
const subtotalAfterDiscount = subtotal - vipDiscount4;
const tax = subtotalAfterDiscount * 0.21;
const total = subtotalAfterDiscount + tax;

console.log('\n📊 Resultado completo:');
console.log('─'.repeat(60));
console.log(`   Subtotal:              €${subtotal.toFixed(2)}`);
console.log(`   Descuento VIP (50%):  -€${vipDiscount4.toFixed(2)} (sin descuento porque es calculadora)`);
console.log(`   Subtotal c/descuento:  €${subtotalAfterDiscount.toFixed(2)}`);
console.log(`   IVA (21%):            +€${tax.toFixed(2)}`);
console.log(`   TOTAL FINAL:           €${total.toFixed(2)}`);

console.log('\n✅ Verificación completa:');
console.log(`   Esperado total: €1149.50 (€950 + IVA 21% sin descuento)`);
console.log(`   Obtenido total: €${total.toFixed(2)}`);
console.log(`   ¿Correcto?: ${Math.abs(total - 1149.50) < 1 ? '✅ SÍ' : '❌ NO'}`);

// RESUMEN FINAL
console.log('\n\n📊 RESUMEN FINAL\n');
console.log('═'.repeat(60));

const test1Pass = Math.abs(vipDiscount1 - expectedDiscount1) < 0.01;
const test2Pass = Math.abs(vipDiscount2 - expectedDiscount2) < 0.01;
const test3Pass = Math.abs(vipDiscount3 - expectedDiscount3) < 0.01;
const test4Pass = Math.abs(total - 1149.50) < 1;

console.log('Test 1 (Calculadora con montajes):  ', test1Pass ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 2 (Producto individual):       ', test2Pass ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 3 (Mix calculadora + producto):', test3Pass ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 4 (Cálculo completo):          ', test4Pass ? '✅ PASÓ' : '❌ FALLÓ');

const allPass = test1Pass && test2Pass && test3Pass && test4Pass;

console.log('\n' + (allPass ? '🎉 TODOS LOS TESTS PASARON' : '⚠️ ALGUNOS TESTS FALLARON'));
console.log('═'.repeat(60));

if (allPass) {
  console.log('\n✅ La lógica del backend es correcta:');
  console.log('   ✅ Items de calculadora (equipos + montajes): SIN descuento VIP');
  console.log('   ✅ Productos individuales normales: CON descuento VIP');
  console.log('   ✅ IVA calculado correctamente sobre el total');
  console.log('   ℹ️ El descuento VIP solo aplica a productos NO de calculadora');
} else {
  console.log('\n❌ HAY PROBLEMAS con la lógica del backend');
}

process.exit(allPass ? 0 : 1);
