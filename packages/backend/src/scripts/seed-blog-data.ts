import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBlogData() {
  console.log('🌱 Sembrando datos del blog...\n');

  try {
    // 1. Crear categorías de blog
    console.log('📁 Creando categorías del blog...');
    
    const blogCategories = [
      {
        name: 'Guías y Tutoriales',
        slug: 'guias-tutoriales',
        description: 'Aprende a organizar eventos perfectos',
        color: '#3B82F6',
      },
      {
        name: 'Tendencias',
        slug: 'tendencias',
        description: 'Las últimas tendencias en eventos',
        color: '#8B5CF6',
      },
      {
        name: 'Casos de Éxito',
        slug: 'casos-exito',
        description: 'Historias reales de nuestros clientes',
        color: '#10B981',
      },
      {
        name: 'Consejos Técnicos',
        slug: 'consejos-tecnicos',
        description: 'Consejos sobre equipamiento audiovisual',
        color: '#F59E0B',
      },
    ];

    const createdCategories = await Promise.all(
      blogCategories.map((category) =>
        prisma.blogCategory.upsert({
          where: { slug: category.slug },
          update: category,
          create: category,
        })
      )
    );

    console.log(`✅ ${createdCategories.length} categorías creadas\n`);

    // 2. Obtener usuario admin para asignar como autor
    console.log('👤 Buscando usuario admin...');
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPERADMIN' },
        ],
      },
    });

    if (!admin) {
      console.error('❌ No se encontró un usuario admin. Crea uno primero.');
      return;
    }

    console.log(`✅ Autor encontrado: ${admin.firstName} ${admin.lastName}\n`);

    // 3. Crear artículos de ejemplo
    console.log('📝 Creando artículos...');

    const blogPosts = [
      {
        title: 'Cómo elegir el equipo de sonido perfecto para tu evento',
        slug: 'como-elegir-equipo-sonido-perfecto',
        excerpt: 'Descubre los factores clave para seleccionar el sistema de audio ideal según el tipo de evento, tamaño del espacio y número de asistentes.',
        content: `
# Guía completa para elegir el equipo de sonido

Elegir el equipo de sonido adecuado es fundamental para el éxito de cualquier evento. En esta guía te explicamos todo lo que necesitas saber.

## Factores a considerar

### 1. Tamaño del espacio
- **Eventos pequeños (hasta 50 personas)**: Altavoces de 300-500W
- **Eventos medianos (50-200 personas)**: Sistema de 1000-2000W
- **Eventos grandes (200+ personas)**: Sistema line array profesional

### 2. Tipo de evento
- **Bodas**: Sonido equilibrado, música ambiental y micrófono para ceremonias
- **Conciertos**: Sistema potente con subwoofers para bajos profundos
- **Conferencias**: Enfoque en claridad vocal y micrófonos inalámbricos

### 3. Presupuesto
En ReSona Events ofrecemos equipos de diferentes gamas para adaptarnos a tu presupuesto sin comprometer la calidad.

## Recomendaciones profesionales

1. Siempre haz una prueba de sonido previa
2. Considera la acústica del lugar
3. Ten equipos de respaldo para imprevistos
4. Contrata a un técnico de sonido profesional

¿Necesitas ayuda para elegir? Contacta con nuestro equipo y te asesoramos gratuitamente.
        `,
        metaTitle: 'Cómo elegir equipo de sonido para eventos | ReSona',
        metaDescription: 'Guía profesional para seleccionar el sistema de audio perfecto. Aprende a elegir según tamaño, tipo de evento y presupuesto.',
        metaKeywords: 'equipo sonido, audio eventos, altavoces eventos, sistema audio',
        categoryId: createdCategories[0].id, // Guías y Tutoriales
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: admin.id,
        views: 127,
        likes: 23,
        aiGenerated: false,
      },
      {
        title: 'Tendencias en iluminación para eventos 2025',
        slug: 'tendencias-iluminacion-eventos-2025',
        excerpt: 'Las últimas tendencias en iluminación LED, efectos especiales y diseño lumínico que marcarán la diferencia en tus eventos este año.',
        content: `
# Tendencias en iluminación 2025

La iluminación ha evolucionado significativamente. Estas son las tendencias que dominarán en 2025.

## 1. Iluminación LED inteligente
Los sistemas LED con control DMX permiten crear ambientes personalizados con millones de colores.

## 2. Mapping y proyecciones
El mapping 3D transforma espacios ordinarios en experiencias visuales inolvidables.

## 3. Sostenibilidad
Equipos de bajo consumo energético que cuidan el medio ambiente sin comprometer la espectacularidad.

## 4. Sincronización con música
Sistemas que reaccionan automáticamente al ritmo de la música creando efectos dinámicos.

## Nuestros equipos recomendados
- Moving Heads LED
- Barras LED RGB
- Par LED 54x3W
- Láser multicolor

Descubre todos nuestros equipos de iluminación en nuestro catálogo.
        `,
        categoryId: createdCategories[1].id, // Tendencias
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        authorId: admin.id,
        views: 89,
        likes: 15,
        aiGenerated: false,
      },
      {
        title: 'Caso de éxito: Boda en Valencia con 300 invitados',
        slug: 'caso-exito-boda-valencia-300-invitados',
        excerpt: 'Descubre cómo transformamos la boda de María y Carlos con nuestro equipo audiovisual profesional en un evento inolvidable.',
        content: `
# Boda de ensueño en Valencia

María y Carlos confiaron en ReSona Events para el equipamiento audiovisual de su boda. Aquí te contamos cómo fue.

## El desafío
- 300 invitados
- Ceremonia al aire libre
- Cena y fiesta en interior
- 12 horas de evento

## La solución
- **Sonido**: Sistema line array JBL con subwoofers
- **Iluminación**: 20 moving heads + barras LED
- **DJ**: Mesa Pioneer DJM-900 con CDJ-3000
- **Técnico**: Profesional in situ durante todo el evento

## Resultado
Los novios y los invitados quedaron encantados. La calidad del sonido fue perfecta en cada momento.

> "El equipo de ReSona Events hizo que nuestra boda fuera perfecta. El sonido era cristalino y la iluminación creó una atmósfera mágica." - María & Carlos

¿Planeas tu boda? Contacta con nosotros para un presupuesto personalizado.
        `,
        categoryId: createdCategories[2].id, // Casos de Éxito
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
        authorId: admin.id,
        views: 234,
        likes: 42,
        aiGenerated: false,
      },
      {
        title: 'Configuración básica de una mesa de mezclas DJ',
        slug: 'configuracion-basica-mesa-mezclas-dj',
        excerpt: 'Tutorial paso a paso para configurar correctamente una mesa de mezclas Pioneer DJM. Ideal para DJs principiantes y intermedios.',
        content: `
# Tutorial: Mesa de mezclas DJ

Aprende a configurar correctamente una mesa de mezclas Pioneer DJM en 5 pasos.

## Paso 1: Conexiones básicas
1. Conecta los CDJs o controladores a los canales
2. Conecta los altavoces a la salida Master
3. Conecta los auriculares

## Paso 2: Niveles de ganancia
Ajusta el trim (gain) de cada canal para que las pistas tengan volumen similar.

## Paso 3: Ecualización
- **HI (agudos)**: Controla brillo y claridad
- **MID (medios)**: Controla voces e instrumentos
- **LOW (graves)**: Controla bajos y bombo

## Paso 4: Filtros y efectos
Experimenta con los filtros HPF/LPF para crear transiciones suaves.

## Paso 5: Crossfader
Ajusta la curva del crossfader según tu estilo:
- **Curva pronunciada**: Ideal para scratching
- **Curva suave**: Mejor para mezclas largas

¿Quieres alquilar equipo DJ profesional? Consulta nuestro catálogo.
        `,
        categoryId: createdCategories[3].id, // Consejos Técnicos
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 días atrás
        authorId: admin.id,
        views: 156,
        likes: 28,
        aiGenerated: false,
      },
      {
        title: '10 errores comunes al alquilar equipo audiovisual',
        slug: '10-errores-comunes-alquilar-equipo-audiovisual',
        excerpt: 'Evita estos errores frecuentes al alquilar material para eventos. Consejos de profesionales con más de 10 años de experiencia.',
        content: `
# 10 errores a evitar

Después de miles de eventos, hemos visto estos errores repetirse. Aquí te explicamos cómo evitarlos.

## 1. No hacer prueba de sonido
Siempre reserva tiempo para una prueba previa.

## 2. Subestimar la potencia necesaria
Mejor sobrar que faltar potencia. Un sistema subdimensionado arruinará tu evento.

## 3. No considerar el espacio
La acústica del lugar es crucial. Espacios abiertos necesitan más potencia.

## 4. Olvidar equipos de respaldo
Los imprevistos ocurren. Ten siempre un plan B.

## 5. No contratar técnico
Un técnico profesional puede resolver problemas al instante.

## 6. Elegir por precio solamente
La calidad importa. El equipo barato puede fallar en el momento crítico.

## 7. No revisar cables y conectores
Lleva siempre cables de repuesto.

## 8. No considerar el tiempo de montaje
El montaje puede llevar 2-4 horas. Planifica con tiempo.

## 9. No probar el equipo al recibirlo
Revisa todo funciona antes de salir del punto de recogida.

## 10. No leer el contrato
Lee bien las condiciones de alquiler, seguros y penalizaciones.

En ReSona Events te asesoramos en todo el proceso para evitar estos errores.
        `,
        categoryId: createdCategories[0].id, // Guías y Tutoriales
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 días atrás
        authorId: admin.id,
        views: 312,
        likes: 67,
        aiGenerated: false,
      },
    ];

    const createdPosts = await Promise.all(
      blogPosts.map((post) =>
        prisma.blogPost.create({
          data: post,
        })
      )
    );

    console.log(`✅ ${createdPosts.length} artículos creados\n`);

    // 4. Crear algunos tags
    console.log('🏷️  Creando tags...');
    
    const tags = [
      { name: 'Sonido', slug: 'sonido' },
      { name: 'Iluminación', slug: 'iluminacion' },
      { name: 'DJ', slug: 'dj' },
      { name: 'Bodas', slug: 'bodas' },
      { name: 'Eventos corporativos', slug: 'eventos-corporativos' },
      { name: 'Tutorial', slug: 'tutorial' },
    ];

    const createdTags = await Promise.all(
      tags.map((tag) =>
        prisma.blogTag.upsert({
          where: { slug: tag.slug },
          update: tag,
          create: tag,
        })
      )
    );

    console.log(`✅ ${createdTags.length} tags creados\n`);

    // 5. Asignar tags a posts
    console.log('🔗 Asignando tags a artículos...');
    
    // Post 1: Guía de sonido
    await prisma.blogPost.update({
      where: { id: createdPosts[0].id },
      data: {
        tags: {
          connect: [
            { id: createdTags[0].id }, // Sonido
            { id: createdTags[5].id }, // Tutorial
          ],
        },
      },
    });

    // Post 2: Iluminación
    await prisma.blogPost.update({
      where: { id: createdPosts[1].id },
      data: {
        tags: {
          connect: [
            { id: createdTags[1].id }, // Iluminación
          ],
        },
      },
    });

    // Post 3: Caso de éxito boda
    await prisma.blogPost.update({
      where: { id: createdPosts[2].id },
      data: {
        tags: {
          connect: [
            { id: createdTags[0].id }, // Sonido
            { id: createdTags[1].id }, // Iluminación
            { id: createdTags[3].id }, // Bodas
          ],
        },
      },
    });

    // Post 4: Tutorial DJ
    await prisma.blogPost.update({
      where: { id: createdPosts[3].id },
      data: {
        tags: {
          connect: [
            { id: createdTags[2].id }, // DJ
            { id: createdTags[5].id }, // Tutorial
          ],
        },
      },
    });

    // Post 5: Errores comunes
    await prisma.blogPost.update({
      where: { id: createdPosts[4].id },
      data: {
        tags: {
          connect: [
            { id: createdTags[0].id }, // Sonido
            { id: createdTags[5].id }, // Tutorial
          ],
        },
      },
    });

    console.log('✅ Tags asignados correctamente\n');

    console.log('═'.repeat(60));
    console.log('✅ DATOS DEL BLOG SEMBRADOS EXITOSAMENTE');
    console.log('═'.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`   - ${createdCategories.length} categorías`);
    console.log(`   - ${createdPosts.length} artículos publicados`);
    console.log(`   - ${createdTags.length} tags`);
    console.log(`\n🌐 Accede al blog en: http://localhost:3000/blog`);
    console.log(`👑 Gestiona el blog en: http://localhost:3000/admin/blog\n`);

  } catch (error) {
    console.error('❌ Error sembrando datos del blog:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
seedBlogData()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Proceso fallido:', error);
    process.exit(1);
  });
