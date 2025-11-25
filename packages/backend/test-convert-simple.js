const http = require('http');

console.log('🧪 TEST SIMPLE: Convertir Solicitud a Pedido\n');

// 1. Login
console.log('1️⃣ Login...');
const loginData = JSON.stringify({
  email: 'admin@resona.com',
  password: 'Admin123!'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Login response:', res.statusCode);
    
    const loginResponse = JSON.parse(data);
    const token = loginResponse.data.accessToken;
    
    console.log('✅ Token obtenido\n');
    
    // 2. Obtener solicitudes
    console.log('2️⃣ Obteniendo solicitudes...');
    const quotesOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/quote-requests',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const quotesReq = http.request(quotesOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const quotesResponse = JSON.parse(data);
        const quotes = quotesResponse.data || [];
        
        console.log(`📊 Solicitudes: ${quotes.length}`);
        
        const activeQuote = quotes.find(q => 
          ['PENDING', 'CONTACTED', 'QUOTED'].includes(q.status)
        );
        
        if (!activeQuote) {
          console.log('❌ No hay solicitudes activas');
          return;
        }
        
        console.log(`\n✅ Solicitud encontrada:`);
        console.log(`   ID: ${activeQuote.id}`);
        console.log(`   Email: ${activeQuote.customerEmail}`);
        console.log(`   Status: ${activeQuote.status}\n`);
        
        // 3. Convertir a pedido
        console.log('3️⃣ Convirtiendo a pedido...\n');
        
        const convertOptions = {
          hostname: 'localhost',
          port: 3001,
          path: `/api/v1/quote-requests/${activeQuote.id}/convert-to-order`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        const convertReq = http.request(convertOptions, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            console.log(`📊 Status: ${res.statusCode}\n`);
            
            try {
              const response = JSON.parse(data);
              
              if (res.statusCode === 200) {
                console.log('✅ ÉXITO!\n');
                console.log(JSON.stringify(response, null, 2));
              } else {
                console.log('❌ ERROR!\n');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(JSON.stringify(response, null, 2));
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
              }
            } catch (e) {
              console.log('❌ Response no es JSON:');
              console.log(data);
            }
          });
        });
        
        convertReq.on('error', (e) => {
          console.error('❌ Error en request:', e.message);
        });
        
        convertReq.end();
      });
    });
    
    quotesReq.on('error', (e) => {
      console.error('❌ Error obteniendo solicitudes:', e.message);
    });
    
    quotesReq.end();
  });
});

loginReq.on('error', (e) => {
  console.error('❌ Error en login:', e.message);
});

loginReq.write(loginData);
loginReq.end();
