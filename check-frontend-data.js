const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFrontendData() {
  console.log('\n📊 ANÁLISIS DETALLADO DE DATOS EN FRONTEND\n');

  try {
    // 1. Productos activos vs inactivos
    console.log('📦 PRODUCTOS\n');
    
    const allProducts = await prisma.product.findMany({
      where: { isPack: false },
      select: { id: true, name: true, realStock: true, stockStatus: true }
    });

    const activeProducts = allProducts.filter(p => p.stockStatus !== 'OUT_OF_STOCK');
    const inactiveProducts = allProducts.filter(p => p.stockStatus === 'OUT_OF_STOCK');

    console.log(`✅ Productos activos: ${activeProducts.length}`);
    console.log(`⚠️ Productos inactivos: ${inactiveProducts.length}`);
    
    if (inactiveProducts.length > 0) {
      console.log('\n   Inactivos:');
      inactiveProducts.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (${p.stockStatus})`);
      });
      if (inactiveProducts.length > 10) {
        console.log(`   ... y ${inactiveProducts.length - 10} más`);
      }
    }

    // 2. Montajes activos vs inactivos
    console.log('\n\n🚚 MONTAJES\n');
    
    const allMontajes = await prisma.pack.findMany({
      include: { categoryRef: true }
    });

    const activeMontajes = allMontajes.filter(m => m.isActive !== false);
    const inactiveMontajes = allMontajes.filter(m => m.isActive === false);

    console.log(`✅ Montajes activos: ${activeMontajes.length}`);
    console.log(`⚠️ Montajes inactivos: ${inactiveMontajes.length}`);

    if (inactiveMontajes.length > 0) {
      console.log('\n   Inactivos:');
      inactiveMontajes.slice(0, 5).forEach(m => {
        console.log(`   - ${m.name} (${m.categoryRef?.name || 'Sin categoría'})`);
      });
      if (inactiveMontajes.length > 5) {
        console.log(`   ... y ${inactiveMontajes.length - 5} más`);
      }
    }

    // 3. Categorías visibles vs ocultas
    console.log('\n\n📂 CATEGORÍAS\n');
    
    const visibleCategories = await prisma.category.findMany({
      where: { isHidden: { not: true } },
      select: { id: true, name: true }
    });

    const hiddenCategories = await prisma.category.findMany({
      where: { isHidden: true },
      select: { id: true, name: true }
    });

    console.log(`👁️ Categorías visibles: ${visibleCategories.length}`);
    console.log(`🔒 Categorías ocultas: ${hiddenCategories.length}`);

    if (hiddenCategories.length > 0) {
      console.log('\n   Ocultas:');
      hiddenCategories.forEach(c => {
        console.log(`   - ${c.name}`);
      });
    }

    // 4. Órdenes por estado
    console.log('\n\n📋 ÓRDENES\n');
    
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });

    console.log('   Por estado:');
    ordersByStatus.forEach(os => {
      console.log(`   - ${os.status}: ${os._count}`);
    });

    // 5. Datos que podrían no estar en backup
    console.log('\n\n⚠️ DATOS POTENCIALMENTE NUEVOS\n');

    // Productos creados en últimos 7 días
    const recentProducts = await prisma.product.findMany({
      where: {
        isPack: false,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: { id: true, name: true, createdAt: true }
    });

    if (recentProducts.length > 0) {
      console.log(`📌 Productos creados en últimos 7 días: ${recentProducts.length}`);
      recentProducts.slice(0, 5).forEach(p => {
        console.log(`   - ${p.name} (${p.createdAt.toLocaleDateString('es-ES')})`);
      });
      if (recentProducts.length > 5) {
        console.log(`   ... y ${recentProducts.length - 5} más`);
      }
    }

    // Montajes creados en últimos 7 días
    const recentMontajes = await prisma.pack.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: { id: true, name: true, createdAt: true }
    });

    if (recentMontajes.length > 0) {
      console.log(`\n📌 Montajes creados en últimos 7 días: ${recentMontajes.length}`);
      recentMontajes.slice(0, 5).forEach(m => {
        console.log(`   - ${m.name} (${m.createdAt.toLocaleDateString('es-ES')})`);
      });
      if (recentMontajes.length > 5) {
        console.log(`   ... y ${recentMontajes.length - 5} más`);
      }
    }

    // Órdenes creadas en últimos 7 días
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: { id: true, status: true, createdAt: true }
    });

    if (recentOrders.length > 0) {
      console.log(`\n📌 Órdenes creadas en últimos 7 días: ${recentOrders.length}`);
      recentOrders.slice(0, 5).forEach(o => {
        console.log(`   - Orden ${o.id.slice(0, 8)}... (${o.status}) - ${o.createdAt.toLocaleDateString('es-ES')}`);
      });
      if (recentOrders.length > 5) {
        console.log(`   ... y ${recentOrders.length - 5} más`);
      }
    }

    console.log('\n✅ Análisis completado\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFrontendData();
