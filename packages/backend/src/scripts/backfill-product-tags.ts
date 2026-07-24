import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tags genéricos por categoría. Refuerzan la búsqueda de texto libre para
// productos nombrados por marca/modelo (p.ej. "LD System Icoa 15a" -> altavoz)
// y permiten filtrado/relacionados por concepto. Clave: nombre de categoría en
// minúsculas. Solo se AÑADEN tags; nunca se eliminan los existentes.
const TAGS_BY_CATEGORY: Record<string, string[]> = {
  sonido: ['altavoz', 'sonido', 'pa', 'audio'],
  'control sonido': ['sonido', 'audio', 'control'],
  microfonia: ['microfono', 'microfonia', 'audio'],
  'mesas de mezcla para directo': ['mesa', 'mezclas', 'sonido', 'audio'],
  iluminacion: ['iluminacion', 'luz', 'foco'],
  'control iluminacion': ['iluminacion', 'control', 'dmx'],
  'pantallas y proyeccion': ['pantalla', 'proyeccion', 'led', 'video'],
  'equipamiento dj': ['dj', 'cabina'],
  cableado: ['cable', 'cableado'],
  fx: ['fx', 'efectos', 'humo'],
  estructuras: ['estructura', 'truss'],
  'elementos decorativos': ['decoracion'],
  'elementos escenario': ['escenario'],
  'generacion y distribucion': ['electricidad', 'distribucion'],
};

const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s: string) => stripAccents(s.toLowerCase()).trim();

async function main() {
  const dryRun = !process.argv.includes('--apply');
  const products = await prisma.product.findMany({
    where: { isActive: true, isPack: false },
    select: { id: true, name: true, tags: true, category: { select: { name: true } } },
  });

  let changed = 0;
  for (const p of products) {
    const catName = norm(p.category?.name || '');
    const catTags = TAGS_BY_CATEGORY[catName] || [];
    if (catTags.length === 0) continue;

    const existing = new Set(p.tags.map((t) => norm(t)));
    const toAdd = catTags.filter((t) => !existing.has(norm(t)));
    if (toAdd.length === 0) continue;

    const newTags = [...p.tags, ...toAdd];
    changed++;
    console.log(`${dryRun ? '[dry]' : '[apply]'} ${p.name} [${p.category?.name}] += ${JSON.stringify(toAdd)}`);
    if (!dryRun) {
      await prisma.product.update({ where: { id: p.id }, data: { tags: newTags } });
    }
  }

  console.log(`\n${dryRun ? 'Se actualizarían' : 'Actualizados'} ${changed}/${products.length} productos.`);
  if (dryRun) console.log('Ejecuta con --apply para escribir en la BD.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
