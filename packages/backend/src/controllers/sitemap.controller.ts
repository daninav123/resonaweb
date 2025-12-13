import { Request, Response } from 'express';
import { prisma } from '../index';

export class SitemapController {
  /**
   * Genera sitemap.xml dinámico con productos y posts del blog
   */
  async generateSitemap(req: Request, res: Response) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'https://resonaevents.com';
      const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Obtener todos los posts publicados
      const posts = await prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
        },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
      });

      // Obtener todas las categorías activas
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          isHidden: false, // No incluir categorías ocultas
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      // Obtener todos los productos activos (solo necesitamos slug)
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isPack: false,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      // Obtener todos los packs activos
      const packs = await prisma.pack.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      // Construir XML
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Catálogo de Productos -->
  <url>
    <loc>${baseUrl}/productos</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Blog Listing -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Calculadora de Eventos -->
  <url>
    <loc>${baseUrl}/calculadora-evento</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Servicios -->
  <url>
    <loc>${baseUrl}/servicios</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Sobre Nosotros -->
  <url>
    <loc>${baseUrl}/sobre-nosotros</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Contacto -->
  <url>
    <loc>${baseUrl}/contacto</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Páginas SEO Locales - ALTA PRIORIDAD -->
  <url>
    <loc>${baseUrl}/alquiler-sonido-valencia</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/alquiler-altavoces-valencia</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.98</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/alquiler-iluminacion-valencia</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/sonido-bodas-valencia</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/alquiler-sonido-torrent</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
`;

      // Añadir categorías
      categories.forEach(cat => {
        const lastmod = cat.updatedAt.toISOString().split('T')[0];
        xml += `  
  <url>
    <loc>${baseUrl}/productos?category=${cat.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      });

      // Añadir productos individuales
      products.forEach(product => {
        const lastmod = product.updatedAt.toISOString().split('T')[0];
        xml += `  
  <url>
    <loc>${baseUrl}/productos/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });

      // Añadir packs
      packs.forEach(pack => {
        const lastmod = pack.updatedAt.toISOString().split('T')[0];
        xml += `  
  <url>
    <loc>${baseUrl}/packs/${pack.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });

      // ⭐ AÑADIR POSTS DEL BLOG ⭐
      posts.forEach(post => {
        const lastmod = post.updatedAt.toISOString().split('T')[0];
        xml += `  
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      });

      xml += `
</urlset>`;

      // Enviar como XML
      res.header('Content-Type', 'application/xml');
      res.header('Cache-Control', 'public, max-age=3600'); // Cache 1 hora
      res.send(xml);
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  }

  /**
   * Genera RSS feed para el blog
   */
  async generateRSS(req: Request, res: Response) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'https://resonaevents.com';
      const now = new Date().toISOString();
      
      const posts = await prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
        },
        select: {
          slug: true,
          title: true,
          excerpt: true,
          content: true,
          publishedAt: true,
          updatedAt: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 20, // Últimos 20 posts
      });

      let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ReSona Events Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Consejos, guías y novedades sobre alquiler de material audiovisual para eventos</description>
    <language>es</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/api/v1/rss" rel="self" type="application/rss+xml"/>
`;

      posts.forEach(post => {
        const pubDate = post.publishedAt?.toUTCString() || post.updatedAt.toUTCString();
        const author = `${post.author.firstName} ${post.author.lastName}`;
        
        rss += `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <author>${author}</author>
      <pubDate>${pubDate}</pubDate>
      <guid>${baseUrl}/blog/${post.slug}</guid>
    </item>
`;
      });

      rss += `
  </channel>
</rss>`;

      res.header('Content-Type', 'application/rss+xml');
      res.header('Cache-Control', 'public, max-age=3600');
      res.send(rss);
      
    } catch (error) {
      console.error('Error generating RSS:', error);
      res.status(500).send('Error generating RSS');
    }
  }
}

export const sitemapController = new SitemapController();
