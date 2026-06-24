const { execSync } = require('child_process');

console.log('🔍 Buscando bases de datos en PostgreSQL...\n');

try {
  // Listar todas las bases de datos
  const result = execSync('docker exec resona-db psql -U resona_user -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"', {
    encoding: 'utf8'
  });
  
  console.log('Bases de datos encontradas:');
  console.log(result);
  
  // Buscar si hay alguna tabla de backup o histórico
  const tables = execSync('docker exec resona-db psql -U resona_user -d resona_db -t -c "SELECT tablename FROM pg_tables WHERE schemaname=\'public\' ORDER BY tablename;"', {
    encoding: 'utf8'
  });
  
  console.log('\nTablas en resona_db:');
  console.log(tables);
  
} catch (error) {
  console.error('Error:', error.message);
}
