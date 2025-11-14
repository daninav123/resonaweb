import { prisma } from '../index';
import { logger } from '../utils/logger';

interface AuditLogData {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Create audit log entry
   */
  async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Don't fail the request if audit logging fails
      logger.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log user action
   */
  async logUserAction(
    userId: string | undefined,
    action: string,
    entity: string,
    entityId: string,
    changes?: any,
    req?: any
  ) {
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.headers?.['user-agent'];

    await this.log({
      userId,
      action,
      entity,
      entityId,
      changes,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    skip?: number;
    take?: number;
  }) {
    const {
      userId,
      entity,
      entityId,
      action,
      skip = 0,
      take = 50,
    } = params || {};

    const where: any = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
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
   * Clean old audit logs (older than 90 days)
   */
  async cleanOldLogs() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    logger.info(`Cleaned ${result.count} old audit logs`);
    return result;
  }
}

export const auditService = new AuditService();
