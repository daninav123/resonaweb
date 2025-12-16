import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          userLevel: true, // ⭐ AÑADIDO
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        address: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
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
      throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Create user (admin only)
   */
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'CLIENT' | 'ADMIN' | 'SUPERADMIN' | 'COMMERCIAL';
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(409, 'El email ya está registrado', 'EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role || 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    logger.info(`User created by admin: ${user.email}`);

    return user;
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      address: any;
      role: 'CLIENT' | 'ADMIN' | 'SUPERADMIN' | 'COMMERCIAL';
      isActive: boolean;
    }>,
    isAdmin: boolean = false
  ) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    // Check if email is being changed and if it's already in use
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (emailExists) {
        throw new AppError(409, 'El email ya está en uso', 'EMAIL_EXISTS');
      }
    }

    // Only admin can change role and isActive
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
    };

    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }

    if (isAdmin) {
      if (data.role !== undefined) updateData.role = data.role;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        address: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`User updated: ${updatedUser.email}`);

    return updatedUser;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    // Soft delete - just deactivate the user
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
      },
    });

    logger.info(`User deactivated: ${deletedUser.email}`);

    return { message: 'Usuario eliminado correctamente' };
  }

  /**
   * Update user level (VIP status)
   */
  async updateUserLevel(id: string, userLevel: 'STANDARD' | 'VIP' | 'VIP_PLUS') {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { userLevel },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userLevel: true,
        role: true,
      },
    });

    logger.info(`User level updated: ${updatedUser.email} -> ${userLevel}`);

    return updatedUser;
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string, params?: {
    skip?: number;
    take?: number;
  }) {
    const { skip = 0, take = 10 } = params || {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  mainImageUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      },
    };
  }

  /**
   * Get user reviews
   */
  async getUserReviews(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            mainImageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews;
  }

  /**
   * Get user favorites
   */
  async getUserFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImageUrl: true,
            pricePerDay: true,
            pricePerWeekend: true,
            pricePerWeek: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(f => f.product);
  }

  /**
   * Add to favorites
   */
  async addToFavorites(userId: string, productId: string) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    // Check if already in favorites
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'El producto ya está en favoritos', 'ALREADY_IN_FAVORITES');
    }

    // Add to favorites
    await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });

    return { message: 'Producto añadido a favoritos' };
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(userId: string, productId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new AppError(404, 'Producto no está en favoritos', 'NOT_IN_FAVORITES');
    }

    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return { message: 'Producto eliminado de favoritos' };
  }
}

export const userService = new UserService();
