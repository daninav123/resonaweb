/**
 * Script de prueba para verificar API RGPD
 * 
 * Uso:
 * 1. Levanta el backend: cd packages/backend && npx ts-node src/index.ts
 * 2. Login en el frontend para obtener el token
 * 3. Copia el token de localStorage
 * 4. Pégalo abajo donde dice YOUR_TOKEN_HERE
 * 5. Ejecuta: node test-gdpr-api.js
 */

const TOKEN = 'YOUR_TOKEN_HERE'; // ← Pega tu token aquí

async function testGdprAPI() {
  console.log('🧪 Probando API RGPD...\n');

  try {
    // Test 1: Obtener resumen de datos
    console.log('1️⃣ Obteniendo resumen de datos...');
    const summaryResponse = await fetch('http://localhost:3001/api/v1/gdpr/my-data/summary', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      console.log('✅ Resumen obtenido:');
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log('❌ Error:', summaryResponse.status, summaryResponse.statusText);
    }

    console.log('\n---\n');

    // Test 2: Obtener historial de consentimientos
    console.log('2️⃣ Obteniendo historial de consentimientos...');
    const historyResponse = await fetch('http://localhost:3001/api/v1/gdpr/consents/history', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('✅ Historial obtenido:');
      console.log(JSON.stringify(history, null, 2));
    } else {
      console.log('❌ Error:', historyResponse.status, historyResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n⚠️ Verifica que el backend esté corriendo en puerto 3001');
  }
}

// Verificar que hay token
if (TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('⚠️  INSTRUCCIONES:\n');
  console.log('1. Login en: http://localhost:3000/login');
  console.log('2. Abre DevTools (F12)');
  console.log('3. Ve a: Application > Local Storage > http://localhost:3000');
  console.log('4. Copia el valor de "accessToken"');
  console.log('5. Pégalo en este archivo donde dice YOUR_TOKEN_HERE');
  console.log('6. Ejecuta: node test-gdpr-api.js\n');
} else {
  testGdprAPI();
}
