const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores de compilación...\n');

// Lista de archivos con problemas
const files = [
  'src/services/customer.service.ts',
  'src/services/invoice.service.ts',
  'src/services/logistics.service.ts',
  'src/services/notification.service.ts',
  'src/services/payment.service.ts',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} no encontrado`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Fix 1: order.(user as any) -> (order as any).user
  if (content.includes('order.(user as any)')) {
    content = content.replace(/order\.\(user as any\)/g, '(order as any).user');
    fixed = true;
  }

  // Fix 2: order.(deliveryAddress -> (order.deliveryAddress
  if (content.includes('order.(deliveryAddress')) {
    content = content.replace(/order\.\(deliveryAddress/g, '(order.deliveryAddress');
    fixed = true;
  }

  // Fix 3: delivery.((order -> ((order
  if (content.includes('delivery.((order')) {
    content = content.replace(/delivery\.\(\(order/g, '((order');
    fixed = true;
  }

  // Fix 4: payment.((order -> ((order
  if (content.includes('payment.((order')) {
    content = content.replace(/payment\.\(\(order/g, '((order');
    fixed = true;
  }

  // Fix 5: invoice.((order -> ((order
  if (content.includes('invoice.((order')) {
    content = content.replace(/invoice\.\(\(order/g, '((order');
    fixed = true;
  }

  // Fix 6: order.deliveryAddress || undefined -> order.deliveryAddress || ''
  if (content.includes('order.deliveryAddress || undefined')) {
    content = content.replace(/order\.deliveryAddress \|\| undefined/g, "order.deliveryAddress || ''");
    fixed = true;
  }

  if (fixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} corregido`);
  } else {
    console.log(`ℹ️  ${file} sin cambios`);
  }
});

console.log('\n✅ Corrección completada!\n');
console.log('Ejecutando build para verificar...\n');
