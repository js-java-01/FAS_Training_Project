export interface RoleDTO {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleFilter {
  isActive?: boolean;
  permissionIds?: string[];
  createdRange?: [string, string];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  isActive: boolean;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

/** Compact role info used by the role-switcher */
export interface RoleSwitchRole {
  id: string;
  name: string;
  permissions: string[];
  isActive?: boolean;
  hierarchyLevel?: number;
}

export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  STUDENT: "STUDENT",
  TRAINER: "TRAINER",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type ROLES = typeof ROLES[keyof typeof ROLES];