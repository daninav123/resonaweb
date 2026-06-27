import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../index';

interface SitemapOptions {
  baseUrl: string;
  includeSeoPages?: boolean;
  // Filtro aplicado al slug de cada SEO page. La home (slug vacío) siempre se incluye.
  seoSlugFilter?: (slug: string) => boolean;
  includeCategories?: boolean;
  includeProducts?: boolean;
  includePacks?: boolean;
  includeBlog?: boolean;
}

// Páginas estáticas que ambas webs sirven (mismo slug en rent y events).
const SHARED_SEO_SLUGS = new Set(['contacto', 'faqs', 'sobre-nosotros']);
// Una SEO page es de Rent si su slug habla de alquiler o del catálogo de productos.
// Las landings de alquiler viven bajo `servicios/alquiler-*`, de ahí el `includes`.
// `iluminacion-led-profesional` es de Rent (alquiler de iluminación LED) aunque su slug
// no contenga "alquiler"; sin esto se cuela en el sitemap de Events y falta en el de Rent.
const isRentSeoSlug = (slug: string) =>
  slug.includes('alquiler') ||
  slug.includes('iluminacion-led-profesional') ||
  slug === 'productos' ||
  slug.startsWith('productos/');

export class SitemapController {
  /**
   * Sitemap genérico (resonaweb.com legacy): todo el contenido, baseUrl FRONTEND_URL.
   */
  async generateSitemap(req: Request, res: Response) {
    return this.respondSitemap(res, {
      baseUrl: process.env.FRONTEND_URL || 'https://resonaevents.com',
      includeSeoPages: true,
      includeCategories: true,
      includeProducts: true,
      includePacks: true,
      includeBlog: true,
    });
  }

  /**
   * Sitemap de Rent (resonarent.com): catálogo de alquiler + categorías + SEO pages de alquiler.
   * No incluye packs ni blog (viven en Events).
   */
  async generateRentSitemap(req: Request, res: Response) {
    return this.respondSitemap(res, {
      baseUrl: process.env.RENT_URL || 'https://resonarent.com',
      includeSeoPages: true,
      seoSlugFilter: (slug) => isRentSeoSlug(slug) || SHARED_SEO_SLUGS.has(slug),
      includeCategories: true,
      includeProducts: true,
      includePacks: false,
      includeBlog: false,
    });
  }

  /**
   * Sitemap de Events (resonaevents.com): packs + blog + SEO pages no-alquiler.
   * No incluye el catálogo de productos ni categorías (viven en Rent).
   */
  async generateEventsSitemap(req: Request, res: Response) {
    return this.respondSitemap(res, {
      baseUrl: process.env.EVENTS_URL || 'https://resonaevents.com',
      includeSeoPages: true,
      seoSlugFilter: (slug) => !isRentSeoSlug(slug),
      includeCategories: false,
      includeProducts: false,
      includePacks: true,
      includeBlog: true,
    });
  }

  private async respondSitemap(res: Response, opts: SitemapOptions) {
    try {
      const xml = await this.buildSitemap(opts);
      res.header('Content-Type', 'application/xml');
      res.header('Cache-Control', 'public, max-age=3600'); // Cache 1 hora
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  }

  private async buildSitemap(opts: SitemapOptions): Promise<string> {
    const { baseUrl } = opts;

    const posts = opts.includeBlog
      ? await prisma.blogPost.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          orderBy: { publishedAt: 'desc' },
        })
      : [];

    const categories = opts.includeCategories
      ? await prisma.category.findMany({
          where: { isActive: true, isHidden: false },
          select: { slug: true, updatedAt: true },
        })
      : [];

    const products = opts.includeProducts
      ? await prisma.product.findMany({
          where: { isActive: true, isPack: false },
          select: { slug: true, updatedAt: true, name: true, mainImageUrl: true, images: true },
        })
      : [];

    // El modelo Pack usa imageUrl, no mainImageUrl
    const packs = opts.includePacks
      ? await prisma.pack.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, name: true, imageUrl: true },
        })
      : [];

    const allSeoPages = opts.includeSeoPages
      ? await prisma.seoPage.findMany({
          where: { isActive: true },
          select: { slug: true, priority: true, changefreq: true, updatedAt: true },
          orderBy: { priority: 'desc' },
        })
      : [];
    // La home (slug vacío) se incluye siempre; el resto pasa por el filtro del sitio.
    const seoPages = opts.seoSlugFilter
      ? allSeoPages.filter((p) => !p.slug || opts.seoSlugFilter!(p.slug))
      : allSeoPages;

      // Construir XML (header)
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

      // ⭐ AÑADIR PÁGINAS SEO PRIMERO (por prioridad) ⭐
      seoPages.forEach(page => {
        const lastmod = page.updatedAt.toISOString().split('T')[0];
        // Si slug está vacío, es la homepage
        const url = page.slug ? `${baseUrl}/${page.slug}` : baseUrl;
        xml += `  
  <!-- SEO Page: ${page.slug || 'Homepage'} -->
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      });

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

      // Utilidad: convertir rutas de imagen a URL absoluta SOLO si el archivo existe
      // en disco. Evita incluir en el sitemap imágenes rotas (Google penaliza).
      // El backend sirve /uploads desde DOS raíces distintas según index.ts:
      //   - express.static(../public/uploads) para /uploads/*
      //   - express.static(../uploads/products) para /uploads/products/*
      // Compruebo ambas para determinar si el archivo realmente se servirá.
      const uploadsRoots = [
        path.join(__dirname, '../../public/uploads'),
        path.join(__dirname, '../../uploads'),
      ];
      const fileExistsInAnyRoot = (relativePathFromUploads: string): boolean => {
        for (const root of uploadsRoots) {
          try {
            if (fs.existsSync(path.join(root, relativePathFromUploads))) return true;
          } catch { /* noop */ }
        }
        return false;
      };
      const toAbsoluteImage = (img?: string | null): string | null => {
        if (!img) return null;
        if (/^https?:\/\//i.test(img)) {
          return img.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        const relative = img.startsWith('/') ? img.substring(1) : img;
        const normalized = relative.startsWith('uploads/')
          ? relative.substring('uploads/'.length)
          : relative;
        if (!fileExistsInAnyRoot(normalized)) return null;
        const abs = `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
        return abs.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      };
      const escapeXml = (str: string) =>
        str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      // Añadir productos individuales (con imágenes para Google Images)
      products.forEach(product => {
        const lastmod = product.updatedAt.toISOString().split('T')[0];
        const imgs = Array.from(new Set(
          [product.mainImageUrl, ...((product.images as string[] | null) || [])]
            .filter(Boolean)
            .map(toAbsoluteImage)
            .filter(Boolean) as string[]
        )).slice(0, 5);
        xml += `  
  <url>
    <loc>${baseUrl}/productos/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${imgs.map(src => `    <image:image>\n      <image:loc>${src}</image:loc>\n      <image:title>${escapeXml(product.name)}</image:title>\n    </image:image>`).join('\n')}
  </url>
`;
      });

      // Añadir packs (con imágenes)
      packs.forEach(pack => {
        const lastmod = pack.updatedAt.toISOString().split('T')[0];
        const imgs = [pack.imageUrl]
          .filter(Boolean)
          .slice(0, 5)
          .map(toAbsoluteImage)
          .filter(Boolean) as string[];
        xml += `  
  <url>
    <loc>${baseUrl}/packs/${pack.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${imgs.map(src => `    <image:image>\n      <image:loc>${src}</image:loc>\n      <image:title>${escapeXml(pack.name)}</image:title>\n    </image:image>`).join('\n')}
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

      return xml;
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
