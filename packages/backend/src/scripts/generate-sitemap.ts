import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

const DOMAIN = 'https://resona.com';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

async function generateSitemap() {
  console.log('🗺️ Generando sitemap.xml...');

  const urls: SitemapURL[] = [];

  // Páginas estáticas
  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/productos', changefreq: 'daily', priority: 0.9 },
    { loc: '/calculadora', changefreq: 'weekly', priority: 0.8 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.7 },
    { loc: '/contacto', changefreq: 'monthly', priority: 0.6 },
    { loc: '/sobre-nosotros', changefreq: 'monthly', priority: 0.5 },
    { loc: '/legal/terminos', changefreq: 'yearly', priority: 0.3 },
    { loc: '/legal/privacidad', changefreq: 'yearly', priority: 0.3 },
    { loc: '/legal/cookies', changefreq: 'yearly', priority: 0.3 },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${DOMAIN}${page.loc}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority
    });
  });

  try {
    // Productos dinámicos
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { 
        slug: true, 
        updatedAt: true 
      }
    });

    products.forEach(product => {
      urls.push({
        loc: `${DOMAIN}/producto/${product.slug}`,
        lastmod: product.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Categorías
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { 
        slug: true, 
        updatedAt: true 
      }
    });

    categories.forEach(category => {
      urls.push({
        loc: `${DOMAIN}/productos?category=${category.slug}`,
        lastmod: category.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    // Blog posts
    const posts = await prisma.blogPost.findMany({
      where: { 
        published: true,
        publishedAt: { lte: new Date() }
      },
      select: { 
        slug: true, 
        updatedAt: true 
      }
    });

    posts.forEach(post => {
      urls.push({
        loc: `${DOMAIN}/blog/${post.slug}`,
        lastmod: post.updatedAt.toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.6
      });
    });

  } catch (error) {
    console.error('Error fetching dynamic content:', error);
  }

  // Generar XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  // Guardar archivo
  const outputPath = path.join(__dirname, '../../../../public/sitemap.xml');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xml);
  
  console.log(`✅ Sitemap generado con ${urls.length} URLs`);
  console.log(`📄 Guardado en: ${outputPath}`);
  
  // Generar robots.txt
  const robotsTxt = `# Robots.txt for ReSona Events
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /reset-password
Disallow: /checkout
Disallow: /mis-pedidos
Disallow: /perfil
Allow: /

# Sitemaps
Sitemap: ${DOMAIN}/sitemap.xml

# Crawl-delay (seconds)
Crawl-delay: 1

# Specific bot rules
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /`;

  const robotsPath = path.join(__dirname, '../../../../public/robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log('🤖 robots.txt generado');
}

// Run if called directly
if (require.main === module) {
  generateSitemap()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default generateSitemap;
