/**
 * Script para corregir el stock de productos
 * 
 * Problema: El campo 'stock' se estaba modificando con las reservas,
 * cuando debería ser fijo (stock físico real).
 * 
 * Solución:
 * 1. Copiar el valor correcto a 'realStock'
 * 2. Resetear 'stock' al valor físico real
 * 3. Calcular 'availableStock' basado en reservas activas
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProductStock() {
  console.log('🔧 Iniciando corrección de stock de productos...\n');

  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        category: true,
      }
    });

    console.log(`📦 Productos encontrados: ${products.length}\n`);

    const updates = [];

    for (const product of products) {
      const realStock = product.realStock ?? product.stock;
      
      // Si stock es negativo o realStock no está poblado, necesita corrección
      if (product.stock < 0 || product.realStock === null || product.realStock === undefined) {
        console.log(`⚠️  ${product.name} (${product.sku})`);
        console.log(`   Stock actual: ${product.stock}`);
        console.log(`   RealStock actual: ${product.realStock}`);
        
        // Solicitar al usuario el stock físico real
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise(resolve => {
          readline.question(`   ¿Cuántas unidades tienes realmente de "${product.name}"? `, resolve);
        });
        readline.close();

        const correctStock = parseInt(answer) || 1;
        
        updates.push({
          id: product.id,
          name: product.name,
          oldStock: product.stock,
          oldRealStock: product.realStock,
          newRealStock: correctStock,
        });

        // Actualizar en la BD
        await prisma.product.update({
          where: { id: product.id },
          data: {
            realStock: correctStock,
            stock: correctStock,
            availableStock: correctStock, // Asumir todo disponible por ahora
          }
        });

        console.log(`   ✅ Actualizado: realStock = ${correctStock}\n`);
      } else {
        // Si está bien, solo asegurar que realStock esté poblado
        if (!product.realStock) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              realStock: product.stock
            }
          });
          console.log(`✅ ${product.name}: realStock inicializado con valor ${product.stock}`);
        }
      }
    }

    console.log('\n📊 Resumen de actualizaciones:');
    console.log(`Total de productos corregidos: ${updates.length}`);
    
    if (updates.length > 0) {
      console.log('\nDetalles:');
      updates.forEach(u => {
        console.log(`- ${u.name}:`);
        console.log(`  Antes: stock=${u.oldStock}, realStock=${u.oldRealStock}`);
        console.log(`  Ahora: realStock=${u.newRealStock}`);
      });
    }

    console.log('\n✅ Corrección completada!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
fixProductStock();
