// Genera versiones responsive en WebP (con fallback JPG) de las fotos reales.
//
// Existe porque los heroes se servían desde Unsplash a 2400px: 559 KB descargados desde
// un dominio externo con prioridad alta, en un tráfico que es 97% móvil. Google puntuaba
// la experiencia de la landing como BELOW_AVERAGE en todas las keywords de Ads.
//
//   npm run images --workspace=events
//
// El manifiesto es explícito a propósito: en public/images/ hay duplicados de la misma
// foto en distintos tamaños, y el nombre del archivo generado se usa desde el código.

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/images');
const OUT = path.join(ROOT, 'public/images/opt');

const WIDTHS = [640, 960, 1440, 1920];
const WEBP_QUALITY = 72;
const JPEG_QUALITY = 76;

// origen → slug de salida. Se eligió la copia de mayor resolución de cada foto.
const MANIFEST = [
  ['boda-carla-john-resona-events.JPG', 'boda-disco-cabina'],
  ['dani-resona-events-dj.JPG', 'dj-directo'],
  ['resona-huerto-montesinos-banquete.jpg', 'banquete-masia'],
  ['iluminacion-disco-azul-resona-events-montesinos-valencia.jpg', 'iluminacion-truss-azul'],
  ['resona-events-cabina-dj-letras-luminosas.jpg', 'cabina-dj-letras'],
  ['resona-events-luces-guirnalda-noche.jpg', 'guirnaldas-noche'],
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function fileSize(p) {
  try {
    return (await fs.stat(p)).size;
  } catch {
    return 0;
  }
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  let totalIn = 0;
  let totalOut = 0;

  for (const [file, slug] of MANIFEST) {
    const srcPath = path.join(SRC, file);
    if (!(await fileSize(srcPath))) {
      console.log(`⚠️  falta ${file}, se salta`);
      continue;
    }

    const meta = await sharp(srcPath).metadata();
    const srcBytes = await fileSize(srcPath);
    totalIn += srcBytes;

    const widths = WIDTHS.filter((w) => w <= meta.width);
    if (!widths.length) widths.push(meta.width);

    const generated = [];
    for (const width of widths) {
      const webp = path.join(OUT, `${slug}-${width}.webp`);
      await sharp(srcPath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webp);
      generated.push(webp);
    }

    // Un único JPG de respaldo para navegadores sin WebP.
    const fallbackWidth = widths[Math.min(1, widths.length - 1)];
    const jpg = path.join(OUT, `${slug}-${fallbackWidth}.jpg`);
    await sharp(srcPath)
      .rotate()
      .resize({ width: fallbackWidth, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(jpg);
    generated.push(jpg);

    let outBytes = 0;
    for (const g of generated) outBytes += await fileSize(g);
    totalOut += outBytes;

    const biggest = await fileSize(path.join(OUT, `${slug}-${widths[widths.length - 1]}.webp`));
    console.log(
      `${slug.padEnd(24)} ${meta.width}x${meta.height} · ${kb(srcBytes).padStart(8)} → ${widths.join('/')}px · mayor WebP ${kb(biggest)}`,
    );
  }

  console.log(`\nOriginales ${kb(totalIn)} → generados ${kb(totalOut)} (${MANIFEST.length} fotos)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
