// Vuelca el catálogo vivo de la BD a tarifa-alquiler.data.mjs.
// Ejecutar cuando cambien precios o stock en el panel: node docs/comercial/extraer-catalogo.mjs
import { writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND = resolve(DIR, '../../packages/backend');
const require = createRequire(join(BACKEND, 'package.json'));

require('dotenv').config({ path: join(BACKEND, '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const num = (v) => (v === null || v === undefined ? null : Number(v));

const products = await prisma.product.findMany({
  where: { isActive: true },
  include: { category: true },
  orderBy: [{ name: 'asc' }],
});

// El desglose de los packs vive en la tabla Pack, que no está relacionada con Product:
// se emparejan por nombre normalizado. Los que no casan se quedan sin desglose.
const normaliza = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const packsBd = await prisma.pack.findMany({
  where: { isActive: true },
  include: { items: { include: { product: { select: { name: true } } } } },
});
const porNombre = new Map(packsBd.map((k) => [normaliza(k.name), k]));

const rows = products.map((p) => ({
  sku: p.sku,
  nombre: p.name,
  categoria: p.category?.name ?? 'Sin categoría',
  dia: num(p.pricePerDay),
  finde: num(p.pricePerWeekend),
  semana: num(p.pricePerWeek),
  stock: p.realStock || p.stock,
  compra: num(p.purchasePrice),
  reposicion: num(p.replacementCost),
  fianzaCustom: num(p.customDeposit),
  pack: p.isPack,
  consumible: p.isConsumable,
  precioUnidad: num(p.pricePerUnit),
  componentes: (porNombre.get(normaliza(p.name))?.items ?? []).map((i) => `${i.quantity}× ${i.product.name}`),
}));

const fecha = new Date().toISOString().slice(0, 10);
const out = `// GENERADO por extraer-catalogo.mjs — no editar a mano.
// Snapshot del catálogo activo de la BD de producción. Precios sin IVA, por día.
export const SNAPSHOT = '${fecha}';
export const CATALOGO = ${JSON.stringify(rows, null, 1)};
`;

writeFileSync(join(DIR, 'tarifa-alquiler.data.mjs'), out);
console.log(`${rows.length} productos activos volcados (${fecha})`);
await prisma.$disconnect();
