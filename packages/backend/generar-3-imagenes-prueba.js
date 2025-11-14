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
          console.log(`   💾 Guardada: ${filename}`);
          resolve(publicPath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function generateBlogImage(articleTitle) {
  try {
    console.log(`   🎨 Generando imagen...`);

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
      return null;
    }

    const savedPath = await downloadAndSaveImage(imageUrl, articleTitle);
    return savedPath;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  try {
    console.log('\n🎨 PRUEBA: Generando 3 imágenes\n');

    const postsWithoutImage = await prisma.blogPost.findMany({
      where: { featuredImage: null },
      take: 3,
      select: { id: true, title: true },
    });

    console.log(`📊 Posts seleccionados: ${postsWithoutImage.length}\n`);

    if (postsWithoutImage.length === 0) {
      console.log('✨ Todos los posts ya tienen imagen!\n');
      return;
    }

    let success = 0;

    for (let i = 0; i < postsWithoutImage.length; i++) {
      const post = postsWithoutImage[i];
      console.log(`\n[${i + 1}/3] "${post.title.substring(0, 60)}..."`);
      
      try {
        const imagePath = await generateBlogImage(post.title);
        
        if (imagePath) {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { featuredImage: imagePath },
          });
          
          console.log(`   ✅ Completado`);
          success++;
        }

        if (i < postsWithoutImage.length - 1) {
          console.log(`   ⏳ Esperando 2 segundos...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n╔════════════════════════╗');
    console.log('║  PRUEBA COMPLETADA    ║');
    console.log('╚════════════════════════╝\n');
    console.log(`✅ Éxitos: ${success}/3`);
    console.log(`💰 Coste: $${(success * 0.04).toFixed(2)} USD\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
