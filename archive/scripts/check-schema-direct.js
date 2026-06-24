const https = require('https');

const url = 'https://resonaevents.com';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Extraer todos los scripts JSON-LD
    const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    const matches = data.match(regex);
    
    if (!matches) {
      console.log('❌ NO SE ENCONTRARON SCHEMAS JSON-LD');
      return;
    }
    
    console.log(`✅ SCHEMAS ENCONTRADOS: ${matches.length}\n`);
    
    matches.forEach((match, index) => {
      const jsonStr = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      
      try {
        const schema = JSON.parse(jsonStr);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`SCHEMA ${index + 1}: ${schema['@type']}`);
        console.log('='.repeat(60));
        
        if (schema['@type'] === 'LocalBusiness') {
          console.log('\n🏢 LOCALBUSINESS DETECTADO\n');
          
          // Verificar address
          if (schema.address) {
            console.log('📍 ADDRESS:');
            console.log(`  - @type: ${schema.address['@type']}`);
            console.log(`  - streetAddress: ${schema.address.streetAddress || '❌ FALTA'}`);
            console.log(`  - addressLocality: ${schema.address.addressLocality || '❌ FALTA'}`);
            console.log(`  - postalCode: ${schema.address.postalCode || '❌ FALTA'}`);
            console.log(`  - addressRegion: ${schema.address.addressRegion || '❌ FALTA'}`);
            console.log(`  - addressCountry: ${schema.address.addressCountry || '❌ FALTA'}`);
            
            // Verificar si están TODOS los campos
            const hasAll = schema.address.streetAddress && 
                          schema.address.addressLocality && 
                          schema.address.postalCode && 
                          schema.address.addressCountry;
            
            if (hasAll) {
              console.log('\n✅ TODOS LOS CAMPOS DE ADDRESS PRESENTES');
            } else {
              console.log('\n❌ FALTAN CAMPOS EN ADDRESS');
            }
          } else {
            console.log('❌ NO HAY CAMPO ADDRESS');
          }
          
          // Verificar offers
          if (schema.hasOfferCatalog && schema.hasOfferCatalog.itemListElement) {
            console.log(`\n📦 SERVICIOS: ${schema.hasOfferCatalog.itemListElement.length}`);
            
            schema.hasOfferCatalog.itemListElement.forEach((item, i) => {
              const hasPrice = item.priceSpecification ? '✅' : '❌';
              const hasAvailability = item.availability ? '✅' : '❌';
              console.log(`  ${i + 1}. ${item.itemOffered?.name}`);
              console.log(`     - priceSpecification: ${hasPrice}`);
              console.log(`     - availability: ${hasAvailability}`);
            });
          }
        }
        
        // Mostrar schema completo (resumido)
        console.log('\n📄 SCHEMA COMPLETO (primeras líneas):');
        console.log(JSON.stringify(schema, null, 2).substring(0, 500) + '...');
        
      } catch (e) {
        console.log(`❌ Error parseando schema ${index + 1}: ${e.message}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('RESUMEN:');
    console.log('='.repeat(60));
    console.log(`Total schemas: ${matches.length}`);
    console.log('\n✅ Si ves "TODOS LOS CAMPOS DE ADDRESS PRESENTES" arriba,');
    console.log('   el problema es que Google aún no rastreó la nueva versión.');
    console.log('\n🔄 Solución: Esperar 24-48h o solicitar re-indexación en Search Console');
    
  });
}).on('error', (err) => {
  console.log('❌ Error:', err.message);
});
