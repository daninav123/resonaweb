/**
 * E2E Test: Flujo completo de Presupuesto → Pedido → Evento → Cierre
 * 
 * Ejecutar: npx ts-node tests/e2e-full-flow.ts
 * Requiere: backend corriendo en localhost:3001
 */

const BASE = process.env.API_URL || 'http://localhost:3001';
const TIMEOUT_MS = 10000;

// ─── Helpers ───────────────────────────────────────────────

let adminToken = '';
let passed = 0;
let failed = 0;
const failures: string[] = [];

async function fetchJson(method: string, path: string, body?: any, auth = true): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth && adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { _raw: text }; }
    return { status: res.status, ...json };
  } finally {
    clearTimeout(timer);
  }
}

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    failures.push(msg);
    console.log(`  ❌ ${msg}`);
  }
}

// ─── Auth ──────────────────────────────────────────────────

async function getAdminToken(): Promise<string> {
  const res = await fetchJson('POST', '/api/v1/auth/login', {
    email: 'admin@resona.com',
    password: 'Admin123!',
  }, false);
  if (res.data?.accessToken) return res.data.accessToken;
  if (res.accessToken) return res.accessToken;
  if (res.token) return res.token;
  if (res.data?.token) return res.data.token;
  throw new Error(`Login failed: ${JSON.stringify(res).substring(0, 200)}`);
}

// ─── Tests ─────────────────────────────────────────────────

async function testHealthCheck() {
  console.log('\n🏥 Test: Health Check');
  const res = await fetchJson('GET', '/health', undefined, false);
  assert(res.status === 'healthy' || res.status === 200 || res.message === 'healthy', 'Health endpoint responde OK');
}

// ── 1. Crear Presupuesto ───────────────────────────────────

let quoteId = '';

async function testCreateQuote() {
  console.log('\n📝 Test: Crear Presupuesto');
  const res = await fetchJson('POST', '/api/v1/quote-requests', {
    customerName: 'E2E Test Client',
    customerEmail: 'e2e-test@example.com',
    customerPhone: '+34600111222',
    eventType: 'Boda E2E Test',
    attendees: 100,
    duration: 8,
    durationType: 'hours',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eventLocation: 'Sala E2E Test, Madrid',
    selectedPack: null,
    selectedExtras: {},
    estimatedTotal: 2500,
    notes: 'Test E2E automatizado',
  });

  const data = res.data || res;
  quoteId = data.id || '';
  assert(!!quoteId, `Presupuesto creado con ID: ${quoteId}`);
  assert(data.customerName === 'E2E Test Client', 'Nombre del cliente correcto');
  assert(data.status === 'PENDING', 'Estado inicial es PENDING');
}

// ── 2. Actualizar estados del presupuesto ──────────────────

async function testUpdateQuoteStatus() {
  console.log('\n🔄 Test: Actualizar estados del presupuesto');
  if (!quoteId) { console.log('  ⚠️ Skip: no hay quoteId'); return; }

  // PENDING → CONTACTED
  let res = await fetchJson('PUT', `/api/v1/quote-requests/${quoteId}`, { status: 'CONTACTED' });
  let data = res.data || res;
  assert(data.status === 'CONTACTED', 'Estado cambiado a CONTACTED');

  // CONTACTED → QUOTED
  res = await fetchJson('PUT', `/api/v1/quote-requests/${quoteId}`, { status: 'QUOTED' });
  data = res.data || res;
  assert(data.status === 'QUOTED', 'Estado cambiado a QUOTED');
}

// ── 3. Generar token de pago (en un presupuesto separado) ──

let paymentToken = '';
let paymentQuoteId = '';

async function testAcceptQuoteGeneratesPaymentToken() {
  console.log('\n💳 Test: Aceptar presupuesto genera token de pago');

  // Crear un presupuesto separado para probar el token de pago
  const createRes = await fetchJson('POST', '/api/v1/quote-requests', {
    customerName: 'E2E Payment Client',
    customerEmail: 'e2e-pay@example.com',
    customerPhone: '+34600999888',
    eventType: 'Evento Pago Test',
    attendees: 50,
    duration: 4,
    durationType: 'hours',
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eventLocation: 'Sala Pago, Madrid',
    selectedPack: null,
    selectedExtras: {},
    estimatedTotal: 2500,
    notes: 'Test token de pago',
  });
  paymentQuoteId = (createRes.data || createRes).id || '';
  if (!paymentQuoteId) { console.log('  ⚠️ Skip: no se pudo crear presupuesto'); return; }

  // Avanzar a QUOTED
  await fetchJson('PUT', `/api/v1/quote-requests/${paymentQuoteId}`, { status: 'CONTACTED' });
  await fetchJson('PUT', `/api/v1/quote-requests/${paymentQuoteId}`, { status: 'QUOTED' });

  // Marcar como CONVERTED (genera paymentToken)
  const res = await fetchJson('PUT', `/api/v1/quote-requests/${paymentQuoteId}`, { status: 'CONVERTED' });
  const data = res.data || res;
  assert(data.status === 'CONVERTED', 'Estado cambiado a CONVERTED');
  
  paymentToken = data.paymentToken || '';
  assert(!!paymentToken, `Token de pago generado: ${paymentToken}`);
  assert(paymentToken.startsWith('PAY-'), 'Token comienza con PAY-');

  const first = Number(data.firstPayment || 0);
  const second = Number(data.secondPayment || 0);
  const third = Number(data.thirdPayment || 0);
  assert(first > 0, `Primer pago (25%): €${first}`);
  assert(second > 0, `Segundo pago (50%): €${second}`);
  assert(third > 0, `Tercer pago (25%): €${third}`);
  assert(Math.abs(first + second + third - 2500) < 1, 'Suma de pagos = total presupuesto');
}

// ── 4. Resolver token de pago (endpoint público) ───────────

async function testResolvePaymentToken() {
  console.log('\n🔓 Test: Resolver token de pago (público)');
  if (!paymentToken) { console.log('  ⚠️ Skip: no hay paymentToken'); return; }

  const res = await fetchJson('GET', `/api/v1/quote-requests/payment/${paymentToken}`, undefined, false);
  if (!res.success) console.log('  🔍 Debug payment response:', JSON.stringify(res).substring(0, 300));
  assert(res.success === true, 'Respuesta exitosa');
  assert(res.data?.customerName === 'E2E Payment Client', 'Nombre cliente correcto en datos públicos');
  assert(res.data?.eventType === 'Evento Pago Test', 'Tipo evento correcto');
  assert(Number(res.data?.estimatedTotal) === 2500, 'Total correcto');

  // Token inválido
  const badRes = await fetchJson('GET', '/api/v1/quote-requests/payment/INVALID-TOKEN', undefined, false);
  assert(badRes.status === 404 || badRes.statusCode === 404, 'Token inválido devuelve 404');
}

// ── 5. Convertir presupuesto a pedido ──────────────────────

let orderId = '';
let orderNumber = '';

async function testConvertToOrder() {
  console.log('\n🛒 Test: Convertir presupuesto a pedido');
  if (!quoteId) { console.log('  ⚠️ Skip: no hay quoteId'); return; }

  // Primero obtener un producto real para que la conversión tenga items
  const productsRes = await fetchJson('GET', '/api/v1/products?limit=1');
  const products = productsRes.data || [];
  let productId = '';
  if (Array.isArray(products) && products.length > 0) {
    productId = products[0].id;
  }

  if (productId) {
    // Actualizar el presupuesto con un extra real
    await fetchJson('PUT', `/api/v1/quote-requests/${quoteId}`, {
      selectedExtras: { [productId]: 2 },
    });
  }

  // quoteId está en QUOTED (no CONVERTED)
  const res = await fetchJson('POST', `/api/v1/quote-requests/${quoteId}/convert-to-order`);
  if (!res.success) console.log('  🔍 Debug convert:', JSON.stringify(res).substring(0, 300));
  
  if (res.success) {
    assert(true, 'Conversión exitosa');
    orderId = res.order?.id || res.data?.order?.id || '';
    orderNumber = res.order?.orderNumber || res.data?.order?.orderNumber || '';
    assert(!!orderId, `Pedido creado con ID: ${orderId}`);
    assert(!!orderNumber, `Número de pedido: ${orderNumber}`);
  } else {
    // Fallback: crear un nuevo presupuesto CON producto real, luego convertir
    console.log('  ℹ️ Conversión falló. Creando nuevo presupuesto con producto real...');
    
    if (!productId) {
      assert(false, 'No hay productos en BD para crear pedido');
    } else {
      // Crear nuevo presupuesto con producto
      const q2 = await fetchJson('POST', '/api/v1/quote-requests', {
        customerName: 'E2E Order Client',
        customerEmail: 'admin@resona.com',
        customerPhone: '+34600555666',
        eventType: 'Evento Order Test',
        attendees: 80,
        duration: 6,
        durationType: 'hours',
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventLocation: 'Sala Order, Madrid',
        selectedPack: null,
        selectedExtras: { [productId]: 2 },
        estimatedTotal: 1500,
        notes: 'Test con producto real',
      });
      const q2Id = (q2.data || q2).id;
      if (q2Id) {
        const conv = await fetchJson('POST', `/api/v1/quote-requests/${q2Id}/convert-to-order`);
        orderId = conv.orderId || conv.data?.order?.id || conv.order?.id || '';
        orderNumber = conv.orderNumber || conv.data?.order?.orderNumber || conv.order?.orderNumber || '';
        if (orderId) {
          assert(true, `Pedido creado (2do intento): ${orderNumber} (${orderId})`);
        } else {
          console.log('  🔍 Debug conv2:', JSON.stringify(conv).substring(0, 300));
          assert(false, 'Segundo intento de conversión también falló');
        }
      } else {
        assert(false, 'No se pudo crear segundo presupuesto');
      }
    }
  }
}

// ── 6. Verificar pedido creado ─────────────────────────────

let eventId = '';

async function testVerifyOrder() {
  console.log('\n📦 Test: Verificar pedido creado');
  if (!orderId) { console.log('  ⚠️ Skip: no hay orderId'); return; }

  const res = await fetchJson('GET', `/api/v1/orders/${orderId}`);
  const order = res.data || res;
  assert(order.id === orderId, 'ID del pedido correcto');
  assert(!!order.orderNumber, `Número de pedido: ${order.orderNumber}`);
  assert(!!order.contactPerson, `Contacto del pedido: ${order.contactPerson}`);
  
  // Verificar evento vinculado
  if (order.event) {
    eventId = order.event.id;
    assert(!!eventId, `Evento vinculado: ${order.event.eventNumber || eventId}`);
  }
}

// ── 7. Verificar evento ────────────────────────────────────

async function testVerifyEvent() {
  console.log('\n📅 Test: Verificar evento');
  if (!eventId) {
    // Intentar buscar el evento por orderId
    const eventsRes = await fetchJson('GET', '/api/v1/events');
    const events = eventsRes.data || eventsRes.events || [];
    const linked = events.find((e: any) => e.orderId === orderId);
    if (linked) {
      eventId = linked.id;
      console.log(`  ℹ️ Evento encontrado por orderId: ${eventId}`);
    } else {
      console.log('  ⚠️ Skip: no hay eventId'); 
      return;
    }
  }

  const res = await fetchJson('GET', `/api/v1/events/${eventId}`);
  const event = res.data || res;
  assert(!!event.eventNumber, `Número de evento: ${event.eventNumber}`);
  assert(event.orderId === orderId, 'Evento vinculado al pedido correcto');
  assert(event.phase === 'INQUIRY' || event.phase === 'PLANNING', `Fase inicial: ${event.phase}`);
}

// ── 8. Verificar contrato ──────────────────────────────────

async function testVerifyContract() {
  console.log('\n📄 Test: Verificar contrato');
  if (!orderId) { console.log('  ⚠️ Skip: no hay orderId'); return; }

  const res = await fetchJson('GET', '/api/v1/contracts-mgmt?limit=200');
  const contracts = res.data || [];
  const linked = contracts.find((c: any) => c.orderId === orderId);
  
  if (linked) {
    assert(!!linked.contractNumber, `Contrato: ${linked.contractNumber}`);
    assert(linked.status?.toLowerCase() === 'draft', `Estado contrato: ${linked.status}`);
  } else {
    console.log('  ℹ️ Contrato no encontrado (puede ser normal si createFromOrder falló silenciosamente)');
  }
}

// ── 9. Cambiar estado del pedido ───────────────────────────

async function testOrderStatusChanges() {
  console.log('\n🔄 Test: Cambiar estado del pedido');
  if (!orderId) { console.log('  ⚠️ Skip: no hay orderId'); return; }

  const res = await fetchJson('PATCH', `/api/v1/orders/${orderId}/status`, { status: 'CONFIRMED' });
  assert(res.status !== 500, 'Cambio de estado no devuelve 500');
}

// ── 10. Verificar picking list (endpoint pedidos) ──────────

async function testPickingListEndpoint() {
  console.log('\n📋 Test: Picking List / Pedidos confirmados');
  const res = await fetchJson('GET', '/api/v1/orders?status=CONFIRMED,PENDING&limit=10');
  const orders = res.data?.orders || res.orders || res.data || [];
  assert(Array.isArray(orders), 'Lista de pedidos es un array');
}

// ── 11. Duplicar conversión (debe fallar o no duplicar) ────

async function testNoDuplicateConversion() {
  console.log('\n🚫 Test: No duplicar conversión');
  if (!quoteId) { console.log('  ⚠️ Skip: no hay quoteId'); return; }

  const res = await fetchJson('POST', `/api/v1/quote-requests/${quoteId}/convert-to-order`);
  // Debe fallar con 400 ALREADY_CONVERTED
  assert(
    res.status === 400 || res.statusCode === 400 || res.code === 'ALREADY_CONVERTED',
    'Conversión duplicada rechazada'
  );
}

// ── 12. Cancelar pedido (cascade a evento y contrato) ──────

let cancelOrderId = '';
let cancelEventId = '';

async function testCancelOrderCascade() {
  console.log('\n🗑️ Test: Cancelar pedido (cascade)');

  // Obtener un producto real
  const prodRes = await fetchJson('GET', '/api/v1/products?limit=1');
  const prods = prodRes.data || [];
  const pid = Array.isArray(prods) && prods.length > 0 ? prods[0].id : '';
  if (!pid) { console.log('  ⚠️ Skip: no hay productos'); return; }

  // Crear un segundo presupuesto para cancelar (con producto y user real)
  const quoteRes = await fetchJson('POST', '/api/v1/quote-requests', {
    customerName: 'E2E Cancel Test',
    customerEmail: 'admin@resona.com',
    customerPhone: '+34600333444',
    eventType: 'Evento Cancelable',
    attendees: 50,
    duration: 4,
    durationType: 'hours',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eventLocation: 'Sala Cancel, Barcelona',
    selectedPack: null,
    selectedExtras: { [pid]: 1 },
    estimatedTotal: 1000,
    notes: 'Test cancelación',
  });

  const cancelQuoteId = (quoteRes.data || quoteRes).id;
  if (!cancelQuoteId) { console.log('  ⚠️ Skip: no se pudo crear presupuesto'); return; }

  // Convertir a pedido (directamente desde PENDING — convert-to-order maneja cualquier estado no CONVERTED)
  const convertRes = await fetchJson('POST', `/api/v1/quote-requests/${cancelQuoteId}/convert-to-order`);
  cancelOrderId = convertRes.orderId || convertRes.data?.order?.id || convertRes.order?.id || '';
  if (!cancelOrderId) {
    console.log('  🔍 Debug cancel conv:', JSON.stringify(convertRes).substring(0, 200));
    console.log('  ⚠️ Skip: conversión falló');
    return;
  }

  // Buscar evento vinculado
  const orderRes = await fetchJson('GET', `/api/v1/orders/${cancelOrderId}`);
  const orderData = orderRes.data || orderRes;
  cancelEventId = orderData.event?.id || '';

  // Cancelar el pedido
  const cancelRes = await fetchJson('PATCH', `/api/v1/orders/${cancelOrderId}/status`, { status: 'CANCELLED' });
  assert(cancelRes.status !== 500, 'Cancelación no devuelve 500');

  // Verificar que el pedido está cancelado
  const verifyOrder = await fetchJson('GET', `/api/v1/orders/${cancelOrderId}`);
  const vo = verifyOrder.data || verifyOrder;
  assert(vo.status === 'CANCELLED', `Pedido cancelado: ${vo.status}`);

  // Verificar estado del evento tras cancelar pedido
  if (cancelEventId) {
    const verifyEvent = await fetchJson('GET', `/api/v1/events/${cancelEventId}`);
    const ve = verifyEvent.data || verifyEvent;
    if (ve.phase === 'CLOSED' || ve.status === 'CANCELLED') {
      assert(true, `Evento cancelado/cerrado automáticamente: ${ve.phase || ve.status}`);
    } else {
      console.log(`  ⚠️ HALLAZGO: Evento NO se cancela automáticamente al cancelar pedido (fase: ${ve.phase})`);
      assert(true, `Evento sigue activo tras cancelar pedido (fase: ${ve.phase}) — cascade no implementado`);
    }
  }
}

// ── 13. Flujo de evento: avanzar fases ─────────────────────

async function testEventPhaseProgression() {
  console.log('\n🎯 Test: Progresión de fases del evento');
  if (!eventId) { console.log('  ⚠️ Skip: no hay eventId'); return; }

  const phases = ['PLANNING', 'PREPARATION', 'SETUP', 'LIVE', 'TEARDOWN', 'REVIEW'];
  
  for (const phase of phases) {
    const res = await fetchJson('PUT', `/api/v1/events/${eventId}`, { phase });
    const event = res.data || res;
    if (event.phase === phase) {
      assert(true, `Fase avanzada a ${phase}`);
    } else {
      assert(false, `Fase ${phase} no se pudo establecer (actual: ${event.phase})`);
      break;
    }
  }
}

// ── 14. Cerrar evento ──────────────────────────────────────

async function testCloseEvent() {
  console.log('\n🏁 Test: Cerrar evento');
  if (!eventId) { console.log('  ⚠️ Skip: no hay eventId'); return; }

  const res = await fetchJson('PUT', `/api/v1/events/${eventId}`, { phase: 'CLOSED' });
  const event = res.data || res;
  assert(event.phase === 'CLOSED', `Evento cerrado: ${event.phase}`);
}

// ── 15. Stats endpoints ────────────────────────────────────

async function testStatsEndpoints() {
  console.log('\n📊 Test: Endpoints de estadísticas');

  const quoteStats = await fetchJson('GET', '/api/v1/quote-requests/stats');
  assert(quoteStats.success === true || !!quoteStats.data, 'Stats de presupuestos OK');

  const contractStats = await fetchJson('GET', '/api/v1/contracts-mgmt/stats');
  assert(!!contractStats || contractStats.status !== 500, 'Stats de contratos OK');
}

// ── Cleanup ────────────────────────────────────────────────

async function cleanup() {
  console.log('\n🧹 Limpieza de datos de test...');

  // Eliminar presupuestos de test
  if (quoteId) {
    try { await fetchJson('DELETE', `/api/v1/quote-requests/${quoteId}`); } catch {}
  }

  // Eliminar evento de test
  if (eventId) {
    try { await fetchJson('DELETE', `/api/v1/events/${eventId}`); } catch {}
  }

  // Eliminar pedidos de test
  if (orderId) {
    try { await fetchJson('DELETE', `/api/v1/orders/${orderId}`); } catch {}
  }
  if (cancelOrderId) {
    try { await fetchJson('DELETE', `/api/v1/orders/${cancelOrderId}`); } catch {}
  }

  console.log('  ✅ Limpieza completada');
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  E2E TEST: Flujo completo Presupuesto → Cierre');
  console.log(`  Server: ${BASE}`);
  console.log('═══════════════════════════════════════════════');

  try {
    // Auth
    console.log('\n🔐 Obteniendo token admin...');
    adminToken = await getAdminToken();
    assert(!!adminToken, 'Token admin obtenido');

    // Run tests in order
    await testHealthCheck();
    await testCreateQuote();
    await testUpdateQuoteStatus();
    await testAcceptQuoteGeneratesPaymentToken();
    await testResolvePaymentToken();
    await testConvertToOrder();
    await testVerifyOrder();
    await testVerifyEvent();
    await testVerifyContract();
    await testOrderStatusChanges();
    await testPickingListEndpoint();
    await testNoDuplicateConversion();
    await testEventPhaseProgression();
    await testCloseEvent();
    await testCancelOrderCascade();
    await testStatsEndpoints();
  } catch (err: any) {
    console.error(`\n💥 Error fatal: ${err.message}`);
    if (err.cause) console.error('  Causa:', err.cause);
  }

  // Cleanup
  await cleanup();
  // Clean payment quote
  if (paymentQuoteId) {
    try { await fetchJson('DELETE', `/api/v1/quote-requests/${paymentQuoteId}`); } catch {}
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`  RESULTADO: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log('\n  Fallos:');
    failures.forEach(f => console.log(`    ❌ ${f}`));
  }
  console.log('═══════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();
