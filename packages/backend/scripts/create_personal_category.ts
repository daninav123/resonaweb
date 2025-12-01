import { prisma } from '../src/index';

async function createPersonalCategory() {
  try {
    console.log('🔄 Creando categoría "Personal" oculta...');
    
    // Verificar si ya existe
    const existing = await prisma.category.findUnique({
      where: { slug: 'personal' }
    });
    
    if (existing) {
      console.log('✅ La categoría "Personal" ya existe');
      if (!existing.isHidden) {
        // Actualizar para hacerla oculta
        await prisma.category.update({
          where: { id: existing.id },
          data: { isHidden: true }
        });
        console.log('✅ Categoría actualizada a oculta');
      }
      process.exit(0);
    }
    
    // Crear la categoría
    const category = await prisma.category.create({
      data: {
        name: 'Personal',
        slug: 'personal',
        description: 'Categoría oculta para personal (técnicos, montadores, DJ, etc)',
        isActive: true,
        isHidden: true,  // OCULTA
        featured: false,
        sortOrder: 999
      }
    });
    
    console.log('✅ Categoría "Personal" creada exitosamente');
    console.log('📋 ID:', category.id);
    console.log('🔒 Oculta: Sí');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createPersonalCategory();
