import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { prisma } from '../index';

export class ProductPurchaseService {
  /**
   * Create a new purchase lot for a product
   */
  async createPurchaseLot(data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    purchaseDate?: Date;
    supplier?: string;
    invoiceNumber?: string;
    notes?: string;
  }) {
    try {
      const totalCost = data.quantity * data.unitPrice;

      // Crear el lote de compra
      const purchase = await prisma.productPurchase.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalCost,
          purchaseDate: data.purchaseDate || new Date(),
          supplier: data.supplier,
          invoiceNumber: data.invoiceNumber,
          notes: data.notes,
          totalGenerated: 0,
          isAmortized: false,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
            },
          },
        },
      });

      // Actualizar el stock del producto sumando la cantidad comprada
      await prisma.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            increment: data.quantity,
          },
        },
      });

      logger.info(`Purchase lot created for product ${data.productId}`, {
        purchaseId: purchase.id,
        quantity: data.quantity,
        totalCost,
        stockUpdated: true,
      });

      return purchase;
    } catch (error) {
      logger.error('Error creating purchase lot:', error);
      throw error;
    }
  }

  /**
   * Get all purchase lots
   */
  async getAllPurchaseLots() {
    try {
      const lots = await prisma.productPurchase.findMany({
        orderBy: { purchaseDate: 'asc' }, // FIFO
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      return lots;
    } catch (error) {
      logger.error('Error getting all purchase lots:', error);
      throw error;
    }
  }

  /**
   * Get all purchase lots for a product
   */
  async getProductPurchaseLots(productId: string) {
    try {
      const lots = await prisma.productPurchase.findMany({
        where: { productId },
        orderBy: { purchaseDate: 'asc' }, // FIFO
      });

      return lots;
    } catch (error) {
      logger.error('Error getting purchase lots:', error);
      throw error;
    }
  }

  /**
   * Update a purchase lot
   */
  async updatePurchaseLot(
    lotId: string,
    data: {
      quantity?: number;
      unitPrice?: number;
      purchaseDate?: Date;
      supplier?: string;
      invoiceNumber?: string;
      notes?: string;
    }
  ) {
    try {
      const existingLot = await prisma.productPurchase.findUnique({
        where: { id: lotId },
      });

      if (!existingLot) {
        throw new AppError(404, 'Lote de compra no encontrado', 'LOT_NOT_FOUND');
      }

      // Recalcular totalCost si cambia quantity o unitPrice
      const quantity = data.quantity ?? existingLot.quantity;
      const unitPrice = data.unitPrice ?? Number(existingLot.unitPrice);
      const totalCost = quantity * unitPrice;

      const updated = await prisma.productPurchase.update({
        where: { id: lotId },
        data: {
          ...data,
          totalCost,
        },
      });

      logger.info(`Purchase lot updated: ${lotId}`);
      return updated;
    } catch (error) {
      logger.error('Error updating purchase lot:', error);
      throw error;
    }
  }

  /**
   * Delete a purchase lot
   */
  async deletePurchaseLot(lotId: string) {
    try {
      const lot = await prisma.productPurchase.findUnique({
        where: { id: lotId },
      });

      if (!lot) {
        throw new AppError(404, 'Lote de compra no encontrado', 'LOT_NOT_FOUND');
      }

      // Solo permitir eliminar si no ha generado ingresos
      if (Number(lot.totalGenerated) > 0) {
        throw new AppError(
          400,
          'No se puede eliminar un lote que ya ha generado ingresos',
          'LOT_HAS_REVENUE'
        );
      }

      await prisma.productPurchase.delete({
        where: { id: lotId },
      });

      logger.info(`Purchase lot deleted: ${lotId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting purchase lot:', error);
      throw error;
    }
  }

  /**
   * Distribute revenue to lots using FIFO algorithm
   * This is called when a product is rented
   */
  async distributeRevenueToLots(productId: string, revenue: number) {
    try {
      // Get all lots for this product (FIFO order)
      const lots = await prisma.productPurchase.findMany({
        where: { productId },
        orderBy: { purchaseDate: 'asc' },
      });

      if (lots.length === 0) {
        logger.warn(`No purchase lots found for product ${productId}`);
        return;
      }

      let remainingRevenue = revenue;

      for (const lot of lots) {
        if (remainingRevenue <= 0) break;

        const lotCost = Number(lot.totalCost);
        const lotGenerated = Number(lot.totalGenerated);
        const lotRemaining = Math.max(lotCost - lotGenerated, 0);

        if (lotRemaining > 0) {
          // Este lote aún no está amortizado
          const amountToAdd = Math.min(remainingRevenue, lotRemaining);
          const newGenerated = lotGenerated + amountToAdd;

          await prisma.productPurchase.update({
            where: { id: lot.id },
            data: {
              totalGenerated: newGenerated,
              isAmortized: newGenerated >= lotCost,
            },
          });

          remainingRevenue -= amountToAdd;

          logger.info(`Revenue distributed to lot ${lot.id}`, {
            amount: amountToAdd,
            newGenerated,
            isAmortized: newGenerated >= lotCost,
          });
        } else if (!lot.isAmortized) {
          // Marcar como amortizado si ya está completo
          await prisma.productPurchase.update({
            where: { id: lot.id },
            data: { isAmortized: true },
          });
        }
      }

      // Si queda revenue después de distribuir a todos los lotes,
      // agregar al último lote (beneficio puro)
      if (remainingRevenue > 0 && lots.length > 0) {
        const lastLot = lots[lots.length - 1];
        const newGenerated = Number(lastLot.totalGenerated) + remainingRevenue;

        await prisma.productPurchase.update({
          where: { id: lastLot.id },
          data: {
            totalGenerated: newGenerated,
            isAmortized: true,
          },
        });

        logger.info(`Excess revenue added to last lot ${lastLot.id}`, {
          amount: remainingRevenue,
        });
      }
    } catch (error) {
      logger.error('Error distributing revenue to lots:', error);
      throw error;
    }
  }
}

export const productPurchaseService = new ProductPurchaseService();
