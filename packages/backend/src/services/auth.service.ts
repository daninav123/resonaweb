import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData) {
    // Check if user already exists
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
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'CLIENT',
      },
    });

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Log registration
    logger.info(`New user registered: ${user.email}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'Tu cuenta está desactivada', 'ACCOUNT_DISABLED');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'Usuario no encontrado o inactivo', 'USER_NOT_FOUND');
      }

      // Generate new token pair
      const tokens = generateTokenPair(user);

      return tokens;
    } catch (error) {
      throw new AppError(401, 'Token de actualización inválido', 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Contraseña actual incorrecta', 'INVALID_PASSWORD');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
    }

    // Generate reset token
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET not configured');
    }
    
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    // Send email
    const emailService = (await import('./email.service')).emailService;
    await emailService.sendPasswordResetEmail(user.email, resetToken);
    
    logger.info(`Password reset email sent to: ${user.email}`);

    return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string) {
    try {
      // Verify token
      if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET not configured');
      }
      
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      ) as any;

      if (decoded.type !== 'password-reset') {
        throw new AppError(400, 'Token inválido', 'INVALID_TOKEN');
      }

      // Find user and check token
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new AppError(400, 'Token inválido o expirado', 'INVALID_TOKEN');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      logger.info(`Password reset successful for: ${user.email}`);

      return { message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(400, 'Token inválido', 'INVALID_TOKEN');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
