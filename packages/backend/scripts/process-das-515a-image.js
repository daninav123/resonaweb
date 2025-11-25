const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function processAndUploadImage() {
  try {
    const productId = '72c03810-0dc2-40a1-8290-3cabc02d5b5c';
    
    // Ruta donde guardaremos la imagen procesada
    const uploadsDir = path.join(__dirname, '../public/uploads/products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    console.log('📁 Directorio de uploads:', uploadsDir);
    console.log('');
    console.log('📸 INSTRUCCIONES:');
    console.log('1. Guarda la imagen que te envié como: temp-das-515a.jpg');
    console.log('2. Colócala en:', path.join(__dirname, '../temp-das-515a.jpg'));
    console.log('3. Presiona Enter para continuar...');
    console.log('');
    console.log('O usa este comando directo:');
    console.log('');
    console.log('curl -X POST http://localhost:3001/api/v1/products/72c03810-0dc2-40a1-8290-3cabc02d5b5c');
    console.log('');
    
    // Nombre del archivo final
    const timestamp = Date.now();
    const filename = `das-audio-515a-${timestamp}.webp`;
    const outputPath = path.join(uploadsDir, filename);
    
    // Ruta de la imagen temporal
    const tempImagePath = path.join(__dirname, '../temp-das-515a.jpg');
    
    if (!fs.existsSync(tempImagePath)) {
      console.log('');
      console.log('⚠️  No se encontró la imagen temporal');
      console.log('Por favor:');
      console.log('1. Guarda la imagen del altavoz como: temp-das-515a.jpg');
      console.log('2. Colócala en:', path.join(__dirname, '..'));
      console.log('3. Ejecuta este script nuevamente');
      return;
    }
    
    console.log('🖼️  Procesando imagen...');
    
    // Procesar imagen: centrar, optimizar, convertir a WebP
    await sharp(tempImagePath)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // Fondo blanco
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log('✅ Imagen procesada:', filename);
    
    // Actualizar producto en la BD
    const imageUrl = `/uploads/products/${filename}`;
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: imageUrl,
        images: [imageUrl]
      }
    });
    
    console.log('✅ Producto actualizado con la nueva imagen');
    console.log('📸 URL de la imagen:', imageUrl);
    console.log('');
    console.log('🌐 Ver producto en:');
    console.log('   Frontend: http://localhost:3000/productos');
    console.log('   Admin: http://localhost:3000/admin/productos');
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempImagePath);
    console.log('🧹 Archivo temporal eliminado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

processAndUploadImage();
