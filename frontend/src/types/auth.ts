export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  isRememberedMe: boolean;
}

export interface LoginResponse {
  token: string;
  type: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface AuthContextType {
  user: LoginResponse | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isAuthenticated: boolean;
  setGoogleUser: (user: LoginResponse) => void;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}
export interface VerifyRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordEmailRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}
export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}
export interface AuthState {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isAuthenticated: boolean;
}

/**
 * Role constant (no enum - compatible with erasableSyntaxOnly)
 */
export const USER_ROLE = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  TRAINER: "TRAINER",
  TRAINEE: "TRAINEE",
  STUDENT: "STUDENT",
} as const;

/**
 * UserRole type (union from USER_ROLE values)
 */
export type UserRole =
  (typeof USER_ROLE)[keyof typeof USER_ROLE];
