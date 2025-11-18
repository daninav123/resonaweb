import cron from 'node-cron';
import { logger } from '../utils/logger';
import { prisma } from '../index';
import { emailService } from '../services/email.service';
import { addDays, startOfDay, endOfDay, subDays } from 'date-fns';

export function setupEmailReminders() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running email reminder jobs...');
    
    try {
      await sendPaymentReminders();
      await send3DayReminders();
      await send1DayReminders();
      await sendDayOfEventReminders();
      await sendReturnReminders();
      await sendReviewRequests();
    } catch (error) {
      logger.error('Error in email reminder jobs:', error);
    }
  });

  logger.info('Email reminder jobs scheduled');
}

/**
 * Send payment reminders for orders with pending payments
 */
async function sendPaymentReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  const orders = await prisma.order.findMany({
    where: {
      remainingPaymentDue: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      remainingPaymentStatus: 'PENDING',
    },
    include: { user: true },
  });

  for (const order of orders) {
    try {
      await emailService.sendPaymentReminderEmail(order);
      logger.info(`Payment reminder sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error(`Failed to send payment reminder for order ${order.orderNumber}:`, error);
    }
  }
}

/**
 * Send reminders 3 days before the event
 */
async function send3DayReminders() {
  const in3Days = addDays(new Date(), 3);
  
  const orders = await prisma.order.findMany({
    where: {
      startDate: {
        gte: startOfDay(in3Days),
        lte: endOfDay(in3Days),
      },
      status: 'CONFIRMED',
    },
    include: { user: true },
  });

  for (const order of orders) {
    try {
      await emailService.sendEventReminderEmail(order, 3);
      logger.info(`3-day reminder sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error(`Failed to send 3-day reminder for order ${order.orderNumber}:`, error);
    }
  }
}

/**
 * Send reminders 1 day before the event
 */
async function send1DayReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  const orders = await prisma.order.findMany({
    where: {
      startDate: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      status: { in: ['CONFIRMED', 'READY'] },
    },
    include: { user: true },
  });

  for (const order of orders) {
    try {
      await emailService.sendEventReminderEmail(order, 1);
      logger.info(`1-day reminder sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error(`Failed to send 1-day reminder for order ${order.orderNumber}:`, error);
    }
  }
}

/**
 * Send reminders on the day of the event
 */
async function sendDayOfEventReminders() {
  const today = new Date();
  
  const orders = await prisma.order.findMany({
    where: {
      startDate: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
      status: { in: ['READY', 'IN_TRANSIT'] },
    },
    include: { user: true },
  });

  for (const order of orders) {
    try {
      await emailService.sendEventReminderEmail(order, 0);
      logger.info(`Day-of-event reminder sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error(`Failed to send day-of-event reminder for order ${order.orderNumber}:`, error);
    }
  }
}

/**
 * Send return reminders
 */
async function sendReturnReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  const orders = await prisma.order.findMany({
    where: {
      endDate: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      status: 'DELIVERED',
    },
    include: { user: true },
  });

  for (const order of orders) {
    try {
      await emailService.sendReturnReminderEmail(order);
      logger.info(`Return reminder sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error(`Failed to send return reminder for order ${order.orderNumber}:`, error);
    }
  }
}

/**
 * Send review requests 3 days after the event
 */
async function sendReviewRequests() {
  const threeDaysAgo = subDays(new Date(), 3);
  
  const orders = await prisma.order.findMany({
    where: {
      endDate: {
        gte: startOfDay(threeDaysAgo),
        lte: endOfDay(threeDaysAgo),
      },
      status: 'COMPLETED',
      reviewRequested: false,
    },
    include: { user: true },
  });

  for (const order of orders) {
    try {
      await emailService.sendReviewRequestEmail(order);
      logger.info(`Review request sent for order ${order.orderNumber}`);
      
      // Mark as requested
      await prisma.order.update({
        where: { id: order.id },
        data: { reviewRequested: true },
      });
    } catch (error) {
      logger.error(`Failed to send review request for order ${order.orderNumber}:`, error);
    }
  }
}
