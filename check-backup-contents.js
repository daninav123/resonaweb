const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBackupContents() {
  console.log('\n📦 ANÁLISIS DE CONTENIDO DEL BACKUP\n');

  try {
    // 1. Verificar imágenes en BD
    console.log('🖼️ IMÁGENES\n');
    
    const productsWithImages = await prisma.product.findMany({
      where: { 
        isPack: false,
        mainImageUrl: { not: null }
      },
      select: { id: true, name: true, mainImageUrl: true }
    });

    const productsWithoutImages = await prisma.product.findMany({
      where: { 
        isPack: false,
        mainImageUrl: null
      },
      select: { id: true, name: true }
    });

    console.log(`✅ Productos con imagen: ${productsWithImages.length}`);
    console.log(`❌ Productos sin imagen: ${productsWithoutImages.length}`);

    const packsWithImages = await prisma.pack.findMany({
      where: { imageUrl: { not: null } },
      select: { id: true, name: true, imageUrl: true }
    });

    const packsWithoutImages = await prisma.pack.findMany({
      where: { imageUrl: null },
      select: { id: true, name: true }
    });

    console.log(`✅ Montajes/Packs con imagen: ${packsWithImages.length}`);
    console.log(`❌ Montajes/Packs sin imagen: ${packsWithoutImages.length}`);

    // 2. Verificar configuración de calculadora
    console.log('\n\n📐 CONFIGURACIÓN DE CALCULADORA\n');

    const calculatorConfig = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });

    if (!calculatorConfig) {
      console.log('❌ NO hay configuración de calculadora guardada');
    } else {
      try {
        const config = JSON.parse(calculatorConfig.value);
        console.log('✅ Configuración de calculadora encontrada');
        console.log(`   Tipos de eventos: ${config.eventTypes?.length || 0}`);
        
        if (config.eventTypes) {
          let totalExtras = 0;
          let totalCategories = 0;
          
          config.eventTypes.forEach((et, i) => {
            const catCount = et.extraCategories?.length || 0;
            const extraCount = et.availableExtras?.length || 0;
            totalExtras += extraCount;
            totalCategories += catCount;
            
            console.log(`   ${i + 1}. ${et.name || 'Sin nombre'}`);
            console.log(`      - Categorías extras: ${catCount}`);
            console.log(`      - Extras disponibles: ${extraCount}`);
          });
          
          console.log(`\n   📊 Total:`);
          console.log(`   - Categorías: ${totalCategories}`);
          console.log(`   - Extras: ${totalExtras}`);
        }
        
        console.log(`\n   ✅ Configuración COMPLETA y GUARDADA`);
      } catch (e) {
        console.log('❌ Error al parsear configuración');
      }
    }

    // 3. Verificar entradas del blog
    console.log('\n\n📝 BLOG\n');

    const blogPosts = await prisma.blogPost.findMany({
      select: { id: true, title: true, published: true, createdAt: true }
    }).catch(() => null);

    if (blogPosts === null) {
      console.log('❌ NO hay tabla de blog en la BD (o no existe)');
    } else {
      const publishedPosts = blogPosts.filter(p => p.published);
      const draftPosts = blogPosts.filter(p => !p.published);
      
      console.log(`✅ Entradas publicadas: ${publishedPosts.length}`);
      console.log(`📋 Borradores: ${draftPosts.length}`);
      console.log(`📊 Total: ${blogPosts.length}`);
      
      if (publishedPosts.length > 0) {
        console.log('\n   Publicadas:');
        publishedPosts.slice(0, 5).forEach(p => {
          console.log(`   - ${p.title} (${p.createdAt.toLocaleDateString('es-ES')})`);
        });
        if (publishedPosts.length > 5) {
          console.log(`   ... y ${publishedPosts.length - 5} más`);
        }
      }
    }

    // 4. Verificar archivos de imágenes en servidor
    console.log('\n\n💾 ARCHIVOS DE IMÁGENES EN SERVIDOR\n');

    const uploadsDir = path.join(__dirname, 'packages', 'backend', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Carpeta /uploads NO existe');
    } else {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      console.log(`✅ Carpeta /uploads existe`);
      console.log(`   Archivos totales: ${files.length}`);
      console.log(`   Imágenes: ${imageFiles.length}`);
      
      if (imageFiles.length > 0) {
        console.log('\n   Primeras imágenes:');
        imageFiles.slice(0, 5).forEach(f => {
          const filePath = path.join(uploadsDir, f);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          console.log(`   - ${f} (${sizeMB} MB)`);
        });
        if (imageFiles.length > 5) {
          console.log(`   ... y ${imageFiles.length - 5} más`);
        }
      }
    }

    // 5. Resumen de lo que está en backup
    console.log('\n\n📋 RESUMEN: ¿QUÉ ESTÁ EN EL BACKUP?\n');

    const backupDir = path.join(__dirname, 'backups', 'database');
    
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir);
      const sqlBackups = backupFiles.filter(f => f.endsWith('.sql'));
      const jsonBackups = backupFiles.filter(f => f.endsWith('.json'));
      
      console.log(`✅ Carpeta de backups existe`);
      console.log(`   Backups SQL: ${sqlBackups.length}`);
      console.log(`   Backups JSON: ${jsonBackups.length}`);
      
      if (sqlBackups.length > 0) {
        const latestSql = sqlBackups.sort().reverse()[0];
        const filePath = path.join(backupDir, latestSql);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        console.log(`\n   📌 Último backup SQL: ${latestSql}`);
        console.log(`      Tamaño: ${sizeMB} MB`);
        console.log(`      Fecha: ${new Date(stats.mtime).toLocaleDateString('es-ES')}`);
        
        // Leer contenido del SQL para ver qué tablas contiene
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        const tables = new Set();
        const tableMatches = sqlContent.match(/INSERT INTO `(\w+)`/g) || [];
        tableMatches.forEach(match => {
          const tableName = match.replace(/INSERT INTO `|`/g, '');
          tables.add(tableName);
        });
        
        console.log(`\n      Tablas incluidas: ${tables.size}`);
        Array.from(tables).sort().forEach(table => {
          console.log(`      - ${table}`);
        });
      }
    } else {
      console.log('❌ Carpeta de backups NO existe');
    }

    console.log('\n✅ Análisis completado\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBackupContents();
