import cron from 'node-cron';
import { logger } from '../utils/logger';
import { prisma } from '../index';
import { emailService } from '../services/email.service';
import { addDays, startOfDay, endOfDay, isBefore } from 'date-fns';

/**
 * Setup installment payment reminders
 * Runs daily to send reminders for upcoming and overdue installments
 */
export function setupInstallmentReminders() {
  logger.info('⏰ Setting up installment reminders job...');

  // Ejecutar diariamente a las 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('🔔 Running installment reminders check...');
    
    try {
      await sendUpcomingInstallmentReminders();
      await sendOverdueInstallmentReminders();
    } catch (error) {
      logger.error('❌ Error in installment reminders job:', error);
    }
  });

  logger.info('✅ Installment reminders job setup complete');
}

/**
 * Send reminders for installments due in 7 days
 */
async function sendUpcomingInstallmentReminders() {
  try {
    const sevenDaysFromNow = addDays(new Date(), 7);
    const reminderDate = startOfDay(sevenDaysFromNow);
    const reminderDateEnd = endOfDay(sevenDaysFromNow);

    // Buscar plazos pendientes que vencen en 7 días
    const upcomingInstallments = await prisma.paymentInstallment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: reminderDate,
          lte: reminderDateEnd
        }
      },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    logger.info(`📧 Found ${upcomingInstallments.length} installments due in 7 days`);

    for (const installment of upcomingInstallments) {
      try {
        await emailService.sendInstallmentReminderEmail(
          installment,
          installment.order,
          7 // días hasta vencimiento
        );

        logger.info(`✅ Reminder sent for installment ${installment.id} (7 days)`);
      } catch (error) {
        logger.error(`❌ Failed to send reminder for installment ${installment.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('❌ Error sending upcoming installment reminders:', error);
  }
}

/**
 * Send reminders for overdue installments
 */
async function sendOverdueInstallmentReminders() {
  try {
    const today = startOfDay(new Date());

    // Buscar plazos vencidos
    const overdueInstallments = await prisma.paymentInstallment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today
        }
      },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    logger.info(`⚠️  Found ${overdueInstallments.length} overdue installments`);

    for (const installment of overdueInstallments) {
      try {
        // Calcular días de retraso
        const daysOverdue = Math.floor(
          (today.getTime() - new Date(installment.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Enviar recordatorio de vencido
        await emailService.sendInstallmentOverdueEmail(
          installment,
          installment.order
        );

        logger.info(`⚠️  Overdue reminder sent for installment ${installment.id} (${daysOverdue} days late)`);
      } catch (error) {
        logger.error(`❌ Failed to send overdue reminder for installment ${installment.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('❌ Error sending overdue installment reminders:', error);
  }
}

/**
 * Send reminder for installment due in 3 days (additional reminder)
 */
async function sendThreeDayReminders() {
  try {
    const threeDaysFromNow = addDays(new Date(), 3);
    const reminderDate = startOfDay(threeDaysFromNow);
    const reminderDateEnd = endOfDay(threeDaysFromNow);

    const upcomingInstallments = await prisma.paymentInstallment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: reminderDate,
          lte: reminderDateEnd
        }
      },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    logger.info(`📧 Found ${upcomingInstallments.length} installments due in 3 days`);

    for (const installment of upcomingInstallments) {
      try {
        await emailService.sendInstallmentReminderEmail(
          installment,
          installment.order,
          3 // días hasta vencimiento
        );

        logger.info(`✅ 3-day reminder sent for installment ${installment.id}`);
      } catch (error) {
        logger.error(`❌ Failed to send 3-day reminder for installment ${installment.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('❌ Error sending 3-day installment reminders:', error);
  }
}
