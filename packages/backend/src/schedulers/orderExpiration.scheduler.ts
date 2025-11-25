/**
 * ORDER EXPIRATION SCHEDULER
 * 
 * Ejecuta automáticamente cada X minutos para verificar y expirar pedidos pendientes.
 * Usa node-cron para programación de tareas.
 */

import cron from 'node-cron';
import { orderExpirationService, CHECK_INTERVAL_MINUTES } from '../services/orderExpiration.service';
import { logger } from '../utils/logger';

class OrderExpirationScheduler {
  private task: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  /**
   * Iniciar el scheduler
   */
  start(): void {
    // Ejecutar cada X minutos (por defecto 5 minutos)
    // Formato cron: */5 * * * * = cada 5 minutos
    const cronExpression = `*/${CHECK_INTERVAL_MINUTES} * * * *`;

    logger.info(`🕐 Starting Order Expiration Scheduler (every ${CHECK_INTERVAL_MINUTES} minutes)`);
    logger.info(`   Cron expression: ${cronExpression}`);

    // Crear tarea programada
    this.task = cron.schedule(cronExpression, async () => {
      // Prevenir ejecuciones concurrentes
      if (this.isRunning) {
        logger.warn('⚠️  Previous expiration check still running, skipping this interval');
        return;
      }

      this.isRunning = true;
      const startTime = Date.now();

      try {
        logger.info('⏰ Starting scheduled order expiration check...');
        
        const result = await orderExpirationService.checkAndExpireOrders();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        logger.info(`✅ Scheduled expiration check completed in ${duration}s`);
        logger.info(`   - Checked: ${result.total} orders`);
        logger.info(`   - Expired: ${result.expired.length} orders`);
        logger.info(`   - Errors: ${result.errors.length}`);
        
        if (result.errors.length > 0) {
          logger.error('❌ Errors during expiration:', result.errors);
        }
      } catch (error: any) {
        logger.error('❌ Error in scheduled expiration check:', error);
      } finally {
        this.isRunning = false;
      }
    });

    // También ejecutar inmediatamente al iniciar (opcional)
    const runOnStart = process.env.ORDER_EXPIRATION_RUN_ON_START === 'true';
    if (runOnStart) {
      logger.info('🚀 Running initial expiration check on start...');
      setTimeout(async () => {
        try {
          await orderExpirationService.checkAndExpireOrders();
          logger.info('✅ Initial expiration check completed');
        } catch (error) {
          logger.error('❌ Error in initial expiration check:', error);
        }
      }, 5000); // Esperar 5 segundos después del inicio
    }

    logger.info('✅ Order Expiration Scheduler started successfully');
  }

  /**
   * Detener el scheduler
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('🛑 Order Expiration Scheduler stopped');
    }
  }

  /**
   * Verificar si el scheduler está corriendo
   */
  isActive(): boolean {
    return this.task !== null;
  }

  /**
   * Obtener información del scheduler
   */
  getStatus() {
    return {
      active: this.isActive(),
      running: this.isRunning,
      intervalMinutes: CHECK_INTERVAL_MINUTES,
      cronExpression: `*/${CHECK_INTERVAL_MINUTES} * * * *`
    };
  }

  /**
   * Ejecutar manualmente (para testing o admin)
   */
  async runNow(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Expiration check is already running');
    }

    logger.info('🔧 Manual expiration check triggered');
    this.isRunning = true;

    try {
      const result = await orderExpirationService.checkAndExpireOrders();
      logger.info('✅ Manual expiration check completed', result);
      return result as any;
    } finally {
      this.isRunning = false;
    }
  }
}

// Exportar instancia única
export const orderExpirationScheduler = new OrderExpirationScheduler();
