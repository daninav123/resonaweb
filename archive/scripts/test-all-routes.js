// Script para probar todas las rutas del proyecto
const routes = {
  "Públicas": [
    { name: "Home", url: "http://localhost:3000/", method: "GET" },
    { name: "Productos", url: "http://localhost:3000/productos", method: "GET" },
    { name: "Blog", url: "http://localhost:3000/blog", method: "GET" },
    { name: "Calculadora Evento", url: "http://localhost:3000/calculadora-evento", method: "GET" },
    { name: "Contacto", url: "http://localhost:3000/contacto", method: "GET" },
    { name: "Sobre Nosotros", url: "http://localhost:3000/sobre-nosotros", method: "GET" },
    { name: "Carrito", url: "http://localhost:3000/carrito", method: "GET" },
  ],
  "Autenticación": [
    { name: "Login", url: "http://localhost:3000/login", method: "GET" },
    { name: "Register", url: "http://localhost:3000/register", method: "GET" },
  ],
  "Backend Health": [
    { name: "Health Check", url: "http://localhost:3001/health", method: "GET" },
    { name: "Blog Categories API", url: "http://localhost:3001/api/v1/blog/categories", method: "GET" },
    { name: "Blog Posts API", url: "http://localhost:3001/api/v1/blog/posts?page=1&limit=9", method: "GET" },
  ],
};

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║     TEST DE TODAS LAS RUTAS DEL PROYECTO     ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('📋 RUTAS A PROBAR:\n');

let totalRoutes = 0;
Object.keys(routes).forEach(category => {
  console.log(`\n${category}:`);
  routes[category].forEach(route => {
    console.log(`  ✓ ${route.name}: ${route.url}`);
    totalRoutes++;
  });
});

console.log(`\n📊 Total de rutas: ${totalRoutes}\n`);
console.log('💡 INSTRUCCIONES:');
console.log('1. Asegúrate de que el proyecto esté corriendo (start-quick.bat)');
console.log('2. Abre tu navegador');
console.log('3. Ve probando cada URL de la lista\n');
console.log('✅ = Funciona correctamente');
console.log('❌ = Error o no carga');
console.log('⚠️  = Carga pero con problemas\n');
console.log('Guarda los resultados en: RESULTADOS_VERIFICACION.txt\n');
