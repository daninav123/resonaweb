require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

async function downloadAndSaveImage(imageUrl, articleTitle) {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, 'public/uploads/blog');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const slug = articleTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const filename = `${slug}-${timestamp}.png`;
      const filepath = path.join(uploadsDir, filename);
      const publicPath = `/uploads/blog/${filename}`;

      const protocol = imageUrl.startsWith('https') ? https : http;
      const file = fs.createWriteStream(filepath);
      
      protocol.get(imageUrl, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`   ✅ Imagen guardada: ${filename}`);
          resolve(publicPath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        console.error(`   ❌ Error descargando: ${err.message}`);
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function generateImageForPost() {
  try {
    console.log('\n🎨 GENERANDO IMAGEN PARA ARTÍCULO\n');

    // Buscar el post
    const post = await prisma.blogPost.findFirst({
      where: {
        title: {
          contains: 'Innovaciones'
        }
      }
    });

    if (!post) {
      console.log('❌ No se encontró el artículo\n');
      return;
    }

    console.log(`📝 Artículo: "${post.title}"`);
    console.log('🎨 Generando imagen con DALL-E 3...\n');

    const imagePrompt = `Professional high-quality photograph for a blog article about: "${post.title}". 
The image should depict modern professional LED lighting equipment for events including: 
LED spotlights, moving heads, RGB LED panels, DMX controllers, colorful stage lighting, 
in an elegant event venue setting with dramatic lighting effects.
Style: Professional photography, dramatic lighting, ultra realistic, 8k quality, 
commercial photography aesthetic. No text or logos in the image.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      console.error('❌ No se generó URL de imagen\n');
      return;
    }

    console.log('✅ Imagen generada por DALL-E 3');
    console.log('📥 Descargando y guardando...\n');

    const savedPath = await downloadAndSaveImage(imageUrl, post.title);
    
    console.log('💾 Actualizando base de datos...\n');

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { featuredImage: savedPath }
    });

    console.log('✅ ¡COMPLETADO!\n');
    console.log(`🖼️  Imagen: ${savedPath}`);
    console.log(`💰 Coste: $0.04 USD\n`);
    console.log('🌐 Refresca tu navegador para ver la imagen\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

generateImageForPost();
