import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Import routers
import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { ordersRouter } from './routes/orders.routes';
import { usersRouter } from './routes/users.routes';
import { cartRouter } from './routes/cart.routes';
import { paymentRouter } from './routes/payment.routes';
import { invoiceRouter } from './routes/invoice.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { logisticsRouter } from './routes/logistics.routes';
import { customerRouter } from './routes/customer.routes';
import blogRouter from './routes/blog.routes';
import { shippingConfigRouter } from './routes/shipping-config.routes';
import { companyRouter } from './routes/company.routes';
import { calendarRouter } from './routes/calendar.routes';
import { orderNoteRouter } from './routes/orderNote.routes';
import { couponRouter } from './routes/coupon.routes';
import { searchRouter } from './routes/search.routes';
import { notificationRouter } from './routes/notification.routes';
import { uploadRouter } from './routes/upload.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';

// Import services
import { logger } from './utils/logger';
import { setupEmailReminders } from './jobs/emailReminders.job';
import { setupPublishScheduledPosts, setupDailyArticleGeneration } from './jobs/blog.job';

// Initialize Prisma
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Create Express app
const app = express();

// Get port from environment
const PORT = process.env.BACKEND_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true,
}));

// Serve static files (uploaded images) - ANTES de otros middlewares
app.use('/uploads', (req, res, next) => {
  // Use specific origins instead of '*'
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  next();
}, express.static(path.join(__dirname, '../public/uploads')));

// Servir imágenes de productos subidas
app.use('/uploads/products', (req, res, next) => {
  res.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  res.header('Access-Control-Allow-Origin', '*'); // Permitir acceso desde frontend
  next();
}, express.static(path.join(__dirname, '../uploads/products')));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
console.log('🌐 Registrando rutas API...');
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
console.log('📦 Registrando /api/v1/orders con ordersRouter');
app.use('/api/v1/orders', ordersRouter);
console.log('✅ Ruta /api/v1/orders registrada');
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/logistics', logisticsRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/shipping-config', shippingConfigRouter);
app.use('/api/v1/company', companyRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1', orderNoteRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/products/search', searchRouter); // Alias para búsqueda de productos
app.use('/api/v1/upload', uploadRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Setup cron jobs for email reminders
    setupEmailReminders();
    logger.info('✅ Email reminders scheduled');

    // Setup blog cron jobs with AI
    setupPublishScheduledPosts();
    logger.info('✅ Blog scheduled posts job started');
    
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (adminUser) {
      setupDailyArticleGeneration(adminUser.id);
      logger.info('✅ Daily AI article generation job started (2 AM daily)');
    } else {
      logger.warn('⚠️  No admin user found, daily article generation disabled');
    }

    // Start listening
    app.listen(PORT, () => {
      logger.info(`
        🚀 Server is running!
        🔊 Listening on port ${PORT}
        📱 Environment: ${NODE_ENV}
        🌐 URL: http://localhost:${PORT}
      `);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;
