/**
 * Repara rutas de imagen que quedaron HTML-escapadas en BDD (`&#x2F;` en vez de `/`).
 * Las escribió una versión antigua de sanitize.middleware.ts que escapaba `/`.
 *
 * Uso:  ts-node scripts/fix-escaped-image-urls.ts          (dry-run)
 *       ts-node scripts/fix-escaped-image-urls.ts --apply  (escribe)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const ENTITIES: Record<string, string> = {
  '&#x2F;': '/',
  '&#x27;': "'",
  '&quot;': '"',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
};

function unescapeHtml(value: string): string {
  let out = value;
  for (const [entity, char] of Object.entries(ENTITIES)) {
    out = out.split(entity).join(char);
  }
  return out;
}

const needsFix = (value?: string | null) => !!value && unescapeHtml(value) !== value;

async function main() {
  let fixed = 0;

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, mainImageUrl: true, images: true },
  });

  for (const p of products) {
    const images = (p.images as string[] | null) || [];
    const dirtyMain = needsFix(p.mainImageUrl);
    const dirtyImages = images.some(needsFix);
    if (!dirtyMain && !dirtyImages) continue;

    const data: { mainImageUrl?: string; images?: string[] } = {};
    if (dirtyMain) data.mainImageUrl = unescapeHtml(p.mainImageUrl!);
    if (dirtyImages) data.images = images.map(unescapeHtml);

    console.log(`product ${p.slug}`);
    if (dirtyMain) console.log(`  mainImageUrl: ${p.mainImageUrl} -> ${data.mainImageUrl}`);
    if (dirtyImages) console.log(`  images: ${JSON.stringify(images)} -> ${JSON.stringify(data.images)}`);

    if (APPLY) await prisma.product.update({ where: { id: p.id }, data });
    fixed++;
  }

  const packs = await prisma.pack.findMany({ select: { id: true, slug: true, imageUrl: true } });
  for (const pack of packs) {
    if (!needsFix(pack.imageUrl)) continue;
    const imageUrl = unescapeHtml(pack.imageUrl!);
    console.log(`pack ${pack.slug}`);
    console.log(`  imageUrl: ${pack.imageUrl} -> ${imageUrl}`);
    if (APPLY) await prisma.pack.update({ where: { id: pack.id }, data: { imageUrl } });
    fixed++;
  }

  console.log(`\n${APPLY ? 'Corregidos' : 'Pendientes de corregir (dry-run)'}: ${fixed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
