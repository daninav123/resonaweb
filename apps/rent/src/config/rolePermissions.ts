// Re-export desde @resona/api-client (código real en packages/api-client/src/rolePermissions.ts).
export {
  ROLE_CONFIGS,
  ADMIN_ROLES,
  COMMERCIAL_ROLES,
  setDynamicRoleConfigs,
  getDynamicRoleConfigs,
  getAllUserRoles,
  userHasRole,
  getAllowedPathsForUser,
  canAccessPath,
  canAccessAdmin,
  getRoleLabel,
  getRoleColor,
  filterMenuItems,
} from '@resona/api-client';
export type { UserRole, RoleConfig } from '@resona/api-client';
