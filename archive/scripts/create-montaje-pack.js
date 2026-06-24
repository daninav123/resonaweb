const axios = require('axios');

async function createMontajePack() {
  try {
    // 1. Login como admin
    console.log('🔐 Haciendo login como admin...\n');
    
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@resona.com',
      password: 'Admin123!@#'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login exitoso!\n');
    
    // 2. Crear pack de MONTAJE
    console.log('🚀 Creando pack de MONTAJE de prueba...\n');
    
    const packData = {
      name: 'Transporte Zona Norte',
      slug: 'transporte-zona-norte',
      description: 'Incluye transporte completo e instalación en zona norte de Valencia (hasta 30km)',
      category: 'MONTAJE',
      finalPrice: 150,
      calculatedTotalPrice: 150,
      basePricePerDay: 150,
      isActive: true,
      featured: false,
      autoCalculate: false,
      customPriceEnabled: true
    };
    
    console.log('📦 Datos del pack:');
    console.log(JSON.stringify(packData, null, 2));
    console.log('\n');
    
    const response = await axios.post('http://localhost:3001/api/v1/packs', packData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Pack creado exitosamente!');
    console.log('ID:', response.data.id);
    console.log('Nombre:', response.data.name);
    console.log('Categoría:', response.data.category);
    console.log('Precio:', response.data.finalPrice);
    console.log('\n');
    
    // Crear otro pack de MONTAJE
    console.log('🚀 Creando segundo pack de MONTAJE...\n');
    
    const packData2 = {
      name: 'Transporte + Montaje Premium',
      slug: 'transporte-montaje-premium',
      description: 'Incluye transporte, montaje completo y técnico durante el evento (cualquier distancia)',
      category: 'MONTAJE',
      finalPrice: 300,
      calculatedTotalPrice: 300,
      basePricePerDay: 300,
      isActive: true,
      featured: true,
      autoCalculate: false,
      customPriceEnabled: true
    };
    
    const response2 = await axios.post('http://localhost:3001/api/v1/packs', packData2, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Segundo pack creado exitosamente!');
    console.log('ID:', response2.data.id);
    console.log('Nombre:', response2.data.name);
    console.log('Categoría:', response2.data.category);
    console.log('Precio:', response2.data.finalPrice);
    console.log('\n');
    
    // Listar todos los packs de MONTAJE
    console.log('📋 Verificando packs de MONTAJE en la BD...\n');
    
    const listResponse = await axios.get('http://localhost:3001/api/v1/packs');
    const montajePacks = listResponse.data.packs.filter(p => p.category === 'MONTAJE');
    
    console.log(`✅ Total de packs MONTAJE: ${montajePacks.length}`);
    montajePacks.forEach(pack => {
      console.log(`  - ${pack.name} (€${pack.finalPrice})`);
    });
    
    console.log('\n🎉 ¡Packs de prueba creados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

createMontajePack();
