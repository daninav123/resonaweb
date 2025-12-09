import { Request, Response } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

class BudgetController {
  /**
   * Generar número de presupuesto único
   */
  private async generateBudgetNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.budget.count({
      where: {
        budgetNumber: {
          startsWith: `BUD-${year}-`,
        },
      },
    });
    return `BUD-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  /**
   * Calcular totales del presupuesto
   */
  private async calculateBudgetTotals(budgetId: string) {
    const sections = await prisma.budgetSection.findMany({
      where: { budgetId },
      include: { items: true },
    });

    let subtotal = new Decimal(0);

    // Calcular subtotal de cada sección
    for (const section of sections) {
      let sectionSubtotal = new Decimal(0);
      
      for (const item of section.items) {
        sectionSubtotal = sectionSubtotal.plus(item.total);
      }

      // Actualizar subtotal de la sección
      await prisma.budgetSection.update({
        where: { id: section.id },
        data: { subtotal: sectionSubtotal },
      });

      subtotal = subtotal.plus(sectionSubtotal);
    }

    // Obtener presupuesto para calcular descuento e IVA
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) return;

    const discount = budget.discount || new Decimal(0);
    const subtotalAfterDiscount = subtotal.minus(discount);
    const tax = subtotalAfterDiscount.times(0.21); // IVA 21%
    const total = subtotalAfterDiscount.plus(tax);

    // Actualizar presupuesto
    await prisma.budget.update({
      where: { id: budgetId },
      data: {
        subtotal,
        tax,
        total,
      },
    });
  }

  /**
   * Crear nuevo presupuesto
   */
  async createBudget(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Usuario no autenticado', 'UNAUTHORIZED');
      }

      const {
        title,
        description,
        clientName,
        clientEmail,
        clientPhone,
        eventType,
        eventDate,
        eventLocation,
        attendees,
        validUntil,
        notes,
        termsAndConditions,
      } = req.body;

      // Validaciones
      if (!title || !clientName || !clientEmail) {
        throw new AppError(400, 'Faltan datos requeridos', 'VALIDATION_ERROR');
      }

      const budgetNumber = await this.generateBudgetNumber();

      const budget = await prisma.budget.create({
        data: {
          budgetNumber,
          title,
          description,
          clientName,
          clientEmail,
          clientPhone,
          eventType,
          eventDate: eventDate ? new Date(eventDate) : null,
          eventLocation,
          attendees: attendees ? parseInt(attendees) : null,
          validUntil: validUntil ? new Date(validUntil) : null,
          notes,
          termsAndConditions,
          createdBy: userId,
        },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });

      logger.info(`Presupuesto creado: ${budget.budgetNumber} - ${clientEmail}`);

      res.status(201).json({
        success: true,
        message: 'Presupuesto creado exitosamente',
        data: budget,
      });
    } catch (error) {
      logger.error('Error creando presupuesto:', error);
      throw error;
    }
  }

  /**
   * Listar presupuestos
   */
  async listBudgets(req: Request, res: Response) {
    try {
      const { status, limit = 50, offset = 0, search } = req.query;

      const where: any = {};
      
      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { budgetNumber: { contains: search as string, mode: 'insensitive' } },
          { title: { contains: search as string, mode: 'insensitive' } },
          { clientName: { contains: search as string, mode: 'insensitive' } },
          { clientEmail: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [budgets, total] = await Promise.all([
        prisma.budget.findMany({
          where,
          include: {
            sections: {
              include: {
                items: true,
              },
            },
            createdByUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: parseInt(offset as string),
        }),
        prisma.budget.count({ where }),
      ]);

      res.json({
        success: true,
        data: budgets,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('Error listando presupuestos:', error);
      throw error;
    }
  }

  /**
   * Obtener presupuesto por ID
   */
  async getBudgetById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const budget = await prisma.budget.findUnique({
        where: { id },
        include: {
          sections: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          order: true,
        },
      });

      if (!budget) {
        throw new AppError(404, 'Presupuesto no encontrado', 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: budget,
      });
    } catch (error) {
      logger.error('Error obteniendo presupuesto:', error);
      throw error;
    }
  }

  /**
   * Actualizar presupuesto
   */
  async updateBudget(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        clientName,
        clientEmail,
        clientPhone,
        eventType,
        eventDate,
        eventLocation,
        attendees,
        discount,
        validUntil,
        notes,
        termsAndConditions,
      } = req.body;

      const budget = await prisma.budget.update({
        where: { id },
        data: {
          title,
          description,
          clientName,
          clientEmail,
          clientPhone,
          eventType,
          eventDate: eventDate ? new Date(eventDate) : null,
          eventLocation,
          attendees: attendees ? parseInt(attendees) : undefined,
          discount: discount ? new Decimal(discount) : undefined,
          validUntil: validUntil ? new Date(validUntil) : null,
          notes,
          termsAndConditions,
        },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });

      // Recalcular totales
      await this.calculateBudgetTotals(id);

      // Obtener presupuesto actualizado
      const updatedBudget = await prisma.budget.findUnique({
        where: { id },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });

      logger.info(`Presupuesto actualizado: ${budget.budgetNumber}`);

      res.json({
        success: true,
        message: 'Presupuesto actualizado exitosamente',
        data: updatedBudget,
      });
    } catch (error) {
      logger.error('Error actualizando presupuesto:', error);
      throw error;
    }
  }

  /**
   * Eliminar presupuesto
   */
  async deleteBudget(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const budget = await prisma.budget.findUnique({
        where: { id },
      });

      if (!budget) {
        throw new AppError(404, 'Presupuesto no encontrado', 'NOT_FOUND');
      }

      // Solo se pueden eliminar borradores
      if (budget.status !== 'DRAFT') {
        throw new AppError(
          400,
          'Solo se pueden eliminar presupuestos en borrador',
          'INVALID_STATUS'
        );
      }

      await prisma.budget.delete({
        where: { id },
      });

      logger.info(`Presupuesto eliminado: ${budget.budgetNumber}`);

      res.json({
        success: true,
        message: 'Presupuesto eliminado exitosamente',
      });
    } catch (error) {
      logger.error('Error eliminando presupuesto:', error);
      throw error;
    }
  }

  /**
   * Agregar sección al presupuesto
   */
  async addSection(req: Request, res: Response) {
    try {
      const { id: budgetId } = req.params;
      const { name, description, order } = req.body;

      if (!name) {
        throw new AppError(400, 'El nombre de la sección es requerido', 'VALIDATION_ERROR');
      }

      const section = await prisma.budgetSection.create({
        data: {
          budgetId,
          name,
          description,
          order: order || 0,
        },
      });

      logger.info(`Sección agregada al presupuesto: ${name}`);

      res.status(201).json({
        success: true,
        message: 'Sección agregada exitosamente',
        data: section,
      });
    } catch (error) {
      logger.error('Error agregando sección:', error);
      throw error;
    }
  }

  /**
   * Actualizar sección
   */
  async updateSection(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;
      const { name, description, order } = req.body;

      const section = await prisma.budgetSection.update({
        where: { id: sectionId },
        data: {
          name,
          description,
          order,
        },
      });

      res.json({
        success: true,
        message: 'Sección actualizada exitosamente',
        data: section,
      });
    } catch (error) {
      logger.error('Error actualizando sección:', error);
      throw error;
    }
  }

  /**
   * Eliminar sección
   */
  async deleteSection(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;

      await prisma.budgetSection.delete({
        where: { id: sectionId },
      });

      res.json({
        success: true,
        message: 'Sección eliminada exitosamente',
      });
    } catch (error) {
      logger.error('Error eliminando sección:', error);
      throw error;
    }
  }

  /**
   * Agregar item a sección
   */
  async addItem(req: Request, res: Response) {
    try {
      const { sectionId } = req.params;
      const { productId, name, description, quantity, unitPrice, isInternal } = req.body;

      if (!name || !quantity || !unitPrice) {
        throw new AppError(400, 'Faltan datos requeridos', 'VALIDATION_ERROR');
      }

      const total = new Decimal(quantity).times(new Decimal(unitPrice));

      const item = await prisma.budgetItem.create({
        data: {
          sectionId,
          productId,
          name,
          description,
          quantity: parseInt(quantity),
          unitPrice: new Decimal(unitPrice),
          total,
          isInternal: isInternal !== false, // Por defecto true
        },
        include: {
          product: true,
        },
      });

      // Recalcular totales
      const section = await prisma.budgetSection.findUnique({
        where: { id: sectionId },
      });
      
      if (section) {
        await this.calculateBudgetTotals(section.budgetId);
      }

      logger.info(`Item agregado a sección: ${name}`);

      res.status(201).json({
        success: true,
        message: 'Item agregado exitosamente',
        data: item,
      });
    } catch (error) {
      logger.error('Error agregando item:', error);
      throw error;
    }
  }

  /**
   * Actualizar item
   */
  async updateItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { name, description, quantity, unitPrice, isInternal } = req.body;

      const updates: any = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (quantity) {
        updates.quantity = parseInt(quantity);
      }
      if (unitPrice) {
        updates.unitPrice = new Decimal(unitPrice);
      }
      if (isInternal !== undefined) updates.isInternal = isInternal;

      // Calcular nuevo total si cambia cantidad o precio
      const item = await prisma.budgetItem.findUnique({
        where: { id: itemId },
        include: { section: true },
      });

      if (!item) {
        throw new AppError(404, 'Item no encontrado', 'NOT_FOUND');
      }

      const qty = quantity ? parseInt(quantity) : item.quantity;
      const price = unitPrice ? new Decimal(unitPrice) : item.unitPrice;
      updates.total = new Decimal(qty).times(price);

      const updatedItem = await prisma.budgetItem.update({
        where: { id: itemId },
        data: updates,
        include: {
          product: true,
        },
      });

      // Recalcular totales
      await this.calculateBudgetTotals(item.section.budgetId);

      res.json({
        success: true,
        message: 'Item actualizado exitosamente',
        data: updatedItem,
      });
    } catch (error) {
      logger.error('Error actualizando item:', error);
      throw error;
    }
  }

  /**
   * Eliminar item
   */
  async deleteItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;

      const item = await prisma.budgetItem.findUnique({
        where: { id: itemId },
        include: { section: true },
      });

      if (!item) {
        throw new AppError(404, 'Item no encontrado', 'NOT_FOUND');
      }

      await prisma.budgetItem.delete({
        where: { id: itemId },
      });

      // Recalcular totales
      await this.calculateBudgetTotals(item.section.budgetId);

      res.json({
        success: true,
        message: 'Item eliminado exitosamente',
      });
    } catch (error) {
      logger.error('Error eliminando item:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado del presupuesto
   */
  async changeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new AppError(400, 'Estado requerido', 'VALIDATION_ERROR');
      }

      const validStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'];
      if (!validStatuses.includes(status)) {
        throw new AppError(400, 'Estado inválido', 'VALIDATION_ERROR');
      }

      const updates: any = { status };

      // Si se marca como SENT, guardar fecha
      if (status === 'SENT') {
        updates.sentAt = new Date();
      }

      const budget = await prisma.budget.update({
        where: { id },
        data: updates,
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });

      logger.info(`Estado del presupuesto cambiado: ${budget.budgetNumber} -> ${status}`);

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: budget,
      });
    } catch (error) {
      logger.error('Error cambiando estado:', error);
      throw error;
    }
  }

  /**
   * Duplicar presupuesto
   */
  async duplicateBudget(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'Usuario no autenticado', 'UNAUTHORIZED');
      }

      const originalBudget = await prisma.budget.findUnique({
        where: { id },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!originalBudget) {
        throw new AppError(404, 'Presupuesto no encontrado', 'NOT_FOUND');
      }

      const budgetNumber = await this.generateBudgetNumber();

      // Crear copia
      const newBudget = await prisma.budget.create({
        data: {
          budgetNumber,
          title: `${originalBudget.title} (Copia)`,
          description: originalBudget.description,
          clientName: originalBudget.clientName,
          clientEmail: originalBudget.clientEmail,
          clientPhone: originalBudget.clientPhone,
          eventType: originalBudget.eventType,
          eventDate: originalBudget.eventDate,
          eventLocation: originalBudget.eventLocation,
          attendees: originalBudget.attendees,
          discount: originalBudget.discount,
          validUntil: originalBudget.validUntil,
          notes: originalBudget.notes,
          termsAndConditions: originalBudget.termsAndConditions,
          createdBy: userId,
        },
      });

      // Copiar secciones e items
      for (const section of originalBudget.sections) {
        const newSection = await prisma.budgetSection.create({
          data: {
            budgetId: newBudget.id,
            name: section.name,
            description: section.description,
            order: section.order,
          },
        });

        for (const item of section.items) {
          await prisma.budgetItem.create({
            data: {
              sectionId: newSection.id,
              productId: item.productId,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              isInternal: item.isInternal,
            },
          });
        }
      }

      // Recalcular totales
      await this.calculateBudgetTotals(newBudget.id);

      // Obtener presupuesto completo
      const completeBudget = await prisma.budget.findUnique({
        where: { id: newBudget.id },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
        },
      });

      logger.info(`Presupuesto duplicado: ${originalBudget.budgetNumber} -> ${budgetNumber}`);

      res.status(201).json({
        success: true,
        message: 'Presupuesto duplicado exitosamente',
        data: completeBudget,
      });
    } catch (error) {
      logger.error('Error duplicando presupuesto:', error);
      throw error;
    }
  }
}

export const budgetController = new BudgetController();
