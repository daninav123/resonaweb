const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInvoice() {
  try {
    const orderId = 'c6b3999a-1029-4004-ae65-4d50613d6a3f';
    
    console.log('🔍 Buscando pedido:', orderId);
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            billingData: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.error('❌ Pedido no encontrado');
      process.exit(1);
    }

    console.log('✅ Pedido encontrado:', {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      items: order.items.length,
      hasUser: !!order.user,
      hasBillingData: !!(order.user && order.user.billingData),
      deliveryAddress: order.deliveryAddress,
      total: order.totalAmount,
    });

    console.log('\n📦 Items:');
    order.items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.product.name} x${item.quantity} = €${item.totalPrice}`);
    });

    console.log('\n👤 Usuario:');
    console.log({
      email: order.user?.email,
      firstName: order.user?.firstName,
      lastName: order.user?.lastName,
      phone: order.user?.phone,
      taxId: order.user?.taxId,
    });

    console.log('\n🏢 Billing Data:');
    if (order.user?.billingData) {
      console.log({
        companyName: order.user.billingData.companyName,
        taxId: order.user.billingData.taxId,
        address: order.user.billingData.address,
        city: order.user.billingData.city,
        postalCode: order.user.billingData.postalCode,
      });
    } else {
      console.log('⚠️ No hay billing data');
    }

    console.log('\n📍 Delivery Address:', order.deliveryAddress);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testInvoice();
