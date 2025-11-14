require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

async function testImageGeneration() {
  try {
    console.log('\n🎨 TEST: Generando UNA imagen con DALL-E 3...\n');

    // Obtener un post sin imagen
    const post = await prisma.blogPost.findFirst({
      where: { featuredImage: null },
      select: { id: true, title: true },
    });

    if (!post) {
      console.log('❌ No hay posts sin imagen\n');
      return;
    }

    console.log(`📝 Post: "${post.title}"`);
    console.log('🎨 Generando imagen...\n');

    const imagePrompt = `Professional high-quality photograph for a blog article about: "${post.title}". 
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
      console.error('❌ No se generó URL de imagen\n');
      return;
    }

    console.log('✅ Imagen generada exitosamente!');
    console.log('📸 URL:', imageUrl);
    console.log('\n💾 Para guardarla y asociarla al post, ejecuta:');
    console.log('   generar-imagenes-blog.bat\n');
    console.log('💰 Coste: $0.04 USD\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testImageGeneration();
