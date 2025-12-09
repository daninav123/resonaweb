const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'packages/frontend/src/pages/services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.tsx'));

console.log('\n📊 ANÁLISIS DE PALABRAS EN PÁGINAS DE SERVICIO\n');
console.log('='.repeat(80));

const results = [];

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Contar palabras en introduction, technicalSpecs, faqs
  const introMatch = content.match(/introduction:\s*`([^`]+)`/);
  const specsMatch = content.match(/technicalSpecs:\s*\[([\s\S]*?)\],/);
  const faqsMatch = content.match(/faqs:\s*\[([\s\S]*?)\],/);
  
  let totalWords = 0;
  
  if (introMatch) {
    totalWords += introMatch[1].split(/\s+/).length;
  }
  if (specsMatch) {
    totalWords += specsMatch[1].split(/\s+/).length;
  }
  if (faqsMatch) {
    totalWords += faqsMatch[1].split(/\s+/).length;
  }
  
  results.push({
    file,
    words: totalWords,
    status: totalWords >= 1500 ? '✅' : '❌'
  });
});

// Ordenar por palabras
results.sort((a, b) => a.words - b.words);

results.forEach(r => {
  console.log(`${r.status} ${r.file.padEnd(45)} ${r.words} palabras`);
});

const completed = results.filter(r => r.words >= 1500).length;
const pending = results.length - completed;

console.log('='.repeat(80));
console.log(`\n✅ Completadas (>=1500 palabras): ${completed}/${results.length}`);
console.log(`❌ Pendientes (<1500 palabras): ${pending}/${results.length}`);
console.log(`\nPendientes de expandir:`);
results.filter(r => r.words < 1500).forEach(r => {
  console.log(`   - ${r.file} (${r.words} palabras, faltan ~${1500 - r.words})`);
});
