/**
 * Script para agregar canonicalUrl a todas las páginas de servicios
 * Soluciona problema de Google Search Console: 132 páginas sin indexar
 */

const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'packages/frontend/src/pages/services');

// Mapeo de archivo -> canonical URL
const canonicalUrls = {
  'AlquilerAltavocesProfesionales.tsx': 'https://resonaevents.com/servicios/alquiler-altavoces-profesionales',
  'AlquilerDJValencia.tsx': 'https://resonaevents.com/servicios/alquiler-dj-valencia',
  'AlquilerIluminacionBodas.tsx': 'https://resonaevents.com/servicios/alquiler-iluminacion-bodas',
  'AlquilerLaser.tsx': 'https://resonaevents.com/servicios/alquiler-laser',
  'AlquilerMaquinasFX.tsx': 'https://resonaevents.com/servicios/alquiler-maquinas-fx',
  'AlquilerMesaMezclaDJ.tsx': 'https://resonaevents.com/servicios/alquiler-mesa-mezcla-dj',
  'AlquilerMicrofonosInalambricos.tsx': 'https://resonaevents.com/servicios/alquiler-microfonos-inalambricos',
  'AlquilerMovingHeads.tsx': 'https://resonaevents.com/servicios/alquiler-moving-heads',
  'AlquilerPantallasLED.tsx': 'https://resonaevents.com/servicios/alquiler-pantallas-led',
  'AlquilerProyectores.tsx': 'https://resonaevents.com/servicios/alquiler-proyectores',
  'AlquilerSonidoValencia.tsx': 'https://resonaevents.com/servicios/alquiler-sonido-valencia',
  'AlquilerSubwoofers.tsx': 'https://resonaevents.com/servicios/alquiler-subwoofers',
  'IluminacionArquitectonica.tsx': 'https://resonaevents.com/servicios/iluminacion-arquitectonica',
  'IluminacionEscenarios.tsx': 'https://resonaevents.com/servicios/iluminacion-escenarios',
  'IluminacionLEDProfesional.tsx': 'https://resonaevents.com/servicios/iluminacion-led-profesional',
  'ProduccionEventosValencia.tsx': 'https://resonaevents.com/servicios/produccion-eventos-valencia',
  'ProduccionTecnicaEventos.tsx': 'https://resonaevents.com/servicios/produccion-tecnica-eventos',
  'SonidoBodasValencia.tsx': 'https://resonaevents.com/servicios/sonido-bodas-valencia',
  'SonidoEventosCorporativos.tsx': 'https://resonaevents.com/servicios/sonido-eventos-corporativos',
  'SonidoIluminacionBodasValencia.tsx': 'https://resonaevents.com/servicios/sonido-iluminacion-bodas-valencia',
  'VideoescenariosStreaming.tsx': 'https://resonaevents.com/servicios/videoescenarios-streaming',
  'BodasValencia.tsx': 'https://resonaevents.com/servicios/bodas-valencia',
};

let updated = 0;
let skipped = 0;
let errors = 0;

console.log('🔧 Agregando canonical URLs a páginas de servicios...\n');

for (const [filename, canonicalUrl] of Object.entries(canonicalUrls)) {
  const filePath = path.join(servicesDir, filename);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  No existe: ${filename}`);
      skipped++;
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene canonicalUrl
    if (content.includes('canonicalUrl:')) {
      console.log(`✅ Ya tiene canonical: ${filename}`);
      skipped++;
      continue;
    }

    // Buscar el patrón de keywords y agregar canonicalUrl después
    const keywordsPattern = /keywords: "([^"]+)",/;
    
    if (!keywordsPattern.test(content)) {
      console.log(`⚠️  No se encontró keywords en: ${filename}`);
      errors++;
      continue;
    }

    // Reemplazar agregando canonicalUrl después de keywords
    content = content.replace(
      keywordsPattern,
      `keywords: "$1",\n    canonicalUrl: "${canonicalUrl}",`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Actualizado: ${filename}`);
    updated++;

  } catch (error) {
    console.error(`❌ Error en ${filename}:`, error.message);
    errors++;
  }
}

console.log('\n📊 Resumen:');
console.log(`   ✅ Actualizados: ${updated}`);
console.log(`   ⏭️  Omitidos: ${skipped}`);
console.log(`   ❌ Errores: ${errors}`);
console.log(`   📄 Total: ${Object.keys(canonicalUrls).length}`);
console.log('\n✨ Listo! Las páginas ahora tienen canonical URLs explícitas.');
