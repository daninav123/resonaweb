const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function optimizeImage() {
  try {
    const productId = '72c03810-0dc2-40a1-8290-3cabc02d5b5c';
    const uploadedImage = '-c349cb7b-f949-41d1-9fc5-07e5c2c58bd3--1764110546954-603864415.png';
    
    const uploadsDir = path.join(__dirname, '../uploads/products');
    const inputPath = path.join(uploadsDir, uploadedImage);
    
    console.log('🖼️  Procesando imagen del DAS 515A...');
    console.log('📁 Archivo original:', uploadedImage);
    
    if (!fs.existsSync(inputPath)) {
      console.log('❌ No se encontró la imagen en:', inputPath);
      return;
    }
    
    // Nombre optimizado
    const timestamp = Date.now();
    const optimizedFilename = `das-audio-515a-${timestamp}.webp`;
    const outputPath = path.join(uploadsDir, optimizedFilename);
    
    console.log('🎨 Optimizando imagen...');
    console.log('   • Centrando en canvas 800x800');
    console.log('   • Añadiendo fondo blanco');
    console.log('   • Convirtiendo a WebP');
    console.log('   • Comprimiendo (calidad 90%)');
    
    // Procesar imagen: centrar, fondo blanco, WebP
    await sharp(inputPath)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        position: 'center'
      })
      .webp({ quality: 90 })
      .toFile(outputPath);
    
    // Obtener tamaño del archivo
    const stats = fs.statSync(outputPath);
    const originalStats = fs.statSync(inputPath);
    const reduction = ((1 - stats.size / originalStats.size) * 100).toFixed(1);
    
    console.log('✅ Imagen optimizada:', optimizedFilename);
    console.log('📊 Tamaño original:', (originalStats.size / 1024).toFixed(2), 'KB');
    console.log('📊 Tamaño optimizado:', (stats.size / 1024).toFixed(2), 'KB');
    console.log('💾 Reducción:', reduction + '%');
    
    // Actualizar producto en la BD
    const imageUrl = `/uploads/products/${optimizedFilename}`;
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        mainImageUrl: imageUrl,
        // images es un array JSON en el schema
      }
    });
    
    console.log('\n✅ Producto actualizado en la base de datos');
    console.log('📸 Nueva URL:', imageUrl);
    
    // Eliminar imagen original PNG
    fs.unlinkSync(inputPath);
    console.log('🧹 Imagen PNG original eliminada');
    
    console.log('\n🌐 Ver resultado en:');
    console.log('   Frontend: http://localhost:3000/productos');
    console.log('   Directo: http://localhost:3001' + imageUrl);
    console.log('   Admin: http://localhost:3000/admin/productos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeImage();
