const fs = require('fs');
const path = require('path');

console.log('🔧 Corrección masiva de errores TypeScript...\n');

const fixes = [
  {
    file: 'src/services/notification.service.ts',
    replacements: [
      { from: 'orderItems:', to: 'items:' },
      { from: "payment.((order as any)", to: "((payment.order as any)" },
      { from: "invoice.((order as any)", to: "((invoice.order as any)" },
      { from: /\(\(order as any\)/g, to: '((invoice.order as any)' },
    ]
  },
  {
    file: 'src/services/logistics.service.ts',
    replacements: [
      { from: 'orderItems:', to: 'items:' },
    ]
  },
  {
    file: 'src/services/availability.service.ts',
    replacements: [
      { from: 'orderItems:', to: 'items:' },
    ]
  },
  {
    file: 'src/services/order.service.ts',
    replacements: [
      { from: 'eventLocation: data.eventLocation || null,', to: 'eventLocation: data.eventLocation || undefined,' },
      { from: 'IN_TRANSIT:', to: '// IN_TRANSIT:' },
    ]
  },
];

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} no encontrado`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    if (typeof from === 'string') {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        modified = true;
      }
    } else {
      // Es una regex
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} corregido`);
  } else {
    console.log(`ℹ️  ${file} sin cambios`);
  }
});

console.log('\n✅ Corrección completada!\n');
