import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReSona API',
      version: '1.0.0',
      description: 'API REST para la plataforma de gestión de eventos y alquiler ReSona',
      contact: {
        name: 'ReSona Eventos',
        email: 'api@resona.com',
        url: 'https://resona.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.resona.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-KEY',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['CLIENT', 'ADMIN', 'SUPERADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sku: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            pricePerDay: { type: 'number' },
            pricePerWeekend: { type: 'number' },
            pricePerWeek: { type: 'number' },
            stock: { type: 'integer' },
            categoryId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderNumber: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED'],
            },
            totalAmount: { type: 'number' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1 },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
          required: ['productId', 'quantity', 'startDate', 'endDate'],
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'integer' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y autorización',
      },
      {
        name: 'Products',
        description: 'Gestión de productos y catálogo',
      },
      {
        name: 'Orders',
        description: 'Gestión de pedidos y reservas',
      },
      {
        name: 'Cart',
        description: 'Gestión del carrito de compra',
      },
      {
        name: 'Payments',
        description: 'Procesamiento de pagos',
      },
      {
        name: 'Invoices',
        description: 'Generación y gestión de facturas',
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios',
      },
      {
        name: 'Notifications',
        description: 'Sistema de notificaciones',
      },
      {
        name: 'Availability',
        description: 'Consulta de disponibilidad',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
