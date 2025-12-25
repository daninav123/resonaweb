const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBlogSEO() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        keywords: true,
        metaDescription: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 ANÁLISIS SEO BLOG - Total: ${posts.length} artículos publicados\n`);
    console.log('='.repeat(80));

    let localCount = 0;
    let keywordsCount = 0;

    posts.forEach((post, index) => {
      const hasValencia = (
        post.title.toLowerCase().includes('valencia') ||
        post.content.toLowerCase().includes('valencia') ||
        post.metaDescription?.toLowerCase().includes('valencia')
      );

      const hasKeywords = post.keywords && post.keywords.length > 0;

      if (hasValencia) localCount++;
      if (hasKeywords) keywordsCount++;

      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   Slug: /blog/${post.slug}`);
      console.log(`   SEO Local: ${hasValencia ? '✅ Incluye Valencia' : '❌ Sin menciones Valencia'}`);
      console.log(`   Keywords: ${hasKeywords ? `✅ ${post.keywords.length} keywords` : '❌ Sin keywords'}`);
      console.log(`   Meta: ${post.metaDescription ? '✅ Presente' : '❌ Falta'}`);
      
      if (hasValencia && post.keywords) {
        const valenciaKeywords = post.keywords.filter(k => k.toLowerCase().includes('valencia'));
        if (valenciaKeywords.length > 0) {
          console.log(`   Keywords locales: ${valenciaKeywords.join(', ')}`);
        }
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n📈 RESUMEN SEO:`);
    console.log(`   Total artículos: ${posts.length}`);
    console.log(`   Con SEO local (Valencia): ${localCount} (${Math.round(localCount/posts.length*100)}%)`);
    console.log(`   Con keywords: ${keywordsCount} (${Math.round(keywordsCount/posts.length*100)}%)`);
    
    console.log(`\n💡 RECOMENDACIONES:`);
    if (localCount < posts.length * 0.5) {
      console.log(`   ⚠️ Solo ${localCount}/${posts.length} artículos mencionan Valencia`);
      console.log(`   → Añadir keywords locales a más artículos`);
    } else {
      console.log(`   ✅ Buen porcentaje de contenido local`);
    }
    
    if (keywordsCount < posts.length) {
      console.log(`   ⚠️ ${posts.length - keywordsCount} artículos sin keywords definidas`);
      console.log(`   → Añadir keywords SEO a todos los artículos`);
    } else {
      console.log(`   ✅ Todos los artículos tienen keywords`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlogSEO();
