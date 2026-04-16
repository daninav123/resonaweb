import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { UnitStatus, UnitCondition, UnitEventType } from '@prisma/client';

/**
 * Genera un código de barras único para una unidad
 * Formato: RES-{SKU_PREFIX}-{3_DIGITS}
 */
async function generateBarcode(productSku: string): Promise<string> {
  const prefix = productSku.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
  let attempts = 0;
  while (attempts < 100) {
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    const barcode = `RES-${prefix}-${seq}`;
    const existing = await prisma.productUnit.findUnique({ where: { barcode } });
    if (!existing) return barcode;
    attempts++;
  }
  throw new AppError(500, 'No se pudo generar un código de barras único', 'BARCODE_GENERATION_ERROR');
}

class ProductUnitService {
  /**
   * Crear una o varias unidades físicas para un producto
   */
  async createUnits(
    productId: string,
    quantity: number,
    data: {
      serialNumbers?: string[];
      purchaseDate?: Date;
      purchasePrice?: number;
      supplier?: string;
      invoiceRef?: string;
      warrantyUntil?: Date;
      condition?: UnitCondition;
      location?: string;
      notes?: string;
    },
    performedBy?: string,
    performedByName?: string
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');

    const created = [];
    for (let i = 0; i < quantity; i++) {
      const barcode = await generateBarcode(product.sku);
      const unit = await prisma.productUnit.create({
        data: {
          productId,
          barcode,
          serialNumber: data.serialNumbers?.[i] ?? null,
          purchaseDate: data.purchaseDate ?? null,
          purchasePrice: data.purchasePrice ?? null,
          supplier: data.supplier ?? null,
          invoiceRef: data.invoiceRef ?? null,
          warrantyUntil: data.warrantyUntil ?? null,
          condition: data.condition ?? UnitCondition.NEW,
          location: data.location ?? 'Almacén',
          notes: data.notes ?? null,
          events: {
            create: {
              type: UnitEventType.CREATED,
              description: `Unidad creada. Código: ${barcode}`,
              performedBy: performedBy ?? null,
              performedByName: performedByName ?? null,
            },
          },
        },
        include: { events: true, product: { select: { name: true, sku: true } } },
      });
      created.push(unit);
    }

    logger.info(`✅ ${quantity} unidades creadas para producto ${product.name}`);
    return created;
  }

  /**
   * Obtener todas las unidades de un producto
   */
  async getUnitsByProduct(productId: string) {
    return prisma.productUnit.findMany({
      where: { productId },
      include: {
        product: { select: { name: true, sku: true } },
        currentOrder: { select: { orderNumber: true, startDate: true, endDate: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { barcode: 'asc' },
    });
  }

  /**
   * Buscar unidad por código de barras
   */
  async getUnitByBarcode(barcode: string) {
    const unit = await prisma.productUnit.findUnique({
      where: { barcode },
      include: {
        product: { select: { name: true, sku: true, mainImageUrl: true } },
        currentOrder: { select: { orderNumber: true, startDate: true, endDate: true, status: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!unit) throw new AppError(404, `No se encontró ninguna unidad con código ${barcode}`, 'UNIT_NOT_FOUND');
    return unit;
  }

  /**
   * Obtener una unidad por ID
   */
  async getUnitById(unitId: string) {
    const unit = await prisma.productUnit.findUnique({
      where: { id: unitId },
      include: {
        product: { select: { name: true, sku: true, mainImageUrl: true } },
        currentOrder: { select: { orderNumber: true, startDate: true, endDate: true, status: true } },
        events: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');
    return unit;
  }

  /**
   * Listar todas las unidades con filtros
   */
  async listUnits(filters: {
    productId?: string;
    status?: UnitStatus;
    condition?: UnitCondition;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.productId) where.productId = filters.productId;
    if (filters.status) where.status = filters.status;
    if (filters.condition) where.condition = filters.condition;
    if (filters.search) {
      where.OR = [
        { barcode: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
        { internalRef: { contains: filters.search, mode: 'insensitive' } },
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [units, total] = await prisma.$transaction([
      prisma.productUnit.findMany({
        where,
        include: {
          product: { select: { name: true, sku: true, mainImageUrl: true, category: { select: { name: true } } } },
          currentOrder: { select: { orderNumber: true, startDate: true, endDate: true } },
        },
        orderBy: [{ status: 'asc' }, { barcode: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.productUnit.count({ where }),
    ]);

    return { units, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Actualizar datos básicos de una unidad
   */
  async updateUnit(
    unitId: string,
    data: {
      serialNumber?: string;
      internalRef?: string;
      condition?: UnitCondition;
      location?: string;
      notes?: string;
      warrantyUntil?: Date;
      lastCheckedAt?: Date;
      lastCheckedBy?: string;
    },
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    const events: any[] = [];

    if (data.condition && data.condition !== unit.condition) {
      events.push({
        type: UnitEventType.CONDITION_CHANGE,
        description: `Condición cambiada de ${unit.condition} a ${data.condition}`,
        conditionBefore: unit.condition,
        conditionAfter: data.condition,
        performedBy: performedBy ?? null,
        performedByName: performedByName ?? null,
      });
    }

    const updated = await prisma.productUnit.update({
      where: { id: unitId },
      data: {
        ...data,
        events: events.length > 0 ? { create: events } : undefined,
      },
      include: { product: { select: { name: true, sku: true } }, events: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });

    return updated;
  }

  /**
   * Marcar unidad como rota
   */
  async markBroken(
    unitId: string,
    description: string,
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    return prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: UnitStatus.BROKEN,
        currentOrderId: null,
        events: {
          create: {
            type: UnitEventType.BROKEN,
            description: description || 'Unidad marcada como rota',
            performedBy: performedBy ?? null,
            performedByName: performedByName ?? null,
          },
        },
      },
      include: { product: { select: { name: true, sku: true } } },
    });
  }

  /**
   * Enviar a reparación
   */
  async sendToRepair(
    unitId: string,
    data: {
      description?: string;
      repairShop?: string;
      repairCost?: number;
      estimatedReturn?: Date;
    },
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    return prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: UnitStatus.UNDER_REPAIR,
        location: data.repairShop ?? 'Taller',
        totalRepairs: { increment: 1 },
        events: {
          create: {
            type: UnitEventType.REPAIR_START,
            description: data.description || `Enviado a reparación${data.repairShop ? ` - ${data.repairShop}` : ''}`,
            repairShop: data.repairShop ?? null,
            repairCost: data.repairCost ?? null,
            estimatedReturn: data.estimatedReturn ?? null,
            performedBy: performedBy ?? null,
            performedByName: performedByName ?? null,
          },
        },
      },
      include: { product: { select: { name: true, sku: true } } },
    });
  }

  /**
   * Volver de reparación
   */
  async returnFromRepair(
    unitId: string,
    data: {
      description?: string;
      condition?: UnitCondition;
      repairCost?: number;
    },
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    return prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: UnitStatus.AVAILABLE,
        location: 'Almacén',
        condition: data.condition ?? unit.condition,
        events: {
          create: {
            type: UnitEventType.REPAIR_END,
            description: data.description || 'Reparación finalizada',
            repairCost: data.repairCost ?? null,
            conditionBefore: unit.condition,
            conditionAfter: data.condition ?? unit.condition,
            performedBy: performedBy ?? null,
            performedByName: performedByName ?? null,
          },
        },
      },
      include: { product: { select: { name: true, sku: true } } },
    });
  }

  /**
   * Marcar como disponible (desde roto, perdido, etc.)
   */
  async markAvailable(
    unitId: string,
    description: string,
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    return prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: UnitStatus.AVAILABLE,
        location: 'Almacén',
        currentOrderId: null,
        events: {
          create: {
            type: UnitEventType.NOTE,
            description: description || 'Unidad marcada como disponible',
            performedBy: performedBy ?? null,
            performedByName: performedByName ?? null,
          },
        },
      },
    });
  }

  /**
   * Dar de baja una unidad
   */
  async retireUnit(
    unitId: string,
    description: string = 'Unidad dada de baja',
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    return prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: UnitStatus.RETIRED,
        currentOrderId: null,
        events: {
          create: {
            type: UnitEventType.RETIRED,
            description: description || 'Unidad dada de baja',
            performedBy: performedBy ?? null,
            performedByName: performedByName ?? null,
          },
        },
      },
    });
  }

  /**
   * Añadir nota manual
   */
  async addNote(
    unitId: string,
    note: string,
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    return prisma.unitEvent.create({
      data: {
        unitId,
        type: UnitEventType.NOTE,
        description: note,
        performedBy: performedBy ?? null,
        performedByName: performedByName ?? null,
      },
    });
  }

  /**
   * Registrar checkout de unidad (asignada a pedido)
   */
  async checkOut(
    unitId: string,
    orderId: string,
    orderNumber: string,
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');
    if (unit.status !== UnitStatus.AVAILABLE) {
      throw new AppError(400, `La unidad no está disponible (estado: ${unit.status})`, 'UNIT_NOT_AVAILABLE');
    }

    return prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: UnitStatus.IN_USE,
        currentOrderId: orderId,
        totalUses: { increment: 1 },
        events: {
          create: {
            type: UnitEventType.CHECKED_OUT,
            orderId,
            orderNumber,
            description: `Unidad asignada al pedido ${orderNumber}`,
            performedBy: performedBy ?? null,
            performedByName: performedByName ?? null,
          },
        },
      },
    });
  }

  /**
   * Registrar checkin de unidad (devuelta)
   */
  async checkIn(
    unitId: string,
    data: {
      condition?: UnitCondition;
      notes?: string;
    },
    performedBy?: string,
    performedByName?: string
  ) {
    const unit = await prisma.productUnit.findUnique({ where: { id: unitId }, include: { currentOrder: true } });
    if (!unit) throw new AppError(404, 'Unidad no encontrada', 'UNIT_NOT_FOUND');

    const orderNumber = unit.currentOrder?.orderNumber ?? 'desconocido';

    return prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: UnitStatus.AVAILABLE,
        currentOrderId: null,
        location: 'Almacén',
        condition: data.condition ?? unit.condition,
        lastCheckedAt: new Date(),
        lastCheckedBy: performedByName ?? performedBy ?? null,
        events: {
          create: {
            type: UnitEventType.CHECKED_IN,
            orderId: unit.currentOrderId ?? null,
            orderNumber,
            description: `Unidad devuelta del pedido ${orderNumber}. Condición: ${data.condition ?? unit.condition}`,
            notes: data.notes ?? null,
            conditionBefore: unit.condition,
            conditionAfter: data.condition ?? unit.condition,
            performedBy: performedBy ?? null,
            performedByName: performedByName ?? null,
          },
        },
      },
    });
  }

  /**
   * Resumen de inventario por producto
   */
  async getInventorySummary() {
    const summary = await prisma.productUnit.groupBy({
      by: ['productId', 'status'],
      _count: { id: true },
    });

    const products = await prisma.product.findMany({
      where: { isActive: true, isPack: false },
      select: { id: true, name: true, sku: true, mainImageUrl: true, category: { select: { name: true } } },
    });

    const result = products.map((p) => {
      const unitStats = summary.filter((s) => s.productId === p.id);
      const total = unitStats.reduce((acc, s) => acc + s._count.id, 0);
      const available = unitStats.find((s) => s.status === 'AVAILABLE')?._count.id ?? 0;
      const inUse = unitStats.find((s) => s.status === 'IN_USE')?._count.id ?? 0;
      const broken = unitStats.find((s) => s.status === 'BROKEN')?._count.id ?? 0;
      const underRepair = unitStats.find((s) => s.status === 'UNDER_REPAIR')?._count.id ?? 0;
      const retired = unitStats.find((s) => s.status === 'RETIRED')?._count.id ?? 0;
      const lost = unitStats.find((s) => s.status === 'LOST')?._count.id ?? 0;

      return { ...p, units: { total, available, inUse, broken, underRepair, retired, lost } };
    });

    return result.filter((p) => p.units.total > 0);
  }
}

export const productUnitService = new ProductUnitService();
