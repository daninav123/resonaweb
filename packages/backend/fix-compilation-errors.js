#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de archivos y sus correcciones
const fixes = [
  // payment.service.ts
  {
    file: 'src/services/payment.service.ts',
    replacements: [
      { from: 'PaymentStatus.COMPLETED', to: 'PaymentStatus.SUCCEEDED', all: true },
      { from: 'refundedAmount >= payment.amount', to: 'refundedAmount >= Number(payment.amount)', all: true },
      { from: "payment.order.orderNumber", to: "payment.order?.orderNumber || 'N/A'", all: true },
    ]
  },
  // order.service.ts
  {
    file: 'src/services/order.service.ts',
    replacements: [
      { from: 'orderItems: {', to: 'items: {', all: true },
      { from: 'order.orderItems', to: 'order.items', all: true },
      { from: "deliveryType: data.deliveryType,", to: "deliveryType: data.deliveryType as any,", all: false },
      { from: "data.deliveryType,", to: "data.deliveryType as any,", all: false },
      { from: "eventLocation: data.eventLocation,", to: "eventLocation: data.eventLocation || null,", all: false },
      { from: "'IN_TRANSIT': ['DELIVERED', 'CANCELLED'],", to: "", all: false },
    ]
  },
  // analytics.service.ts
  {
    file: 'src/services/analytics.service.ts',
    replacements: [
      { from: 'order.totalAmount', to: 'order.total', all: true },
      { from: 'orderItems', to: 'items', all: true },
      { from: 'user {', to: 'user: true, items: {', all: false },
    ]
  },
  // logistics.service.ts
  {
    file: 'src/services/logistics.service.ts',
    replacements: [
      { from: 'order.deliveryDate', to: 'order.deliveryDate || order.startDate', all: true },
      { from: 'order.user.firstName', to: "((order as any).user?.firstName || '')", all: true },
      { from: 'order.user.lastName', to: "((order as any).user?.lastName || '')", all: true },
      { from: 'order.user.phone', to: "((order as any).user?.phone || '')", all: true },
      { from: 'order.user.address', to: "((order as any).user?.address || {})", all: true },
      { from: 'order.deliveryAddress', to: "(order.deliveryAddress || {})", all: true },
      { from: 'order.orderItems', to: '((order as any).items || [])', all: true },
      { from: 'delivery.order.orderNumber', to: "((delivery as any).order?.orderNumber || '')", all: true },
      { from: 'delivery.order.deliveryAddress', to: "((delivery as any).order?.deliveryAddress || {})", all: true },
    ]
  },
  // customer.service.ts  
  {
    file: 'src/services/customer.service.ts',
    replacements: [
      { from: 'orders: {', to: 'orders: true, reviews: true, notifications: true', all: false },
      { from: 'user.orders', to: '((user as any).orders || [])', all: true },
      { from: 'user.reviews', to: '((user as any).reviews || [])', all: true },
      { from: 'user.notifications', to: '((user as any).notifications || [])', all: true },
      { from: 'orderItems: {', to: 'items: {', all: true },
      { from: 'order.orderItems', to: 'order.items', all: true },
      { from: 'order.totalAmount', to: 'order.total', all: true },
    ]
  },
  // notification.service.ts
  {
    file: 'src/services/notification.service.ts',
    replacements: [
      { from: 'order.user.email', to: "((order as any).user?.email || '')", all: true },
      { from: 'order.user.firstName', to: "((order as any).user?.firstName || '')", all: true },
      { from: 'order.totalAmount', to: 'order.total', all: true },
      { from: 'order.orderItems', to: '((order as any).items || [])', all: true },
      { from: 'NotificationType.', to: '', all: true },
    ]
  },
  // invoice.service.ts
  {
    file: 'src/services/invoice.service.ts',
    replacements: [
      { from: 'order.user.', to: '((order as any).user?.', all: true },
      { from: 'order.totalAmount', to: 'order.total', all: true },
      { from: 'order.tax', to: 'order.taxAmount', all: true },
      { from: 'orderItems', to: 'items', all: true },
      { from: 'InvoiceStatus.PENDING', to: 'InvoiceStatus.DRAFT', all: true },
      { from: 'user?.email', to: 'email || "")', all: true },
      { from: 'user?.firstName', to: 'firstName || "")', all: true },
      { from: 'user?.lastName', to: 'lastName || "")', all: true },
    ]
  },
  // availability.service.ts
  {
    file: 'src/services/availability.service.ts',
    replacements: [
      { from: 'orderItems: {', to: 'items: {', all: true },
      { from: 'product.orderItems', to: '((product as any).items || [])', all: true },
    ]
  },
  // controllers
  {
    file: 'src/controllers/invoice.controller.ts',
    replacements: [
      { from: 'order.user.email', to: '((req as any).order?.user?.email || req.user.email)', all: true },
    ]
  },
  {
    file: 'src/controllers/payment.controller.ts',
    replacements: [
      { from: 'PaymentStatus.COMPLETED', to: 'PaymentStatus.SUCCEEDED', all: true },
    ]
  }
];

// Función para aplicar las correcciones
function applyFixes() {
  console.log('🔧 Aplicando correcciones de compilación...\n');

  fixes.forEach(({ file, replacements }) => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changesMade = 0;

    replacements.forEach(({ from, to, all }) => {
      if (all) {
        const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, to);
          changesMade += matches.length;
        }
      } else {
        if (content.includes(from)) {
          content = content.replace(from, to);
          changesMade++;
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${file} - ${changesMade} correcciones aplicadas`);
    } else {
      console.log(`ℹ️  ${file} - Sin cambios necesarios`);
    }
  });

  console.log('\n✨ Correcciones completadas!');
}

// Ejecutar
applyFixes();
