// Roles que pueden acceder al panel admin
export const ADMIN_ROLES = ['SUPERADMIN', 'ADMIN', 'COMMERCIAL', 'WAREHOUSE', 'TECHNICIAN', 'ACCOUNTANT'] as const;

// Roles que pueden gestionar usuarios
export const USER_MANAGEMENT_ROLES = ['SUPERADMIN', 'ADMIN'] as const;

// Roles con acceso completo
export const FULL_ACCESS_ROLES = ['SUPERADMIN', 'ADMIN'] as const;

// Roles que pueden ver ventas/pedidos
export const SALES_ROLES = ['SUPERADMIN', 'ADMIN', 'COMMERCIAL'] as const;

// Roles que pueden ver inventario/logística
export const WAREHOUSE_ROLES = ['SUPERADMIN', 'ADMIN', 'WAREHOUSE'] as const;

// Roles que pueden ver operaciones/eventos
export const OPERATIONS_ROLES = ['SUPERADMIN', 'ADMIN', 'TECHNICIAN', 'WAREHOUSE'] as const;

// Roles que pueden ver finanzas
export const FINANCE_ROLES = ['SUPERADMIN', 'ADMIN', 'ACCOUNTANT'] as const;

// Roles que pueden crear/editar productos
export const CATALOG_ROLES = ['SUPERADMIN', 'ADMIN'] as const;

// Roles que pueden acceder al panel comercial
export const COMMERCIAL_PANEL_ROLES = ['SUPERADMIN', 'ADMIN', 'COMMERCIAL'] as const;

// Tipo helper
export type AdminRole = typeof ADMIN_ROLES[number];
