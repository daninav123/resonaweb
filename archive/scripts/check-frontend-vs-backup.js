const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFrontendVsBackup() {
  console.log('\n🔍 COMPARANDO FRONTEND vs BACKUP\n');

  try {
    // 1. Obtener datos del frontend (desde BD)
    console.log('📊 Cargando datos de la BD...\n');

    const products = await prisma.product.findMany({
      where: { isPack: false },
      select: { id: true, name: true, sku: true, realStock: true, purchasePrice: true }
    });

    const packs = await prisma.pack.findMany({
      select: { id: true, name: true, category: true }
    });

    const categories = await prisma.category.findMany({
      select: { id: true, name: true, isHidden: true }
    });

    const orders = await prisma.order.findMany({
      select: { id: true, status: true, total: true }
    });

    console.log(`✅ Productos: ${products.length}`);
    console.log(`✅ Packs/Montajes: ${packs.length}`);
    console.log(`✅ Categorías: ${categories.length}`);
    console.log(`✅ Órdenes: ${orders.length}`);

    // 2. Verificar integridad de datos
    console.log('\n\n📋 VERIFICACIÓN DE INTEGRIDAD\n');

    // Productos sin categoría
    const productsNoCategory = await prisma.product.findMany({
      where: { categoryId: null, isPack: false },
      select: { id: true, name: true }
    });

    if (productsNoCategory.length > 0) {
      console.log(`⚠️ ${productsNoCategory.length} productos sin categoría asignada:`);
      productsNoCategory.slice(0, 5).forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
      });
      if (productsNoCategory.length > 5) {
        console.log(`   ... y ${productsNoCategory.length - 5} más`);
      }
    } else {
      console.log('✅ Todos los productos tienen categoría');
    }

    // Packs sin items
    const packsNoItems = await prisma.pack.findMany({
      where: { items: { none: {} } },
      select: { id: true, name: true }
    });

    if (packsNoItems.length > 0) {
      console.log(`\n⚠️ ${packsNoItems.length} packs/montajes sin items:`);
      packsNoItems.slice(0, 5).forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
      });
      if (packsNoItems.length > 5) {
        console.log(`   ... y ${packsNoItems.length - 5} más`);
      }
    } else {
      console.log('✅ Todos los packs tienen items');
    }

    // Órdenes sin items
    const ordersNoItems = await prisma.order.findMany({
      where: { items: { none: {} } },
      select: { id: true, status: true }
    });

    if (ordersNoItems.length > 0) {
      console.log(`\n⚠️ ${ordersNoItems.length} órdenes sin items`);
    } else {
      console.log('✅ Todas las órdenes tienen items');
    }

    // 3. Verificar montajes vs categoría
    console.log('\n\n🚚 VERIFICACIÓN DE MONTAJES\n');

    const montajeCategory = await prisma.category.findFirst({
      where: { name: { equals: 'Montaje', mode: 'insensitive' } }
    });

    if (!montajeCategory) {
      console.log('❌ No existe categoría "Montaje"');
    } else {
      const montajes = await prisma.pack.findMany({
        where: { categoryId: montajeCategory.id },
        select: { id: true, name: true }
      });
      console.log(`✅ Categoría "Montaje" encontrada`);
      console.log(`   Montajes en categoría: ${montajes.length}`);
    }

    // 4. Verificar configuración de calculadora
    console.log('\n\n📐 VERIFICACIÓN CONFIGURACIÓN CALCULADORA\n');

    const config = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });

    if (!config) {
      console.log('⚠️ No hay configuración de calculadora guardada');
    } else {
      try {
        const configData = JSON.parse(config.value);
        console.log(`✅ Configuración de calculadora encontrada`);
        console.log(`   Tipos de eventos: ${configData.eventTypes?.length || 0}`);
        
        if (configData.eventTypes) {
          configData.eventTypes.forEach((et, i) => {
            console.log(`   ${i + 1}. ${et.name || 'Sin nombre'}`);
            console.log(`      - Categorías extras: ${et.extraCategories?.length || 0}`);
            console.log(`      - Extras disponibles: ${et.availableExtras?.length || 0}`);
          });
        }
      } catch (e) {
        console.log('❌ Error al parsear configuración de calculadora');
      }
    }

    // 5. Resumen de datos
    console.log('\n\n📊 RESUMEN GENERAL\n');

    const totalInventoryValue = products.reduce((acc, p) => {
      return acc + ((p.purchasePrice || 0) * (p.realStock || 0));
    }, 0) * 1.21;

    console.log(`💰 Valor total inventario: €${totalInventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`📦 Stock total: ${products.reduce((acc, p) => acc + (p.realStock || 0), 0)} unidades`);
    console.log(`🎉 Tipos de eventos: ${categories.filter(c => !c.isHidden && c.name !== 'Montaje').length}`);

    console.log('\n✅ Verificación completada\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFrontendVsBackup();
