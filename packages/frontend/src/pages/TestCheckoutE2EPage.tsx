import { useState } from 'react';
import { api } from '../services/api';
import { guestCart } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';

const TestCheckoutE2EPage = () => {
  const { user, login } = useAuthStore();
  const [logs, setLogs] = useState<Array<{ message: string; type: string; timestamp: Date }>>([]);
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'failed'>('pending');

  const log = (message: string, type: 'log' | 'success' | 'error' | 'warning' = 'log') => {
    const entry = { message, type, timestamp: new Date() };
    setLogs(prev => [...prev, entry]);
    console.log(`[${type.toUpperCase()}]`, message);
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResult('pending');
  };

  const runFullE2ETest = async () => {
    clearLogs();
    setRunning(true);
    setTestResult('pending');
    
    log('🚀 INICIANDO TEST E2E COMPLETO DE CHECKOUT', 'log');
    log('='.repeat(80), 'log');
    log('', 'log');

    try {
      // PASO 1: LOGIN
      log('🔐 PASO 1: Autenticación', 'log');
      log('-'.repeat(80), 'log');
      
      if (!user) {
        log('Iniciando sesión con danielnavarrocampos@icloud.com...', 'log');
        const loginSuccess = await login('danielnavarrocampos@icloud.com', 'Daniel123!');
        
        if (!loginSuccess) {
          log('❌ FALLO: No se pudo iniciar sesión', 'error');
          setTestResult('failed');
          setRunning(false);
          return;
        }
        log('✅ Login exitoso', 'success');
      } else {
        log(`✅ Ya autenticado como: ${user.email}`, 'success');
      }
      log('', 'log');

      // PASO 2: BUSCAR PRODUCTO CON STOCK 0
      log('📦 PASO 2: Buscando producto con stock 0', 'log');
      log('-'.repeat(80), 'log');
      
      const productsRes: any = await api.get('/products');
      const products = productsRes.data?.data || productsRes.data || [];
      
      const productWithStock0 = products.find((p: any) => p.stock === 0);
      
      if (!productWithStock0) {
        log('❌ FALLO: No hay productos con stock 0 para probar', 'error');
        setTestResult('failed');
        setRunning(false);
        return;
      }
      
      log(`✅ Producto encontrado: "${productWithStock0.name}"`, 'success');
      log(`   ID: ${productWithStock0.id}`, 'log');
      log(`   Stock: ${productWithStock0.stock}`, 'log');
      log(`   Precio por día: €${productWithStock0.pricePerDay}`, 'log');
      log('', 'log');

      // PASO 3: LIMPIAR Y PREPARAR CARRITO
      log('🛒 PASO 3: Preparando carrito', 'log');
      log('-'.repeat(80), 'log');
      
      guestCart.clear();
      log('✅ Carrito limpiado', 'log');
      
      const addedItem = guestCart.addItem(productWithStock0, 2);
      log(`✅ Producto añadido: ${addedItem.quantity}x "${productWithStock0.name}"`, 'success');
      log('', 'log');

      // PASO 4: ASIGNAR FECHAS CON 32 DÍAS DE ANTELACIÓN
      log('📅 PASO 4: Asignando fechas (32 días de antelación)', 'log');
      log('-'.repeat(80), 'log');
      
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + 32);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      log(`   Fecha inicio: ${startDateStr}`, 'log');
      log(`   Fecha fin: ${endDateStr}`, 'log');
      
      guestCart.updateDates(addedItem.id, startDateStr, endDateStr);
      log('✅ Fechas asignadas al carrito', 'success');
      
      const cartItems = guestCart.getCart();
      log(`   Items en carrito: ${cartItems.length}`, 'log');
      log(`   Primer item tiene fechas: ${cartItems[0].startDate ? 'SÍ' : 'NO'}`, cartItems[0].startDate ? 'success' : 'error');
      log('', 'log');

      // PASO 5: VALIDAR FRONTEND
      log('✅ PASO 5: Validando lógica del frontend', 'log');
      log('-'.repeat(80), 'log');
      
      const item = cartItems[0];
      const productStock = item.product.stock ?? 0;
      
      log(`   Stock del producto: ${productStock}`, 'log');
      log(`   Fecha inicio: ${item.startDate}`, 'log');
      
      if (productStock === 0 && item.startDate) {
        const todayCheck = new Date();
        todayCheck.setHours(0, 0, 0, 0);
        const start = new Date(item.startDate);
        start.setHours(0, 0, 0, 0);
        const daysUntilStart = Math.ceil((start.getTime() - todayCheck.getTime()) / (1000 * 60 * 60 * 24));
        
        log(`   Días de antelación: ${daysUntilStart}`, 'log');
        
        if (daysUntilStart < 30) {
          log('❌ VALIDACIÓN FRONTEND: Debería rechazar (< 30 días)', 'error');
          log('❌ FALLO: La fecha no es válida según el frontend', 'error');
          setTestResult('failed');
          setRunning(false);
          return;
        } else {
          log('✅ VALIDACIÓN FRONTEND: Acepta (≥ 30 días)', 'success');
        }
      }
      log('', 'log');

      // PASO 6: PREPARAR PAYLOAD PARA BACKEND
      log('📤 PASO 6: Preparando payload para backend', 'log');
      log('-'.repeat(80), 'log');
      
      const calculateDays = (start: string, end: string) => {
        const startD = new Date(start);
        const endD = new Date(end);
        const diffTime = Math.abs(endD.getTime() - startD.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };

      const orderItems = cartItems.map(item => {
        const days = calculateDays(item.startDate || '', item.endDate || '');
        const pricePerUnit = item.product.pricePerDay * days;
        const totalPrice = pricePerUnit * item.quantity;
        
        const startDateISO = item.startDate ? new Date(item.startDate + 'T00:00:00.000Z').toISOString() : new Date().toISOString();
        const endDateISO = item.endDate ? new Date(item.endDate + 'T23:59:59.999Z').toISOString() : new Date().toISOString();
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: pricePerUnit,
          totalPrice: totalPrice,
          startDate: startDateISO,
          endDate: endDateISO,
        };
      });

      const orderPayload = {
        items: orderItems,
        deliveryType: 'PICKUP',
        deliveryAddress: undefined,
        notes: 'Test E2E - Producto bajo pedido',
      };

      log('   Payload preparado:', 'log');
      log(JSON.stringify(orderPayload, null, 2), 'log');
      log('', 'log');

      // PASO 7: ENVIAR AL BACKEND
      log('🚀 PASO 7: Enviando orden al backend', 'log');
      log('-'.repeat(80), 'log');
      
      try {
        const response: any = await api.post('/orders', orderPayload);
        
        log('✅ ORDEN CREADA EXITOSAMENTE', 'success');
        log(`   Order ID: ${response.data?.id || response.data?.order?.id || 'N/A'}`, 'success');
        log(`   Order Number: ${response.data?.orderNumber || response.data?.order?.orderNumber || 'N/A'}`, 'success');
        log('', 'log');
        
        // LIMPIAR CARRITO
        guestCart.clear();
        log('✅ Carrito limpiado después del éxito', 'success');
        
        setTestResult('success');
        
      } catch (error: any) {
        log('❌ ERROR AL CREAR ORDEN', 'error');
        log('', 'log');
        
        const errorData = error.response?.data;
        log('Detalles del error:', 'error');
        log(JSON.stringify(errorData, null, 2), 'error');
        log('', 'log');
        
        if (errorData?.error?.details?.errors) {
          log('Errores de validación:', 'error');
          errorData.error.details.errors.forEach((err: string) => {
            log(`   • ${err}`, 'error');
          });
        }
        
        log('', 'log');
        log('🔍 DIAGNÓSTICO:', 'warning');
        
        if (errorData?.error?.details?.errors?.some((e: string) => e.includes('Stock insuficiente'))) {
          log('', 'log');
          log('❌ EL BACKEND NO TIENE LA LÓGICA DE "BAJO PEDIDO"', 'error');
          log('', 'log');
          log('Posibles causas:', 'warning');
          log('1. El backend NO se reinició después de los cambios', 'warning');
          log('2. Los cambios en cart.service.ts no se aplicaron', 'warning');
          log('3. El archivo compilado (.js) todavía tiene el código viejo', 'warning');
          log('', 'log');
          log('✅ SOLUCIÓN:', 'success');
          log('1. Ve a la terminal del backend', 'success');
          log('2. Presiona Ctrl+C para detener el servidor', 'success');
          log('3. Ejecuta: npm run dev', 'success');
          log('4. Espera a ver: "Server running on port 3001"', 'success');
          log('5. Vuelve a ejecutar este test', 'success');
        }
        
        setTestResult('failed');
      }

    } catch (error: any) {
      log('', 'log');
      log(`❌ ERROR FATAL: ${error.message}`, 'error');
      console.error(error);
      setTestResult('failed');
    } finally {
      setRunning(false);
      
      log('', 'log');
      log('='.repeat(80), 'log');
      log('TEST COMPLETADO', 'log');
      log('='.repeat(80), 'log');
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 border-green-400 bg-green-900/20';
      case 'error': return 'text-red-400 border-red-400 bg-red-900/20';
      case 'warning': return 'text-yellow-400 border-yellow-400 bg-yellow-900/20';
      default: return 'text-blue-400 border-blue-400 bg-blue-900/20';
    }
  };

  const getResultBadge = () => {
    switch (testResult) {
      case 'success':
        return <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">✅ TEST PASADO</span>;
      case 'failed':
        return <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">❌ TEST FALLADO</span>;
      default:
        return <span className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold">⏳ PENDIENTE</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">🧪 Test E2E - Checkout Completo</h1>
            <p className="text-gray-400 mt-2">Verifica todo el flujo: Login → Carrito → Fechas → Orden</p>
          </div>
          {getResultBadge()}
        </div>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={runFullE2ETest}
            disabled={running}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {running ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Ejecutando Test...
              </>
            ) : (
              <>▶️ Ejecutar Test E2E Completo</>
            )}
          </button>
          
          <button
            onClick={clearLogs}
            disabled={running}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50"
          >
            🗑️ Limpiar Logs
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm max-h-[700px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">Presiona "Ejecutar Test E2E Completo" para comenzar</p>
              <p className="text-gray-500 text-sm">
                Este test verificará automáticamente:<br />
                • Login de usuario<br />
                • Añadir producto al carrito<br />
                • Asignar fechas válidas<br />
                • Validación del frontend<br />
                • Envío de orden al backend<br />
                • Detección de errores
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((entry, index) => (
                <div
                  key={index}
                  className={`border-l-4 pl-3 py-1 ${getColorClass(entry.type)}`}
                >
                  {entry.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {testResult === 'failed' && (
          <div className="mt-6 p-6 bg-red-900/20 border border-red-500 rounded-lg">
            <h3 className="text-red-400 font-semibold text-lg mb-2">❌ Test Fallido</h3>
            <p className="text-red-300 text-sm">
              Revisa los logs arriba para ver exactamente dónde falló.<br />
              Si ves "Stock insuficiente", el backend NO se reinició correctamente.
            </p>
          </div>
        )}

        {testResult === 'success' && (
          <div className="mt-6 p-6 bg-green-900/20 border border-green-500 rounded-lg">
            <h3 className="text-green-400 font-semibold text-lg mb-2">✅ Test Pasado</h3>
            <p className="text-green-300 text-sm">
              ¡Todo funcionó correctamente! El flujo completo de checkout está operativo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCheckoutE2EPage;
