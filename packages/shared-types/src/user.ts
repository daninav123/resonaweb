export type UserLevel = 'STANDARD' | 'VIP' | 'VIP_PLUS';

export type UserRole =
  | 'CLIENT'
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'COMMERCIAL'
  | 'WAREHOUSE'
  | 'TECHNICIAN'
  | 'ACCOUNTANT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  additionalRoles?: string[];
  userLevel: UserLevel;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptPrivacy?: boolean;
  acceptMarketing?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
