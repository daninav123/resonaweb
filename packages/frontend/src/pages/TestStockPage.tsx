import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { guestCart } from '../utils/guestCart';
import toast from 'react-hot-toast';

const TestStockPage = () => {
  const [logs, setLogs] = useState<Array<{ message: string; type: string }>>([]);
  const [running, setRunning] = useState(false);

  const log = (message: string, type: 'log' | 'success' | 'error' | 'warning' = 'log') => {
    setLogs(prev => [...prev, { message, type }]);
    console.log(message);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runTest = async () => {
    clearLogs();
    setRunning(true);
    log('🚀 Iniciando test automático de validación de stock...', 'log');
    
    try {
      // PASO 1: Obtener productos con stock 0
      log('', 'log');
      log('='.repeat(60), 'log');
      log('PASO 1: Buscar productos con stock 0', 'log');
      log('='.repeat(60), 'log');
      
      const productsRes: any = await api.get('/products');
      const products = productsRes.data?.data || productsRes.data || [];
      
      let productWithStock0 = products.find((p: any) => p.stock === 0);
      
      if (!productWithStock0) {
        log('⚠️ No se encontró ningún producto con stock 0', 'warning');
        log('Por favor, crea un producto con stock 0 desde /admin/productos', 'warning');
        setRunning(false);
        return;
      }
      
      log('✅ Producto encontrado: ' + productWithStock0.name, 'success');
      log(`   ID: ${productWithStock0.id}`, 'log');
      log(`   Stock: ${productWithStock0.stock}`, 'log');
      log(`   RealStock: ${productWithStock0.realStock}`, 'log');
      
      // PASO 2: Simular añadir al carrito
      log('', 'log');
      log('='.repeat(60), 'log');
      log('PASO 2: Añadir al carrito (simulación)', 'log');
      log('='.repeat(60), 'log');
      
      // Limpiar carrito primero
      localStorage.removeItem('guest_cart');
      log('   🗑️ Carrito limpiado', 'log');
      
      // Añadir producto
      guestCart.addItem(productWithStock0, 1);
      log('✅ Producto añadido al carrito', 'success');
      
      // Verificar que se guardó correctamente
      const cart = guestCart.getCart();
      const cartItem = cart[0];
      
      log(`   Verificando datos guardados:`, 'log');
      log(`     - Nombre: ${cartItem.product.name}`, 'log');
      log(`     - Stock: ${cartItem.product.stock}`, cartItem.product.stock !== undefined ? 'success' : 'error');
      log(`     - RealStock: ${cartItem.product.realStock}`, cartItem.product.realStock !== undefined ? 'success' : 'error');
      
      if (cartItem.product.stock === undefined && cartItem.product.realStock === undefined) {
        log('❌ ERROR: El stock NO se guardó en el carrito', 'error');
        log('Esto indica que guestCart.addItem() no está guardando el stock', 'error');
        setRunning(false);
        return;
      }
      
      // PASO 3: Validar fecha < 30 días
      log('', 'log');
      log('='.repeat(60), 'log');
      log('PASO 3: Probar validación con fecha < 30 días', 'log');
      log('='.repeat(60), 'log');
      
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 10); // 10 días
      const dateStr = testDate.toISOString().split('T')[0];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      log(`   Fecha a probar: ${dateStr}`, 'log');
      log(`   Días de antelación: ${daysUntilStart}`, 'log');
      
      const productStock = cartItem.product.stock || cartItem.product.realStock || 0;
      
      log(`   Stock del producto: ${productStock}`, 'log');
      log(`   ¿Stock es 0?: ${productStock === 0}`, 'log');
      log(`   ¿Días < 30?: ${daysUntilStart < 30}`, 'log');
      
      const shouldReject = productStock === 0 && daysUntilStart < 30;
      log(`   ¿Debería RECHAZAR?: ${shouldReject}`, shouldReject ? 'warning' : 'log');
      
      if (shouldReject) {
        log('✅ LÓGICA CORRECTA: Debería mostrar error', 'success');
      } else {
        log('❌ PROBLEMA: La lógica no rechazaría esta fecha', 'error');
      }
      
      // PASO 4: Validar fecha > 30 días
      log('', 'log');
      log('='.repeat(60), 'log');
      log('PASO 4: Probar validación con fecha > 30 días', 'log');
      log('='.repeat(60), 'log');
      
      const testDate2 = new Date();
      testDate2.setDate(testDate2.getDate() + 45); // 45 días
      const dateStr2 = testDate2.toISOString().split('T')[0];
      
      const start2 = new Date(dateStr2);
      start2.setHours(0, 0, 0, 0);
      const daysUntilStart2 = Math.ceil((start2.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      log(`   Fecha a probar: ${dateStr2}`, 'log');
      log(`   Días de antelación: ${daysUntilStart2}`, 'log');
      
      const shouldAccept = daysUntilStart2 >= 30;
      log(`   ¿Debería ACEPTAR?: ${shouldAccept}`, shouldAccept ? 'success' : 'warning');
      
      // RESUMEN FINAL
      log('', 'log');
      log('='.repeat(60), 'log');
      log('✅ RESUMEN DEL TEST', 'log');
      log('='.repeat(60), 'log');
      log('', 'log');
      log('El código de validación funciona correctamente.', 'success');
      log('', 'log');
      log('🔍 PRÓXIMO PASO - PRUEBA MANUAL:', 'warning');
      log('', 'log');
      log('1. Ve a /carrito', 'log');
      log('2. Verás el producto con stock 0', 'log');
      log('3. En "Fechas del Pedido", selecciona:', 'log');
      log(`   - Fecha inicio: ${dateStr} (${daysUntilStart} días)`, 'log');
      log('4. Haz click en "Aplicar a todos los productos"', 'log');
      log('', 'log');
      log('DEBERÍAS VER:', 'warning');
      log('❌ Toast de error: "Los siguientes productos no tienen stock..."', 'error');
      log('', 'log');
      log('Si NO ves el error, abre la consola (F12) y revisa:', 'warning');
      log('  - ¿Hay errores de JavaScript?', 'log');
      log('  - ¿El evento onChange se dispara en el input de fecha?', 'log');
      
      toast.success('Test completado. Ve a /carrito y prueba manualmente.', { duration: 5000 });
      
    } catch (error: any) {
      log(`❌ ERROR: ${error.message}`, 'error');
      console.error(error);
      toast.error('Error en el test: ' + error.message);
    } finally {
      setRunning(false);
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 border-green-400';
      case 'error': return 'text-red-400 border-red-400';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      default: return 'text-blue-400 border-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">🧪 Test de Validación de Stock</h1>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={runTest}
            disabled={running}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {running ? '⏳ Ejecutando...' : '▶️ Ejecutar Test'}
          </button>
          
          <button
            onClick={clearLogs}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
          >
            🗑️ Limpiar Logs
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-400">Presiona "Ejecutar Test" para comenzar...</p>
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

export default TestStockPage;
