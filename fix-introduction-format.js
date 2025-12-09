const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'packages/frontend/src/pages/services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.tsx'));

console.log('\n🔧 REFORMATEANDO INTRODUCTION EN 20 PÁGINAS\n');

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Buscar el introduction y convertir saltos de línea a espacios
  content = content.replace(
    /(introduction:\s*`)([\s\S]*?)(`\s*,)/,
    (match, prefix, intro, suffix) => {
      // Convertir múltiples saltos de línea a un solo espacio
      const formattedIntro = intro
        .replace(/\n\n+/g, ' ') // Múltiples saltos -> espacio
        .replace(/\n/g, ' ') // Saltos simples -> espacio
        .replace(/\s+/g, ' ') // Múltiples espacios -> uno solo
        .trim();
      
      return prefix + formattedIntro + suffix;
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${file}`);
});

console.log(`\n✅ COMPLETADO: ${files.length} archivos reformateados`);
