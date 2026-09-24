/**
 * Carga masiva de fotos de producto a Cloudinary.
 *
 * Subirlas una a una por el panel son 49 vueltas de buscar producto, abrir
 * modal, elegir archivo y guardar. Esto lo hace en dos pasos.
 *
 * USO:
 *   1. Deja las imágenes en una carpeta, nombradas parecido al producto:
 *        das-audio-action-215a.jpg, truss-2m.png, tarima-2x1.jpg...
 *   2. npx ts-node --transpile-only src/scripts/bulk-upload-product-photos.ts --plan <carpeta>
 *      Escribe un plan en ./plan-fotos.json con el producto que ha emparejado
 *      para cada archivo, y marca los dudosos. REVÍSALO y corrige a mano lo
 *      que haga falta: basta con cambiar el campo productId.
 *   3. npx ts-node --transpile-only src/scripts/bulk-upload-product-photos.ts --apply
 *
 * Solo toca productos sin imagen viva, salvo que se pase --overwrite.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const PLAN_FILE = path.join(process.cwd(), 'plan-fotos.json');
const EXT_VALIDAS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

type Entrada = {
  archivo: string;
  productId: string | null;
  productName: string | null;
  confianza: number;
  nota?: string;
};

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Similitud por palabras compartidas, ponderada por longitud. */
function similitud(a: string, b: string): number {
  const pa = new Set(normalizar(a).split(' ').filter((w) => w.length > 1));
  const pb = new Set(normalizar(b).split(' ').filter((w) => w.length > 1));
  if (!pa.size || !pb.size) return 0;
  let comunes = 0;
  for (const w of pa) if (pb.has(w)) comunes++;
  return (2 * comunes) / (pa.size + pb.size);
}

async function plan(carpeta: string) {
  if (!fs.existsSync(carpeta)) {
    console.error(`❌ No existe la carpeta: ${carpeta}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const productos = await prisma.product.findMany({ select: { id: true, name: true } });

  const archivos = fs
    .readdirSync(carpeta)
    .filter((f) => EXT_VALIDAS.includes(path.extname(f).toLowerCase()));

  if (!archivos.length) {
    console.error(`❌ No hay imágenes en ${carpeta} (${EXT_VALIDAS.join(', ')})`);
    process.exit(1);
  }

  const entradas: Entrada[] = archivos.map((archivo) => {
    const base = path.basename(archivo, path.extname(archivo));
    let mejor = { p: null as { id: string; name: string } | null, s: 0 };
    for (const p of productos) {
      const s = similitud(base, p.name);
      if (s > mejor.s) mejor = { p, s };
    }
    return {
      archivo,
      productId: mejor.s >= 0.34 ? mejor.p!.id : null,
      productName: mejor.s >= 0.34 ? mejor.p!.name : null,
      confianza: Number(mejor.s.toFixed(2)),
      ...(mejor.s < 0.34 ? { nota: 'SIN EMPAREJAR — rellena productId a mano' } : {}),
      ...(mejor.s >= 0.34 && mejor.s < 0.6 ? { nota: 'DUDOSO — revisa' } : {}),
    };
  });

  fs.writeFileSync(PLAN_FILE, JSON.stringify({ carpeta, entradas }, null, 2));

  const seguros = entradas.filter((e) => e.confianza >= 0.6).length;
  const dudosos = entradas.filter((e) => e.confianza >= 0.34 && e.confianza < 0.6).length;
  const sueltos = entradas.filter((e) => !e.productId).length;

  console.log(`\n${archivos.length} imágenes · ${productos.length} productos\n`);
  for (const e of entradas) {
    const marca = !e.productId ? '  ?  ' : e.confianza >= 0.6 ? '  ok ' : '  ~  ';
    console.log(`${marca} ${e.archivo.slice(0, 40).padEnd(42)} ${e.productName ?? '(sin emparejar)'}`);
  }
  console.log(`\nseguros: ${seguros} · dudosos: ${dudosos} · sin emparejar: ${sueltos}`);
  console.log(`\nPlan escrito en ${PLAN_FILE}`);
  console.log('Revísalo, corrige los productId que haga falta, y luego --apply');

  await prisma.$disconnect();
}

async function apply(overwrite: boolean) {
  if (process.env.CLOUDINARY_ENABLED !== 'true') {
    console.error('❌ CLOUDINARY_ENABLED no es "true" en .env');
    process.exit(1);
  }
  if (!fs.existsSync(PLAN_FILE)) {
    console.error(`❌ No hay plan. Ejecuta primero --plan <carpeta>`);
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

  const { carpeta, entradas } = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8')) as {
    carpeta: string;
    entradas: Entrada[];
  };

  const prisma = new PrismaClient();
  const folder = `${process.env.CLOUDINARY_FOLDER || 'resona'}/products`;
  let subidas = 0;
  let saltadas = 0;
  let fallos = 0;

  for (const e of entradas) {
    if (!e.productId) {
      console.log(`  —  ${e.archivo}: sin producto asignado`);
      saltadas++;
      continue;
    }

    const producto = await prisma.product.findUnique({
      where: { id: e.productId },
      select: { id: true, name: true, mainImageUrl: true, images: true },
    });
    if (!producto) {
      console.log(`  ✗  ${e.archivo}: productId no existe`);
      fallos++;
      continue;
    }
    if (!overwrite && producto.mainImageUrl?.startsWith('http')) {
      console.log(`  —  ${producto.name}: ya tiene imagen (usa --overwrite para reemplazar)`);
      saltadas++;
      continue;
    }

    try {
      const res = await cloudinary.uploader.upload(path.join(carpeta, e.archivo), {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      await prisma.product.update({
        where: { id: producto.id },
        data: {
          mainImageUrl: res.secure_url,
          images: [res.secure_url, ...(producto.images || []).filter((i) => i.startsWith('http'))],
        },
      });
      console.log(`  ✓  ${producto.name} → ${res.secure_url}`);
      subidas++;
    } catch (err: any) {
      console.log(`  ✗  ${e.archivo}: ${err.message}`);
      fallos++;
    }
  }

  console.log(`\nsubidas: ${subidas} · saltadas: ${saltadas} · fallos: ${fallos}`);
  await prisma.$disconnect();
}

const args = process.argv.slice(2);
const iPlan = args.indexOf('--plan');

if (iPlan !== -1) {
  plan(args[iPlan + 1]);
} else if (args.includes('--apply')) {
  apply(args.includes('--overwrite'));
} else {
  console.log('Uso:\n  --plan <carpeta>   empareja imágenes con productos\n  --apply            sube y actualiza la BD\n  --apply --overwrite  además reemplaza las que ya tienen foto');
}
