import bcrypt from 'bcrypt';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class GdprService {
  /**
   * Obtener todos los datos del usuario para exportación (Derecho de Portabilidad)
   */
  async getUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        reviews: true,
        favorites: {
          include: {
            product: true,
          },
        },
        billingData: true,
        carts: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Eliminar información sensible
    const { password, resetToken, resetTokenExpiry, ...userData } = user;

    return {
      exportDate: new Date().toISOString(),
      userId: user.id,
      personalData: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        createdAt: userData.createdAt,
        lastLoginAt: userData.lastLoginAt,
      },
      consents: {
        marketingConsent: userData.marketingConsent,
        dataProcessingConsent: userData.dataProcessingConsent,
        acceptedPrivacyAt: userData.acceptedPrivacyAt,
        acceptedMarketingAt: userData.acceptedMarketingAt,
        lastConsentUpdate: userData.lastConsentUpdate,
      },
      orders: userData.orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
      })),
      reviews: userData.reviews,
      favorites: userData.favorites.map((fav: any) => ({
        productId: fav.productId,
        productName: fav.product?.name,
        addedAt: fav.createdAt,
      })),
      billingData: userData.billingData,
      metadata: userData.metadata,
    };
  }

  /**
   * Obtener resumen de datos del usuario
   */
  async getUserDataSummary(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        marketingConsent: true,
        dataProcessingConsent: true,
        acceptedPrivacyAt: true,
        acceptedMarketingAt: true,
        lastConsentUpdate: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    return {
      personalData: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        memberSince: user.createdAt,
      },
      consents: {
        marketingConsent: user.marketingConsent,
        dataProcessingConsent: user.dataProcessingConsent,
        acceptedPrivacyAt: user.acceptedPrivacyAt,
        acceptedMarketingAt: user.acceptedMarketingAt,
        lastConsentUpdate: user.lastConsentUpdate,
      },
      statistics: {
        totalOrders: user._count.orders,
        totalReviews: user._count.reviews,
        totalFavorites: user._count.favorites,
      },
    };
  }

  /**
   * Actualizar consentimientos del usuario
   */
  async updateConsents(userId: string, consents: { marketingConsent?: boolean }) {
    const updates: any = {
      lastConsentUpdate: new Date(),
    };

    if (consents.marketingConsent !== undefined) {
      updates.marketingConsent = consents.marketingConsent;
      
      if (consents.marketingConsent) {
        updates.acceptedMarketingAt = new Date();
      } else {
        updates.acceptedMarketingAt = null;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    logger.info(`✅ Consentimientos actualizados para usuario ${userId}`);
  }

  /**
   * Eliminar cuenta del usuario (Derecho de Supresión)
   */
  async deleteUserAccount(userId: string, password: string, reason?: string) {
    // 1. Verificar que el usuario existe y obtener contraseña
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS'],
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('INVALID_PASSWORD');
    }

    // 3. Verificar que no tiene pedidos activos
    if (user.orders.length > 0) {
      throw new Error('HAS_ACTIVE_ORDERS');
    }

    // 4. Log de eliminación (guardar antes de eliminar)
    logger.warn(`🗑️ RGPD: Eliminando cuenta de usuario ${user.email}`, {
      userId: user.id,
      email: user.email,
      reason: reason || 'No especificado',
      deletedAt: new Date().toISOString(),
    });

    // 5. Eliminar todos los datos relacionados (Prisma cascade se encarga)
    // Las relaciones con onDelete: Cascade se eliminarán automáticamente:
    // - orders, reviews, favorites, emailNotifications, notifications, etc.
    
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`✅ Cuenta eliminada exitosamente: ${user.email}`);
  }

  /**
   * Obtener historial de consentimientos
   */
  async getConsentHistory(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        acceptedTermsAt: true,
        acceptedPrivacyAt: true,
        acceptedMarketingAt: true,
        lastConsentUpdate: true,
        marketingConsent: true,
        dataProcessingConsent: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    const history = [];

    // Registro de cuenta
    if (user.createdAt) {
      history.push({
        date: user.createdAt,
        action: 'Registro de cuenta',
        description: 'Aceptación inicial de términos y política de privacidad',
      });
    }

    // Política de privacidad
    if (user.acceptedPrivacyAt) {
      history.push({
        date: user.acceptedPrivacyAt,
        action: 'Política de Privacidad aceptada',
        description: 'Consentimiento para tratamiento de datos personales',
      });
    }

    // Marketing
    if (user.marketingConsent && user.acceptedMarketingAt) {
      history.push({
        date: user.acceptedMarketingAt,
        action: 'Consentimiento de marketing',
        description: 'Aceptación para recibir comunicaciones comerciales',
      });
    }

    // Última actualización
    if (user.lastConsentUpdate) {
      history.push({
        date: user.lastConsentUpdate,
        action: 'Actualización de consentimientos',
        description: 'Última modificación de preferencias de privacidad',
      });
    }

    // Ordenar por fecha descendente
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      currentConsents: {
        marketingConsent: user.marketingConsent,
        dataProcessingConsent: user.dataProcessingConsent,
      },
      history,
    };
  }
}
