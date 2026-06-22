#!/usr/bin/env node
// Genera public/sitemap.xml combinando rutas fijas + posts de blog (dinámicos desde la API).
// Se ejecuta en prebuild. Si la API no responde, escribe solo las rutas fijas (no rompe el build).

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = process.env.VITE_SITE_URL || 'https://resonaevents.com';
const API = process.env.VITE_API_URL || 'https://resona-backend.onrender.com/api/v1';
const OUT = resolve(__dirname, '../public/sitemap.xml');

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/bodas', changefreq: 'monthly', priority: '0.95' },
  { path: '/eventos', changefreq: 'monthly', priority: '0.9' },
  { path: '/servicios', changefreq: 'monthly', priority: '0.85' },
  { path: '/portfolio', changefreq: 'weekly', priority: '0.9' },
  { path: '/portfolio/boda-maria-jorge', changefreq: 'monthly', priority: '0.7' },
  { path: '/portfolio/adidas-valencia-run', changefreq: 'monthly', priority: '0.7' },
  { path: '/portfolio/boda-clara-pablo', changefreq: 'monthly', priority: '0.7' },
  { path: '/portfolio/coca-cola-summer-camp', changefreq: 'monthly', priority: '0.7' },
  { path: '/portfolio/boda-lucia-alex', changefreq: 'monthly', priority: '0.7' },
  { path: '/portfolio/ayuntamiento-valencia-fallas', changefreq: 'monthly', priority: '0.7' },
  { path: '/estudio', changefreq: 'monthly', priority: '0.7' },
  { path: '/brief', changefreq: 'monthly', priority: '0.9' },
  { path: '/packs', changefreq: 'monthly', priority: '0.95' },
  { path: '/packs/boda-esencial', changefreq: 'monthly', priority: '0.9' },
  { path: '/packs/boda-completo', changefreq: 'monthly', priority: '0.9' },
  { path: '/packs/boda-premium', changefreq: 'monthly', priority: '0.9' },
  { path: '/packs/corporativo-presentacion', changefreq: 'monthly', priority: '0.85' },
  { path: '/packs/corporativo-convencion', changefreq: 'monthly', priority: '0.85' },
  { path: '/contacto', changefreq: 'yearly', priority: '0.6' },
  { path: '/faqs', changefreq: 'monthly', priority: '0.6' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  { path: '/aviso-legal', changefreq: 'yearly', priority: '0.2' },
  { path: '/politica-privacidad', changefreq: 'yearly', priority: '0.2' },
  { path: '/politica-cookies', changefreq: 'yearly', priority: '0.2' },
  { path: '/terminos-condiciones', changefreq: 'yearly', priority: '0.2' },
];

async function fetchBlogRoutes() {
  try {
    const res = await fetch(`${API}/blog/posts?limit=1000`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const posts = json.posts || json.data?.posts || json.data || [];
    return posts
      .filter((p) => p.slug)
      .map((p) => ({
        path: `/blog/${p.slug}`,
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: (p.updatedAt || p.publishedAt || '').slice(0, 10) || undefined,
      }));
  } catch (err) {
    console.warn(`[sitemap] No se pudieron obtener posts del blog (${err.message}). Genero solo rutas fijas.`);
    return [];
  }
}

function urlEntry({ path, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${SITE}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function main() {
  const blogRoutes = await fetchBlogRoutes();
  const routes = [...STATIC_ROUTES, ...blogRoutes];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map(urlEntry),
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(OUT, xml, 'utf8');
  console.log(`[sitemap] Generado con ${routes.length} URLs (${blogRoutes.length} posts de blog) → ${OUT}`);
}

main();
