import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'El refresh token es requerido'),
  }),
});

export const resetPasswordRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
  }),
});

// Product schemas
export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'El SKU es requerido'),
    name: z.string().min(1, 'El nombre es requerido'),
    slug: z.string().min(1, 'El slug es requerido'),
    description: z.string().min(1, 'La descripción es requerida'),
    categoryId: z.string().uuid('ID de categoría inválido'),
    pricePerDay: z.number().positive('El precio por día debe ser positivo'),
    pricePerWeekend: z.number().positive('El precio por fin de semana debe ser positivo'),
    pricePerWeek: z.number().positive('El precio por semana debe ser positivo'),
    stock: z.number().int().min(0, 'El stock no puede ser negativo'),
    realStock: z.number().int().min(0, 'El stock real no puede ser negativo'),
    weight: z.number().positive().optional(),
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    volume: z.number().positive().optional(),
    requiresSpecialTransport: z.boolean().optional(),
    mainImageUrl: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    specifications: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Order schemas
export const createOrderSchema = z.object({
  body: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    eventType: z.string().optional(),
    eventLocation: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      state: z.string().optional(),
      country: z.string().optional(),
      additionalInfo: z.string().optional(),
    }),
    attendees: z.number().positive().optional(),
    contactPerson: z.string().min(1),
    contactPhone: z.string().min(1),
    notes: z.string().optional(),
    deliveryType: z.enum(['PICKUP', 'DELIVERY', 'SHIPPING']),
    deliveryAddress: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      state: z.string().optional(),
      country: z.string().optional(),
      additionalInfo: z.string().optional(),
    }).optional(),
    deliveryTime: z.string().optional(),
    deliveryNotes: z.string().optional(),
    paymentTerm: z.enum(['FULL_UPFRONT', 'PARTIAL_UPFRONT', 'ON_PICKUP']),
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1, 'Debe haber al menos un producto'),
    services: z.array(z.object({
      serviceId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).optional(),
  }),
});

// Pagination schema
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

// Validation middleware
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos proporcionados no son válidos',
          details: error.errors,
        },
      });
    }
  };
};
