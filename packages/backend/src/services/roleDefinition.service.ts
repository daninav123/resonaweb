import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Roles del sistema por defecto (se seedean al arrancar)
const SYSTEM_ROLES = [
  {
    name: 'SUPERADMIN',
    label: 'Super Administrador',
    description: 'Acceso total al sistema, configuración y gestión de usuarios',
    color: 'red',
    icon: 'Shield',
    defaultRedirect: '/admin',
    allowedPaths: ['*'], // wildcard = todas
  },
  {
    name: 'ADMIN',
    label: 'Administrador',
    description: 'Gestión operativa completa del negocio',
    color: 'purple',
    icon: 'Shield',
    defaultRedirect: '/admin',
    allowedPaths: [
      '/admin', '/admin/statistics', '/admin/contabilidad',
      '/admin/products', '/admin/packs', '/admin/personal', '/admin/montajes',
      '/admin/categories', '/admin/extra-categories', '/admin/calculator',
      '/admin/pipeline', '/admin/orders', '/admin/crm', '/admin/client-portal',
      '/admin/quote-requests', '/admin/portfolio', '/admin/commissions', '/admin/coupons', '/admin/refunds',
      '/admin/events', '/admin/event-templates', '/admin/calendar', '/admin/staff-hr', '/admin/subcontracts', '/admin/tech-view',
      '/admin/picking-list', '/admin/loading-sheets', '/admin/material-check', '/admin/shipping-config', '/admin/vehicles', '/admin/vehicle-calendar',
      '/admin/equipment-availability', '/admin/stock', '/admin/inventory', '/admin/warehouse-locations', '/admin/maintenance', '/admin/purchase-lots',
      '/admin/invoices', '/admin/invoices/manual', '/admin/contracts-mgmt', '/admin/suppliers', '/admin/fiscal', '/admin/company-settings',
      '/admin/role-dashboard', '/admin/reports', '/admin/email-marketing', '/admin/notifications', '/admin/blog',
    ],
  },
  {
    name: 'COMMERCIAL',
    label: 'Comercial',
    description: 'Ventas, presupuestos, leads y comisiones',
    color: 'blue',
    icon: 'ShoppingCart',
    defaultRedirect: '/admin',
    allowedPaths: [
      '/admin', '/admin/pipeline', '/admin/orders', '/admin/crm',
      '/admin/client-portal', '/admin/quote-requests', '/admin/portfolio',
      '/admin/commissions', '/admin/coupons', '/admin/events', '/admin/event-templates',
      '/admin/calendar', '/admin/contracts-mgmt', '/admin/products', '/admin/packs',
      '/admin/calculator', '/admin/role-dashboard', '/admin/email-marketing',
    ],
  },
  {
    name: 'WAREHOUSE',
    label: 'Almacén / Logística',
    description: 'Stock, picking, hojas de carga, vehículos y mantenimiento',
    color: 'orange',
    icon: 'Truck',
    defaultRedirect: '/admin',
    allowedPaths: [
      '/admin', '/admin/picking-list', '/admin/loading-sheets', '/admin/material-check',
      '/admin/shipping-config', '/admin/vehicles', '/admin/vehicle-calendar',
      '/admin/equipment-availability', '/admin/stock', '/admin/inventory',
      '/admin/warehouse-locations', '/admin/maintenance', '/admin/purchase-lots',
      '/admin/products', '/admin/packs', '/admin/orders', '/admin/events',
      '/admin/calendar', '/admin/suppliers', '/admin/role-dashboard',
    ],
  },
  {
    name: 'TECHNICIAN',
    label: 'Técnico',
    description: 'Eventos asignados, montajes, calendario y check de material',
    color: 'green',
    icon: 'Wrench',
    defaultRedirect: '/admin/tech-view',
    allowedPaths: [
      '/admin', '/admin/events', '/admin/calendar', '/admin/tech-view',
      '/admin/material-check', '/admin/loading-sheets', '/admin/staff-hr',
      '/admin/equipment-availability', '/admin/vehicle-calendar', '/admin/role-dashboard',
    ],
  },
  {
    name: 'ACCOUNTANT',
    label: 'Contabilidad',
    description: 'Facturas, contabilidad, fiscal, gastos e informes',
    color: 'yellow',
    icon: 'Calculator',
    defaultRedirect: '/admin/contabilidad',
    allowedPaths: [
      '/admin', '/admin/statistics', '/admin/contabilidad',
      '/admin/invoices', '/admin/invoices/manual', '/admin/fiscal',
      '/admin/company-settings', '/admin/orders', '/admin/suppliers',
      '/admin/commissions', '/admin/reports', '/admin/role-dashboard',
    ],
  },
  {
    name: 'CLIENT',
    label: 'Cliente',
    description: 'Acceso solo a la tienda y su cuenta',
    color: 'gray',
    icon: 'Users',
    defaultRedirect: '/',
    allowedPaths: [],
  },
];

export class RoleDefinitionService {
  /**
   * Seedear roles del sistema si no existen
   */
  async seedSystemRoles() {
    let created = 0;
    for (const role of SYSTEM_ROLES) {
      const existing = await prisma.roleDefinition.findUnique({
        where: { name: role.name },
      });
      if (!existing) {
        await prisma.roleDefinition.create({
          data: {
            ...role,
            allowedPaths: role.allowedPaths,
            isSystem: true,
          },
        });
        created++;
      }
    }
    if (created > 0) {
      logger.info(`Seeded ${created} system role definitions`);
    }
    return created;
  }

  /**
   * Obtener todas las definiciones de rol
   */
  async getAll() {
    return prisma.roleDefinition.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtener todas (incluidas inactivas) - para admin
   */
  async getAllAdmin() {
    return prisma.roleDefinition.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Obtener por nombre
   */
  async getByName(name: string) {
    return prisma.roleDefinition.findUnique({ where: { name } });
  }

  /**
   * Crear nuevo rol personalizado
   */
  async create(data: {
    name: string;
    label: string;
    description?: string;
    color?: string;
    icon?: string;
    allowedPaths?: string[];
    defaultRedirect?: string;
  }) {
    // Validar nombre único y formato
    const normalized = data.name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const existing = await prisma.roleDefinition.findUnique({ where: { name: normalized } });
    if (existing) {
      throw new AppError(409, `Ya existe un rol con el nombre "${normalized}"`, 'ROLE_EXISTS');
    }

    const role = await prisma.roleDefinition.create({
      data: {
        name: normalized,
        label: data.label,
        description: data.description || '',
        color: data.color || 'gray',
        icon: data.icon || 'Users',
        allowedPaths: data.allowedPaths || [],
        defaultRedirect: data.defaultRedirect || '/admin',
        isSystem: false,
      },
    });

    logger.info(`Custom role created: ${role.name}`);
    return role;
  }

  /**
   * Actualizar rol (paths, label, color, etc.)
   */
  async update(id: string, data: Partial<{
    label: string;
    description: string;
    color: string;
    icon: string;
    allowedPaths: string[];
    defaultRedirect: string;
    isActive: boolean;
  }>) {
    const existing = await prisma.roleDefinition.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Rol no encontrado', 'ROLE_NOT_FOUND');
    }

    const role = await prisma.roleDefinition.update({
      where: { id },
      data,
    });

    logger.info(`Role updated: ${role.name}`);
    return role;
  }

  /**
   * Eliminar rol personalizado (no se pueden eliminar los del sistema)
   */
  async delete(id: string) {
    const existing = await prisma.roleDefinition.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Rol no encontrado', 'ROLE_NOT_FOUND');
    }
    if (existing.isSystem) {
      throw new AppError(403, 'No se pueden eliminar roles del sistema', 'SYSTEM_ROLE');
    }

    // Verificar que no hay usuarios con este rol
    const usersWithRole = await prisma.user.count({
      where: {
        OR: [
          { role: existing.name },
          { additionalRoles: { has: existing.name } },
        ],
      },
    });

    if (usersWithRole > 0) {
      throw new AppError(409, `Hay ${usersWithRole} usuario(s) con este rol. Reasígnalos antes de eliminar.`, 'ROLE_IN_USE');
    }

    await prisma.roleDefinition.delete({ where: { id } });
    logger.info(`Role deleted: ${existing.name}`);
    return { message: 'Rol eliminado' };
  }

  /**
   * Obtener todas las rutas admin disponibles (para el editor de permisos)
   */
  getAvailableAdminPaths() {
    return [
      { path: '/admin', label: 'Dashboard', section: 'Dashboard' },
      { path: '/admin/statistics', label: 'Estadísticas', section: 'Analytics' },
      { path: '/admin/contabilidad', label: 'Contabilidad', section: 'Analytics' },
      { path: '/admin/products', label: 'Productos', section: 'Catálogo' },
      { path: '/admin/packs', label: 'Packs', section: 'Catálogo' },
      { path: '/admin/personal', label: 'Personal', section: 'Catálogo' },
      { path: '/admin/montajes', label: 'Montajes', section: 'Catálogo' },
      { path: '/admin/categories', label: 'Categorías', section: 'Catálogo' },
      { path: '/admin/extra-categories', label: 'Extras Categorías', section: 'Catálogo' },
      { path: '/admin/calculator', label: 'Calculadora', section: 'Catálogo' },
      { path: '/admin/pipeline', label: 'Pipeline Comercial', section: 'Ventas' },
      { path: '/admin/orders', label: 'Pedidos', section: 'Ventas' },
      { path: '/admin/crm', label: 'CRM Clientes', section: 'Ventas' },
      { path: '/admin/client-portal', label: 'Portal Cliente', section: 'Ventas' },
      { path: '/admin/quote-requests', label: 'Solicitudes Presupuesto', section: 'Ventas' },
      { path: '/admin/portfolio', label: 'Portfolio', section: 'Ventas' },
      { path: '/admin/commissions', label: 'Comisiones', section: 'Ventas' },
      { path: '/admin/coupons', label: 'Cupones', section: 'Ventas' },
      { path: '/admin/refunds', label: 'Devoluciones', section: 'Ventas' },
      { path: '/admin/events', label: 'Eventos', section: 'Operaciones' },
      { path: '/admin/event-templates', label: 'Plantillas Evento', section: 'Operaciones' },
      { path: '/admin/calendar', label: 'Calendario', section: 'Operaciones' },
      { path: '/admin/staff-hr', label: 'Personal / RRHH', section: 'Operaciones' },
      { path: '/admin/subcontracts', label: 'Subcontrataciones', section: 'Operaciones' },
      { path: '/admin/tech-view', label: 'Vista Técnicos', section: 'Operaciones' },
      { path: '/admin/picking-list', label: 'Picking List', section: 'Logística' },
      { path: '/admin/loading-sheets', label: 'Hojas de Carga', section: 'Logística' },
      { path: '/admin/material-check', label: 'Check-in/out Material', section: 'Logística' },
      { path: '/admin/shipping-config', label: 'Config Envíos', section: 'Logística' },
      { path: '/admin/vehicles', label: 'Flota Vehículos', section: 'Logística' },
      { path: '/admin/vehicle-calendar', label: 'Calendario Vehículos', section: 'Logística' },
      { path: '/admin/equipment-availability', label: 'Disponibilidad Equipos', section: 'Inventario' },
      { path: '/admin/stock', label: 'Stock', section: 'Inventario' },
      { path: '/admin/inventory', label: 'Inventario', section: 'Inventario' },
      { path: '/admin/warehouse-locations', label: 'Ubicaciones Almacén', section: 'Inventario' },
      { path: '/admin/maintenance', label: 'Mantenimiento', section: 'Inventario' },
      { path: '/admin/purchase-lots', label: 'Lotes de Compra', section: 'Inventario' },
      { path: '/admin/invoices', label: 'Facturas', section: 'Documentos' },
      { path: '/admin/invoices/manual', label: 'Factura Manual', section: 'Documentos' },
      { path: '/admin/contracts-mgmt', label: 'Contratos', section: 'Documentos' },
      { path: '/admin/suppliers', label: 'Proveedores', section: 'Documentos' },
      { path: '/admin/fiscal', label: 'Contabilidad Fiscal', section: 'Documentos' },
      { path: '/admin/company-settings', label: 'Datos Empresa', section: 'Documentos' },
      { path: '/admin/role-dashboard', label: 'Dashboard por Rol', section: 'Administración' },
      { path: '/admin/reports', label: 'Informes', section: 'Administración' },
      { path: '/admin/email-marketing', label: 'Email Marketing', section: 'Administración' },
      { path: '/admin/notifications', label: 'Notificaciones', section: 'Administración' },
      { path: '/admin/users', label: 'Usuarios', section: 'Administración' },
      { path: '/admin/roles', label: 'Roles y Permisos', section: 'Administración' },
      { path: '/admin/blog', label: 'Blog', section: 'Administración' },
      { path: '/admin/backups', label: 'Backups', section: 'Administración' },
      { path: '/admin/settings', label: 'Configuración', section: 'Administración' },
    ];
  }
}

export const roleDefinitionService = new RoleDefinitionService();
