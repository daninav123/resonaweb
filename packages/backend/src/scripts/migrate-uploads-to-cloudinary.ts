/**
 * Script one-off para migrar las imágenes locales (packages/backend/uploads)
 * a Cloudinary y actualizar todas las referencias en la BD.
 *
 * USO:
 *   1. Activar Cloudinary en .env (ver cloudinaryUpload.middleware.ts).
 *   2. `npm install cloudinary` en packages/backend.
 *   3. Ejecutar: `npx ts-node src/scripts/migrate-uploads-to-cloudinary.ts [--dry-run]`
 *
 * Sube cada archivo en /uploads/products manteniendo el mismo basename como public_id,
 * y actualiza Product.mainImageUrl, Product.images[], Pack.imageUrl y BlogPost.featuredImage
 * reemplazando la ruta /uploads/... por la URL https de Cloudinary.
 *
 * Idempotente: si un archivo ya existe en Cloudinary lo reutiliza (overwrite=false).
 *
 * Logs en consola + reporte en stdout. Crea archivo /tmp/migrate-uploads-report.json.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '../..');
const UPLOAD_ROOTS = [
  path.join(ROOT, 'uploads'),
  path.join(ROOT, 'public/uploads'),
];

interface MigrationResult {
  total: number;
  uploaded: number;
  skipped: number;
  failed: number;
  mapping: Record<string, string>; // localPath → cloudinaryUrl
  dbUpdates: { model: string; field: string; count: number }[];
}

async function main() {
  console.log(`[migrate] modo: ${DRY_RUN ? 'DRY-RUN' : 'REAL'}`);

  if (process.env.CLOUDINARY_ENABLED !== 'true') {
    console.error('❌ CLOUDINARY_ENABLED no es "true". Configura .env primero.');
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { v2: cloudinary } = require('cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const folder = process.env.CLOUDINARY_FOLDER || 'resona-events';
  const prisma = new PrismaClient();
  const result: MigrationResult = {
    total: 0,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    mapping: {},
    dbUpdates: [],
  };

  // 1. Recopilar todos los archivos de imagen en las carpetas de uploads
  const files: { absPath: string; relativePath: string }[] = [];
  for (const root of UPLOAD_ROOTS) {
    if (!fs.existsSync(root)) continue;
    const walk = (dir: string, prefix: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        const rel = path.join(prefix, entry.name);
        if (entry.isDirectory()) walk(p, rel);
        else if (/\.(png|jpe?g|gif|webp|avif)$/i.test(entry.name)) {
          files.push({ absPath: p, relativePath: rel });
        }
      }
    };
    walk(root, '');
  }
  result.total = files.length;
  console.log(`[migrate] ${files.length} archivos detectados`);

  // 2. Subir cada uno a Cloudinary
  for (const f of files) {
    const subfolder = f.relativePath.startsWith('products')
      ? 'products'
      : f.relativePath.startsWith('blog')
      ? 'blog'
      : 'misc';
    const publicId = path
      .basename(f.absPath, path.extname(f.absPath))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const localKey = `/uploads/${f.relativePath.replace(/\\/g, '/')}`;

    if (DRY_RUN) {
      result.mapping[localKey] = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${folder}/${subfolder}/${publicId}`;
      result.uploaded++;
      continue;
    }

    try {
      const up = await cloudinary.uploader.upload(f.absPath, {
        folder: `${folder}/${subfolder}`,
        public_id: publicId,
        overwrite: false,
        resource_type: 'image',
        unique_filename: false,
      });
      result.mapping[localKey] = up.secure_url;
      result.uploaded++;
      console.log(`✓ ${localKey} → ${up.secure_url}`);
    } catch (err: any) {
      if (err?.http_code === 409 || /already exists/i.test(err?.message || '')) {
        // Ya existe — construir URL
        const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${folder}/${subfolder}/${publicId}`;
        result.mapping[localKey] = url;
        result.skipped++;
      } else {
        console.error(`✗ ${localKey}:`, err?.message || err);
        result.failed++;
      }
    }
  }

  // 3. Actualizar BD reemplazando rutas /uploads/... por URLs Cloudinary
  const replaceInString = (val: string): string => {
    for (const [local, remote] of Object.entries(result.mapping)) {
      if (val.includes(local)) val = val.split(local).join(remote);
    }
    return val;
  };

  // Product.mainImageUrl + Product.images[]
  const products = await prisma.product.findMany({ select: { id: true, mainImageUrl: true, images: true } });
  let productsUpdated = 0;
  for (const p of products) {
    const newMain = p.mainImageUrl ? replaceInString(p.mainImageUrl) : p.mainImageUrl;
    const oldImages = (p.images as string[] | null) || [];
    const newImages = oldImages.map(replaceInString);
    const changed = newMain !== p.mainImageUrl || JSON.stringify(newImages) !== JSON.stringify(oldImages);
    if (changed) {
      productsUpdated++;
      if (!DRY_RUN) {
        await prisma.product.update({ where: { id: p.id }, data: { mainImageUrl: newMain, images: newImages } });
      }
    }
  }
  result.dbUpdates.push({ model: 'Product', field: 'mainImageUrl+images', count: productsUpdated });

  // Pack.imageUrl
  const packs = await prisma.pack.findMany({ select: { id: true, imageUrl: true } });
  let packsUpdated = 0;
  for (const p of packs) {
    if (!p.imageUrl) continue;
    const n = replaceInString(p.imageUrl);
    if (n !== p.imageUrl) {
      packsUpdated++;
      if (!DRY_RUN) await prisma.pack.update({ where: { id: p.id }, data: { imageUrl: n } });
    }
  }
  result.dbUpdates.push({ model: 'Pack', field: 'imageUrl', count: packsUpdated });

  // BlogPost.featuredImage
  try {
    const posts = await (prisma as any).blogPost.findMany({ select: { id: true, featuredImage: true } });
    let postsUpdated = 0;
    for (const p of posts) {
      if (!p.featuredImage) continue;
      const n = replaceInString(p.featuredImage);
      if (n !== p.featuredImage) {
        postsUpdated++;
        if (!DRY_RUN) await (prisma as any).blogPost.update({ where: { id: p.id }, data: { featuredImage: n } });
      }
    }
    result.dbUpdates.push({ model: 'BlogPost', field: 'featuredImage', count: postsUpdated });
  } catch {
    // BlogPost puede no tener ese campo; ignorar
  }

  await prisma.$disconnect();

  // 4. Reporte
  const reportPath = '/tmp/migrate-uploads-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log('\n=== RESUMEN ===');
  console.log(`Total archivos: ${result.total}`);
  console.log(`Subidos: ${result.uploaded}  Existentes: ${result.skipped}  Fallos: ${result.failed}`);
  for (const u of result.dbUpdates) {
    console.log(`BD ${u.model}.${u.field}: ${u.count} registros ${DRY_RUN ? '(dry-run)' : 'actualizados'}`);
  }
  console.log(`\nReporte completo: ${reportPath}`);
  if (DRY_RUN) console.log('\n⚠️  DRY-RUN — nada se ha escrito en Cloudinary ni en BD.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
