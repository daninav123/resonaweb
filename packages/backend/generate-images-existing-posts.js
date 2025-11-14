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

// Función para descargar y guardar imagen
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
          console.log(`   💾 Imagen guardada: ${publicPath}`);
          resolve(publicPath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        console.error(`   ❌ Error descargando imagen: ${err.message}`);
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Función para generar imagen con DALL-E 3
async function generateBlogImage(articleTitle) {
  try {
    console.log(`   🎨 Generando imagen con DALL-E 3...`);

    const imagePrompt = `Professional high-quality photograph for a blog article about: "${articleTitle}". 
The image should depict modern professional audio-visual equipment for events including: 
sound systems, speakers, microphones, LED lighting, mixing consoles, in an elegant event venue setting.
Style: Professional photography, bright natural lighting, ultra realistic, 8k quality, 
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
      console.error('   ❌ No se generó URL de imagen');
      return null;
    }

    console.log(`   ✅ Imagen generada`);

    const savedPath = await downloadAndSaveImage(imageUrl, articleTitle);
    return savedPath;
  } catch (error) {
    console.error(`   ❌ Error generando imagen: ${error.message}`);
    return null;
  }
}

async function generateImagesForExistingPosts() {
  try {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  GENERAR IMÁGENES PARA ARTÍCULOS EXISTENTES   ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // Obtener posts sin imagen
    const postsWithoutImage = await prisma.blogPost.findMany({
      where: {
        featuredImage: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    console.log(`📊 Total de artículos sin imagen: ${postsWithoutImage.length}\n`);

    if (postsWithoutImage.length === 0) {
      console.log('✨ Todos los artículos ya tienen imagen!\n');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < postsWithoutImage.length; i++) {
      const post = postsWithoutImage[i];
      console.log(`\n[${i + 1}/${postsWithoutImage.length}] Procesando: "${post.title}"`);
      
      try {
        // Generar imagen
        const imagePath = await generateBlogImage(post.title);
        
        if (imagePath) {
          // Actualizar post con la imagen
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { featuredImage: imagePath },
          });
          
          console.log(`   ✅ Post actualizado con imagen`);
          successCount++;
        } else {
          console.log(`   ⚠️  No se pudo generar imagen`);
          errorCount++;
        }

        // Esperar 3 segundos entre imágenes para no saturar la API
        if (i < postsWithoutImage.length - 1) {
          console.log(`   ⏳ Esperando 3 segundos...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`   ❌ Error procesando post: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║               RESUMEN FINAL                     ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`✅ Éxitos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total: ${postsWithoutImage.length}\n`);

    // Costo estimado
    const cost = successCount * 0.04; // $0.04 USD por imagen
    console.log(`💰 Costo estimado: $${cost.toFixed(2)} USD\n`);

  } catch (error) {
    console.error('\n❌ ERROR GENERAL:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

generateImagesForExistingPosts();
