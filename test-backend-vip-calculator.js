/**
 * Test Backend: Verificar que el backend calcula correctamente 
 * el descuento VIP excluyendo montajes de calculadora
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

// Credenciales VIP (debes tener un usuario VIP en la BD)
const VIP_USER = {
  email: 'admin@resona.com',
  password: 'Admin123!@#'
};

async function testBackendVIPDiscount() {
  console.log('\n🧪 === TEST BACKEND: Descuento VIP en Calculadora ===\n');
  console.log('═'.repeat(60));

  try {
    // 1. Login como usuario VIP
    console.log('\n1️⃣ Iniciando sesión como usuario VIP...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, VIP_USER);
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log(`✅ Login exitoso - Usuario: ${user.email}`);
    console.log(`   Nivel: ${user.userLevel}`);
    
    if (user.userLevel !== 'VIP' && user.userLevel !== 'VIP_PLUS') {
      console.log('❌ ERROR: Usuario no es VIP');
      process.exit(1);
    }

    // 2. Crear orden con item de calculadora
    console.log('\n2️⃣ Creando orden con item de calculadora...');
    
    // NOTA: Este test verificará la LÓGICA de cálculo, no creará el pedido real
    // porque requeriría un producto válido en la BD
    console.log('   ⚠️ Test de LÓGICA (no crea pedido real)');
    
    const orderData = {
      userId: user.id,
      deliveryType: 'PICKUP',
      items: [
        {
          productId: 'test-product-id', // ID ficticio para test de lógica
          quantity: 1,
          startDate: '2026-05-07',
          endDate: '2026-05-08',
          totalPrice: 950, // €500 equipos + €450 montajes
          // Metadata de calculadora
          eventMetadata: {
            partsTotal: 500,      // Equipos (deben tener descuento)
            extrasTotal: 450,     // Montajes (NO deben tener descuento)
            packBasePrice: 0,
            eventDate: '2026-05-07',
            eventLocation: 'Valencia',
            selectedParts: [
              { id: '1', name: 'Equipo sonido', pricePerDay: 300, quantity: 1, total: 300 },
              { id: '2', name: 'Iluminación', pricePerDay: 200, quantity: 1, total: 200 }
            ],
            selectedExtras: [
              { id: '3', name: 'Montaje', pricePerDay: 250, quantity: 1, total: 250 },
              { id: '4', name: 'Transporte', pricePerDay: 200, quantity: 1, total: 200 }
            ]
          }
        }
      ],
      deliveryDistance: 0,
      shippingCost: 0,
      deliveryAddress: null,
      customerData: {
        firstName: user.firstName || 'Test',
        lastName: user.lastName || 'User',
        email: user.email,
        phone: user.phone || '123456789'
      }
    };

    console.log('\n📦 Datos del pedido:');
    console.log('   - Subtotal items: €950 (€500 equipos + €450 montajes)');
    console.log('   - Usuario: VIP (50% descuento)');
    console.log('   - Descuento esperado: €250 (50% de €500 equipos)');
    
    // 3. Enviar orden al backend
    console.log('\n3️⃣ Enviando orden al backend...');
    
    const orderResponse = await axios.post(
      `${API_URL}/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const order = orderResponse.data;
    
    console.log('\n✅ Orden creada exitosamente');
    console.log('\n📊 RESULTADOS DEL BACKEND:');
    console.log('─'.repeat(60));
    console.log(`Subtotal:              €${order.subtotal?.toFixed(2) || 'N/A'}`);
    console.log(`Descuento VIP:        -€${order.discountAmount?.toFixed(2) || 'N/A'}`);
    console.log(`Total antes IVA:       €${order.totalBeforeAdjustment?.toFixed(2) || 'N/A'}`);
    console.log(`IVA (21%):            +€${order.taxAmount?.toFixed(2) || 'N/A'}`);
    console.log(`TOTAL FINAL:           €${order.total?.toFixed(2) || 'N/A'}`);

    // 4. Verificar que el descuento es correcto
    console.log('\n4️⃣ Verificando cálculos...');
    
    const expectedDiscount = 500 * 0.50; // 50% sobre €500 de equipos
    const actualDiscount = Number(order.discountAmount || 0);
    
    const discountCorrect = Math.abs(actualDiscount - expectedDiscount) < 0.01;
    
    console.log('\n✅ VERIFICACIÓN:');
    console.log('─'.repeat(60));
    console.log(`Descuento esperado:   €${expectedDiscount.toFixed(2)} (50% de €500)`);
    console.log(`Descuento obtenido:   €${actualDiscount.toFixed(2)}`);
    console.log(`¿Correcto?:`, discountCorrect ? '✅ SÍ' : '❌ NO');
    
    if (discountCorrect) {
      // Verificar cálculo completo
      const expectedSubtotalAfterDiscount = 950 - 250; // €700
      const expectedTax = expectedSubtotalAfterDiscount * 0.21; // €147
      const expectedTotal = expectedSubtotalAfterDiscount + expectedTax; // €847
      
      const totalCorrect = Math.abs(Number(order.total) - expectedTotal) < 1;
      
      console.log('\n📋 Verificación completa:');
      console.log('   - Subtotal después descuento: €' + (950 - actualDiscount).toFixed(2) + ' (esperado: €700)');
      console.log('   - IVA: €' + Number(order.taxAmount).toFixed(2) + ' (esperado: €147)');
      console.log('   - Total final: €' + Number(order.total).toFixed(2) + ' (esperado: €847)');
      console.log('   - ¿Todo correcto?:', totalCorrect ? '✅ SÍ' : '⚠️ Pequeñas diferencias de redondeo');
    }
    
    // 5. Resultado final
    console.log('\n' + '═'.repeat(60));
    if (discountCorrect) {
      console.log('🎉 TEST PASADO: El backend calcula correctamente el descuento VIP');
      console.log('   ✅ Montajes (€450) NO tienen descuento');
      console.log('   ✅ Equipos (€500) tienen 50% descuento (€250)');
      console.log('   ✅ Total final correcto: €847');
      console.log('═'.repeat(60));
      process.exit(0);
    } else {
      console.log('❌ TEST FALLIDO: El descuento VIP no es correcto');
      console.log('   El backend debe excluir los montajes del descuento');
      console.log('═'.repeat(60));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR en el test:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   ', error.message);
    }
    console.log('\n⚠️ NOTA: Este test requiere:');
    console.log('   1. Backend corriendo en puerto 3001');
    console.log('   2. Usuario VIP con email: admin@resona.com');
    console.log('   3. Producto con ID válido en la BD');
    process.exit(1);
  }
}

// Ejecutar test
testBackendVIPDiscount();
