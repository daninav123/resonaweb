// Escribe en la BD los precios ya reflejados en el dossier.
//   node docs/comercial/aplicar-ajustes-bd.mjs             → simulacro, no toca nada
//   node docs/comercial/aplicar-ajustes-bd.mjs --escribir  → aplica los cambios
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { catalogoAjustado } from './catalogo-ajustado.mjs';
import { EXCLUIDOS } from './reglas-alquiler.data.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND = resolve(DIR, '../../packages/backend');
const require = createRequire(join(BACKEND, 'package.json'));
require('dotenv').config({ path: join(BACKEND, '.env') });
const { PrismaClient } = require('@prisma/client');

const ESCRIBIR = process.argv.includes('--escribir');
const prisma = new PrismaClient();

const { items, cambios } = catalogoAjustado();
const afectados = [...new Set(cambios.map((c) => c.sku))].filter((sku) => !EXCLUIDOS.includes(sku));

const eur = (n) => `${Number(n).toFixed(2)} €`;

console.log(ESCRIBIR ? '── APLICANDO CAMBIOS ──' : '── SIMULACRO (usa --escribir para aplicar) ──');

let ok = 0;
for (const sku of afectados) {
  const p = items.find((x) => x.sku === sku);
  const suyos = cambios.filter((c) => c.sku === sku);
  const detalle = suyos.map((c) => `${c.campo} ${eur(c.antes)} → ${eur(c.despues)}`).join(' · ');
  console.log(`${sku.padEnd(34)} ${detalle}   ${p.nombre}`);

  if (!ESCRIBIR) continue;
  const actual = await prisma.product.findUnique({ where: { sku }, select: { id: true, pricePerDay: true } });
  if (!actual) {
    console.log(`   ⚠ no existe en la BD, se salta`);
    continue;
  }
  const enBd = Number(actual.pricePerDay);
  const esperado = suyos.find((c) => c.campo === 'dia')?.antes ?? p.dia;
  if (Math.abs(enBd - esperado) > 0.005) {
    console.log(`   ⚠ la BD tiene ${eur(enBd)} y el snapshot decía ${eur(esperado)}: alguien lo cambió, se salta`);
    continue;
  }
  await prisma.product.update({
    where: { id: actual.id },
    data: { pricePerDay: p.dia, pricePerWeekend: p.finde, pricePerWeek: p.semana },
  });
  ok++;
}

console.log(`\n${afectados.length} productos con cambios.`);
if (ESCRIBIR) {
  console.log(`${ok} actualizados en la BD. Vuelve a ejecutar extraer-catalogo.mjs para refrescar el snapshot.`);
} else {
  console.log('Nada escrito.');
}

await prisma.$disconnect();
