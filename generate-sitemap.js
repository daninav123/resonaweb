const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateSitemap() {
  console.log('🔄 Generando sitemap.xml dinámico...\n');

  try {
    // 1. Obtener productos activos
    const products = await prisma.product.findMany({
      where: { 
        isPack: false
      },
      select: { 
        slug: true, 
        updatedAt: true 
      }
    });

    // 2. Obtener blog posts publicados
    const blogPosts = await prisma.blogPost.findMany({
      where: { 
        status: 'PUBLISHED',
        publishedAt: { not: null }
      },
      select: { 
        slug: true, 
        publishedAt: true 
      }
    });

    // 3. Obtener categorías
    const categories = await prisma.category.findMany({
      where: { 
        isHidden: { not: true }
      },
      select: { 
        slug: true, 
        name: true 
      }
    });

    console.log(`✅ Productos: ${products.length}`);
    console.log(`✅ Blog posts: ${blogPosts.length}`);
    console.log(`✅ Categorías: ${categories.length}\n`);

    // 4. Generar XML
    const today = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>https://resonaevents.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Catálogo de Productos -->
  <url>
    <loc>https://resonaevents.com/productos</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Blog -->
  <url>
    <loc>https://resonaevents.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Calculadora de Eventos -->
  <url>
    <loc>https://resonaevents.com/calculadora-evento</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Contacto -->
  <url>
    <loc>https://resonaevents.com/contacto</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Categorías -->
`;

    // Agregar categorías
    categories.forEach(cat => {
      sitemap += `  <url>
    <loc>https://resonaevents.com/productos?category=${cat.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `;
    });

    // Agregar productos
    sitemap += `
  <!-- Productos Individuales -->
`;
    products.forEach(product => {
      const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : today;
      sitemap += `  <url>
    <loc>https://resonaevents.com/productos/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  `;
    });

    // Agregar blog posts
    sitemap += `
  <!-- Blog Posts -->
`;
    blogPosts.forEach(post => {
      const lastmod = post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : today;
      sitemap += `  <url>
    <loc>https://resonaevents.com/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  `;
    });

    sitemap += `
</urlset>`;

    // 5. Guardar archivo
    const outputPath = './packages/frontend/public/sitemap.xml';
    fs.writeFileSync(outputPath, sitemap);

    console.log(`✅ Sitemap generado: ${outputPath}`);
    console.log(`📊 Total URLs: ${products.length + blogPosts.length + categories.length + 5}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

generateSitemap();
