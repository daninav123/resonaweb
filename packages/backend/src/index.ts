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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../public/uploads')));

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
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/logistics', logisticsRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/blog', blogRouter);

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
