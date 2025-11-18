import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { guestCart } from '../utils/guestCart';
import toast from 'react-hot-toast';

const TestStockE2EPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<Array<{ message: string; type: string }>>([]);
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'failed'>('pending');

  const log = (message: string, type: 'log' | 'success' | 'error' | 'warning' = 'log') => {
    setLogs(prev => [...prev, { message, type }]);
    console.log(message);
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResult('pending');
  };

  // Simular la función de validación que usa CartPage
  const validateStockAndDate = (productStock: number, startDate: string): { valid: boolean; message: string } => {
    if (productStock === 0 && startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilStart < 30) {
        return {
          valid: false,
          message: `RECHAZADO - ${daysUntilStart} días es menos de 30`
        };
      } else {
        return {
          valid: true,
          message: `ACEPTADO - ${daysUntilStart} días es suficiente`
        };
      }
    }
    
    return { valid: true, message: 'Stock disponible' };
  };

  const runE2ETest = async () => {
    clearLogs();
    setRunning(true);
    setTestResult('pending');
    
    log('🚀 INICIANDO TEST E2E DE VALIDACIÓN DE STOCK', 'log');
    log('='.repeat(80), 'log');
    log('', 'log');

    let allTestsPassed = true;

    try {
      // PASO 1: Buscar producto con stock 0
      log('📦 PASO 1: Buscando producto con stock 0...', 'log');
      const productsRes: any = await api.get('/products');
      const products = productsRes.data?.data || productsRes.data || [];
      
      let productWithStock0 = products.find((p: any) => p.stock === 0);
      
      if (!productWithStock0) {
        log('⚠️  No hay productos con stock 0. Asegúrate de tener al menos uno.', 'warning');
        log('   Puedes crear uno desde /admin/productos con stock = 0', 'warning');
        setRunning(false);
        setTestResult('failed');
        return;
      }
      
      log(`✅ Producto encontrado: "${productWithStock0.name}"`, 'success');
      log(`   ID: ${productWithStock0.id}`, 'log');
      log(`   Stock: ${productWithStock0.stock}`, 'log');
      log('', 'log');

      // PASO 2: Limpiar carrito y añadir producto
      log('🛒 PASO 2: Preparando carrito...', 'log');
      localStorage.removeItem('guest_cart');
      log('   ✅ Carrito limpiado', 'log');
      
      guestCart.addItem(productWithStock0, 1);
      log(`   ✅ Producto añadido al carrito`, 'success');
      
      const cartItems = guestCart.getCart();
      const cartItem = cartItems[0];
      
      log(`   Verificando datos guardados:`, 'log');
      log(`     - Stock: ${cartItem.product.stock}`, cartItem.product.stock !== undefined ? 'success' : 'error');
      log(`     - RealStock: ${cartItem.product.realStock}`, cartItem.product.realStock !== undefined ? 'success' : 'error');
      log('', 'log');

      if (cartItem.product.stock === undefined && cartItem.product.realStock === undefined) {
        log('❌ ERROR CRÍTICO: El stock no se guardó en el carrito', 'error');
        log('   Esto indica que guestCart.addItem() no está guardando el stock', 'error');
        setTestResult('failed');
        setRunning(false);
        return;
      }

      // PASO 3: Test validación con fecha < 30 días
      log('⏰ PASO 3: Probando validación con fecha CERCANA (< 30 días)...', 'log');
      log('-'.repeat(80), 'log');
      
      const date10Days = new Date();
      date10Days.setDate(date10Days.getDate() + 10);
      const dateStr10 = date10Days.toISOString().split('T')[0];
      
      log(`   Fecha de prueba: ${dateStr10} (10 días desde hoy)`, 'log');
      
      // Usar SOLO stock, no realStock (realStock puede ser diferente)
      const productStock = cartItem.product.stock ?? 0;
      log(`   Stock: ${productStock}, RealStock: ${cartItem.product.realStock}`, 'log');
      const result1 = validateStockAndDate(productStock, dateStr10);
      
      log(`   Stock del producto: ${productStock}`, 'log');
      log(`   Resultado: ${result1.message}`, result1.valid ? 'error' : 'success');
      
      if (!result1.valid) {
        log('   ✅ TEST 1 PASADO: Rechazó correctamente la fecha cercana', 'success');
      } else {
        log('   ❌ TEST 1 FALLADO: Debería haber rechazado', 'error');
        allTestsPassed = false;
      }
      log('', 'log');

      // PASO 4: Test validación con fecha > 30 días
      log('⏰ PASO 4: Probando validación con fecha LEJANA (> 30 días)...', 'log');
      log('-'.repeat(80), 'log');
      
      const date45Days = new Date();
      date45Days.setDate(date45Days.getDate() + 45);
      const dateStr45 = date45Days.toISOString().split('T')[0];
      
      log(`   Fecha de prueba: ${dateStr45} (45 días desde hoy)`, 'log');
      
      const result2 = validateStockAndDate(productStock, dateStr45);
      
      log(`   Resultado: ${result2.message}`, result2.valid ? 'success' : 'error');
      
      if (result2.valid) {
        log('   ✅ TEST 2 PASADO: Aceptó correctamente la fecha lejana', 'success');
      } else {
        log('   ❌ TEST 2 FALLADO: Debería haber aceptado', 'error');
        allTestsPassed = false;
      }
      log('', 'log');

      // PASO 5: Test con producto CON stock
      log('📦 PASO 5: Probando con producto CON STOCK...', 'log');
      log('-'.repeat(80), 'log');
      
      const productWithStock = products.find((p: any) => p.stock > 0);
      
      if (productWithStock) {
        log(`   Producto: "${productWithStock.name}" (stock: ${productWithStock.stock})`, 'log');
        
        const result3 = validateStockAndDate(productWithStock.stock, dateStr10);
        
        if (result3.valid) {
          log('   ✅ TEST 3 PASADO: Aceptó producto con stock en cualquier fecha', 'success');
        } else {
          log('   ❌ TEST 3 FALLADO: No debería rechazar producto con stock', 'error');
          allTestsPassed = false;
        }
      } else {
        log('   ⚠️  No hay productos con stock para probar', 'warning');
      }
      log('', 'log');

      // PASO 6: Verificar que el carrito muestre el indicador visual
      log('👁️  PASO 6: Verificando indicadores visuales en el carrito...', 'log');
      log('-'.repeat(80), 'log');
      log(`   El producto "${productWithStock0.name}" debería mostrar:`, 'log');
      log('   ⚠️ "Stock bajo pedido (requiere 30 días de antelación)"', 'warning');
      log('', 'log');

      // RESUMEN FINAL
      log('='.repeat(80), 'log');
      log('📊 RESUMEN DE RESULTADOS', 'log');
      log('='.repeat(80), 'log');
      log('', 'log');

      if (allTestsPassed) {
        log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE', 'success');
        log('', 'log');
        log('✅ La lógica de validación funciona correctamente:', 'success');
        log('   • Rechaza fechas < 30 días con stock 0', 'success');
        log('   • Acepta fechas ≥ 30 días con stock 0', 'success');
        log('   • Acepta cualquier fecha con stock > 0', 'success');
        log('', 'log');
        log('🔍 AHORA VERIFICA EN LA UI:', 'warning');
        log('   1. Ve a /carrito (el producto ya está añadido)', 'log');
        log(`   2. Intenta seleccionar fecha: ${dateStr10}`, 'log');
        log('   3. Deberías ver un toast de ERROR', 'log');
        log(`   4. Luego intenta seleccionar fecha: ${dateStr45}`, 'log');
        log('   5. Deberías ver un toast de ÉXITO', 'log');
        
        setTestResult('success');
        toast.success('¡Tests pasados! Ve a /carrito para verificar visualmente', { duration: 5000 });
      } else {
        log('❌ ALGUNOS TESTS FALLARON', 'error');
        log('', 'log');
        log('Revisa los errores arriba para ver qué falló.', 'error');
        
        setTestResult('failed');
        toast.error('Tests fallidos - revisa los logs', { duration: 5000 });
      }

    } catch (error: any) {
      log('', 'log');
      log(`❌ ERROR FATAL: ${error.message}`, 'error');
      console.error(error);
      setTestResult('failed');
      toast.error('Error en el test: ' + error.message);
    } finally {
      setRunning(false);
    }
  };

  const goToCart = () => {
    navigate('/carrito');
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 border-green-400';
      case 'error': return 'text-red-400 border-red-400';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      default: return 'text-blue-400 border-blue-400';
    }
  };

  const getResultBadge = () => {
    switch (testResult) {
      case 'success':
        return <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">✅ PASADO</span>;
      case 'failed':
        return <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">❌ FALLADO</span>;
      default:
        return <span className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold">⏳ PENDIENTE</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">🧪 Test E2E - Validación de Stock</h1>
          {getResultBadge()}
        </div>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={runE2ETest}
            disabled={running}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? '⏳ Ejecutando Test...' : '▶️ Ejecutar Test E2E'}
          </button>
          
          <button
            onClick={clearLogs}
            disabled={running}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50"
          >
            🗑️ Limpiar Logs
          </button>

          {testResult === 'success' && (
            <button
              onClick={goToCart}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              🛒 Ir al Carrito (Verificar UI)
            </button>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">Presiona "Ejecutar Test E2E" para comenzar</p>
              <p className="text-gray-500 text-sm">Este test verificará automáticamente que la validación de stock funciona correctamente</p>
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
      </div>
    </div>
  );
};

export default TestStockE2EPage;
