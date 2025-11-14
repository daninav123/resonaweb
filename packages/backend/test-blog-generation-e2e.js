require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testE2E() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  TEST E2E: GENERACIÓN DE ARTÍCULO IA   ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // PASO 1: Verificar configuración
    console.log('📋 PASO 1: Verificando configuración...');
    console.log('   ✓ API Key:', process.env.OPENAI_API_KEY ? `OK (${process.env.OPENAI_API_KEY.length} chars)` : '❌ FALTA');
    console.log('   ✓ Project:', process.env.OPENAI_PROJECT_ID || '❌ FALTA');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    // PASO 2: Verificar conexión a BD
    console.log('\n📋 PASO 2: Verificando base de datos...');
    await prisma.$connect();
    console.log('   ✓ Conexión a BD: OK');

    // PASO 3: Buscar usuario admin
    console.log('\n📋 PASO 3: Buscando usuario admin...');
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
      throw new Error('No se encontró usuario admin');
    }
    console.log(`   ✓ Admin encontrado: ${adminUser.email} (ID: ${adminUser.id})`);

    // PASO 4: Test OpenAI
    console.log('\n📋 PASO 4: Probando OpenAI...');
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      project: process.env.OPENAI_PROJECT_ID,
    });

    const testResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Di hola' }],
      max_tokens: 5,
    });
    console.log('   ✓ OpenAI responde:', testResponse.choices[0].message.content);

    // PASO 5: Generar artículo completo con IA
    console.log('\n📋 PASO 5: Generando artículo con IA (esto toma 30-60 seg)...');
    
    const prompt = `Escribe un artículo de blog profesional sobre: "Cómo elegir equipo de sonido para eventos"

El artículo debe:
- Tener entre 1500-2000 palabras
- Estar en español
- Incluir una sección de preguntas frecuentes
- Usar formato Markdown con títulos H2 y H3

Estructura:
# [Título]
## Introducción
## [Secciones principales]
## Preguntas Frecuentes
## Conclusión`;

    const articleResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en alquiler de material audiovisual.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const fullContent = articleResponse.choices[0].message.content;
    console.log(`   ✓ Artículo generado: ${fullContent.length} caracteres`);

    // Extraer título
    const titleMatch = fullContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Test: Cómo elegir equipo de sonido para eventos';
    console.log(`   ✓ Título extraído: "${title}"`);

    // Generar slug
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    console.log(`   ✓ Slug generado: "${slug}"`);

    // PASO 6: Verificar si ya existe
    console.log('\n📋 PASO 6: Verificando duplicados...');
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      console.log('   ⚠️  Ya existe un artículo con este slug, eliminándolo...');
      await prisma.blogPost.delete({ where: { id: existing.id } });
    }
    console.log('   ✓ No hay duplicados');

    // PASO 7: Buscar o crear categoría
    console.log('\n📋 PASO 7: Gestionando categoría...');
    let category = await prisma.blogCategory.findFirst({
      where: { name: 'Guías' },
    });

    if (!category) {
      console.log('   → Creando categoría "Guías"...');
      category = await prisma.blogCategory.create({
        data: {
          name: 'Guías',
          slug: 'guias',
          description: 'Artículos sobre guías',
          color: '#5ebbff',
        },
      });
    }
    console.log(`   ✓ Categoría: ${category.name} (ID: ${category.id})`);

    // PASO 8: Crear el post
    console.log('\n📋 PASO 8: Creando post en base de datos...');
    
    const excerpt = fullContent.substring(0, 250).replace(/["""]/g, '').trim();
    
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content: fullContent,
        metaTitle: title.substring(0, 60),
        metaDescription: excerpt.substring(0, 155),
        metaKeywords: 'equipo sonido, eventos, alquiler',
        categoryId: category.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: adminUser.id,
        aiGenerated: true,
        aiPrompt: 'Test E2E generation',
      },
    });

    console.log(`   ✓ Post creado con ID: ${post.id}`);
    console.log(`   ✓ Título: "${post.title}"`);
    console.log(`   ✓ Estado: ${post.status}`);

    // PASO 9: Verificar que se creó correctamente
    console.log('\n📋 PASO 9: Verificando creación...');
    const verificacion = await prisma.blogPost.findUnique({
      where: { id: post.id },
      include: {
        category: true,
        author: true,
      },
    });

    if (!verificacion) {
      throw new Error('El post no se encuentra en la BD después de crearlo');
    }

    console.log('   ✓ Post verificado en BD');
    console.log(`   ✓ URL: /blog/${verificacion.slug}`);

    // RESUMEN FINAL
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║          ✅ TEST EXITOSO ✅            ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log('📊 RESUMEN:');
    console.log(`   • ID del post: ${post.id}`);
    console.log(`   • Título: ${post.title}`);
    console.log(`   • Slug: ${post.slug}`);
    console.log(`   • Categoría: ${verificacion.category.name}`);
    console.log(`   • Autor: ${verificacion.author.email}`);
    console.log(`   • Contenido: ${post.content.length} caracteres`);
    console.log(`   • Estado: ${post.status}`);
    console.log('\n✨ El artículo se generó correctamente con IA!\n');

  } catch (error) {
    console.error('\n❌ ERROR EN TEST E2E:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testE2E();
