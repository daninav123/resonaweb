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
import { stockAlertsRouter } from './routes/stock-alerts.routes';
import billingRouter from './routes/billing.routes';
import orderModificationRouter from './routes/orderModification.routes';
import packRouter from './routes/pack.routes';
import orderExpirationRouter from './routes/orderExpiration.routes';
import quoteRequestRouter from './routes/quoteRequest.routes';
import { metricsRouter } from './routes/metrics.routes';
import backupRouter from './routes/backup.routes';
import contractRouter from './routes/contract.routes';
import terminalRouter from './routes/terminal.routes';
// import { redsysRouter } from './routes/redsys.routes'; // Desactivado - solo Stripe

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { httpsRedirect, securityHeaders } from './middleware/httpsRedirect.middleware';
import { sanitizeInputs, detectXSS } from './middleware/sanitize.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';

// Import services
import { logger } from './utils/logger';
// import { setupEmailReminders } from './jobs/emailReminders.job';
import { setupPublishScheduledPosts, setupDailyArticleGeneration } from './jobs/blog.job';
import { setupGMBPostGenerator } from './jobs/gmb-post-generator.job';
// import { orderExpirationScheduler } from './schedulers/orderExpiration.scheduler';
// import { initErrorTracking, getSentryRequestHandler, getSentryTracingHandler, getSentryErrorHandler } from './services/errorTracking.service';

// Initialize Prisma
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Create Express app
const app = express();

// Get port from environment
const PORT = process.env.BACKEND_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize error tracking (Sentry)
// DESACTIVADO TEMPORALMENTE - Causaba crash
// initErrorTracking();

// Middleware
// Sentry debe ser de los primeros
// DESACTIVADO TEMPORALMENTE - Causaba crash
// app.use(getSentryRequestHandler());
// app.use(getSentryTracingHandler());

// HTTPS redirect (debe ser primero en producción)
app.use(httpsRedirect);
app.use(securityHeaders);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Necesario para algunos scripts inline (revisar en futuro)
        "https://js.stripe.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Necesario para TailwindCSS y estilos inline
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://www.google-analytics.com"
      ],
      frameSrc: [
        "https://js.stripe.com",
        "https://hooks.stripe.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    }
  },
}));
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Permitir requests sin origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista exacta
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Permitir cualquier subdominio de vercel.app
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Rechazar otros origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Serve static files (uploaded images) - ANTES de otros middlewares
app.use('/uploads', (req, res, next) => {
  // Use specific origins instead of '*'
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (origin && (allowedOrigins.includes(origin) || origin.includes('.vercel.app'))) {
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

// Stripe webhook - DEBE ir ANTES de express.json() para obtener el body raw
import stripeWebhookRouter from './routes/stripe-webhook.routes';
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), stripeWebhookRouter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización de inputs (prevenir XSS)
app.use(sanitizeInputs);
app.use(detectXSS);

// Metrics middleware (debe ir antes de las rutas para capturar todas)
app.use(metricsMiddleware);

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

// Metrics endpoint (para Prometheus) - ANTES del rate limiting
app.use('/metrics', metricsRouter);

// API Routes
logger.info('🌐 Registrando rutas API...');
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/payments', paymentRouter);
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
app.use('/api/v1', stockAlertsRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/order-modifications', orderModificationRouter);
app.use('/api/v1/packs', packRouter);
app.use('/api/v1/order-expiration', orderExpirationRouter);
app.use('/api/v1/quote-requests', quoteRequestRouter);
app.use('/api/v1/admin/backups', backupRouter);
app.use('/api/v1/contracts', contractRouter);
app.use('/api/v1/terminal', terminalRouter);
// app.use('/api/v1/redsys', redsysRouter); // Desactivado - solo Stripe

// Error handling
app.use(notFoundHandler);
// app.use(getSentryErrorHandler()); // Sentry error handler antes del custom - DESACTIVADO
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Setup cron jobs for email reminders
    // DESACTIVADO TEMPORALMENTE - Causaba crash en startup
    // try {
    //   setupEmailReminders();
    //   logger.info('✅ Email reminders scheduled');
    // } catch (e) {
    //   logger.warn('⚠️  Email reminders setup failed:', e);
    // }

    // Setup blog jobs
    try {
      setupPublishScheduledPosts();
      logger.info('✅ Blog scheduled posts job started (runs every hour)');
    } catch (e) {
      logger.warn('⚠️  Blog scheduled posts setup failed:', e);
    }
    
    try {
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        setupDailyArticleGeneration(adminUser.id);
        logger.info('✅ Daily AI article generation job started (2 AM daily)');
      } else {
        logger.warn('⚠️  No admin user found, daily article generation disabled');
      }
    } catch (e) {
      logger.warn('⚠️  Daily article generation setup failed:', e);
    }

    // Setup GMB post generator (generates posts for Google My Business)
    try {
      setupGMBPostGenerator();
      logger.info('✅ GMB post generator started (every Monday 9:30 AM)');
    } catch (e) {
      logger.warn('⚠️  GMB post generator setup failed:', e);
    }

    // Setup order expiration scheduler
    // DESACTIVADO TEMPORALMENTE - Causaba crash en startup
    // try {
    //   orderExpirationScheduler.start();
    //   logger.info('✅ Order expiration scheduler started');
    // } catch (e) {
    //   logger.warn('⚠️  Order expiration scheduler setup failed:', e);
    // }
    
    logger.info('⚠️  Schedulers desactivados temporalmente');

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
