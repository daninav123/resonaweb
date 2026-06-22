// Configuración de permisos por rol para el panel de administración
// Soporta roles dinámicos cargados desde la API + fallback hardcoded

export type UserRole = string;

export interface RoleConfig {
  label: string;
  description: string;
  color: string;
  allowedPaths: string[];
  defaultRedirect: string;
}

// ============= STORE DINÁMICO =============
// Las definiciones se cargan desde la API al arrancar el panel admin.
// Si no se han cargado, se usan los defaults hardcoded como fallback.

let _dynamicConfigs: Record<string, RoleConfig> | null = null;

export function setDynamicRoleConfigs(configs: Record<string, RoleConfig>) {
  _dynamicConfigs = configs;
}

export function getDynamicRoleConfigs(): Record<string, RoleConfig> | null {
  return _dynamicConfigs;
}

// ============= FALLBACK HARDCODED =============

const FALLBACK_CONFIGS: Record<string, RoleConfig> = {
  SUPERADMIN: {
    label: 'Super Administrador',
    description: 'Acceso total al sistema',
    color: 'red',
    allowedPaths: ['*'],
    defaultRedirect: '/admin',
  },
  ADMIN: {
    label: 'Administrador',
    description: 'Gestión operativa completa',
    color: 'purple',
    allowedPaths: ['*'],
    defaultRedirect: '/admin',
  },
  COMMERCIAL: {
    label: 'Comercial',
    description: 'Ventas y presupuestos',
    color: 'blue',
    allowedPaths: ['/admin'],
    defaultRedirect: '/admin',
  },
  WAREHOUSE: {
    label: 'Almacén / Logística',
    description: 'Stock y logística',
    color: 'orange',
    allowedPaths: ['/admin'],
    defaultRedirect: '/admin',
  },
  TECHNICIAN: {
    label: 'Técnico',
    description: 'Eventos y montajes',
    color: 'green',
    allowedPaths: ['/admin'],
    defaultRedirect: '/admin/tech-view',
  },
  ACCOUNTANT: {
    label: 'Contabilidad',
    description: 'Facturas y fiscal',
    color: 'yellow',
    allowedPaths: ['/admin'],
    defaultRedirect: '/admin/contabilidad',
  },
  CLIENT: {
    label: 'Cliente',
    description: 'Acceso a la tienda',
    color: 'gray',
    allowedPaths: [],
    defaultRedirect: '/',
  },
};

// Obtener la config de un rol (dinámico > fallback)
function getConfig(role: string): RoleConfig | undefined {
  return _dynamicConfigs?.[role] || FALLBACK_CONFIGS[role];
}

// Re-exportar para compatibilidad
export const ROLE_CONFIGS: Record<string, RoleConfig> = new Proxy({} as Record<string, RoleConfig>, {
  get(_, prop: string) {
    return getConfig(prop);
  },
  ownKeys() {
    const keys = new Set([
      ...Object.keys(FALLBACK_CONFIGS),
      ...(_dynamicConfigs ? Object.keys(_dynamicConfigs) : []),
    ]);
    return Array.from(keys);
  },
  getOwnPropertyDescriptor(_, prop: string) {
    const config = getConfig(prop as string);
    if (config) return { configurable: true, enumerable: true, value: config };
    return undefined;
  },
});

// Roles que pueden acceder al panel admin (CLIENT queda fuera por defecto)
export const ADMIN_ROLES: string[] = ['SUPERADMIN', 'ADMIN', 'COMMERCIAL', 'WAREHOUSE', 'TECHNICIAN', 'ACCOUNTANT'];

// Roles que pueden acceder al panel comercial
export const COMMERCIAL_ROLES: string[] = ['SUPERADMIN', 'ADMIN', 'COMMERCIAL'];

// Comprobar si un rol tiene acceso admin (dinámico: cualquier rol con allowedPaths no vacío)
function roleHasAdminAccess(roleName: string): boolean {
  if (ADMIN_ROLES.includes(roleName)) return true;
  const config = getConfig(roleName);
  return !!(config && config.allowedPaths.length > 0);
}

// Obtener todos los roles efectivos de un usuario (principal + adicionales)
export function getAllUserRoles(user: { role?: string; additionalRoles?: string[] }): string[] {
  const roles = new Set<string>();
  if (user.role) roles.add(user.role);
  if (user.additionalRoles && Array.isArray(user.additionalRoles)) {
    user.additionalRoles.forEach(r => roles.add(r));
  }
  return Array.from(roles);
}

// Comprobar si un usuario tiene al menos uno de los roles indicados
export function userHasRole(user: { role?: string; additionalRoles?: string[] }, ...roles: string[]): boolean {
  const allRoles = getAllUserRoles(user);
  return roles.some(r => allRoles.includes(r));
}

// Comprobar si un rol tiene wildcard (acceso total)
function hasWildcard(roleName: string): boolean {
  const config = getConfig(roleName);
  return !!(config && config.allowedPaths.includes('*'));
}

// Resolver allowedPaths de un rol
function resolveAllowedPaths(roleName: string): string[] {
  const config = getConfig(roleName);
  if (!config) return [];
  return config.allowedPaths.filter(p => p !== '*');
}

// Obtener todas las rutas permitidas para un usuario multi-rol
export function getAllowedPathsForUser(user: { role?: string; additionalRoles?: string[] }): string[] {
  const allRoles = getAllUserRoles(user);
  const paths = new Set<string>();
  allRoles.forEach(role => {
    resolveAllowedPaths(role).forEach(p => paths.add(p));
  });
  return Array.from(paths);
}

// Comprobar si un rol puede acceder a una ruta (soporta multi-rol)
export function canAccessPath(role: string, path: string, additionalRoles?: string[]): boolean {
  const allRoles = getAllUserRoles({ role, additionalRoles });
  // Wildcard = acceso total
  if (allRoles.some(r => hasWildcard(r))) return true;
  const allowedPaths = new Set<string>();
  allRoles.forEach(r => {
    resolveAllowedPaths(r).forEach(p => allowedPaths.add(p));
  });
  return Array.from(allowedPaths).some(p => path === p || (p !== '/admin' && path.startsWith(p + '/')));
}

// Comprobar si un usuario puede acceder al panel admin
export function canAccessAdmin(role: string, additionalRoles?: string[]): boolean {
  const allRoles = getAllUserRoles({ role, additionalRoles });
  return allRoles.some(r => roleHasAdminAccess(r));
}

// Obtener la etiqueta visible de un rol
export function getRoleLabel(role: string): string {
  return getConfig(role)?.label || role;
}

// Obtener color del rol
export function getRoleColor(role: string): string {
  return getConfig(role)?.color || 'gray';
}

// Filtrar items del menú según roles del usuario (soporta multi-rol + dinámico)
export function filterMenuItems<T extends { path?: string }>(items: T[], role: string, additionalRoles?: string[]): T[] {
  const allRoles = getAllUserRoles({ role, additionalRoles });
  // Wildcard = ver todo
  if (allRoles.some(r => hasWildcard(r))) return items;
  const allowedPaths = new Set<string>();
  allRoles.forEach(r => {
    resolveAllowedPaths(r).forEach(p => allowedPaths.add(p));
  });
  const pathsArray = Array.from(allowedPaths);
  return items.filter(item => {
    if (!item.path) return true;
    return pathsArray.some(p => item.path === p || (p !== '/admin' && item.path!.startsWith(p + '/')));
  });
}
