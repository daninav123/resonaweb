const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function diagnoseImages() {
  console.log('\n🔍 DIAGNÓSTICO DE IMÁGENES\n');
  console.log('═'.repeat(60));
  
  try {
    // 1. Verificar productos con imágenes
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        mainImageUrl: true,
      },
      take: 10,
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('\n📦 ÚLTIMOS 10 PRODUCTOS ACTUALIZADOS:\n');
    
    for (const product of products) {
      const hasImage = !!product.mainImageUrl;
      const icon = hasImage ? '✅' : '❌';
      
      console.log(`${icon} ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   SKU: ${product.sku || 'N/A'}`);
      console.log(`   mainImageUrl: ${product.mainImageUrl || 'NULL'}`);
      
      if (hasImage) {
        // Verificar si el archivo existe
        const imagePath = product.mainImageUrl.replace('/uploads/', '');
        const fullPath = path.join(__dirname, '../uploads', imagePath);
        const exists = fs.existsSync(fullPath);
        
        console.log(`   Archivo existe: ${exists ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   Ruta completa: ${fullPath}`);
        
        if (exists) {
          const stats = fs.statSync(fullPath);
          console.log(`   Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
        }
      }
      console.log('');
    }
    
    // 2. Contar totales
    const totalProducts = await prisma.product.count();
    const withImages = await prisma.product.count({
      where: {
        mainImageUrl: {
          not: null
        }
      }
    });
    const withoutImages = totalProducts - withImages;
    
    console.log('═'.repeat(60));
    console.log('\n📊 ESTADÍSTICAS:\n');
    console.log(`   Total productos: ${totalProducts}`);
    console.log(`   Con imagen: ${withImages} (${((withImages/totalProducts)*100).toFixed(1)}%)`);
    console.log(`   Sin imagen: ${withoutImages} (${((withoutImages/totalProducts)*100).toFixed(1)}%)`);
    
    // 3. Verificar directorio de uploads
    const uploadsDir = path.join(__dirname, '../uploads/products');
    console.log('\n📁 DIRECTORIO DE UPLOADS:\n');
    console.log(`   Ruta: ${uploadsDir}`);
    console.log(`   Existe: ${fs.existsSync(uploadsDir) ? '✅ SÍ' : '❌ NO'}`);
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`   Archivos: ${files.length}`);
      
      if (files.length > 0) {
        console.log('\n   Últimos 5 archivos:');
        files.slice(-5).forEach(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
      }
    }
    
    // 4. Productos con URLs problemáticas
    const problematicProducts = await prisma.product.findMany({
      where: {
        mainImageUrl: {
          contains: 'http'
        }
      },
      select: {
        id: true,
        name: true,
        mainImageUrl: true
      }
    });
    
    if (problematicProducts.length > 0) {
      console.log('\n⚠️  PRODUCTOS CON URLs COMPLETAS (DEBEN SER RELATIVAS):\n');
      problematicProducts.forEach(p => {
        console.log(`   ❌ ${p.name}`);
        console.log(`      ${p.mainImageUrl}`);
        console.log('');
      });
    }
    
    console.log('\n═'.repeat(60));
    console.log('\n✅ Diagnóstico completado\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseImages();
