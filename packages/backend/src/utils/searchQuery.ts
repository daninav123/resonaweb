import { Prisma } from '@prisma/client';

const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const normalize = (s: string) => stripAccents(s.toLowerCase()).trim();

// Grupos de sinónimos por dominio del catálogo. Cada token de una búsqueda que
// caiga en un grupo se expande a todos los miembros del grupo, de forma que
// buscar "altavoces" también encuentre productos nombrados por marca cuya
// descripción menciona "altavoz", "PA" o "bafle".
const SYNONYM_GROUPS: string[][] = [
  ['altavoz', 'altavoces', 'bafle', 'bafles', 'pa', 'monitor', 'monitores', 'sonido', 'columna'],
  ['microfono', 'microfonos', 'micro', 'micros', 'mic', 'microfonia', 'inalambrico'],
  ['foco', 'focos', 'luz', 'luces', 'iluminacion', 'wash', 'moving', 'cabezal'],
  ['pantalla', 'pantallas', 'led', 'proyeccion', 'proyector', 'videowall', 'display'],
  ['mesa', 'mesas', 'mezclas', 'mixer', 'mezcladora', 'consola'],
  ['cable', 'cables', 'cableado', 'xlr', 'jack', 'dmx'],
  // "zapatilla" es como se conoce popularmente a la regleta eléctrica.
  ['regleta', 'regletas', 'zapatilla', 'zapatillas', 'ladron', 'ladrones', 'alargador', 'alargadera'],
  ['dj', 'plato', 'platos', 'controladora', 'giradiscos'],
  ['humo', 'niebla', 'maquina', 'fx', 'confeti'],
];

const synonymsFor = (token: string): string[] => {
  const out: string[] = [];
  for (const group of SYNONYM_GROUPS) {
    if (group.includes(token)) out.push(...group);
  }
  return out;
};

// Variantes morfológicas simples (español) singular <-> plural.
const morphVariants = (token: string): string[] => {
  const out = new Set<string>([token]);
  if (token.length > 3) {
    if (token.endsWith('ces')) out.add(token.slice(0, -3) + 'z'); // altavoces -> altavoz
    else if (token.endsWith('es')) out.add(token.slice(0, -2)); // paneles -> panel
    else if (token.endsWith('s')) out.add(token.slice(0, -1)); // focos -> foco
  }
  if (token.endsWith('z')) out.add(token.slice(0, -1) + 'ces'); // luz -> luces
  else if (/[aeiou]$/.test(token)) out.add(token + 's'); // foco -> focos
  else out.add(token + 'es'); // panel -> paneles
  return [...out];
};

const expandToken = (rawToken: string): string[] => {
  const token = normalize(rawToken);
  if (!token) return [];
  // El término escrito por el usuario se respeta siempre (aunque sea corto).
  const variants = new Set<string>([rawToken.toLowerCase(), token]);
  // Las variantes automáticas (plural/singular, sinónimos) sí se filtran por
  // longitud: un sinónimo de 2 letras como "pa" produciría ruido como substring
  // ("zaPAtillas", "Cabina PAlets").
  for (const m of morphVariants(token)) {
    if (m.length >= 3) variants.add(m);
    for (const syn of synonymsFor(m)) {
      if (syn.length >= 3) variants.add(syn);
    }
  }
  return [...variants].filter((v) => v.length >= 2);
};

/**
 * Construye el filtro de Prisma para una búsqueda de texto libre.
 *
 * Cada palabra de la query debe encontrar coincidencia (AND entre palabras),
 * y una palabra coincide si cualquiera de sus variantes (acentos, singular/
 * plural, sinónimos) aparece en name, description, sku o tags (OR).
 */
export const buildSearchFilter = (
  query?: string
): Prisma.ProductWhereInput | undefined => {
  if (!query || !query.trim()) return undefined;

  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return undefined;

  const AND: Prisma.ProductWhereInput[] = tokens.map((token) => {
    const variants = expandToken(token);
    const OR: Prisma.ProductWhereInput[] = variants.flatMap((v) => [
      { name: { contains: v, mode: 'insensitive' as const } },
      { description: { contains: v, mode: 'insensitive' as const } },
      { sku: { contains: v, mode: 'insensitive' as const } },
      { tags: { has: v } },
      // Muchos productos se nombran por marca/modelo (p.ej. "LD System Icoa 15a")
      // y solo la categoría contiene el término genérico ("SONIDO", "MICROFONIA").
      { category: { is: { name: { contains: v, mode: 'insensitive' as const } } } },
    ]);
    return { OR };
  });

  return { AND };
};
